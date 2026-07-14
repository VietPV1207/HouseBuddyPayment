const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, walletController.createWallet);
router.get('/', verifyToken, walletController.getAllWallets);
router.get('/:walletId', verifyToken, walletController.getWalletById);
router.get('/user/:userId', verifyToken, walletController.getWalletByUser);
router.put('/:walletId', verifyToken, walletController.updateWallet);
router.put('/:walletId/balance', verifyToken, walletController.updateWalletBalance);
router.delete('/:walletId', verifyToken, walletController.deleteWallet);

module.exports = router;
