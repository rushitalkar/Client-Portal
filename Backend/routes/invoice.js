import express from "express";
import multer from "multer";
import { Invoice } from "../models/models.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { clientId, invoiceNumber, amount, dueDate } = req.body;
    const businessId = req.user.businessId;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const invoice = await Invoice.create({
      businessId,
      clientId,
      invoiceNumber,
      amount,
      dueDate,
      fileUrl
    });

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'business') {
      query = { businessId: req.user.businessId };
      if (req.query.clientId) query.clientId = req.query.clientId;
    } else {
      query = { clientId: req.user.clientId, businessId: req.user.businessId };
    }

    const invoices = await Invoice.find(query).populate('clientId', 'name email');
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;