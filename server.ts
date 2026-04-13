import 'dotenv/config';
import express from 'express';
import Groq from 'groq-sdk';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { AI_MODEL_ROUTING } from './shared/aiPolicy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';
const groq = apiKey ? new Groq({ apiKey }) : null;
const TEXT_MODEL = AI_MODEL_ROUTING.text.id;
const VISION_MODEL = AI_MODEL_ROUTING.vision.id;

type AuditStatus =
  | 'verified'
  | 'discrepancy'
  | 'unverified'
  | 'compliant'
  | 'inconclusive';

function extractJSON(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Could not find valid JSON in AI response.');
  }
}

function requireGroq() {
  if (!groq) {
    throw new Error(
      'Groq API key is missing. Set GROQ_API_KEY on the server before running audits.',
    );
  }

  return groq;
}

async function runAudit({
  productDescription,
  region,
  mediaItems = [],
  dossierTexts = [],
}: {
  productDescription: string;
  region: string;
  mediaItems?: { data: string; mimeType: string; label?: string }[];
  dossierTexts?: string[];
}) {
  const client = requireGroq();

  const model = mediaItems.length > 0 ? VISION_MODEL : TEXT_MODEL;

  const systemInstruction = `
    You are OmniAudit AI v3.0, a Lead AI Compliance Engineer specializing in Multimodal Audits.
    Your goal is to audit product listings for "Greenwashing" and regional compliance (${region}).

    1. **Digital Twin Matcher (Weight/Logo/License Mismatches)**
    2. **FSSAI Category Consultant (Cross-referencing 2026 FCS Categories)**
    3. **Shelf-Life Tracker (Date Extraction & Freshness Guard)**

    CRITICAL:
    - Current Date for Shelf-Life: ${new Date().toISOString().split('T')[0]}
    - Identify Manufacturing (MFG), Expiry (EXP/USE BY), or Best Before dates on packaging images.
    - Status Rules:
      * "expired" if Current Date > EXP Date.
      * "near-expiry" if Remaining Days < 45.
      * "fresh" if Remaining Days >= 45.

    EXAMPLE JSON (FOLLOW THIS EXACT SKELETON):
    {
      "productName": "Example Wheatgrass",
      "complianceScore": 30,
      "riskSummary": "High risk due to unlisted fillers and near-expiry state.",
      "shelfLife": {
        "mfgDate": "2024-01-01",
        "expDate": "2024-05-15",
        "remainingDays": 20,
        "status": "near-expiry"
      },
      "fssaiCategory": "13.6 (Health Supplements)",
      "categoryReasoning": "Product contains concentrated plant extracts and vitamins, fitting the 2026 supplement mandate.",
      "twinMismatches": [
        {
          "attribute": "Net Weight",
          "physicalValue": "500g",
          "digitalValue": "450g",
          "severity": "high"
        }
      ],
      "findings": [
        {
          "claim": "100% Pure & No Additives",
          "evidence": "Supplier dossier lists Maltodextrin (20%) as a carrier.",
          "status": "discrepancy",
          "reasoning": "Direct contradiction between marketing and supply chain documents.",
          "legalReference": "FSSAI Food Labeling Standard 2026 / EU Green Claims Directive",
          "correctiveAction": "Disclose maltodextrin on the back label ingredients list.",
          "visualFixPrompt": "Remove '100% Pure' badge from the front of the packaging mockup."
        }
      ],
      "thoughtSignature": "Deep Dossier & Digital Twin cross-referencing enabled."
    }

    DIGITAL TWIN PROTOCOL:
    If multiple images are provided, perform a side-by-side audit:
    1. IMAGE A (Tagged in prompt as Physical): The ground truth label.
    2. IMAGE B (Tagged in prompt as Digital/Listing): The marketplace representation.
    3. FLAG any discrepancies in Net Weight, Logos (Veg/Non-Veg), FSSAI license numbers, or health claims found in one but not the other.
  `;

  const messages: any[] = [
    {
      role: 'system',
      content: systemInstruction,
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Audit this product for ${region}:\n\nDescription: ${productDescription}\n\nDossier Data: ${dossierTexts.join('\n---\n')}\n\nIMPORTANT: Start your response with '{' and provide a fully populated JSON object following the schema.`,
        },
        ...mediaItems.flatMap((item, index) => [
          {
            type: 'text',
            text: `Media ${index + 1}${item.label ? ` (${item.label})` : ''}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: item.data.startsWith('data:')
                ? item.data
                : `data:${item.mimeType};base64,${item.data}`,
            },
          },
        ]),
      ],
    },
  ];

  const response = await client.chat.completions.create({
    model,
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content || '{}';
  let parsed = extractJSON(content);

  if (parsed.auditReport) parsed = parsed.auditReport;
  if (parsed.report) parsed = parsed.report;

  return {
    productName:
      parsed.productName ||
      productDescription.split('\n')[0].substring(0, 50) ||
      'New Audit',
    complianceScore:
      typeof parsed.complianceScore === 'number' ? parsed.complianceScore : 50,
    riskSummary: parsed.riskSummary || 'Audit summary missing.',
    findings: Array.isArray(parsed.findings)
      ? parsed.findings.map((finding: any) => ({
          claim: finding.claim || 'General Claim',
          evidence: finding.evidence || 'N/A',
          status: ([
            'verified',
            'discrepancy',
            'unverified',
            'compliant',
            'inconclusive',
          ].includes(finding.status)
            ? finding.status
            : 'unverified') as AuditStatus,
          reasoning: finding.reasoning || 'No reasoning provided.',
          legalReference: finding.legalReference || 'N/A',
          correctiveAction: finding.correctiveAction,
          visualFixPrompt: finding.visualFixPrompt,
        }))
      : [],
    thoughtSignature:
      parsed.thoughtSignature || 'OmniAudit AI v3.0 Stabilization',
    fssaiCategory: parsed.fssaiCategory,
    categoryReasoning: parsed.categoryReasoning,
    shelfLife:
      parsed.shelfLife &&
      typeof parsed.shelfLife === 'object' &&
      ['fresh', 'near-expiry', 'expired'].includes(parsed.shelfLife.status)
        ? {
            mfgDate: parsed.shelfLife.mfgDate || 'Unknown',
            expDate: parsed.shelfLife.expDate || 'Unknown',
            remainingDays:
              typeof parsed.shelfLife.remainingDays === 'number'
                ? parsed.shelfLife.remainingDays
                : 0,
            status: parsed.shelfLife.status,
          }
        : undefined,
    twinMismatches: Array.isArray(parsed.twinMismatches)
      ? parsed.twinMismatches
      : [],
  };
}

async function runConsult(query: string) {
  const client = requireGroq();

  const response = await client.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a concise voice-driven compliance consultant for OmniAudit AI. Provide sharp, 1-2 sentence expert answers. No preamble, just the answer.',
      },
      {
        role: 'user',
        content: query,
      },
    ],
    max_tokens: 100,
    temperature: 0.5,
  });

  return (
    response.choices[0]?.message?.content || "I couldn't process that query."
  );
}

async function runQuickCheck(text: string) {
  const client = requireGroq();

  const response = await client.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'Analyze product text for greenwashing red flags. Return JSON: { "risk": "high" | "low", "message": "short warning" }.',
      },
      {
        role: 'user',
        content: text,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  return extractJSON(response.choices[0]?.message?.content || '{}');
}

async function runReportChat(query: string, context: string) {
  const client = requireGroq();

  const response = await client.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are OmniAudit AI, an explainable compliance copilot. Answer using the provided report context only when possible. Be clear, practical, and concise. If asked for next steps, prioritize the highest-risk items first.',
      },
      {
        role: 'user',
        content: `Report context:\n${context}\n\nQuestion:\n${query}`,
      },
    ],
    max_tokens: 220,
    temperature: 0.3,
  });

  return (
    response.choices[0]?.message?.content ||
    "I couldn't process that report question."
  );
}

async function runFindingRewrite({
  claim,
  reasoning,
  legalReference,
  region,
  productName,
  correctiveAction,
}: {
  claim: string;
  reasoning: string;
  legalReference: string;
  region: string;
  productName: string;
  correctiveAction?: string;
}) {
  const client = requireGroq();

  const response = await client.chat.completions.create({
    model: TEXT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You rewrite risky marketing language into safer, region-aware product copy. Return JSON with exactly these keys: suggestedCopy, rationale, confidence. Keep suggestedCopy concise and usable in a listing. confidence must be high, medium, or low.',
      },
      {
        role: 'user',
        content: `Product: ${productName}
Region: ${region}
Original claim: ${claim}
Why it was flagged: ${reasoning}
Legal reference: ${legalReference}
Corrective action: ${correctiveAction || 'Not provided'}

Create a safer rewrite that preserves value without making risky compliance promises.`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const parsed = extractJSON(response.choices[0]?.message?.content || '{}');

  return {
    suggestedCopy:
      typeof parsed.suggestedCopy === 'string' && parsed.suggestedCopy.trim()
        ? parsed.suggestedCopy.trim()
        : 'Rewritten copy unavailable.',
    rationale:
      typeof parsed.rationale === 'string' && parsed.rationale.trim()
        ? parsed.rationale.trim()
        : 'No rationale was returned.',
    confidence:
      parsed.confidence === 'high' ||
      parsed.confidence === 'medium' ||
      parsed.confidence === 'low'
        ? parsed.confidence
        : 'medium',
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/ai-policy', (_req, res) => {
    res.json({
      data: {
        textModel: AI_MODEL_ROUTING.text,
        visionModel: AI_MODEL_ROUTING.vision,
      },
    });
  });

  app.post('/api/audit', async (req, res) => {
    try {
      const { productDescription, region, mediaItems, dossierTexts } = req.body;

      if (!productDescription || typeof productDescription !== 'string') {
        return res
          .status(400)
          .json({ error: 'Product description is required.' });
      }

      const containsUnsupportedVideo = Array.isArray(mediaItems)
        ? mediaItems.some(
            (item) =>
              typeof item?.mimeType === 'string' &&
              item.mimeType.startsWith('video/'),
          )
        : false;

      if (containsUnsupportedVideo) {
        return res.status(400).json({
          error:
            'Video auditing is not enabled yet. Please use packaging images, listing screenshots, and supplier docs for now.',
        });
      }

      const report = await runAudit({
        productDescription,
        region,
        mediaItems,
        dossierTexts,
      });

      return res.json({ data: report });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Audit generation failed.';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/consult', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res
          .status(400)
          .json({ error: 'Consultation query is required.' });
      }

      const message = await runConsult(query);
      return res.json({ data: { message } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Consultation failed.';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/quick-check', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Quick-check text is required.' });
      }

      const result = await runQuickCheck(text);
      return res.json({ data: result });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Quick check failed.';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/report-chat', async (req, res) => {
    try {
      const { query, context } = req.body;
      if (!query || typeof query !== 'string') {
        return res
          .status(400)
          .json({ error: 'A report question is required.' });
      }

      const message = await runReportChat(
        query,
        typeof context === 'string' ? context : '',
      );
      return res.json({ data: { message } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Report copilot failed.';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/rewrite-finding', async (req, res) => {
    try {
      const {
        claim,
        reasoning,
        legalReference,
        region,
        productName,
        correctiveAction,
      } = req.body;

      if (
        !claim ||
        typeof claim !== 'string' ||
        !reasoning ||
        typeof reasoning !== 'string' ||
        !legalReference ||
        typeof legalReference !== 'string' ||
        !region ||
        typeof region !== 'string' ||
        !productName ||
        typeof productName !== 'string'
      ) {
        return res.status(400).json({
          error:
            'Claim, reasoning, legal reference, region, and product name are required.',
        });
      }

      const suggestion = await runFindingRewrite({
        claim,
        reasoning,
        legalReference,
        region,
        productName,
        correctiveAction:
          typeof correctiveAction === 'string' ? correctiveAction : undefined,
      });

      return res.json({ data: suggestion });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Rewrite generation failed.';
      return res.status(500).json({ error: message });
    }
  });

  app.post('/api/fix-image', async (req, res) => {
    try {
      const { fixPrompt } = req.body;
      if (!fixPrompt || typeof fixPrompt !== 'string') {
        return res
          .status(400)
          .json({ error: 'A visual fix prompt is required.' });
      }

      const refinedPrompt = encodeURIComponent(
        `Professional product photography of a compliant version: ${fixPrompt}. Studio lighting, clean background, high resolution, realistic packaging.`,
      );
      const imageUrl = `https://image.pollinations.ai/prompt/${refinedPrompt}?width=1024&height=1024&seed=${Math.floor(
        Math.random() * 1000000,
      )}&nologo=true&enhance=true`;

      return res.json({ data: { imageUrl } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Image fix generation failed.';
      return res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
