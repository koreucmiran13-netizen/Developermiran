import express from 'express';
import cors from 'cors';
import qrcode from 'qrcode';
import { 
  startWhatsApp, 
  getQR, 
  getStatus, 
  getLogs, 
  logoutWhatsApp, 
  sendNotificationMessage 
} from './whatsapp.js';

const app = express();
const port = 3001; // WhatsApp Bot Server is dedicated to Port 3001
const host = '0.0.0.0';

app.use(cors());
app.use(express.json());

// API health route for bot
app.get('/api/whatsapp/health', (req, res) => {
  res.json({ status: 'ok', service: 'whatsapp-bot', port });
});

// WhatsApp Bot API Endpoints
app.get('/api/whatsapp/status', (req, res) => {
  res.json({ 
    status: getStatus(), 
    hasQr: !!getQR(),
    logs: getLogs()
  });
});

app.get('/api/whatsapp/qr', async (req, res) => {
  const qr = getQR();
  if (!qr) {
    return res.status(404).json({ error: 'QR kod şu anda hazır değil veya bot zaten bağlı.' });
  }
  try {
    const qrDataUrl = await qrcode.toDataURL(qr);
    res.json({ qr: qrDataUrl });
  } catch (err: any) {
    res.status(500).json({ error: 'QR resim formatına dönüştürülemedi: ' + err.message });
  }
});

app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    await logoutWhatsApp();
    res.json({ success: true, message: 'Başarıyla çıkış yapıldı ve oturum temizlendi.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Website lead collection and automatic WhatsApp notification endpoint
app.post('/api/teklif', async (req, res) => {
  const { name, district, address, note, services, total } = req.body;

  const summaryMessage = 
    `🔔 *YENİ İNTERNET SİPARİŞİ VE TEKLİFİ* 🔔\n\n` +
    `👤 *Müşteri:* ${name || 'Belirtilmedi'}\n` +
    `📍 *Bölge:* Diyarbakır / ${selectedDistrictSafe(district)}\n` +
    `🏠 *Adres:* ${address || 'Belirtilmedi'}\n` +
    `💬 *Not:* ${note || 'Yok'}\n\n` +
    `🛠️ *Talep Edilenler:* \n${services.map((s: string) => `• ${s}`).join('\n')}\n\n` +
    `💰 *Tahmini Fiyat:* ~${total} TL\n\n` +
    `⚡ Müşteriyle iletişime geçmek için hazırdır.`;

  // Send notification to usta's phone automatically via bot
  const sent = await sendNotificationMessage(summaryMessage);

  res.json({ 
    success: true, 
    notifiedViaBot: sent,
    message: 'Teklif başarıyla kaydedildi!' 
  });
});

function selectedDistrictSafe(district: any) {
  return district || 'Belirtilmedi';
}

// Start WhatsApp service
startWhatsApp();

app.listen(port, host, () => {
  console.log(`⚡ Dedicated WhatsApp Bot Server running at http://${host}:${port}`);
});
