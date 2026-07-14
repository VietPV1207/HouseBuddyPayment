const mongoose = require('mongoose');
const AdminProfile = require('../models/adminProfile.model');
const UserAccount = require('../models/userAccount.model');
const HelperProfile = require('../models/helperProfile.model');

exports.updateAdminProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, email, roleDetail, voucherMgt, rewardMgt, age } = req.body;

        const profile = await AdminProfile.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(userId) },
            { fullName, email, roleDetail, voucherMgt, rewardMgt, age },
            { new: true, runValidators: true }
        );

        if (!profile) {
            return res.status(404).json({ message: 'Admin profile not found' });
        }

        res.json({
            message: 'Admin profile updated successfully',
            profile
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAdminProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const profile = await AdminProfile.findOne({ _id: new mongoose.Types.ObjectId(userId) });

        if (!profile) {
            return res.status(404).json({ message: 'Admin profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.approveHelper = async (req, res) => {
    try {
        const { userId } = req.params;

        const userAccount = await UserAccount.findById(userId);
        if (!userAccount) {
            return res.status(404).json({ message: 'User account not found' });
        }

        if (userAccount.role !== 'helper') {
            return res.status(400).json({ message: 'User is not a helper' });
        }

        if (userAccount.accountStatus !== 'in-progress') {
            return res.status(400).json({ message: 'Helper is not in pending approval status' });
        }

        const profile = await HelperProfile.create({
            _id: userAccount._id,
            email: userAccount.email,
            fullName: userAccount.helperInfo?.fullName || userAccount.email.split('@')[0],
            skills: userAccount.helperInfo?.skills || [],
            identityVerified: true,
            rating: 0,
            workStatus: 'available',
            age: userAccount.helperInfo?.age,
            gender: userAccount.helperInfo?.gender,
            address: userAccount.helperInfo?.address
        });

        userAccount.accountStatus = 'active';
        userAccount.helperInfo = undefined;
        await userAccount.save();

        res.json({
            message: 'Helper approved successfully',
            user: {
                _id: userAccount._id,
                phoneNumber: userAccount.phoneNumber,
                email: userAccount.email,
                accountStatus: userAccount.accountStatus
            },
            helper: {
                _id: profile._id
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};