import dotenv from 'dotenv';
import mysql from 'mysql2';
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

// Create MySQL connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to MySQL database
connection.connect(err => {
    if (err) {
        logger.error('Error connecting to MySQL database:', err);
        throw err; // Throw error if connection fails
    }
    logger.info('Connected to MySQL database successfully!');
});

// Export the connection object
export default connection;
