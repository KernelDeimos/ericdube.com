// Where contact-form submissions go. Server-side only — it holds a write token,
// so never import this from client code.
//
// Two independent channels, each enabled by its own env var:
//
//   SANITY_WRITE_TOKEN  -> creates an `enquiry` document you triage in the
//                          Studio. The durable record: status, private notes,
//                          and a reference to the service it came from.
//   ENQUIRY_NEXUS_KEY   -> announces the enquiry on a claude-nexus channel so
//                          it shows up live. Reuses NEXUS_URL / NEXUS_TOKEN.
//
// A submission succeeds if AT LEAST ONE channel accepts it, so nexus alone is a
// valid setup (no Sanity token needed) and a nexus outage cannot lose an
// enquiry that Sanity already stored. With neither configured the route falls
// back to telling the visitor to email instead — a message is never silently
// dropped.

import { createClient } from '@sanity/client';
import { appendToNexusLog } from './nexus';

const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN ?? '';
// Nexus is the default channel: the node runs on the same server and needs no
// credentials on trusted loopback, so enquiries land somewhere out of the box.
// Set to an empty string to turn the channel off.
const ENQUIRY_NEXUS_KEY = process.env.ENQUIRY_NEXUS_KEY ?? 'pub.enquiries';

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

// Deliberately lives in this server-only module rather than in the route file.
// Anything in a route module's shared scope ends up in the public client
// bundle, where a scraper can read it straight out of the JS even if the page
// never renders it. The address is handed to the browser only in the body of a
// failed submission, so a plain GET of /services never carries it.
const CONTACT_EMAIL = process.env.CONTACT_EMAIL ?? 'eric.alex.dube@gmail.com';

export function contactMailto(subject = 'Freelance enquiry'): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function enquiriesConfigured(): boolean {
  return SANITY_WRITE_TOKEN !== '' || ENQUIRY_NEXUS_KEY !== '';
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

async function deliverToSanity(input: EnquiryInput, submittedAt: string): Promise<void> {
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
    submittedAt,
  });
}

async function deliverToNexus(input: EnquiryInput, submittedAt: string): Promise<void> {
  const detail = [
    input.company ? `Company: ${input.company}` : null,
    input.budget ? `Budget: ${input.budget}` : null,
    input.timeline ? `Timeline: ${input.timeline}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  await appendToNexusLog(ENQUIRY_NEXUS_KEY, {
    author: 'website',
    role: 'system',
    text: `New enquiry from ${input.name} <${input.email}>\n${detail}\n\n${input.message}`,
    data: { kind: 'enquiry', ...input, submittedAt },
    at: submittedAt,
  });
}

export async function submitEnquiry(input: EnquiryInput): Promise<EnquiryResult> {
  if (!enquiriesConfigured()) return { ok: false, reason: 'unconfigured' };

  const submittedAt = new Date().toISOString();
  const channels: Array<Promise<void>> = [];
  if (writeClient) channels.push(deliverToSanity(input, submittedAt));
  if (ENQUIRY_NEXUS_KEY) channels.push(deliverToNexus(input, submittedAt));

  const settled = await Promise.allSettled(channels);

  // Never drop a message silently — every failure lands in the server log even
  // when another channel succeeded, so a half-broken setup is still visible.
  for (const outcome of settled) {
    if (outcome.status === 'rejected') {
      console.error('enquiry delivery failed', outcome.reason);
    }
  }

  const delivered = settled.some((outcome) => outcome.status === 'fulfilled');
  return delivered ? { ok: true } : { ok: false, reason: 'error' };
}
