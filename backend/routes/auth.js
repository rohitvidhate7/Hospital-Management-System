const express = require('express');
const { validateRegister, validateLogin, validateGoogle, validateOtpRequest, validateOtpVerify, checkValidation } = require('../validations/auth');
const { googleAuth, register, login /*, other functions */ } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/google - Public
router.post('/google', validateGoogle, checkValidation, googleAuth);

// POST /api/auth/register - Public
router.post('/register', validateRegister, checkValidation, register);

// POST /api/auth/login - Public
router.post('/login', validateLogin, checkValidation, login);

// POST /api/auth/login-otp/request - Send OTP to email
router.post('/login-otp/request', validateOtpRequest, checkValidation, require('../controllers/authController').requestLoginOtp);

// POST /api/auth/login-otp/verify - Verify OTP and login
router.post('/login-otp/verify', validateOtpVerify, checkValidation, require('../controllers/authController').verifyLoginOtp);

module.exports = router;

