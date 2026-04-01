import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true // Required for client-side usage in Vite
});

export interface AuditFinding {
  claim: string;
  evidence: string;
  status: 'verified' | 'discrepancy' | 'unverified';
  reasoning: string;
  legalReference: string;
  correctiveAction?: string;
  visualFixPrompt?: string;
}

export interface AuditReport {
  productName: string;
  complianceScore: number;
  riskSummary: string;
  findings: AuditFinding[];
  thoughtSignature: string;
  fssaiCategory?: string;
  categoryReasoning?: string;
  twinMismatches?: Array<{
    attribute: string;
    physicalValue: string;
    digitalValue: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Robust JSON Extractor for LLM responses
 * Finds the first {...} block in the text even if wrapped in markdown.
 */
function extractJSON(text: string): any {
  try {
    // If it's already clean JSON
    return JSON.parse(text);
  } catch (e) {
    // Try to find the JSON block using a broad regex
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerError) {
        console.error("Failed to parse inner JSON block:", innerError);
      }
    }
    throw new Error("Could not find valid JSON in AI response.");
  }
}

export async function performAudit(
  productDescription: string,
  region: string,
  mediaItems: { data: string; mimeType: string }[] = [],
  dossierTexts: string[] = [],
): Promise<AuditReport> {
  // Hybrid Intelligence Selection:
  // - Llama 4 for Multimodal (Images/Video)
  // - Llama 3.3 for Deep Text Compliance
  const model = mediaItems.length > 0 
    ? 'meta-llama/llama-4-scout-17b-16e-instruct' 
    : 'llama-3.3-70b-versatile';

  const systemInstruction = `
    You are OmniAudit AI v3.0, a Lead AI Compliance Engineer specializing in Multimodal Audits.
    Your goal is to audit product listings for "Greenwashing" and regional compliance (${region}).
    
    1.  **Digital Twin Matcher (Weight/Logo/License Mismatches)**
    2.  **FSSAI Category Consultant (Cross-referencing 2026 FCS Categories)**
    3.  **Shelf-Life Tracker (Date Extraction & Freshness Guard)**
    
    CRITICAL:
    - Current Date for Shelf-Life: ${new Date().toISOString().split('T')[0]}
    - Identify Manufacturing (MFG), Expiry (EXP/USE BY), or Best Before dates on packaging images.
    - Status Rules:
        *   "expired" if Current Date > EXP Date.
        *   "near-expiry" if Remaining Days < 45.
        *   "fresh" if Remaining Days >= 45.
    
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

    FSSAI CATEGORY INDEX (2026):
    - 01.0: Dairy | 02.0: Fats/Oils | 04.0: Fruit/Veg | 05.0: Confectionery
    - 06.0: Cereals | 07.0: Bakery | 12.0: Salts/Spices | 13.0: Nutritional Uses
    - 13.6: Health Supplements (Common for powders/extracts)
    - 14.0: Beverages (Mixes/Drinks)
  `;

  const messages: any[] = [
    {
      role: 'system',
      content: systemInstruction
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Audit this product for ${region}:\n\nDescription: ${productDescription}\n\nDossier Data: ${dossierTexts.join('\n---\n')}\n\nIMPORTANT: Start your response with '{' and provide a full populate JSON following the schema.`
        },
        ...mediaItems.map(item => ({
          type: 'image_url',
          image_url: {
            url: item.data.startsWith('data:') ? item.data : `data:${item.mimeType};base64,${item.data}`
          }
        }))
      ]
    }
  ];

  const response = await groq.chat.completions.create({
    model,
    messages,
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content || '{}';
  console.log("STABILIZED RAW RESPONSE:", content);

  try {
    let parsed = extractJSON(content);
    
    // Normalize nested structures
    if (parsed.auditReport) parsed = parsed.auditReport;
    if (parsed.report) parsed = parsed.report;

    return {
      productName: parsed.productName || productDescription.split('\n')[0].substring(0, 50) || 'New Audit',
      complianceScore: typeof parsed.complianceScore === 'number' ? parsed.complianceScore : 50,
      riskSummary: parsed.riskSummary || 'Audit summary missing.',
      findings: Array.isArray(parsed.findings) ? parsed.findings.map((f: any) => ({
        claim: f.claim || 'General Claim',
        evidence: f.evidence || 'N/A',
        status: (['verified', 'discrepancy', 'unverified'].includes(f.status) ? f.status : 'unverified') as 'verified' | 'discrepancy' | 'unverified',
        reasoning: f.reasoning || 'No reasoning provided.',
        legalReference: f.legalReference || 'N/A',
        correctiveAction: f.correctiveAction,
        visualFixPrompt: f.visualFixPrompt
      })) : [],
      thoughtSignature: parsed.thoughtSignature || 'OmniAudit AI v3.0 Stabilization',
      fssaiCategory: parsed.fssaiCategory,
      categoryReasoning: parsed.categoryReasoning,
      twinMismatches: Array.isArray(parsed.twinMismatches) ? parsed.twinMismatches : []
    };
  } catch (e) {
    console.error("Final Parsing Crash:", e, content);
    throw new Error("The AI report was malformed. Please try again.");
  }
}

export async function getConsultationResponse(
  query: string,
): Promise<string> {
  const model = 'llama-3.3-70b-versatile';
  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a concise voice-driven compliance consultant for OmniAudit AI. Provide sharp, 1-2 sentence expert answers. NO preamble, just the answer.'
      },
      {
        role: 'user',
        content: query
      }
    ],
    max_tokens: 100,
    temperature: 0.5,
  });

  return response.choices[0]?.message?.content || "I couldn't process that query.";
}

export async function quickCheck(
  text: string,
): Promise<{ risk: 'high' | 'low'; message: string } | null> {
  if (text.length < 10) return null;

  const model = 'llama-3.3-70b-versatile';
  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'Analyze product text for greenwashing red flags. Return JSON: { "risk": "high" | "low", "message": "short warning" }.'
      },
      {
        role: 'user',
        content: text
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}

export async function fixImage(
  imageBase64: string,
  fixPrompt: string,
): Promise<string> {
  const refinedPrompt = encodeURIComponent(`Professional product photography of a compliant version: ${fixPrompt}. Studio lighting, clean background, high resolution, realistic packaging.`);
  const imageUrl = `https://image.pollinations.ai/prompt/${refinedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&nologo=true&enhance=true`;
  return imageUrl;
}
