import express from "express";
import homePageController from "../controllers/homePageController";
import registerController from "../controllers/registerController";
import loginController from "../controllers/loginController";
import aboutController from "../controllers/aboutController"; // Import about controller
import auth from "../validation/authValidation";
import passport from "passport";
import initPassportLocal from "../controllers/passportLocalController";

// Init all passport
initPassportLocal();

let router = express.Router();

let initWebRoutes = (app) => {
    // Home Page
    router.get("/", loginController.checkLoggedIn, homePageController.handleHelloWorld);

    // Login Routes
    router.get("/login", loginController.checkLoggedOut, loginController.getPageLogin);
    router.post("/login", passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        successFlash: true,
        failureFlash: true
    }));

    // Register Routes
    router.get("/register", registerController.getPageRegister);
    router.post("/register", auth.validateRegister, registerController.createNewUser);

    // Logout Route
    router.post("/logout", loginController.postLogOut);

    // About Page Route
    router.get("/about", aboutController.getPageAbout);

    // Contact Page Route
    router.get("/contact", aboutController.getPageContact);

    // FAQ Page Route
    router.get("/faq", aboutController.getPageFAQ);

    // NEWS Page Route
    router.get("/news", aboutController.getPageNEWS);
    return app.use("/", router);
};

module.exports = initWebRoutes;
