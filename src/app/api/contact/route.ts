import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'Service Clients VitoGaz Madagascar <onboarding@resend.dev>',
      to: 'vitobyvitogaz@gmail.com',
      replyTo: email,
      subject: `[VITO] ${subject} — ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #008B7F; padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">Nouveau message via VITO</h1>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666; width: 120px;">Nom</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0; font-weight: 600;">${email}</td></tr>
              ${phone ? `<tr><td style="padding: 8px 0; color: #666;">Téléphone</td><td style="padding: 8px 0; font-weight: 600;">${phone}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; color: #666;">Sujet</td><td style="padding: 8px 0; font-weight: 600;">${subject}</td></tr>
            </table>
            <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e5e5e5;">
              <p style="color: #666; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase;">Message</p>
              <p style="margin: 0; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}