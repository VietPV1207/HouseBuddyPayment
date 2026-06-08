const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Worker = require('../models/Worker');
const Service = require('../models/Service');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get('/', async (req, res, next) => {
  try {
    const workers = await Worker.find().populate('skills', 'service_name');
    res.json(workers);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid worker id' });
  try {
    const worker = await Worker.findById(req.params.id).populate('skills', 'service_name');
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid worker id' });
  try {
    const update = req.body || {};
    if (update.skills && Array.isArray(update.skills)) {
      const invalidSkills = update.skills.filter(id => !isValidId(id));
      if (invalidSkills.length > 0) {
        return res.status(400).json({ message: `Invalid skill service id: ${invalidSkills.join(', ')}` });
      }
      const existingServices = await Service.find({ _id: { $in: update.skills } }, { _id: 1 });
      const existingIds = existingServices.map(s => s._id.toString());
      const missing = update.skills.filter(id => !existingIds.includes(id));
      if (missing.length > 0) {
        return res.status(400).json({ message: `Unknown service id: ${missing.join(', ')}` });
      }
    }
    const worker = await Worker.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).populate('skills', 'service_name');
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
