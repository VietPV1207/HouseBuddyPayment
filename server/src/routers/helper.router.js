const express = require('express');
const router = express.Router();
const helperController = require('../controllers/helper.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

router.put('/:userId', verifyToken, authorize('helper'), helperController.updateHelperProfile);
router.get('/:userId', verifyToken, authorize('helper'), helperController.getHelperProfile);

module.exports = router;