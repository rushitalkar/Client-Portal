# Multi-Tenant Client Portal & Workflow API

Group 4 :
Rushikesh Talkar
Ranjeet Munna Sah
Pratham Kishor Gupta



A full-stack, multi-tenant SaaS backend built with **Node.js**, **Express**, **MongoDB**, and **Next.js**. Designed for service agencies, CA/CPA firms, and B2B platforms, it handles client management, automated invoicing, Tally XML synchronization, digital eSign audit logs, and WhatsApp payment notifications.

---

## 🚀 Live Demo & Deployment

* **Backend API Base URL:** https://client-9u2p.onrender.com/
* **Frontend:** https://client-portal-backend-tawny.vercel.app/

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** Next.js, React, Tailwind CSS, Axios
* **Backend:** Node.js (ES Modules), Express.js
* **Database:** MongoDB with Mongoose (Multi-tenant relational schema design)
* **Authentication:** JSON Web Tokens (JWT) with Role-Based Access Control (`business` / `client`)
* **Integrations:** Multer (File uploads), XML2JS (Tally parser), Meta WhatsApp Cloud API Mock, Aadhaar eSign verification workflow

---

## 📂 Project Structure

```text
├── middleware/
│   └── auth.js             # JWT Verification & Role-Based Access Control
├── models/
│   ├── Business.js         # Business/Tenant schema
│   ├── Client.js           # Client credentials & association
│   ├── Project.js          # Project deliverables & progress
│   ├── Invoice.js          # Standard billing records
│   ├── TallyInvoice.js     # Tally XML mapped metadata
│   ├── PaymentLink.js      # UPI & Stripe payment tracking
│   ├── Document.js         # Shared files & attachments
│   ├── ESignLog.js         # Digital signature audit trail
│   └── index.js            # Central model exporter
├── routes/
│   ├── business.js         # Business onboarding & auth
│   ├── client.js           # Client creation & authentication
│   ├── project.js          # Project lifecycle management
│   ├── invoice.js          # File upload & invoice listing
│   ├── tally.js            # Tally XML import & synchronization
│   ├── payment.js          # WhatsApp dispatch & payment links
│   ├── esign.js           # Digital eSign verification flow
│   └── workflow.js         # Compliance & GST calendar lookup
├── uploads/                # Local storage directory for uploads
├── index.js                # Express app entrypoint & DB connection
└── package.json
