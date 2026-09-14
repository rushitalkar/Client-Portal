import express from "express";
import crypto from "crypto";
import { ESignLog } from "../models/models.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/aadhaar/init', authenticateToken, async (req, res) => {
  try {
    const { documentId, clientId, aadhaarNumber } = req.body;

    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      return res.status(400).json({ error: 'Invalid identification format' });
    }

    const transactionId = `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const last4 = aadhaarNumber.slice(-4);

    req.app.set(`esign_${transactionId}`, { documentId, clientId, last4 });

    res.json({
      message: 'OTP sent to registered mobile number',
      transactionId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/aadhaar/verify', authenticateToken, async (req, res) => {
  try {
    const { transactionId, otp } = req.body;

    if (otp !== '123456') {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const txData = req.app.get(`esign_${transactionId}`);
    if (!txData) return res.status(404).json({ error: 'Transaction expired or not found' });

    const signedPdfUrl = `/uploads/signed-${txData.documentId}.pdf`;

    const log = await ESignLog.create({
      documentId: txData.documentId,
      clientId: txData.clientId,
      aadhaarLast4: txData.last4,
      ip: req.ip || '127.0.0.1',
      pdfUrl: signedPdfUrl
    });

    res.json({
      message: 'Document signed successfully',
      pdfUrl: signedPdfUrl,
      logId: log._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
