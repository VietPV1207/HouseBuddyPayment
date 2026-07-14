const mongoose = require('mongoose');
const HelperProfile = require('../models/helperProfile.model');
const UserAccount = require('../models/userAccount.model');

exports.updateHelperProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, email, bio, avatarUrl, availability, skills, identityVerified, identityDetails, rating, workStatus, currentZoneId, equipment, age, gender, address } = req.body;

        if (req.userId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this profile.' });
        }

        const account = await UserAccount.findById(req.userId);
        if (!account || account.accountStatus !== 'active') {
            return res.status(403).json({ message: 'Only active helpers can update their profile.' });
        }

        const updatePayload = {
            fullName,
            email,
            bio,
            avatarUrl,
            availability,
            skills,
            identityVerified,
            identityDetails,
            rating,
            workStatus,
            currentZoneId,
            equipment,
            age,
            gender,
            address
        };

        const profile = await HelperProfile.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(userId) },
            updatePayload,
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({ message: 'Helper profile not found' });
        }

        res.json({
            message: 'Helper profile updated successfully',
            profile
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getHelperProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.userId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to view this profile.' });
        }

        const profile = await HelperProfile.findOne({ _id: new mongoose.Types.ObjectId(userId) });

        if (!profile) {
            return res.status(404).json({ message: 'Helper profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};