export function getWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function getPhoneLink(phone: string): string {
  return `tel:${phone}`
}