const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Worker = require('../models/Worker');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const workers = await Worker.find();
    console.info(`[workers] fetched ${workers.length} items`);
    console.debug(workers);
    res.json(workers);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid worker id' });
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    const worker = new Worker(req.body);
    await worker.save();
    res.status(201).json(worker);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid worker id' });
  try {
    const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid worker id' });
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json({ message: 'Worker deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
