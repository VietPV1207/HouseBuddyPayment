const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const AdminProfile = require('../models/adminProfile.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const admins = await AdminProfile.find();
    res.json(admins);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid admin id' });
  try {
    const admin = await AdminProfile.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    const admin = new AdminProfile(req.body);
    await admin.save();
    res.status(201).json(admin);
  } catch (err) {
    next(Object.assign(new Error(err.message || 'Error creating admin'), { status: 400 }));
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid admin id' });
  try {
    const admin = await AdminProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid admin id' });
  try {
    const admin = await AdminProfile.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
