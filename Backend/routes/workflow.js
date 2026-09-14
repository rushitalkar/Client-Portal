import express from "express";

const router = express.Router();

router.get('/gst-deadlines', (req, res) => {
  res.json({
    compliance: 'GST India Statutory Deadlines',
    schedules: [
      { returnType: 'GSTR-1', frequency: 'Monthly', dueDate: '11th of every month' },
      { returnType: 'GSTR-3B', frequency: 'Monthly', dueDate: '20th of every month' },
      { returnType: 'CMP-08', frequency: 'Quarterly', dueDate: '18th of month following quarter' },
      { returnType: 'GSTR-9', frequency: 'Annual', dueDate: '31st December' }
    ],
    timestamp: new Date().toISOString()
  });
});

export default router;