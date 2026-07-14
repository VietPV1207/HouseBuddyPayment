const mongoose = require('mongoose');
const Booking = require('../models/bookings.model');
const CustomerProfile = require('../models/customerProfile.model');
const HelperProfile = require('../models/helperProfile.model');
const Service = require('../models/services.model');

exports.getAllBookings = async (req, res) => {
    try {
        const { status, customerId, helperId } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (customerId) filter.customerId = new mongoose.Types.ObjectId(customerId);
        if (helperId) filter.helperId = new mongoose.Types.ObjectId(helperId);

        const bookings = await Booking.find(filter)
            .populate({ path: 'customerId', model: CustomerProfile })
            .populate({ path: 'helperId', model: HelperProfile })
            .populate({ path: 'serviceId', model: Service })
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
