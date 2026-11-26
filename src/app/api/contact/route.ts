import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { EMAIL_PATTERN, escapeHtml, singleLine } from '@/lib/utils/escapeHtml'
import { parseRecipients } from '@/lib/utils/recipients'
import { EMAIL_COLORS } from '@/lib/email-theme'

// Expéditeur et destinataire configurables (variables Vercel). Sans CONTACT_FROM_EMAIL, on garde
// l'adresse de test de Resend, qui n'envoie qu'à l'e-mail du compte Resend.
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'
// CONTACT_TO_EMAIL accepte plusieurs adresses séparées par des virgules
const TO_EMAILS = parseRecipients(process.env.CONTACT_TO_EMAIL, ['vitobyvitogaz@gmail.com'])

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }
    // Les valeurs doivent être du texte (un objet ou un nombre ferait échouer l'échappement)
    if ([name, email, subject, message].some((v) => typeof v !== 'string') || (phone && typeof phone !== 'string')) {
      return NextResponse.json({ error: 'Champs invalides' }, { status: 400 })
    }
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Adresse e-mail invalide' }, { status: 400 })
    }

    const { error: sendError } = await resend.emails.send({
      from: `Service Clients VitoGaz Madagascar <${FROM_EMAIL}>`,
      to: TO_EMAILS,
      replyTo: email,
      subject: `[VITO] ${singleLine(subject)} — ${singleLine(name)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${EMAIL_COLORS.brand}; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Nouveau message via VITO</h1>
          </div>
          <div style="background: ${EMAIL_COLORS.surface}; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid ${EMAIL_COLORS.border};">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: ${EMAIL_COLORS.muted}; width: 120px;">Nom</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(name)}</td></tr>
              <tr><td style="padding: 8px 0; color: ${EMAIL_COLORS.muted};">Email</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(email)}</td></tr>
              ${phone ? `<tr><td style="padding: 8px 0; color: ${EMAIL_COLORS.muted};">Téléphone</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(phone)}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; color: ${EMAIL_COLORS.muted};">Sujet</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(subject)}</td></tr>
            </table>
            <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid ${EMAIL_COLORS.border};">
              <p style="color: ${EMAIL_COLORS.muted}; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">Message</p>
              <p style="margin: 0; line-height: 1.6;">${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        </div>
      `,
    })

    // Le SDK Resend ne lève pas d'exception en cas de refus (domaine non vérifié, clé invalide…) :
    // sans ce contrôle, le visiteur verrait « Message envoyé » alors que rien n'est parti.
    if (sendError) {
      console.error('❌ Erreur Resend contact:', sendError)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}