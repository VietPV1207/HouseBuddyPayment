const express = require("express");
const router = express.Router();
const PayOS = require("@payos/node").PayOS;
const Order = require("../models/Order");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const crypto = require("crypto");

function isValidId(id) {
  const mongoose = require("mongoose");
  return mongoose.Types.ObjectId.isValid(id);
}

function createSignature(data) {
  const keys = ["amount", "cancelUrl", "description", "orderCode", "returnUrl"];
  const signatureString = keys
    .filter((key) => data[key] !== undefined)
    .map((key) => `${key}=${data[key]}`)
    .join("&");
  return crypto
    .createHmac("sha256", process.env.PAYOS_CHECKSUM_KEY)
    .update(signatureString)
    .digest("hex");
}

function getPayOSClient() {
  if (
    !process.env.PAYOS_CLIENT_ID ||
    !process.env.PAYOS_API_KEY ||
    !process.env.PAYOS_CHECKSUM_KEY
  ) {
    return null;
  }
  return new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
  });
}

router.post("/checkout", async (req, res, next) => {
  try {
    const { order_id } = req.body;

    if (!order_id || !isValidId(order_id)) {
      return res.status(400).json({ message: "Valid order_id is required" });
    }

    const order = await Order.findById(order_id)
      .populate("customer_id")
      .populate("service_id");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payOS = getPayOSClient();
    if (!payOS) {
      return res.status(500).json({ message: "PayOS not configured" });
    }

    const orderCode = parseInt(order._id.toString().substring(0, 10), 16);
    const amount = order.amount;
    const description = `TT ${order._id.toString().substring(0, 8)}`;

    const paymentRequestData = {
      orderCode,
      amount,
      description,
      items: [
        {
          name: order.service_id?.service_name || "Dich vu",
          quantity: 1,
          price: amount,
        },
      ],
      returnUrl: `${process.env.CLIENT_URL || "http://localhost:3000"}/orders/${order._id}?status=success`,
      cancelUrl: `${process.env.CLIENT_URL || "http://localhost:3000"}/orders/${order._id}?status=cancelled`,
    };

    const paymentLink = await payOS.paymentRequests.create(paymentRequestData);

    await Order.findByIdAndUpdate(order_id, {
      payment_link: paymentLink.checkoutUrl,
      payment_status: "pending",
      orderCode,
    });

    res.json({
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/webhook", async (req, res) => {
  try {
    const payload = req.body;
    const payOS = getPayOSClient();

    if (!payOS) {
      console.error("PayOS not configured");
      return res.status(500).json({ success: false });
    }

    let webhookData;
    try {
      webhookData = await payOS.webhooks.verify(payload);
      console.log("Webhook verified data:", webhookData);
    } catch (verifyError) {
      console.error("Invalid signature", verifyError.message);
      return res.status(400).json({ success: false });
    }

    // lấy orderCode trực tiếp từ webhookData
    const orderCode = webhookData.orderCode;
    if (!orderCode) {
      console.error("OrderCode missing", webhookData);
      return res.status(400).json({ success: false });
    }

    const order = await Order.findOne({ orderCode });
    if (!order) {
      console.error("Order not found", { orderCode });
      return res.status(404).json({ success: false });
    }

    // lấy status trực tiếp từ webhookData
    const status = webhookData.status;
    if (status === "PAID") {
      order.payment_status = "paid";
      order.status = "assigned";

      // Credit company wallet for received payment, avoid double-credit on retries
      try {
        // Skip if amount is missing
        if (order.amount && order.amount > 0) {
          const existing = await Transaction.findOne({ order_id: order._id, transaction_type: 'income', status: 'success' });
          if (!existing) {
            const companyWallet = await Wallet.findOne({ wallet_type: 'corporate', owner_model: 'Company' });
            if (companyWallet) {
              companyWallet.balance = (companyWallet.balance || 0) + order.amount;
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
            } else {
              console.error('Company wallet not found to credit payment for order', order._id);
            }
          } else {
            console.log('Payment already credited for order', order._id);
          }
        }
      } catch (creditErr) {
        console.error('Error crediting company wallet on webhook:', creditErr);
      }
    } else if (status === "CANCELLED") {
      order.payment_status = "cancelled";
      order.status = "cancelled";
    } else {
      console.warn("Unhandled status", status);
    }

    await order.save();
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
