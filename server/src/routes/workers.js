const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const HelperProfile = require('../models/helperProfile.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const helpers = await HelperProfile.find();
    res.json(helpers);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid helper id' });
  try {
    const helper = await HelperProfile.findById(req.params.id);
    if (!helper) return res.status(404).json({ message: 'Helper not found' });
    res.json(helper);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid helper id' });
  try {
    const update = req.body || {};
    const helper = await HelperProfile.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!helper) return res.status(404).json({ message: 'Helper not found' });
    res.json(helper);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    const helper = new HelperProfile(req.body);
    await helper.save();
    res.status(201).json(helper);
  } catch (err) {
    next(Object.assign(new Error(err.message || 'Error creating helper'), { status: 400 }));
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid helper id' });
  try {
    const helper = await HelperProfile.findByIdAndDelete(req.params.id);
    if (!helper) return res.status(404).json({ message: 'Helper not found' });
    res.json({ message: 'Helper deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
