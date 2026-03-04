import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log('🔍 QR scan - API URL:', apiUrl);

  try {
    const response = await fetch(`${apiUrl}/qr/scan`, {
      method: 'POST',
    });
    console.log('✅ QR scan recorded - status:', response.status);
  } catch (error) {
    console.error('❌ QR scan error:', error);
  }

  return NextResponse.redirect('https://vitobyvitogaz.mg/fr');
}