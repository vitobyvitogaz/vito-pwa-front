import { ReactNode } from 'react'
import { BottomNav } from '@/components/shared/BottomNav'
import { BackendWakeUp } from '@/components/shared/BackendWakeUp'

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
      {/* Ping silencieux pour réveiller Render.com dès l'ouverture de l'app */}
      <BackendWakeUp />
      {children}
      <BottomNav />
    </>
  )
}