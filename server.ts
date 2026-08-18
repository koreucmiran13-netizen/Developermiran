import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import qrcode from 'qrcode';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const host = '0.0.0.0';

app.use(cors());
app.use(express.json());

// API health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', domain: 'diyarbakirelektrikustasi.com.tr' });
});

// Setup development-only WhatsApp endpoints inside the web server so AI Studio preview is fully functional.
// In production VDS, Nginx will route all /api/whatsapp and /api/teklif requests directly to the bot on Port 3001.
async function setupDevBot() {
  if (process.env.NODE_ENV !== 'production') {
    const { 
      startWhatsApp, 
      getQR, 
      getStatus, 
      getLogs, 
      logoutWhatsApp, 
      sendNotificationMessage 
    } = await import('./whatsapp.js');

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
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/whatsapp/logout', async (req, res) => {
      await logoutWhatsApp();
      res.json({ success: true });
    });

    app.post('/api/teklif', async (req, res) => {
      const { name, district, address, note, services, total } = req.body;
      const summaryMessage = 
        `🔔 *YENİ İNTERNET SİPARİŞİ VE TEKLİFİ* 🔔\n\n` +
        `👤 *Müşteri:* ${name || 'Belirtilmedi'}\n` +
        `📍 *Bölge:* Diyarbakır / ${district || 'Belirtilmedi'}\n` +
        `🏠 *Adres:* ${address || 'Belirtilmedi'}\n` +
        `💬 *Not:* ${note || 'Yok'}\n\n` +
        `🛠️ *Talep Edilenler:* \n${services.map((s: string) => `• ${s}`).join('\n')}\n\n` +
        `💰 *Tahmini Fiyat:* ~${total} TL`;

      const sent = await sendNotificationMessage(summaryMessage);
      res.json({ success: true, notifiedViaBot: sent });
    });

    // Boot Bot on Dev Startup
    startWhatsApp();
  }
}

// Vite Integration
async function startServer() {
  await setupDevBot();

  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, host, () => {
    console.log(`Diyarbakir Elektrik Ustasi Web running at http://${host}:${port}`);
  });
}

startServer();
