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

router.post('/webhook', async (req, res) => {
  try {
    const { data, signature } = req.body;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

    // verify signature
    const sortedJson = JSON.stringify(data, Object.keys(data).sort());
    const computedSignature = crypto.createHmac('sha256', checksumKey)
                                    .update(sortedJson)
                                    .digest('hex');
    if (computedSignature !== signature) {
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // tìm order bằng orderCode
    const order = await Order.findOne({ orderCode: data.orderCode });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (data.status === 'PAID') {
      order.payment_status = 'paid';
      order.status = 'assigned';
      // cộng tiền vào ví công ty...
    } else if (data.status === 'CANCELLED') {
      order.payment_status = 'cancelled';
      order.status = 'cancelled';
    }

    await order.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;