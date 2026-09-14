import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Modular Routers
import businessRoutes from './routes/business.js';
import clientRoutes from './routes/client.js';
import projectRoutes from './routes/project.js';
import invoiceRoutes from './routes/invoice.js';
import tallyRoutes from './routes/tally.js';
import paymentRoutes from './routes/payment.js';
import esignRoutes from './routes/esign.js';
import workflowRoutes from './routes/workflow.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/my_app_db';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send({ status: 'API is running' });
});

// API Routes
app.use('/api/business', businessRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/tally', tallyRoutes);
app.use('/api/invoice', paymentRoutes);
app.use('/api/esign', esignRoutes);
app.use('/api/workflows', workflowRoutes);

// Database Connection & Server Initialization
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failure:', error.message);
    process.exit(1);
  });