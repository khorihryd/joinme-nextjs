export const WHATSAPP_CONFIG = {
  // Nomor admin default (format internasional tanpa tanda +)
  adminNumber: '6281234567890',

  // Pesan default saat klik CTA umum
  defaultMessage: 'Halo admin JoinMe! 👋\nSaya ingin membuat undangan digital.\nBisa dibantu untuk proses pembuatannya?',

  // Helper function untuk generate WhatsApp URL
  getUrl: (message?: string) => {
    const text = encodeURIComponent(message || WHATSAPP_CONFIG.defaultMessage);
    return `https://wa.me/${WHATSAPP_CONFIG.adminNumber}?text=${text}`;
  },

  // Pesan khusus saat klik template tertentu
  templateMessage: (templateName: string, priceStr?: string) => {
    const priceText = priceStr ? ` (${priceStr})` : '';
    return `Halo admin JoinMe! 👋\nSaya tertarik untuk membuat undangan dengan template "${templateName}"${priceText}.\nBisa dibantu proses pembuatannya?`;
  },

  // Pesan khusus saat klik paket harga tertentu
  pricingMessage: (planName: string) =>
    `Halo admin JoinMe! 👋\nSaya ingin memesan undangan digital ${planName}.\nMohon info detail dan instruksi pembayarannya ya!`,
};
