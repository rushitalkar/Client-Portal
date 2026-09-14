import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Client, Business } from "../models/models.js";
import { requireRole, authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get('/list', authenticateToken, requireRole('business'), async (req, res) => {
  try {
    const clients = await Client.find({ businessId: req.user.businessId }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', authenticateToken, requireRole('business'), async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const businessId = req.user.businessId;

    const plainPassword = crypto.randomBytes(4).toString('hex');
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const client = await Client.create({
      businessId,
      name,
      email,
      phone,
      passwordHash
    });

    res.status(201).json({
      message: 'Client registered successfully',
      clientId: client._id,
      plainPassword
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, subdomain } = req.body;

    const business = await Business.findOne({ subdomain });
    if (!business) return res.status(404).json({ error: 'Business subdomain not found' });

    const client = await Client.findOne({ email, businessId: business._id });
    if (!client) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, client.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { clientId: client._id, businessId: business._id, role: 'client' },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    res.json({ token, clientId: client._id, businessId: business._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;