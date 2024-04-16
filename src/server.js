import dotenv from 'dotenv';
import express from "express";
import configViewEngine from "./configs/viewEngine";
import initWebRoutes from "./routes/web";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import session from "express-session";
import connectFlash from "connect-flash";
import passport from "passport";
import winston from 'winston';
import promClient from 'prom-client';

// Initialize Express application
let app = express();

// Load environment variables from .env file
dotenv.config();

// Create a Winston logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ]
});

// Add transports for error and warn levels
logger.add(new winston.transports.File({ filename: 'error.log', level: 'error' }));
logger.add(new winston.transports.File({ filename: 'warn.log', level: 'warn' }));

// Use cookie parser
app.use(cookieParser('secret'));

// Configure session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 86400000 1 day
    }
}));

// Enable body parser for parsing request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure view engine
configViewEngine(app);

// Enable flash messages
app.use(connectFlash());

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware to record request duration
const recordRequestDuration = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        httpRequestDurationMicroseconds
            .labels(req.method, req.path, res.statusCode)
            .observe(duration / 1000); // Convert to seconds
    });
    next();
};

// Middleware to record request count
const recordRequestCount = (req, res, next) => {
    httpRequestsTotal
        .labels(req.method, req.path, res.statusCode)
        .inc();
    next();
};

// Middleware to record errors
const recordErrors = (err, req, res, next) => {
    if (res.statusCode >= 400 && res.statusCode < 500) {
        http4xxErrorsTotal.labels(req.method, req.path).inc();
    } else if (res.statusCode >= 500 && res.statusCode < 600) {
        http5xxErrorsTotal.labels(req.method, req.path).inc();
    }
    next();
};

// Apply middleware for the main app
app.use(recordRequestDuration);
app.use(recordRequestCount);
app.use(recordErrors);

// Initialize all web routes
initWebRoutes(app);

// Start the server
let port = process.env.PORT || 8080;
app.listen(port, () => {
    logger.info(`Building a login system with NodeJS is running on port ${port}!`);
});

// New Express application for serving metrics
let metricsApp = express();

// Create a Prometheus Registry
const promRegistry = new promClient.Registry();

// Create custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    registers: [promRegistry]
});

const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [promRegistry]
});

const http4xxErrorsTotal = new promClient.Counter({
    name: 'http_4xx_errors_total',
    help: 'Total number of HTTP 4xx errors',
    labelNames: ['method', 'route'],
    registers: [promRegistry]
});

const http5xxErrorsTotal = new promClient.Counter({
    name: 'http_5xx_errors_total',
    help: 'Total number of HTTP 5xx errors',
    labelNames: ['method', 'route'],
    registers: [promRegistry]
});

// Expose Prometheus metrics endpoint on port 9090
const METRICS_PORT = 9091;
metricsApp.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promRegistry.metrics());
});
metricsApp.get('/', (req, res) => {
    res.send('This is a metrics server');
});

metricsApp.listen(METRICS_PORT, () => {
    logger.info(`Metrics server is running on port ${METRICS_PORT}`);
});
