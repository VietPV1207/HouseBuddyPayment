const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, voucherController.createVoucher);
router.get('/', verifyToken, voucherController.getAllVouchers);
router.get('/:voucherId', verifyToken, voucherController.getVoucherById);
router.get('/customer/:customerId', verifyToken, voucherController.getVouchersByCustomer);
router.put('/:voucherId', verifyToken, voucherController.updateVoucher);
router.post('/:voucherId/apply', verifyToken, voucherController.applyVoucher);
router.delete('/:voucherId', verifyToken, voucherController.deleteVoucher);

module.exports = router;
