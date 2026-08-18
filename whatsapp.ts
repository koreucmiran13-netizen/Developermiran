import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason,
  WASocket
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import path from 'path';
import fs from 'fs';

// Connection States
export type BotStatus = 'disconnected' | 'connecting' | 'qr' | 'connected';

let sock: WASocket | null = null;
let qrCode: string | null = null;
let connectionStatus: BotStatus = 'disconnected';
let botLogs: string[] = [];

function logToBot(msg: string) {
  const time = new Date().toLocaleTimeString('tr-TR');
  const loggedMsg = `[${time}] ${msg}`;
  console.log(loggedMsg);
  botLogs.unshift(loggedMsg);
  if (botLogs.length > 100) botLogs.pop();
}

export function getQR() {
  return qrCode;
}

export function getStatus() {
  return connectionStatus;
}

export function getLogs() {
  return botLogs;
}

export async function logoutWhatsApp() {
  logToBot('Oturum kapatılıyor ve oturum dosyaları temizleniyor...');
  connectionStatus = 'disconnected';
  qrCode = null;
  
  if (sock) {
    try {
      await sock.logout();
    } catch (e) {}
    sock = null;
  }

  const authFolder = path.join(process.cwd(), 'auth_info_baileys');
  if (fs.existsSync(authFolder)) {
    try {
      fs.rmSync(authFolder, { recursive: true, force: true });
      logToBot('Oturum dosyaları başarıyla temizlendi.');
    } catch (err: any) {
      logToBot('Hata: Oturum dosyaları temizlenemedi: ' + err.message);
    }
  }

  // Restart connection in disconnected state
  setTimeout(() => {
    startWhatsApp();
  }, 1000);
}

export async function startWhatsApp() {
  if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
    logToBot('WhatsApp zaten başlatılıyor veya zaten bağlı durumda.');
    return;
  }

  connectionStatus = 'connecting';
  qrCode = null;
  logToBot('WhatsApp bağlantısı başlatılıyor...');

  const authFolder = path.join(process.cwd(), 'auth_info_baileys');
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);

  try {
    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: 'silent' }),
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCode = qr;
        connectionStatus = 'qr';
        logToBot('QR Kod başarıyla üretildi! Lütfen telefonunuzdan taratın.');
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        logToBot(`Bağlantı kapandı. Sebep: ${lastDisconnect?.error?.toString()}. Yeniden bağlanılıyor mu: ${shouldReconnect}`);
        
        connectionStatus = 'disconnected';
        qrCode = null;

        if (shouldReconnect) {
          setTimeout(() => {
            startWhatsApp();
          }, 3000);
        } else {
          logToBot('WhatsApp oturumu kapatıldı (Cihaz bağlantısı sonlandırıldı).');
          logoutWhatsApp();
        }
      } else if (connection === 'open') {
        connectionStatus = 'connected';
        qrCode = null;
        logToBot('🎉 Tebrikler! WhatsApp Botu başarıyla BAĞLANDI!');
      }
    });

    // Listen for incoming messages
    sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      if (!msg.key.fromMe && m.type === 'notify') {
        const from = msg.key.remoteJid;
        const name = msg.pushName || 'Değerli Müşterimiz';
        
        // Only reply to direct messages
        if (from && from.endsWith('@s.whatsapp.net')) {
          const body = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text || 
                       '';
          
          logToBot(`📨 Yeni Mesaj - Gönderen: ${name} (${from.split('@')[0]}): "${body}"`);

          // Send an automatic, polite welcome card response
          try {
            const welcomeText = `Merhaba ${name}! Diyarbakır Elektrik Ustası otomatik asistanına hoş geldiniz. ⚡\n\n` +
              `Mesajınızı aldık! Usta ekibimiz şu an sahada çalışıyor olabilir. En kısa sürede size geri dönüş yapacağız. \n\n` +
              `🚀 *Hızlı Hizmet Almak İçin:* \n` +
              `• Arızanızı/talebinizi detaylıca yazabilirsiniz.\n` +
              `• Konum veya açık adres paylaşabilirsiniz.\n\n` +
              `📞 *Doğrudan Acil Usta Hattı:* \n` +
              `Hemen görüşmek için bizi arayabilirsiniz: *0543 668 21 47*`;

            await sock!.sendMessage(from, { text: welcomeText });
            logToBot(`✉️ Otomatik karşılama mesajı gönderildi: ${from}`);
          } catch (err: any) {
            logToBot(`❌ Otomatik mesaj gönderilemedi: ${err.message}`);
          }
        }
      }
    });

  } catch (error: any) {
    logToBot(`❌ Bot başlatılırken kritik bir hata oluştu: ${error.message}`);
    connectionStatus = 'disconnected';
  }
}

// Allows sending custom messages from the website form backend
export async function sendNotificationMessage(text: string) {
  if (!sock || connectionStatus !== 'connected') {
    logToBot('⚠️ Bildirim gönderilemedi: Bot şu anda bağlı değil.');
    return false;
  }

  try {
    // Clean phone number format for usta's phone number
    const targetNumber = '905436682147@s.whatsapp.net';
    await sock.sendMessage(targetNumber, { text });
    logToBot(`✅ Web sitesinden gelen teklif başarıyla kendi telefonunuza iletildi.`);
    return true;
  } catch (err: any) {
    logToBot(`❌ Bildirim mesajı gönderilirken hata: ${err.message}`);
    return false;
  }
}
