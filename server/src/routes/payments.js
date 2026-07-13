const express = require("express");
const router = express.Router();
const PayOS = require("@payos/node").PayOS;
const crypto = require("crypto");
const mongoose = require("mongoose");
const Booking = require("../models/bookings.model");
const PaymentRecord = require("../models/paymentRecords.model");
const Wallet = require("../models/wallet.model");

function isValidId(id) {
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

function generateOrderCode(booking) {
  return parseInt(booking._id.toString().substring(0, 10), 16);
}

router.post("/checkout", async (req, res, next) => {
  try {
    const { booking_id } = req.body;

    if (!booking_id || !isValidId(booking_id)) {
      return res.status(400).json({ message: "Valid booking_id is required" });
    }

    const booking = await Booking.findById(booking_id)
      .populate("customerId")
      .populate("serviceId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const payOS = getPayOSClient();
    if (!payOS) {
      return res.status(500).json({ message: "PayOS not configured" });
    }

    const orderCode = generateOrderCode(booking);
    const amount = booking.totalAmount;
    const description = `TT ${booking._id.toString().substring(0, 8)}`;

    const paymentRequestData = {
      orderCode,
      amount,
      description,
      items: [
        {
          name: booking.serviceId?.packageName || booking.serviceId?.categoryName || "Dich vu",
          quantity: 1,
          price: amount,
        },
      ],
      returnUrl: `${process.env.CLIENT_URL || "http://localhost:3000"}/orders/${booking._id}?status=success`,
      cancelUrl: `${process.env.CLIENT_URL || "http://localhost:3000"}/orders/${booking._id}?status=cancelled`,
    };

    const paymentLink = await payOS.paymentRequests.create(paymentRequestData);

    booking.orderCode = orderCode;
    booking.status = "PENDING";
    await booking.save();

    const paymentRecord = await PaymentRecord.create({
      bookingId: booking._id,
      transactionId: String(orderCode),
      paymentStatus: "pending",
      amount,
    });

    res.json({
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode,
      paymentRecordId: paymentRecord._id,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/webhook", async (req, res) => {
  try {
    const payOS = getPayOSClient();

    if (!payOS) {
      console.error("PayOS not configured");
      return res.status(200).json({ success: true, message: 'PayOS not configured' });
    }

    const raw = req.rawBody ? req.rawBody.toString() : null;
    let webhookData = null;
    try {
      if (raw) {
        webhookData = await payOS.webhooks.verify(raw, req.headers);
      } else {
        webhookData = await payOS.webhooks.verify(req.body, req.headers);
      }
      console.log("Webhook verified data:", webhookData);
    } catch (verifyError) {
      console.error("Webhook signature verification failed", verifyError && verifyError.message);
      return res.status(200).json({ success: true });
    }

    const orderCode = webhookData?.data?.orderCode || webhookData?.orderCode || webhookData?.data?.order_code || webhookData?.order_code;
    const status = webhookData?.data?.status || webhookData?.status;

    if (!orderCode) {
      console.error("OrderCode missing in webhook payload", { webhookData });
      return res.status(200).json({ success: true });
    }

    const booking = await Booking.findOne({ orderCode });
    if (!booking) {
      console.error("Booking not found", { orderCode });
      return res.status(200).json({ success: true });
    }

    if (status === "PAID") {
      // idempotent: only update/credit if not already paid
      if (booking.status !== "PAID") {
        booking.status = "PAID";
        await booking.save();

        const record = await PaymentRecord.findOne({ bookingId: booking._id, paymentStatus: { $ne: "completed" } });
        if (record) {
          record.paymentStatus = "completed";
          await record.save();
        }

        try {
          if (booking.totalAmount && booking.totalAmount > 0 && booking.helperId) {
            const existing = await Wallet.findOne({ userId: booking.helperId, walletType: "personal" });
            if (existing) {
              existing.balance = (existing.balance || 0) + booking.totalAmount;
              existing.lastUpdate = new Date();
              await existing.save();
            } else {
              await Wallet.create({
                userId: booking.helperId,
                walletType: "personal",
                balance: booking.totalAmount,
                lastUpdate: new Date(),
              });
            }
          }
        } catch (creditErr) {
          console.error("Error crediting helper wallet on webhook:", creditErr);
        }
      } else {
        console.log("Booking already marked PAID", booking._id.toString());
      }
    } else if (status === "CANCELLED") {
      booking.status = "CANCELLED";
      await booking.save();
      await PaymentRecord.updateOne(
        { bookingId: booking._id },
        { paymentStatus: "failed" }
      );
    } else {
      console.warn("Unhandled webhook status", status);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;
