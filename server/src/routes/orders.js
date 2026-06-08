const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Worker = require('../models/Worker');
const Service = require('../models/Service');
const Transaction = require('../models/Transaction');
const PayOS = require('@payos/node').PayOS;

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

async function createPayOSPayment(order) {
  try {
    if (!process.env.PAYOS_CLIENT_ID || !process.env.PAYOS_API_KEY) {
      return null;
    }
    
    const orderCode = parseInt(order._id.toString().substring(0, 10), 16);
    const service = await Service.findById(order.service_id);
    
    const paymentRequestData = {
      orderCode,
      amount: order.amount,
      description: `TT don ${order._id.toString().substring(0, 5)}`,
      items: [{
        name: service?.service_name || 'Dich vu',
        quantity: 1,
        price: order.amount
      }],
      returnUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders?status=success`,
      cancelUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders?status=cancelled`
    };
    
    const payOS = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY,
    });
    
    return await payOS.paymentRequests.create(paymentRequestData);
  } catch (err) {
    console.error('PayOS payment creation error:', err);
    return null;
  }
}

router.get('/my', async (req, res, next) => {
  try {
    const { worker_id, status } = req.query;
    const query = {};
    if (worker_id && isValidId(worker_id)) query.worker_id = worker_id;
    if (status) query.status = status;
    const orders = await Order.find(query).populate('customer_id').populate('worker_id').populate('service_id');
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get('/customer/:customer_id', async (req, res, next) => {
  const { customer_id } = req.params;
  if (!isValidId(customer_id)) return res.status(400).json({ message: 'Invalid customer id' });
  try {
    const orders = await Order.find({ customer_id }).populate('customer_id').populate('worker_id').populate('service_id');
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get('/pending-count/:worker_id', async (req, res, next) => {
  const { worker_id } = req.params;
  if (!isValidId(worker_id)) return res.status(400).json({ message: 'Invalid worker id' });
  try {
    const count = await Order.countDocuments({ worker_id, status: { $in: ['pending', 'assigned'] } });
    res.json({ count });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
  const { status, role } = req.body;
  const allowed = ['accepted', 'in_progress', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    const order = await Order.findById(req.params.id).populate('customer_id').populate('worker_id').populate('service_id');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Handle confirmation flow for completion
    if (status === 'completed' && role) {
      if (role === 'worker') {
        order.worker_confirmed = true;
      } else if (role === 'customer') {
        order.customer_confirmed = true;
      }
      
      // Only mark as completed when both parties confirm
      if (order.worker_confirmed && order.customer_confirmed) {
        order.status = 'completed';
        order.completed_at = new Date();
        
        if (order.worker_id && order.amount) {
          try {
            const worker = await Worker.findById(order.worker_id._id || order.worker_id);
            if (!worker) throw new Error('Worker not found');
            
            const companyWallet = await Wallet.findOne({ wallet_type: 'corporate', owner_model: 'Company' });
            if (!companyWallet) throw new Error('Company wallet not found');
            
            if (worker.wallet_personal_id) {
              const workerWallet = await Wallet.findById(worker.wallet_personal_id);
              if (workerWallet) {
                const workerAmount = order.amount * 0.8;
                const feeAmount = order.amount * 0.2;
                
                workerWallet.balance += workerAmount;
                workerWallet.last_update = new Date();
                await workerWallet.save();
                
                await Transaction.create({
                  wallet_source_id: companyWallet._id,
                  wallet_target_id: worker.wallet_personal_id,
                  amount: workerAmount,
                  transaction_type: 'income',
                  order_id: order._id,
                  status: 'success'
                });
                
                await Transaction.create({
                  wallet_source_id: companyWallet._id,
                  wallet_target_id: companyWallet._id,
                  amount: feeAmount,
                  transaction_type: 'fee',
                  order_id: order._id,
                  status: 'success'
                });
              }
            }
          } catch (creditErr) {
            console.error('Payment distribution error:', creditErr);
          }
        }
      }
    } else {
      order.status = status;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { worker_id, status } = req.query;
    const query = {};
    if (status) query.status = status;
    const orders = await Order.find(query).populate('customer_id').populate('worker_id').populate('service_id');
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
  try {
    const order = await Order.findById(req.params.id).populate('customer_id').populate('worker_id').populate('service_id');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) return res.status(400).json({ message: 'Body is required' });
  try {
    const orderData = { ...req.body };
    if (!orderData.status) orderData.status = 'pending';
    
    // Auto-assign worker if worker_id not provided
    if (!orderData.worker_id && orderData.service_id) {
      const availableWorkers = await Worker.find({ 
        skills: orderData.service_id, 
        status: 'active' 
      }).limit(1);
      if (availableWorkers.length > 0) {
        orderData.worker_id = availableWorkers[0]._id;
        if (orderData.payment_method === 'cash') {
          orderData.status = 'assigned';
        }
      }
    }
    
    const order = new Order(orderData);
    await order.save();
    
    // For cash payments, add to company wallet immediately
    if (order.payment_method === 'cash' && order.amount && order.amount > 0) {
      try {
        const companyWallet = await Wallet.findOne({ wallet_type: 'corporate', owner_model: 'Company' });
        if (companyWallet) {
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
      } catch (paymentErr) {
        console.error('Payment processing error:', paymentErr);
      }
    }
    
    // For e-wallet payments, create PayOS link
    let paymentData = null;
    if (order.payment_method === 'e-wallet' && order.amount && order.amount > 0) {
      paymentData = await createPayOSPayment(order);
      if (paymentData) {
        const orderCode = parseInt(order._id.toString().substring(0, 10), 16);
        await Order.findByIdAndUpdate(order._id, { 
          payment_link: paymentData.checkoutUrl,
          payment_status: 'pending',
          orderCode
        });
      }
    }
    
    const populatedOrder = await Order.findById(order._id).populate('customer_id').populate('worker_id').populate('service_id');
    
    const response = {
      ...populatedOrder.toObject(),
      payment_url: paymentData?.checkoutUrl || null,
      qr_code: paymentData?.qrCode || null
    };
    
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('customer_id').populate('worker_id').populate('service_id');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
