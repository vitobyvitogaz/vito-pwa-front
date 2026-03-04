import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/scan`, {
      method: 'POST',
    });
  } catch (error) {
    // On ignore l'erreur
  }

  return NextResponse.redirect('https://vitobyvitogaz.mg/fr');
}