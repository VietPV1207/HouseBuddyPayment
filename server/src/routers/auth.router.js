const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register/customer', authController.registerCustomer);
router.post('/register/helper', authController.registerHelper);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', authController.login);

module.exports = router;