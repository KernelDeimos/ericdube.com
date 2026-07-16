import type { Route } from './+types/api.zerogpt';

const ZEROGPT_URL = 'https://api.zerogpt.com/api/detect/detectText';

// The Studio lives on a different origin, so responses must be CORS-readable.
// text/plain requests are "simple" and skip preflight, but we answer OPTIONS anyway.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: CORS });
}

type ZeroGptResponse = {
  success?: boolean;
  message?: string;
  data?: {
    fakePercentage?: number;
    h?: string[];
    feedback?: string;
  } | null;
};

export async function action({ request }: Route.ActionArgs) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const apiKey = process.env.ZEROGPT_API_KEY;
  if (!apiKey) {
    return json({ error: 'Server is missing ZEROGPT_API_KEY.' }, 500);
  }

  // Optional shared-secret speed bump. Only enforced when configured; note the
  // token would live in the Studio bundle, so this deters casual abuse, not a
  // determined attacker. ZeroGPT's per-key credit cap is the real backstop.
  const guard = process.env.ZEROGPT_PROXY_TOKEN;

  let text: string;
  let token: string | undefined;
  try {
    const parsed = JSON.parse(await request.text()) as { text?: unknown; token?: unknown };
    text = typeof parsed.text === 'string' ? parsed.text.trim() : '';
    token = typeof parsed.token === 'string' ? parsed.token : undefined;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (guard && token !== guard) {
    return json({ error: 'Unauthorized.' }, 401);
  }
  if (text.length < 40) {
    return json({ error: 'Text too short to analyze.' }, 400);
  }

  let upstream: ZeroGptResponse;
  try {
    const res = await fetch(ZEROGPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ApiKey: apiKey },
      body: JSON.stringify({ input_text: text }),
    });
    upstream = (await res.json()) as ZeroGptResponse;
  } catch (err) {
    return json({ error: `Could not reach ZeroGPT: ${String(err)}` }, 502);
  }

  if (!upstream.success || !upstream.data) {
    // e.g. "Not enough credits" — surface ZeroGPT's own message to the Studio.
    return json({ error: upstream.message || 'ZeroGPT analysis failed.' }, 502);
  }

  return json({
    score: upstream.data.fakePercentage ?? 0,
    flaggedSentences: upstream.data.h ?? [],
    feedback: upstream.data.feedback ?? upstream.message ?? null,
    analyzedAt: new Date().toISOString(),
  });
}
