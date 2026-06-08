const express = require('express');
const router = express.Router();
const PayOS = require('@payos/node').PayOS;
const Order = require('../models/Order');
const crypto = require('crypto');

function isValidId(id) {
  const mongoose = require('mongoose');
  return mongoose.Types.ObjectId.isValid(id);
}

function createSignature(data) {
  const keys = ['amount', 'cancelUrl', 'description', 'orderCode', 'returnUrl'];
  const signatureString = keys
    .filter((key) => data[key] !== undefined)
    .map((key) => `${key}=${data[key]}`)
    .join('&');
  return crypto.createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY).update(signatureString).digest('hex');
}

function getPayOSClient() {
  if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY || !process.env.PAYOS_CHECKSUM_KEY) {
    return null;
  }
  return new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY
  });
}

router.post('/checkout', async (req, res, next) => {
  try {
    const { order_id } = req.body;
    
    if (!order_id || !isValidId(order_id)) {
      return res.status(400).json({ message: 'Valid order_id is required' });
    }

    const order = await Order.findById(order_id).populate('customer_id').populate('service_id');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const payOS = getPayOSClient();
    if (!payOS) {
      return res.status(500).json({ message: 'PayOS not configured' });
    }

    const orderCode = parseInt(order._id.toString().substring(0, 10), 16);
    const amount = order.amount;
    const description = `TT ${order._id.toString().substring(0, 8)}`;
    
    const paymentRequestData = {
      orderCode,
      amount,
      description,
      items: [{
        name: order.service_id?.service_name || 'Dich vu',
        quantity: 1,
        price: amount
      }],
      returnUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}?status=success`,
      cancelUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}?status=cancelled`
    };

    const paymentLink = await payOS.paymentRequests.create(paymentRequestData);
    
    await Order.findByIdAndUpdate(order_id, { 
      payment_link: paymentLink.checkoutUrl,
      payment_status: 'pending',
      orderCode
    });

    res.json({
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode
    });
  } catch (err) {
    next(err);
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    const payOS = getPayOSClient();

    if (!payOS) {
      // If PayOS is not configured in this environment, don't return 500
      // because external validation requests (like PayOS confirm-webhook)
      // expect a 2xx response. Log and return 200 so validation doesn't fail.
      console.error('PayOS not configured');
      return res.status(200).json({ success: true, message: 'PayOS not configured' });
    }

    // verify signature using PayOS SDK
    let webhookData;
    try {
      webhookData = await payOS.webhooks.verify(payload);
      console.log('Webhook data:', JSON.stringify(webhookData, null, 2));
    } catch (verifyError) {
      console.error('Invalid signature', { error: verifyError.message, payload, webhookData });
      return res.json({ success: true });
    }

    if (!webhookData || !webhookData.data) {
      console.error('Invalid webhook payload structure', { webhookData });
      // Return 200 so validating services treat the webhook endpoint as reachable.
      return res.status(200).json({ success: true });
    }

    // tìm order bằng orderCode
    const order = await Order.findOne({ orderCode: webhookData.data.orderCode });
    if (!order) {
      console.error('Order not found', { orderCode: webhookData.data.orderCode });
      // Do not return 4xx for validation requests - respond 200 so the
      // external service doesn't mark the webhook as invalid.
      return res.status(200).json({ success: true });
    }

    // cập nhật trạng thái thanh toán
    switch (webhookData.data.status) {
      case 'PAID':
        order.payment_status = 'paid';
        order.status = 'assigned';
        break;
      case 'CANCELLED':
        order.payment_status = 'cancelled';
        order.status = 'cancelled';
        break;
      default:
        console.warn('Unhandled status', webhookData.data.status);
    }

    await order.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;