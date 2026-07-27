// Where contact-form submissions go. Server-side only — it holds a write token,
// so never import this from client code.
//
// Today an enquiry becomes an `enquiry` document in Sanity, which you triage in
// the Studio. Swapping in email (Resend/SMTP) or the nexus node later means
// rewriting `deliverEnquiry` and nothing else: the route only knows about
// `submitEnquiry` and the result union below.

import { createClient } from '@sanity/client';

const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN ?? '';

export type EnquiryInput = {
  name: string;
  email: string;
  company: string | null;
  serviceId: string | null;
  budget: string | null;
  timeline: string | null;
  message: string;
};

export type EnquiryResult =
  | { ok: true }
  /** No delivery channel configured — the form should fall back to mailto. */
  | { ok: false; reason: 'unconfigured' }
  | { ok: false; reason: 'error' };

export function enquiriesConfigured(): boolean {
  return SANITY_WRITE_TOKEN !== '';
}

const writeClient = SANITY_WRITE_TOKEN
  ? createClient({
      projectId: 'd6ez6jwn',
      dataset: 'production',
      apiVersion: '2026-05-15',
      useCdn: false,
      token: SANITY_WRITE_TOKEN,
    })
  : null;

async function deliverEnquiry(input: EnquiryInput): Promise<void> {
  if (!writeClient) throw new Error('no write client');
  await writeClient.create({
    _type: 'enquiry',
    status: 'new',
    name: input.name,
    email: input.email,
    ...(input.company ? { company: input.company } : {}),
    ...(input.serviceId
      ? { service: { _type: 'reference', _ref: input.serviceId } }
      : {}),
    ...(input.budget ? { budget: input.budget } : {}),
    ...(input.timeline ? { timeline: input.timeline } : {}),
    message: input.message,
    submittedAt: new Date().toISOString(),
  });
}

export async function submitEnquiry(input: EnquiryInput): Promise<EnquiryResult> {
  if (!enquiriesConfigured()) return { ok: false, reason: 'unconfigured' };
  try {
    await deliverEnquiry(input);
    return { ok: true };
  } catch (error) {
    // Never drop a message silently — the route tells the visitor to email
    // instead, and the reason lands in the server log.
    console.error('enquiry delivery failed', error);
    return { ok: false, reason: 'error' };
  }
}
