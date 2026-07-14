const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

router.put('/approve-helper/:userId', verifyToken, authorize('admin'), adminController.approveHelper);
router.put('/:userId', verifyToken, authorize('admin'), adminController.updateAdminProfile);
router.get('/:userId', verifyToken, authorize('admin'), adminController.getAdminProfile);

module.exports = router;