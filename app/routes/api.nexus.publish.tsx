import { data } from 'react-router';
import type { Route } from './+types/api.nexus.publish';
import { recordPublish } from '~/nexus/store.server';

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    throw data({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  const requiredToken = process.env.NEXUS_SHARED_TOKEN;
  if (requiredToken && request.headers.get('x-nexus-token') !== requiredToken) {
    throw data({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    throw data({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { source, key, type, items, at } = body ?? {};
  if (typeof source !== 'string' || typeof key !== 'string' || typeof type !== 'string') {
    throw data({ ok: false, error: 'source, key, and type are required strings' }, { status: 400 });
  }

  const stored = recordPublish({
    source,
    key,
    type,
    items,
    at: typeof at === 'string' ? at : new Date().toISOString(),
  });

  return Response.json({ ok: true, id: stored.id });
}
