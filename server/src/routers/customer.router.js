const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

router.put('/:userId', verifyToken, authorize('customer'), customerController.updateCustomerProfile);
router.get('/:userId', verifyToken, authorize('customer'), customerController.getCustomerProfile);

module.exports = router;