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

let handleHelloWorld = async (req, res) => {
    try {
        logger.info('Rendering homepage');
        return res.render("homepage.ejs", {
            user: req.user
        });
    } catch (error) {
        logger.error('Error rendering homepage:', error);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    handleHelloWorld: handleHelloWorld,
};
