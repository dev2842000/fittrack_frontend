import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL;

async function proxy(req: NextRequest, path: string) {
  const upstream = await fetch(`${BACKEND}/api/auth/${path}`, {
    method: req.method,
    headers: {
      'content-type': 'application/json',
      // Forward cookie so refresh/logout can read the httpOnly token
      ...(req.headers.get('cookie') && { cookie: req.headers.get('cookie')! }),
      // Forward Authorization for /auth/me
      ...(req.headers.get('authorization') && { authorization: req.headers.get('authorization')! }),
    },
    body: req.method !== 'GET' ? await req.text() : undefined,
  });

  const res = NextResponse.json(await upstream.json(), { status: upstream.status });

  // Forward Set-Cookie so it's stored on vercel.app (first-party — works on Safari/PWA)
  const cookie = upstream.headers.get('set-cookie');
  if (cookie) res.headers.set('set-cookie', cookie);

  return res;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path.join('/'));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path.join('/'));
}
