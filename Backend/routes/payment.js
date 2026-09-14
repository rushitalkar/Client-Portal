import express from "express";
import { PaymentLink, Invoice } from "../models/models.js";
import { requireRole, authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/send-whatsapp', authenticateToken, requireRole('business'), async (req, res) => {
  try {
    const { invoiceId, phone } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const upiLink = `upi://pay?pa=merchant@upi&am=${invoice.amount}`;
    const stripeLink = `https://buy.stripe.com/mock_${invoice._id}`;

    const paymentLink = await PaymentLink.create({
      invoiceId: invoice._id,
      amount: invoice.amount,
      upiLink,
      stripeLink,
      status: 'pending'
    });

    res.json({
      message: 'WhatsApp notification dispatched',
      paymentLink,
      pdfUrl: invoice.fileUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;