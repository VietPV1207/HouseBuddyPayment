const express = require('express');
const router = express.Router();
const PayOS = require('@payos/node').PayOS;
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');

const isValidId = (id) => {
  const mongoose = require('mongoose');
  return mongoose.Types.ObjectId.isValid(id);
};

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
      payment_status: 'pending'
    });

    res.json({
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode
    });
  } catch (err) {
    next(err);
  }
});

router.post('/webhook', async (req, res, next) => {
  try {
    const webhookBody = req.body;
    
    if (!webhookBody) {
      return res.status(400).json({ message: 'Invalid webhook data' });
    }

    const signature = req.headers['x-payos-signature'];
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    
    if (!signature || !checksumKey) {
      return res.status(401).json({ message: 'Missing signature or checksum key' });
    }

    const webhookData = webhookBody.data || webhookBody;
    
    if (!webhookData.orderCode && !webhookData.status) {
      return res.status(400).json({ message: 'Invalid webhook data' });
    }

    const payload = { ...webhookData };
    delete payload.id;
    
    const signatureData = JSON.stringify(payload, Object.keys(payload).sort());
    const computedSignature = crypto.createHmac('sha256', checksumKey).update(signatureData).digest('hex');
    
    if (computedSignature !== signature) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const description = webhookData.description || '';
    const orderMatch = description.match(/(?:don|order)\s*([a-f0-9]{24})/i);
    
    let order = null;
    if (orderMatch && orderMatch[1]) {
      order = await Order.findById(orderMatch[1]);
    }
    
    if (!order && webhookData.orderId) {
      order = await Order.findById(webhookData.orderId);
    }

    if (!order) {
      const orderCodeHex = webhookData.orderCode.toString(16).padStart(24, '0');
      order = await Order.findById(orderCodeHex);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const paymentStatus = webhookData.status;
    
    if (paymentStatus === 'PAID' || paymentStatus === 'paid' || paymentStatus === 'SUCCESS') {
      order.payment_status = 'paid';
      order.status = 'assigned';
      
      const companyWallet = await Wallet.findOne({ wallet_type: 'corporate', owner_model: 'Company' });
      if (companyWallet && order.amount) {
        companyWallet.balance += order.amount;
        companyWallet.last_update = new Date();
        await companyWallet.save();
        
        await Transaction.create({
          wallet_source_id: null,
          wallet_target_id: companyWallet._id,
          amount: order.amount,
          transaction_type: 'income',
          order_id: order._id,
          status: 'success'
        });
      }
    } else if (paymentStatus === 'CANCELLED' || paymentStatus === 'cancelled') {
      order.payment_status = 'cancelled';
    }

    await order.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;