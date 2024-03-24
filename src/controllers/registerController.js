import registerService from "./../services/registerService";
import { validationResult } from "express-validator";
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

let getPageRegister = (req, res) => {
    try {
        logger.info('Rendering register page');
        return res.render("register.ejs", {
            errors: req.flash("errors")
        });
    } catch (error) {
        logger.error('Error rendering register page:', error);
        return res.status(500).send('Internal Server Error');
    }
};

let createNewUser = async (req, res) => {
    try {
        // Validate required fields
        let errorsArr = [];
        let validationErrors = validationResult(req);
        if (!validationErrors.isEmpty()) {
            let errors = Object.values(validationErrors.mapped());
            errors.forEach((item) => {
                errorsArr.push(item.msg);
            });
            req.flash("errors", errorsArr);
            return res.redirect("/register");
        }

        // Create a new user
        let newUser = {
            fullname: req.body.fullName,
            email: req.body.email,
            password: req.body.password
        };
        await registerService.createNewUser(newUser);
        logger.info(`New user created successfully: ${JSON.stringify(newUser)}`);
        return res.redirect("/login");
    } catch (error) {
        logger.error('Error creating new user:', error);
        req.flash("errors", error.message);
        return res.redirect("/register");
    }
};

module.exports = {
    getPageRegister: getPageRegister,
    createNewUser: createNewUser
};
