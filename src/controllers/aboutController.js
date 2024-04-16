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
logger.add(new winston.transports.File({ filename: 'error.log', level: 'error' }));
logger.add(new winston.transports.File({ filename: 'warn.log', level: 'warn' }));

// Render the About page
let getPageAbout = (req, res) => {
    try {
        logger.info('Rendering About page');
        return res.render("about.ejs"); // Render the about view template
    } catch (error) {
        logger.error('Error rendering About page:', error);
        return res.status(500).send('Internal Server Error');
    }
};

// Render the Contact page
let getPageContact = (req, res) => {
    try {
        logger.info('Rendering Contact page');
        return res.render("contact.ejs"); // Render the contact view template
    } catch (error) {
        logger.error('Error rendering Contact page:', error);
        return res.status(500).send('Internal Server Error');
    }
};

// Render the FAQ page
let getPageFAQ = (req, res) => {
    try {
        logger.info('Rendering FAQ page');
        return res.render("faq.ejs"); // Render the FAQ view template
    } catch (error) {
        logger.error('Error rendering FAQ page:', error);
        return res.status(500).send('Internal Server Error');
    }
};

// Render the NEWS page
let getPageNEWS = (req, res) => {
    try {
        logger.info('Rendering newsapi page');
        return res.render("news.ejs"); // Render the NEWS view template
    } catch (error) {
        logger.error('Error rendering news page:', error);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getPageAbout: getPageAbout,
    getPageContact: getPageContact,
    getPageNEWS: getPageNEWS,
    getPageFAQ: getPageFAQ
};
