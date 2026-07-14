const express = require('express');
const router = express.Router();
const payosWebhookController = require('../controllers/payosWebhook.controller');

router.post('/webhook', payosWebhookController.handlePayOSWebhook);

module.exports = router;
