import passportLocal from "passport-local";
import passport from "passport";
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

let LocalStrategy = passportLocal.Strategy;

let initPassportLocal = () => {
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                await loginService.findUserByEmail(email).then(async (user) => {
                    if (!user) {
                        logger.info(`User with email ${email} not found`);
                        return done(null, false, req.flash("errors", `This user email "${email}" doesn't exist`));
                    }
                    if (user) {
                        let match = await loginService.comparePassword(password, user);
                        if (match === true) {
                            logger.info(`User ${user.id} authenticated successfully`);
                            return done(null, user, null);
                        } else {
                            logger.info(`Authentication failed for user ${user.id}: ${match}`);
                            return done(null, false, req.flash("errors", match));
                        }
                    }
                });
            } catch (err) {
                logger.error('Error in passport authentication:', err);
                return done(null, false, { message: err });
            }
        }));

};

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    loginService.findUserById(id).then((user) => {
        return done(null, user);
    }).catch(error => {
        logger.error('Error deserializing user:', error);
        return done(error, null);
    });
});

module.exports = initPassportLocal;
