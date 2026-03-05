import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

  const userAgent = request.headers.get('user-agent') || 'unknown';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
              request.headers.get('x-real-ip') ||
              'unknown';

  try {
    await fetch(`${apiUrl}/qr/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userAgent, ip }),
    });
  } catch (error) {
    console.error('❌ QR scan error:', error);
  }

  return NextResponse.redirect('https://vitobyvitogaz.mg/fr');
}