const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Google auth routes
router.post('/user', authController.createUser);


router.get('/google', authController.googleAuth);

const googleAuth = passport.authenticate('google', { failureRedirect: '/' });
router.get('/google/callback', googleAuth, authController.googleAuthCallback);

// Facebook auth routes
router.get('/facebook', authController.facebookAuth);

const facebookAuth = passport.authenticate('facebook', { failureRedirect: '/' });
router.get('/facebook/callback', facebookAuth, authController.facebookAuthCallback);


// Register route

// Login route
router.post('/login', authController.login);


module.exports = router;
