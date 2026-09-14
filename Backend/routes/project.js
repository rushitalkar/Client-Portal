import express from "express";
import { Project } from "../models/models.js";
import { requireRole, authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/create', authenticateToken, requireRole('business'), async (req, res) => {
  try {
    const { clientId, title, description, deadline } = req.body;
    const businessId = req.user.businessId;

    const project = await Project.create({
      businessId,
      clientId,
      title,
      description,
      deadline
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', authenticateToken, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'business') {
      query = { businessId: req.user.businessId };
    } else if (req.user.role === 'client') {
      query = { clientId: req.user.clientId, businessId: req.user.businessId };
    }

    const projects = await Project.find(query).populate('clientId', 'name email phone');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;