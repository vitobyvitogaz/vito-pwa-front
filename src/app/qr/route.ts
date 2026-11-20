import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
              request.headers.get('x-real-ip') ||
              'unknown';

  // Position approximative du visiteur, fournie par Vercel (en-têtes x-vercel-ip-*, présents
  // seulement une fois déployé). Elle est transmise au backend, qui n'a ainsi plus besoin
  // d'envoyer l'adresse IP du visiteur à un service de géolocalisation tiers.
  const decode = (value: string | null): string | undefined => {
    if (!value) return undefined
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }
  const geo = {
    countryCode: request.headers.get('x-vercel-ip-country') || undefined,
    region: request.headers.get('x-vercel-ip-country-region') || undefined,
    city: decode(request.headers.get('x-vercel-ip-city')),
  }

  try {
    await fetch(`${apiUrl}/qr/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userAgent, ip, geo }),
    });
  } catch (error) {
    console.error('❌ QR scan error:', error);
  }

  return NextResponse.redirect('https://vitobyvitogaz.mg/fr');
}