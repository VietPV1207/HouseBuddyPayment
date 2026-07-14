const express = require('express');
const router = express.Router();
const paymentRecordController = require('../controllers/paymentRecord.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, paymentRecordController.createPaymentRecord);
router.get('/', verifyToken, paymentRecordController.getAllPaymentRecords);
router.get('/:paymentId', verifyToken, paymentRecordController.getPaymentRecordById);
router.get('/booking/:bookingId', verifyToken, paymentRecordController.getPaymentRecordsByBooking);
router.get('/transaction/:transactionId', verifyToken, paymentRecordController.getPaymentRecordByTransaction);
router.put('/:paymentId', verifyToken, paymentRecordController.updatePaymentRecord);
router.delete('/:paymentId', verifyToken, paymentRecordController.deletePaymentRecord);

module.exports = router;
