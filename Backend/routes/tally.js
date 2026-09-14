import express from "express";
import multer from "multer";
import xml2js from "xml2js";
import { requireRole, authenticateToken } from "../middleware/auth.js";
import { TallyInvoice, Invoice } from "../models/models.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const { Parser } = xml2js;

router.post('/sync', authenticateToken, requireRole('business'), upload.single('tallyXml'), async (req, res) => {
  try {
    const { clientId } = req.body;
    const businessId = req.user.businessId;

    if (!req.file) return res.status(400).json({ error: 'Tally XML file required' });

    const parser = new Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(req.file.buffer.toString());

    const voucher = result?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.VOUCHER || {};
    const tallyInvoiceNo = voucher.VOUCHERNUMBER || `TALLY-${Date.now()}`;
    const amount = parseFloat(voucher.AMOUNT || req.body.amount || 0);
    const gstAmount = parseFloat(voucher.GSTAMOUNT || 0);

    const invoice = await Invoice.create({
      businessId,
      clientId,
      invoiceNumber: tallyInvoiceNo,
      amount,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    });

    const tallyInvoice = await TallyInvoice.create({
      businessId,
      clientId,
      tallyInvoiceNo,
      amount,
      gstAmount,
      eInvoiceQR: voucher.EINVOICEQR || ''
    });

    res.status(201).json({ invoice, tallyInvoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;