import mongoose from "mongoose";

const { Schema } = mongoose;

// 1. BUSINESS SCHEMA
const businessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    subdomain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerEmail: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    logoUrl: { type: String, default: null },
    primaryColor: { type: String, default: "#000000" },
    customDomain: { type: String, unique: true, sparse: true, lowercase: true, trim: true }
  },
  { timestamps: true }
);

// 2. CLIENT SCHEMA
const clientSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true }
  },
  { timestamps: true }
);

// 3. PROJECT SCHEMA
const projectSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending"
    },
    deadline: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 }
  },
  { timestamps: true }
);

// 4. INVOICE SCHEMA
const invoiceSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    invoiceNumber: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid"
    },
    fileUrl: { type: String }
  },
  { timestamps: true }
);

invoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });

// 5. DOCUMENT SCHEMA
const documentSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// 6. TALLY INVOICE SCHEMA
const tallyInvoiceSchema = new Schema(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    tallyInvoiceNo: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    gstAmount: { type: Number, default: 0, min: 0 },
    eInvoiceQR: { type: String },
    syncedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// 7. PAYMENT LINK SCHEMA
const paymentLinkSchema = new Schema(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    upiLink: { type: String },
    stripeLink: { type: String },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "expired"],
      default: "pending"
    },
    paidAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// 8. E-SIGN LOG SCHEMA
const eSignLogSchema = new Schema(
  {
    documentId: { type: Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    aadhaarLast4: {
      type: String,
      required: true,
      match: /^\d{4}$/
    },
    signedAt: { type: Date, default: Date.now },
    ip: { type: String, required: true },
    pdfUrl: { type: String, required: true }
  },
  { timestamps: true }
);

export const Business = mongoose.model("Business", businessSchema);
export const Client = mongoose.model("Client", clientSchema);
export const Project = mongoose.model("Project", projectSchema);
export const Invoice = mongoose.model("Invoice", invoiceSchema);
export const Document = mongoose.model("Document", documentSchema);
export const TallyInvoice = mongoose.model("TallyInvoice", tallyInvoiceSchema);
export const PaymentLink = mongoose.model("PaymentLink", paymentLinkSchema);
export const ESignLog = mongoose.model("ESignLog", eSignLogSchema);

export default {
  Business,
  Client,
  Project,
  Invoice,
  Document,
  TallyInvoice,
  PaymentLink,
  ESignLog
};