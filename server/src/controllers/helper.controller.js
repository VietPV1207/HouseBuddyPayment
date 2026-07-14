const mongoose = require('mongoose');
const HelperProfile = require('../models/helperProfile.model');

exports.updateHelperProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, email, skills, identityVerified, identityDetails, rating, workStatus, currentZoneId, equipment } = req.body;

        const profile = await HelperProfile.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(userId) },
            {
                fullName,
                email,
                skills,
                identityVerified,
                identityDetails,
                rating,
                workStatus,
                currentZoneId,
                equipment
            },
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

        const profile = await HelperProfile.findOne({ _id: new mongoose.Types.ObjectId(userId) });

        if (!profile) {
            return res.status(404).json({ message: 'Helper profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};