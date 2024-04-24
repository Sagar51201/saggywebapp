import DBConnection from "./../configs/DBConnection";
import bcrypt from "bcryptjs";
import winston from "winston";

// Configure the Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Use JSON format for logging
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }) // Log to a file named 'combined.log'
    ]
});

// Add transports for error and warn levels
logger.add(new winston.transports.File({ filename: 'error.log', level: 'error', format: winston.format.json() }));
logger.add(new winston.transports.File({ filename: 'warn.log', level: 'warn', format: winston.format.json() }));

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        // check email is exist or not
        let isEmailExist = await checkExistEmail(data.email);
        if (isEmailExist) {
            reject(`This email "${data.email}" has already exist. Please choose another email`);
            logger.warn({ message: `Attempt to create user with existing email: ${data.email}` }); // Log warning in JSON format
        } else {
            // hash password
            let salt = bcrypt.genSaltSync(10);
            let userItem = {
                fullname: data.fullname,
                email: data.email,
                password: bcrypt.hashSync(data.password, salt),
            };

            //create a new account
            DBConnection.query(
                ' INSERT INTO users set ? ', userItem,
                function(err, rows) {
                    if (err) {
                        reject(false);
                        logger.error({ message: `Error while creating a new user: ${err}` }); // Log error in JSON format
                    }
                    resolve("Create a new user successful");
                }
            );
        }
    });
};

let checkExistEmail = (email) => {
    return new Promise( (resolve, reject) => {
        try {
            DBConnection.query(
                ' SELECT * FROM `users` WHERE `email` = ?  ', email,
                function(err, rows) {
                    if (err) {
                        reject(err);
                        logger.error({ message: `Error while checking existing email: ${err}` }); // Log error in JSON format
                    }
                    if (rows.length > 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            );
        } catch (err) {
            reject(err);
            logger.error({ message: `Error while checking existing email: ${err}` }); // Log error in JSON format
        }
    });
};

module.exports = {
    createNewUser: createNewUser
};
