import { ReactNode } from 'react'
import { BottomNav } from '@/components/shared/BottomNav'

export default async function LocaleLayout({ 
  children,
  params 
}: { 
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}