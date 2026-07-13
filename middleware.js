import { next } from '@vercel/edge';

// Only these hosts are considered production; everything else (the
// *.vercel.app staging URL, any preview/branch deployment, an
// unrecognised custom domain) defaults to noindex as a safe fallback.
const PRODUCTION_HOSTS = ['stepdex.my', 'www.stepdex.my'];

export const config = {
  matcher: '/:path*',
};

export default function middleware(request) {
  const host = (request.headers.get('host') || '').toLowerCase().split(':')[0];
  const isProduction = PRODUCTION_HOSTS.includes(host);
  const { pathname } = new URL(request.url);

  if (pathname === '/robots.txt') {
    const body = isProduction
      ? 'User-agent: *\nAllow: /\n'
      : 'User-agent: *\nDisallow: /\n';
    return new Response(body, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const response = next();
  if (!isProduction) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}
