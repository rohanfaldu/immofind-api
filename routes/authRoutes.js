const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Google auth routes
router.post('/create-normal/user', authController.createNormalUser);

router.post('/create/user', authController.createUser);

router.post('/get/user', authController.getUser);

router.post('/check/user', authController.checkUserExists);

router.post('/updatepassword', authController.updatePassword);

module.exports = router;
