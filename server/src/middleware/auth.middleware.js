const jwt = require('jsonwebtoken');
const UserAccount = require('../models/userAccount.model');

const extractToken = (req) => req.header('Authorization')?.replace('Bearer ', '');

const verifyToken = async (req, res, next) => {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;

        const account = await UserAccount.findById(req.userId);
        if (!account) {
            return res.status(401).json({ message: 'Account not found.' });
        }
        if (account.accountStatus !== 'active') {
            return res.status(403).json({ message: 'Account is not active.' });
        }

        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.userId) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({ message: 'Access denied. You do not have permission.' });
        }
        next();
    };
};

module.exports = {
    verifyToken,
    authorize
};