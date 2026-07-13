const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const GPoint = require('../models/gPoints.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const { customerId } = req.query;
    const query = {};
    if (customerId && isValidId(customerId)) query.customerId = customerId;
    const points = await GPoint.find(query);
    res.json(points);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid gPoint id' });
  try {
    const point = await GPoint.findById(req.params.id);
    if (!point) return res.status(404).json({ message: 'GPoint not found' });
    res.json(point);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    if (!req.body.customerId) return res.status(400).json({ message: 'customerId is required' });
    if (!req.body.amount) return res.status(400).json({ message: 'amount is required' });
    const point = new GPoint(req.body);
    await point.save();
    res.status(201).json(point);
  } catch (err) {
    next(Object.assign(new Error(err.message || 'Error creating gPoint'), { status: 400 }));
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid gPoint id' });
  try {
    const point = await GPoint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!point) return res.status(404).json({ message: 'GPoint not found' });
    res.json(point);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid gPoint id' });
  try {
    const point = await GPoint.findByIdAndDelete(req.params.id);
    if (!point) return res.status(404).json({ message: 'GPoint not found' });
    res.json({ message: 'GPoint deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
