const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const HelperSchedules = require('../models/helperSchedules.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const { helperId, date, status } = req.query;
    const query = {};
    if (helperId && isValidId(helperId)) query.helperId = helperId;
    if (date) query.date = new Date(date);
    if (status) query.status = status;
    const schedules = await HelperSchedules.find(query);
    res.json(schedules);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid schedule id' });
  try {
    const schedule = await HelperSchedules.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    if (!req.body.helperId) return res.status(400).json({ message: 'helperId is required' });
    const schedule = new HelperSchedules(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (err) {
    next(Object.assign(new Error(err.message || 'Error creating schedule'), { status: 400 }));
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid schedule id' });
  try {
    const schedule = await HelperSchedules.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid schedule id' });
  try {
    const schedule = await HelperSchedules.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Schedule deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
