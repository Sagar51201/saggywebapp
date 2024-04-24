import DBConnection from "../configs/DBConnection";
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

let handleLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        //check email is exist or not
        let user = await findUserByEmail(email);
        if (user) {
            //compare password
            await bcrypt.compare(password, user.password).then((isMatch) => {
                if (isMatch) {
                    resolve(true);
                } else {
                    reject(`The password that you've entered is incorrect`);
                    logger.error({ message: `Failed login attempt for email: ${email}` }); // Log error in JSON format
                }
            });
        } else {
            reject(`This user email "${email}" doesn't exist`);
            logger.error({ message: `Login attempt for non-existing email: ${email}` }); // Log error in JSON format
        }
    });
};


let findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        try {
            DBConnection.query(
                ' SELECT * FROM `users` WHERE `email` = ?  ', email,
                function(err, rows) {
                    if (err) {
                        reject(err);
                        logger.error({ message: `Error while finding user by email: ${err}` }); // Log error in JSON format
                    }
                    let user = rows[0];
                    resolve(user);
                }
            );
        } catch (err) {
            reject(err);
            logger.error({ message: `Error while finding user by email: ${err}` }); // Log error in JSON format
        }
    });
};

let findUserById = (id) => {
    return new Promise((resolve, reject) => {
        try {
            DBConnection.query(
                ' SELECT * FROM `users` WHERE `id` = ?  ', id,
                function(err, rows) {
                    if (err) {
                        reject(err);
                        logger.error({ message: `Error while finding user by ID: ${err}` }); // Log error in JSON format
                    }
                    let user = rows[0];
                    resolve(user);
                }
            );
        } catch (err) {
            reject(err);
            logger.error({ message: `Error while finding user by ID: ${err}` }); // Log error in JSON format
        }
    });
};

let comparePassword = (password, userObject) => {
    return new Promise(async (resolve, reject) => {
        try {
            await bcrypt.compare(password, userObject.password).then((isMatch) => {
                if (isMatch) {
                    resolve(true);
                } else {
                    resolve(`The password that you've entered is incorrect`);
                    logger.error({ message: `Failed password comparison for user ID: ${userObject.id}` }); // Log error in JSON format
                }
            });
        } catch (e) {
            reject(e);
            logger.error({ message: `Error while comparing passwords: ${e}` }); // Log error in JSON format
        }
    });
};

module.exports = {
    handleLogin: handleLogin,
    findUserByEmail: findUserByEmail,
    findUserById: findUserById,
    comparePassword: comparePassword
};
