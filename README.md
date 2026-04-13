# OmniAudit AI

OmniAudit AI is a multimodal compliance auditing app for e-commerce product listings. It helps teams review marketing claims, packaging images, marketplace screenshots, and supplier documents for labeling risks, greenwashing signals, and product-listing mismatches.

[![Live Demo](https://img.shields.io/badge/Live-Demo-indigo?style=for-the-badge)](https://omni-audit-ai.vercel.app/)

## What It Does

- Runs AI audits against product descriptions and uploaded media.
- Compares physical packaging with digital marketplace listings.
- Generates structured reports with findings, legal references, corrective actions, and compliance scores.
- Tracks audit history per user in Firebase.
- Offers a quick-check experience while typing and a voice-based compliance consult flow.

## Current Stack

- Frontend: React 19, Vite, Tailwind CSS 4, Framer Motion
- Backend: Express wrapper for local Vite serving
- Auth and data: Firebase Auth and Firestore
- AI services: Groq-hosted Llama models for audit and consultation
- Export: jsPDF + html2canvas for downloadable report certificates

## Main Product Features

- Multimodal audit flow for text, images, and supplier docs
- Digital twin mismatch detection for physical vs. marketplace assets
- Shelf-life extraction and freshness status in reports
- FSSAI category tagging and reasoning
- Visual-fix suggestions for non-compliant packaging findings
- Audit history dashboard with filtering and report review

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project
- A Groq API key

### Installation

1. Clone the repository.

   ```bash
   git clone https://github.com/deepakpatil26/OmniAudit-AI.git
   cd OmniAudit-AI
   ```

2. Install dependencies.

   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example` and set your values.

   Required variables:

   ```env
   GROQ_API_KEY=your_groq_api_key
   APP_URL=https://omni-audit-ai.vercel.app/
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_FIREBASE_DATABASE_ID=(default)
   ```

4. Start the app.

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev`: start the local app server
- `npm run build`: build the frontend
- `npm run preview`: preview the production build
- `npm run lint`: run TypeScript checks
- `npm run clean`: remove the `dist` folder

## Deployment Notes

- Build command: `npm run build`
- Output directory: `dist`
- Deploy `firestore.rules` with Firebase when updating data rules

```bash
firebase deploy --only firestore:rules
```

## Notes

- The current implementation uses secure server-side Groq routes, not client-side API keys.
- The `.env` file should never be committed. If a real API key has ever been checked in, rotate it.
