'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QrPage() {
  const router = useRouter();

  useEffect(() => {
    const recordScan = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/scan`, {
          method: 'POST',
        });
      } catch (error) {
        // On ignore l'erreur — la redirection se fait quand même
      } finally {
        router.replace('/');
      }
    };

    recordScan();
  }, [router]);

  return null;
}