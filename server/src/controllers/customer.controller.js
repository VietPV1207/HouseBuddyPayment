const mongoose = require('mongoose');
const CustomerProfile = require('../models/customerProfile.model');

exports.updateCustomerProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, email, address, gender, age, avatarUrl, gPointBalance } = req.body;

        const profile = await CustomerProfile.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(userId) },
            { fullName, email, address, gender, age, avatarUrl, gPointBalance },
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        res.json({
            message: 'Customer profile updated successfully',
            profile
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCustomerProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const profile = await CustomerProfile.findOne({ _id: new mongoose.Types.ObjectId(userId) });

        if (!profile) {
            return res.status(404).json({ message: 'Customer profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};