import { NextRequest } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL;

async function proxy(req: NextRequest, path: string) {
  const upstream = await fetch(`${BACKEND}/api/auth/${path}`, {
    method: req.method,
    headers: {
      'content-type': 'application/json',
      ...(req.headers.get('cookie') ? { cookie: req.headers.get('cookie')! } : {}),
      ...(req.headers.get('authorization') ? { authorization: req.headers.get('authorization')! } : {}),
    },
    body: req.method !== 'GET' ? await req.text() : undefined,
    cache: 'no-store',
  });

  const headers = new Headers({ 'content-type': 'application/json' });

  // getSetCookie() correctly handles multiple Set-Cookie headers
  const setCookies = upstream.headers.getSetCookie?.() ??
    (upstream.headers.get('set-cookie') ? [upstream.headers.get('set-cookie')!] : []);

  for (const c of setCookies) headers.append('set-cookie', c);

  return new Response(await upstream.text(), { status: upstream.status, headers });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path.join('/'));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path.join('/'));
}
