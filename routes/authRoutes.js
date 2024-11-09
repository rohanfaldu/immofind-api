const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Google auth routes
router.post('/create/user', authController.createUser);

router.post('/get/user', authController.getUser);

router.get('/test', authController.testData);

router.get('/google', authController.googleAuth);

const googleAuth = passport.authenticate('google', { failureRedirect: '/' });
router.get('/google/callback', googleAuth, authController.googleAuthCallback);

// Facebook auth routes
router.get('/facebook', authController.facebookAuth);

const facebookAuth = passport.authenticate('facebook', { failureRedirect: '/' });
router.get('/facebook/callback', facebookAuth, authController.facebookAuthCallback);


module.exports = router;
