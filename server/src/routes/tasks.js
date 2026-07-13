const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Tasks = require('../models/tasks.model');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const { serviceId } = req.query;
    const query = {};
    if (serviceId && isValidId(serviceId)) query.serviceId = serviceId;
    const tasks = await Tasks.find(query);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid task id' });
  try {
    const task = await Tasks.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    if (!req.body.serviceId) return res.status(400).json({ message: 'serviceId is required' });
    if (!req.body.taskName) return res.status(400).json({ message: 'taskName is required' });
    const task = new Tasks(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(Object.assign(new Error(err.message || 'Error creating task'), { status: 400 }));
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid task id' });
  try {
    const task = await Tasks.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid task id' });
  try {
    const task = await Tasks.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
