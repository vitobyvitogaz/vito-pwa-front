import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const body = await request.json()
    const { type, fullName, company, phone, email, city, message } = body

    if (!fullName || !company || !phone || !email || !city) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    const typeLabel = type === 'revendeur' ? 'Devenir Revendeur' : 'Devenir Client Professionnel'

    await resend.emails.send({
      from: 'Contact Pro Vitogaz Madagascar <onboarding@resend.dev>',
      to: 'vitobyvitogaz@gmail.com',
      replyTo: email,
      subject: `[VITO] ${typeLabel} — ${fullName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #7C3AED; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Nouvelle demande partenaire via VITO</h1>
            <p style="color: white/80; margin: 8px 0 0 0; font-size: 14px;">${typeLabel}</p>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666; width: 140px;">Type</td><td style="padding: 8px 0; font-weight: 600;">${typeLabel}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Nom complet</td><td style="padding: 8px 0; font-weight: 600;">${fullName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Entreprise</td><td style="padding: 8px 0; font-weight: 600;">${company}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Téléphone</td><td style="padding: 8px 0; font-weight: 600;">${phone}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0; font-weight: 600;">${email}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Ville</td><td style="padding: 8px 0; font-weight: 600;">${city}</td></tr>
            </table>
            ${message ? `
            <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e5e5e5;">
              <p style="color: #666; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">Message</p>
              <p style="margin: 0; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            </div>` : ''}
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('❌ Erreur envoi email contact-pro:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}