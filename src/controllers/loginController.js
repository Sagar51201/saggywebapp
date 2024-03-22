import { validationResult } from "express-validator";
import loginService from "../services/loginService";
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

let getPageLogin = (req, res) => {
    try {
        logger.info('Rendering login page');
        return res.render("login.ejs", {
            errors: req.flash("errors")
        });
    } catch (error) {
        logger.error('Error rendering login page:', error);
        return res.status(500).send('Internal Server Error');
    }
};

let handleLogin = async (req, res) => {
    let errorsArr = [];
    let validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        let errors = Object.values(validationErrors.mapped());
        errors.forEach((item) => {
            errorsArr.push(item.msg);
        });
        req.flash("errors", errorsArr);
        return res.redirect("/login");
    }

    try {
        await loginService.handleLogin(req.body.email, req.body.password);
        logger.info(`User ${req.body.email} logged in successfully`);
        return res.redirect("/");
    } catch (error) {
        logger.error(`Error handling login for user ${req.body.email}:`, error);
        req.flash("errors", error);
        return res.redirect("/login");
    }
};

let checkLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }
    next();
};

let checkLoggedOut = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
};

let postLogOut = (req, res) => {
    req.session.destroy(function(err) {
        if (err) {
            logger.error('Error logging out:', err);
        } else {
            logger.info('User logged out successfully');
        }
        return res.redirect("/login");
    });
};

module.exports = {
    getPageLogin: getPageLogin,
    handleLogin: handleLogin,
    checkLoggedIn: checkLoggedIn,
    checkLoggedOut: checkLoggedOut,
    postLogOut: postLogOut
};
