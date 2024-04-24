import winston from 'winston';

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
logger.add(new winston.transports.File({ filename: 'error.log', level: 'error', format: winston.format.json() }));
logger.add(new winston.transports.File({ filename: 'warn.log', level: 'warn', format: winston.format.json() }));

let handleHelloWorld = async (req, res) => {
    try {
        logger.info('Rendering homepage');
        return res.render("homepage.ejs", {
            user: req.user
        });
    } catch (error) {
        logger.error({ message: 'Error rendering homepage', error }); // Log error in JSON format
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    handleHelloWorld: handleHelloWorld,
};
