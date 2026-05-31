# OmniAudit AI — quick overview

OmniAudit AI is a snappy, multimodal compliance workspace for e-commerce teams — run audits on product text and images, generate structured reports, and track your audit history.

![Home](./public/home-page.png)

Why you'll like it:

- Fast text + image audits
- Compact dashboard with filtered audit feeds
- Downloadable report PDFs and AI-assisted rewrite suggestions

Screenshots

Home · Ledger · Report · Settings

![Ledger](./public/ledger-details.png) ![Report](./public/report-details.png) ![Settings](./public/settings-page.png)

Quick start

1. Clone and install

   ```bash
   git clone https://github.com/deepakpatil26/OmniAudit-AI.git
   cd OmniAudit-AI
   npm install
   ```

2. Copy `.env.example` → `.env` and set required keys (Firebase + GROQ)

3. Run locally

   ```bash
   npm run dev
   ```

Helpful scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run preview` — preview build
- `npm run lint` — TypeScript checks
- `npm test` — run unit tests

CI & tests

This repo includes a GitHub Actions workflow to run `lint` + `test` on pushes to `main`.

Notes

- Keep `.env` secret. Rotate keys if accidentally committed.
- See [CHANGELOG.md](./CHANGELOG.md) for release notes.

Logo

![OmniAudit](./public/light-logo.png)

Enjoy — ping me if you want a one-click deploy script or a short demo video.
