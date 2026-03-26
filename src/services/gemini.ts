import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
}

export async function performAudit(
  productDescription: string,
  region: string,
  mediaItems: { data: string, mimeType: string }[] = [],
  dossierTexts: string[] = []
): Promise<AuditReport> {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `
    You are OmniAudit AI v2.0, a Lead AI Compliance Engineer specializing in Long-Context and Multimodal Agents.
    Your goal is to audit product listings (text, images, videos) for "Greenwashing" and regional legal compliance.
    
    CONTEXT CAPABILITIES:
    - Deep Dossier: You can ingest multiple supplier documents (up to 1M tokens). Cross-reference them to find historical contradictions or certification lapses.
    - Social Video Auditor: You can analyze video frames and audio transcripts to verify visual claims against legal standards.
    - Global Market Switcher: You must use Google Search Grounding to fetch the latest 2026 legal statutes for the selected region: ${region}.
    
    YOUR TASK:
    1. Analyze the product listing text and all provided media (images/videos).
    2. Cross-reference claims with the "Deep Dossier" of supplier documents.
    3. Research regional laws (e.g., EU Green Claims Directive, US FTC Green Guides, APAC standards) using Google Search.
    4. Flag discrepancies. For visual discrepancies (e.g., an illegal "100% Organic" badge on an image), provide a "visualFixPrompt" that describes exactly how to semantically edit the image to make it compliant.
    5. Calculate a Compliance Score (0-100) and provide a Risk Summary.
    6. Provide a "Thought Signature" explaining your long-horizon reasoning.
    
    Output MUST be a structured JSON report.
  `;

  const prompt = `
    Audit the following product for the ${region} market:
    
    Product Description: ${productDescription}
    
    ${dossierTexts.length > 0 ? `Supplier Dossier (Multiple Documents):\n${dossierTexts.join('\n---\n')}` : "No supplier dossier provided."}
    
    Please perform the audit and return the findings in JSON format.
  `;

  const contents = [];
  const parts: any[] = [{ text: prompt }];
  
  mediaItems.forEach(item => {
    parts.push({
      inlineData: {
        mimeType: item.mimeType,
        data: item.data.split(',')[1] || item.data
      }
    });
  });
  
  contents.push({ parts });

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          complianceScore: { type: Type.NUMBER },
          riskSummary: { type: Type.STRING },
          findings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                claim: { type: Type.STRING },
                evidence: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["verified", "discrepancy", "unverified"] },
                reasoning: { type: Type.STRING },
                legalReference: { type: Type.STRING },
                correctiveAction: { type: Type.STRING },
                visualFixPrompt: { type: Type.STRING }
              },
              required: ["claim", "evidence", "status", "reasoning", "legalReference"]
            }
          },
          thoughtSignature: { type: Type.STRING }
        },
        required: ["productName", "complianceScore", "riskSummary", "findings", "thoughtSignature"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function quickCheck(text: string): Promise<{ risk: 'high' | 'low', message: string } | null> {
  if (text.length < 10) return null;
  
  const model = "gemini-3.1-flash-lite-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze this product title/description for immediate greenwashing red flags (e.g., "100% eco", "totally natural" without proof). Return JSON: { "risk": "high" | "low", "message": "short warning or ok" }. Text: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          risk: { type: Type.STRING, enum: ["high", "low"] },
          message: { type: Type.STRING }
        },
        required: ["risk", "message"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function fixImage(imageBase64: string, fixPrompt: string): Promise<string> {
  const model = "gemini-3.1-flash-image-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.split(',')[1] || imageBase64
          }
        },
        { text: `Semantically edit this image according to this instruction: ${fixPrompt}. Maintain subject consistency and professional quality.` }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate fixed image");
}
