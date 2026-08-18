import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  CheckCircle, 
  Loader2, 
  LogOut, 
  RefreshCw, 
  Terminal, 
  MessageSquare, 
  ShieldCheck, 
  ArrowLeft,
  Smartphone,
  Info
} from 'lucide-react';

export default function WhatsappAdmin() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'qr' | 'connected'>('disconnected');
  const [hasQr, setHasQr] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      setStatus(data.status);
      setHasQr(data.hasQr);
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Bağlantı durumu alınamadı:', err);
    }
  };

  const fetchQr = async () => {
    try {
      setQrError(null);
      const res = await fetch('/api/whatsapp/qr');
      if (res.status === 404) {
        setQrImage(null);
        return;
      }
      const data = await res.json();
      if (data.qr) {
        setQrImage(data.qr);
      }
    } catch (err) {
      setQrError('QR Kod yüklenirken bir hata oluştu.');
      console.error('QR alınamadı:', err);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('WhatsApp botunun cihaz bağlantısını kesmek istediğinize emin misiniz?')) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatus('disconnected');
        setQrImage(null);
        alert('Bağlantı kesildi. Yeni bir QR kod üretiliyor...');
      }
    } catch (err) {
      alert('Çıkış yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
      fetchStatus();
    }
  };

  // Poll connection status every 3 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch QR code if status is 'qr'
  useEffect(() => {
    if (status === 'qr' || hasQr) {
      fetchQr();
      const qrInterval = setInterval(fetchQr, 5000);
      return () => clearInterval(qrInterval);
    } else {
      setQrImage(null);
    }
  }, [status, hasQr]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-6">
          <div className="flex items-center gap-3">
            <a 
              href="/" 
              className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <span className="text-[10px] text-amber-500 font-extrabold tracking-widest uppercase">YÖNETİCİ PANELİ</span>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                WhatsApp Bot Kontrol Merkezi
              </h1>
            </div>
          </div>

          <button 
            onClick={fetchStatus} 
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Yenile
          </button>
        </div>

        {/* Status Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Status Column */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 space-y-6 relative overflow-hidden">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Bağlantı Durumu</h2>
              
              {status === 'connected' && (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-black uppercase">
                    <CheckCircle className="w-4 h-4 fill-emerald-500/10" />
                    AKTİF / BAĞLI
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Botunuz şu an WhatsApp sunucularına bağlı. Gelen mesajları otomatik karşılayabilir ve internet siparişlerinizi bildirim olarak gönderebilir.
                  </p>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Aktif Telefon</p>
                      <p className="text-xs font-bold text-white">Mobil Cihaz Bağlandı</p>
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    Cihaz Bağlantısını Kes (Çıkış Yap)
                  </button>
                </div>
              )}

              {status === 'connecting' && (
                <div className="space-y-4 py-6 text-center">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">Bağlantı Kuruluyor...</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Sunucu bağlantı kuruyor. Lütfen birkaç saniye bekleyin.
                  </p>
                </div>
              )}

              {status === 'disconnected' && (
                <div className="space-y-4 py-4 text-center">
                  <Loader2 className="w-8 h-8 text-slate-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">WhatsApp Başlatılıyor</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Servis yanıt vermedi, QR kod üretiliyor. Lütfen sayfayı yenileyin veya bekleyin.
                  </p>
                </div>
              )}

              {status === 'qr' && (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-xs font-black uppercase">
                    <QrCode className="w-4 h-4" />
                    TARAMA BEKLENİYOR
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed">
                    WhatsApp botunu başlatmak için aşağıdaki QR kodunu telefonunuzdaki WhatsApp uygulamasından **Bağlı Cihazlar {'>'} Cihaz Bağla** adımlarını izleyerek taratın.
                  </p>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-2 text-left">
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-[10px] text-slate-500 leading-relaxed">
                      QR kodu tarattıktan sonra sayfa otomatik olarak <strong>"Bağlandı"</strong> durumuna geçecektir.
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* QR Code Canvas / Instructions Column */}
          <div className="md:col-span-7 space-y-6">
            
            {status === 'qr' && (
              <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider w-full text-left border-b border-slate-950 pb-4">
                  1. QR Kodu Taratın
                </h3>
                
                {qrImage ? (
                  <div className="p-4 bg-white rounded-2xl shadow-xl shadow-amber-500/5 border border-slate-200">
                    <img src={qrImage} alt="WhatsApp QR Code" className="w-64 h-64 select-none" />
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <span className="text-[10px] text-slate-500">QR Kod Alınıyor...</span>
                  </div>
                )}

                {qrError && (
                  <p className="text-xs text-red-500 font-bold">{qrError}</p>
                )}

                <div className="w-full text-left space-y-2 text-xs text-slate-400 p-4 bg-slate-950 rounded-2xl border border-slate-850">
                  <p className="font-bold text-white text-[11px] uppercase tracking-wider mb-1">📱 NASIL BAĞLANIR?</p>
                  <p>1. Telefonunuzdan <strong>WhatsApp</strong>'ı açın.</p>
                  <p>2. Sağ üstteki menüden (veya Ayarlar'dan) <strong>Bağlı Cihazlar</strong>'ı seçin.</p>
                  <p>3. <strong>Cihaz Bağla</strong> butonuna dokunun.</p>
                  <p>4. Kameranızı bu ekrandaki QR koda doğrultup taratın.</p>
                </div>
              </div>
            )}

            {status === 'connected' && (
              <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-950 pb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Botunuz Çalışıyor!
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-emerald-500/20 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Özellik</p>
                      <p className="text-xs font-bold text-slate-200">7/24 Otomatik Karşılama</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-emerald-500/20 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Durum</p>
                      <p className="text-xs font-bold text-slate-200">Güvenli Oturum (Baileys)</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 text-xs text-slate-400 space-y-2">
                  <p className="font-bold text-white text-[11px] uppercase tracking-wider">🌟 BAĞLANTI AVANTAJLARI</p>
                  <p>• Sitenizden bir müşteri sipariş hesapladığında, detaylı mesaj doğrudan sizin bu telefonunuza <strong>Usta Bildirimi</strong> olarak iletilir.</p>
                  <p>• Gece yarısı veya meşgulken gelen arıza mesajlarına bot otomatik olarak nezaketle yanıt verir ve sizi bilgilendirir.</p>
                </div>
              </div>
            )}

            {status === 'connecting' && (
              <div className="bg-slate-900/60 border border-slate-900 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Bağlantı Doğrulanıyor</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  WhatsApp bağlantısı güvenli soket üzerinden başlatılıyor. Bu işlem 10-15 saniye sürebilir. Lütfen bekleyin.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Live Bot Logs Terminal */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-950 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-500" />
              Canlı Bot Logları (Sistem Günlüğü)
            </h3>
            <span className="text-[10px] bg-slate-950 text-slate-500 px-2 py-0.5 rounded border border-slate-900 font-mono">
              Real-time Logs
            </span>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-900 p-4 font-mono text-[10px] text-slate-400 h-64 overflow-y-auto space-y-1.5 scrollbar-thin">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="hover:text-white transition-colors border-l-2 border-slate-800 pl-2">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-center text-slate-600 py-12">
                Henüz log kaydı oluşmadı. Sistem bekleniyor...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
