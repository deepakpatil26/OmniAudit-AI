export const AI_MODEL_ROUTING = {
  text: {
    id: 'llama-3.1-8b-instant',
    label: 'Low-cost text copilot',
    usage: 'quick checks, report Q&A, rewrites, and general chat',
  },
  vision: {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    label: 'Vision audit mode',
    usage: 'packaging and listing image comparison during multimodal audits',
  },
} as const;

export const AI_POLICY_SUMMARY =
  'OmniAudit uses a low-cost free-tier-friendly text model for everyday AI tasks and only switches to the vision audit model when image evidence is intentionally included.';
