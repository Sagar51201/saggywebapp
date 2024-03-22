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

let app = express();

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

// Initialize all web routes
initWebRoutes(app);

// Start the server
let port = process.env.PORT || 8080;
app.listen(port, () => {
    logger.info(`Building a login system with NodeJS is running on port ${port}!`);
});

