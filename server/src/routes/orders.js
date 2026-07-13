const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/bookings.model');
const HelperProfile = require('../models/helperProfile.model');
const Services = require('../models/services.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/my', async (req, res, next) => {
  try {
    const { helper_id, status } = req.query;
    const query = {};
    if (helper_id && isValidId(helper_id)) query.helperId = helper_id;
    if (status) query.status = status;
    const bookings = await Booking.find(query)
      .populate('customerId')
      .populate('helperId')
      .populate('serviceId');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

router.get('/customer/:customer_id', async (req, res, next) => {
  const { customer_id } = req.params;
  if (!isValidId(customer_id)) return res.status(400).json({ message: 'Invalid customer id' });
  try {
    const bookings = await Booking.find({ customerId: customer_id })
      .populate('customerId')
      .populate('helperId')
      .populate('serviceId');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

router.get('/pending-count/:helper_id', async (req, res, next) => {
  const { helper_id } = req.params;
  if (!isValidId(helper_id)) return res.status(400).json({ message: 'Invalid helper id' });
  try {
    const count = await Booking.countDocuments({ helperId: helper_id, status: { $in: ['PENDING', 'CONFIRMED'] } });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid booking id' });
  const { status } = req.body;
  const allowed = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'AWAITING_PAYMENT', 'PAID', 'FINISHED', 'REVIEWED', 'CANCELLED'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customerId').populate('helperId').populate('serviceId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const bookings = await Booking.find(query)
      .populate('customerId')
      .populate('helperId')
      .populate('serviceId');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid booking id' });
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId')
      .populate('helperId')
      .populate('serviceId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    const bookingData = { ...req.body };
    if (!bookingData.status) bookingData.status = 'DRAFT';

    // Auto-assign an available helper if none provided
    if (!bookingData.helperId) {
      const available = await HelperProfile.findOne({ workStatus: 'available' }).limit(1);
      if (available) bookingData.helperId = available._id;
    }

    const booking = new Booking(bookingData);
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('customerId')
      .populate('helperId')
      .populate('serviceId');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid booking id' });
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('customerId')
      .populate('helperId')
      .populate('serviceId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid booking id' });
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
