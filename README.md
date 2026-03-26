# 🛡️ OmniAudit AI v2.0

**OmniAudit AI** is an autonomous compliance agent designed to detect and correct non-compliant product listings in real-time. Leveraging the power of **Gemini 3.1 Flash/Pro**, it provides deep dossier analysis, social video auditing, and AI-powered visual correction for non-compliant imagery.

[![Live Demo](https://img.shields.io/badge/Live-Demo-indigo?style=for-the-badge)](https://omni-audit-ai.vercel.app/)

---

## 🚀 Key Features

- **🔍 Autonomous Audit**: Multimodal analysis of product descriptions, images, and videos against regional laws (EU Green Claims, etc.).
- **🪄 Visual Fixer**: Automatically correct non-compliant product imagery (e.g., removing fake organic seals) using **Gemini 3.1 Flash Image**.
- **🌐 Google Search Grounding**: Real-time verification of legal references and compliance standards via Google Search.
- **⚡ Quick Check**: Instant "as-you-type" risk assessment for product claims.
- **🎙️ Live AI Consult**: Hands-free, voice-activated compliance verification powered by **Gemini 2.5 Flash Native Audio**.
- **📁 Deep Dossier Analysis**: Process large supplier documents (PDFs) with up to 1M token context.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Framer Motion
- **Backend**: Express (Vite Middleware), Node.js
- **Database & Auth**: Firebase (Firestore, Auth)
- **AI Engine**: Google Gemini API (`@google/genai`)
  - `gemini-3.1-pro-preview` (Complex Reasoning)
  - `gemini-3.1-flash-lite-preview` (Quick Checks)
  - `gemini-3.1-flash-image-preview` (Visual Fixes)
  - `gemini-2.5-flash-native-audio-preview` (Live Consult)

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- Firebase Project
- Google Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/omni-audit-ai.git
   cd omni-audit-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   # Firebase config is handled via firebase-applet-config.json
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment

### Vercel / Netlify

1. Connect your GitHub repository to Vercel/Netlify.
2. Set the **Build Command** to `npm run build`.
3. Set the **Output Directory** to `dist`.
4. Add your `GEMINI_API_KEY` to the environment variables.

### Firebase Rules

Ensure your `firestore.rules` are deployed to protect user data:
```bash
firebase deploy --only firestore:rules
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the OmniAudit Team.
