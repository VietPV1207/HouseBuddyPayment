const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const UserAccount = require('../models/userAccount.model');
const CustomerProfile = require('../models/customerProfile.model');
const { sendOTPEmail } = require('../utils/email');

const generateToken = (userId, role) => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const validateEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhoneNumber = (phone) => {
    if (!phone) return false;
    const phoneRegex = /^0\d{9,10}$/;
    return phoneRegex.test(phone);
};

const getOTPConfig = () => ({
    expiryMinutes: 2,
    maxAttempts: 3,
    lockMinutes: 1,
    cooldownSeconds: 30
});

const getLoginConfig = () => ({
    maxAttempts: 5,
    lockMinutes: 5
});

const formatUserResponse = (user) => ({
    _id: user._id,
    phoneNumber: user.phoneNumber,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus
});

exports.registerCustomer = async (req, res) => {
    try {
        const { phoneNumber, email, password, fullName, address, gender, age } = req.body;
        const { expiryMinutes } = getOTPConfig();

        if (!phoneNumber && !email) {
            return res.status(400).json({ message: 'Phone number or email is required' });
        }

        if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number. Must be 10-11 digits starting with 0.' });
        }

        if (email && !validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        const existingPhone = await UserAccount.findOne({ phoneNumber });
        if (existingPhone) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }

        const existingEmail = await UserAccount.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otpCode = generateOTP();
        const otpExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);

        const userAccount = await UserAccount.create({
            phoneNumber,
            email,
            password: hashedPassword,
            role: 'customer',
            accountStatus: 'pending',
            otpCode,
            otpExpiry,
            customerInfo: { fullName, address, gender, age }
        });

        if (email) {
            try {
                await sendOTPEmail(email, otpCode);
            } catch (emailErr) {
                console.error('Email send failed:', emailErr.message);
            }
        }

        res.status(201).json({
            message: 'Customer registered successfully. Please verify OTP.',
            _id: userAccount._id,
            otp: otpCode
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.registerHelper = async (req, res) => {
    try {
        const { phoneNumber, email, password, identityDetails } = req.body;
        const { expiryMinutes } = getOTPConfig();

        if (!phoneNumber && !email) {
            return res.status(400).json({ message: 'Phone number or email is required' });
        }

        if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number. Must be 10-11 digits starting with 0.' });
        }

        if (email && !validateEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        const existingPhone = await UserAccount.findOne({ phoneNumber });
        if (existingPhone) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }

        const existingEmail = await UserAccount.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otpCode = generateOTP();
        const otpExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);

        const userAccount = await UserAccount.create({
            phoneNumber,
            email,
            password: hashedPassword,
            role: 'helper',
            accountStatus: 'pending',
            otpCode,
            otpExpiry,
            helperInfo: identityDetails || null
        });

        if (email) {
            try {
                await sendOTPEmail(email, otpCode);
            } catch (emailErr) {
                console.error('Email send failed:', emailErr.message);
            }
        }

        res.status(201).json({
            message: 'Helper registration submitted. Please verify OTP.',
            _id: userAccount._id,
            otp: otpCode
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginAttemptTracker = new Map();
const otpAttemptTracker = new Map();

exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, email, otpCode } = req.body;
        const { lockMinutes, maxAttempts } = getOTPConfig();

        const query = phoneNumber 
            ? { phoneNumber } 
            : email 
            ? { email } 
            : null;

        if (!query) {
            return res.status(400).json({ message: 'Phone number or email is required' });
        }

        const user = await UserAccount.findOne(query);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.accountStatus === 'active') {
            return res.status(400).json({ message: 'Account already verified' });
        }

        if (!otpCode) {
            return res.status(400).json({ message: 'OTP code is required' });
        }

        const userKey = user._id.toString();
        const attempts = otpAttemptTracker.get(userKey) || 0;
        const lockUntil = loginAttemptTracker.get(userKey);
        
        if (lockUntil && lockUntil > Date.now()) {
            return res.status(429).json({ message: `Account locked. Try again in ${Math.ceil((lockUntil - Date.now()) / 60000)} minutes.` });
        }

        if (Date.now() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP expired. Please request new OTP.' });
        }

        if (user.otpCode !== otpCode) {
            otpAttemptTracker.set(userKey, attempts + 1);
            
            if (attempts + 1 >= maxAttempts) {
                loginAttemptTracker.set(userKey, Date.now() + lockMinutes * 60000);
                return res.status(429).json({ message: `Too many failed attempts. Account locked for ${lockMinutes} minutes.` });
            }
            
            const remainingAttempts = maxAttempts - (attempts + 1);
            if (attempts + 1 >= 3) {
                return res.status(400).json({ message: `Too many failed attempts. Try again in 1 minute.`, attemptsRemaining: remainingAttempts });
            }
            
            return res.status(400).json({ message: `Invalid OTP. ${remainingAttempts} attempts remaining.` });
        }

        otpAttemptTracker.delete(userKey);
        loginAttemptTracker.delete(userKey);

        user.accountStatus = user.role === 'helper' ? 'in-progress' : 'active';
        user.otpCode = undefined;
        user.otpExpiry = undefined;
        
        if (user.role === 'customer' && user.customerInfo) {
            await CustomerProfile.create({
                _id: user._id,
                email: user.email,
                fullName: user.customerInfo.fullName || email.split('@')[0],
                address: user.customerInfo.address || [],
                age: user.customerInfo.age,
                gender: user.customerInfo.gender,
                gPointBalance: 0
            });
            user.customerInfo = undefined;
        }
        await user.save();

        res.json({
            message: user.role === 'helper' 
                ? 'Account verified successfully. Your application is pending admin approval.' 
                : 'Account verified successfully',
            user: formatUserResponse(user)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { phoneNumber, email } = req.body;
        const { expiryMinutes } = getOTPConfig();

        const query = phoneNumber 
            ? { phoneNumber } 
            : email 
            ? { email } 
            : null;

        if (!query) {
            return res.status(400).json({ message: 'Phone number or email is required' });
        }

        const user = await UserAccount.findOne(query);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.accountStatus !== 'pending' && user.accountStatus !== 'in-progress') {
            return res.status(400).json({ message: 'Account already verified or not in pending status' });
        }

        const userKey = user._id.toString();
        const lockUntil = loginAttemptTracker.get(userKey);
        if (lockUntil && lockUntil > Date.now()) {
            return res.status(429).json({ message: 'Account is locked. Please wait.' });
        }

        const otpCode = generateOTP();
        const otpExpiry = new Date(Date.now() + expiryMinutes * 60 * 1000);

        user.otpCode = otpCode;
        user.otpExpiry = otpExpiry;
        await user.save();

        res.json({
            message: 'New OTP generated successfully',
            otp: otpCode
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { phoneNumber, email, password } = req.body;
        const { maxAttempts, lockMinutes } = getLoginConfig();

        const identifier = phoneNumber || email;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Phone number/email and password are required' });
        }

        const query = { $or: [{ phoneNumber: identifier }, { email: identifier }] };
        const user = await UserAccount.findOne(query);

        if (!user) {
            return res.status(404).json({ message: 'Account not found. Please register first.' });
        }

        const userKey = user._id.toString();
        const lockUntil = loginAttemptTracker.get(userKey);

        if (lockUntil && lockUntil > Date.now()) {
            return res.status(429).json({ message: `Account locked. Try again in ${Math.ceil((lockUntil - Date.now()) / 60000)} minutes.`, accountStatus: 'locked' });
        }

        if (user.accountStatus !== 'active') {
            return res.status(403).json({ message: `Account is ${user.accountStatus}. Please verify OTP first.` });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const attempts = (loginAttemptTracker.get(userKey) || 0) + 1;
            loginAttemptTracker.set(userKey, attempts);
            
            if (attempts >= maxAttempts) {
                loginAttemptTracker.set(userKey, Date.now() + lockMinutes * 60000);
                return res.status(429).json({ message: `Too many failed attempts. Account locked for ${lockMinutes} minutes.`, accountStatus: 'locked' });
            }
            
            const remainingAttempts = maxAttempts - attempts;
            if (attempts >= 3) {
                return res.status(400).json({ message: `Invalid credentials. Warning: ${remainingAttempts} attempts remaining before lockout.`, attemptsRemaining: remainingAttempts });
            }
            
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        loginAttemptTracker.delete(userKey);

        const token = generateToken(user._id, user.role);

        res.json({
            message: 'Login successful',
            token,
            user: formatUserResponse(user)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};