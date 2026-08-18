import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  Wrench, 
  Zap, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  Wifi, 
  Tv, 
  AlertTriangle,
  ChevronRight,
  Star,
  Users,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import WhatsappAdmin from './components/WhatsappAdmin';

// Pricing data for Interactive Estimator
const SERVICES_DATA = [
  { id: 'sigorta', name: 'Sigorta Arızası & Değişimi', price: 250, icon: AlertTriangle, desc: 'Atan sigortalar, gevşek klemensler ve pano arızaları.' },
  { id: 'avize', name: 'Avize & Aydınlatma Montajı', price: 200, icon: Zap, desc: 'Avize, LED şerit, spot ve aplik montaj işleri.' },
  { id: 'priz', name: 'Priz / Anahtar Yenileme', price: 100, icon: Wrench, desc: 'Eski, yerinden çıkmış prizlerin değişimi.' },
  { id: 'internet', name: 'İnternet / Telefon Kablolama', price: 300, icon: Wifi, desc: 'Cat6 kablo çekimi, modem kurulumu ve hat arıza tespiti.' },
  { id: 'tesisat', name: 'Ev / Ofis Komple Tesisat', price: 1500, icon: ShieldCheck, desc: 'Eski tesisatın sıfırdan güvenli şekilde yenilenmesi.' },
  { id: 'tv', name: 'TV & Uydu Kurulumu', price: 250, icon: Tv, desc: 'Televizyon askı aparatı montajı ve hat ayarı.' }
];

const TESTIMONIALS = [
  { name: 'Ahmet Y.', district: 'Kayapınar, Diyarbakır', text: 'Gece yarısı sigorta kutusundan sesler geliyordu, yarım saatte gelip tüm sigortaları yenilediler. Güler yüzlü ve işinin ehli bir usta.', rating: 5 },
  { name: 'Mehmet S.', district: 'Yenişehir, Diyarbakır', text: 'Evimizin tüm avize montajlarını ve internet kablolamasını yaptı. Çok temiz çalışıyor, arkasında hiç toz bırakmadı.', rating: 5 },
  { name: 'Leyla K.', district: 'Bağlar, Diyarbakır', text: 'Priz arızası için çağırmıştık, elektrik tesisatındaki kaçakları da tespit edip düzeltti. Fiyatları da piyasaya göre çok makul.', rating: 5 }
];

export default function App() {
  const isAdmin = window.location.pathname === '/admin' || window.location.pathname === '/admin/';
  
  if (isAdmin) {
    return <WhatsappAdmin />;
  }

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Kayapınar');
  
  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, id) => {
      const service = SERVICES_DATA.find(s => s.id === id);
      return total + (service ? service.price : 0);
    }, 0);
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      alert('Lütfen teklif almak için en az bir hizmet seçin!');
      return;
    }

    const selectedNames = selectedServices.map(id => {
      const s = SERVICES_DATA.find(item => item.id === id);
      return `• ${s?.name} (~${s?.price} TL)`;
    }).join('\n');

    const total = calculateTotal();
    
    // Auto-ping the WhatsApp bot backend in background to notify usta
    const serviceNamesOnly = selectedServices.map(id => {
      const s = SERVICES_DATA.find(item => item.id === id);
      return s ? s.name : '';
    }).filter(Boolean);

    fetch('/api/teklif', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: customerName,
        district: selectedDistrict,
        address: customerAddress,
        note: customerNote,
        services: serviceNamesOnly,
        total: total
      })
    }).catch(err => console.error('Bot notification error:', err));

    const message = `Merhaba Diyarbakır Elektrik Ustası,\n\n` +
      `Web sitenizden teklif oluşturmak istiyorum:\n\n` +
      `👤 *Müşteri Adı:* ${customerName || 'Belirtilmedi'}\n` +
      `📍 *Bölge:* Diyarbakır / ${selectedDistrict}\n` +
      `🏠 *Adres:* ${customerAddress || 'Belirtilmedi'}\n` +
      `💬 *Not:* ${customerNote || 'Arıza hakkında kısa bilgi...'}\n\n` +
      `🛠️ *Seçilen Hizmetler:* \n${selectedNames}\n\n` +
      `💰 *Yaklaşık Tahmini Tutar:* ~${total} TL\n\n` +
      `Adresime usta yönlendirebilir misiniz?`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/905436682147?text=${encodedMessage}`; // User WhatsApp Link
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      
      {/* Top Banner & Header */}
      <div className="bg-amber-500 text-slate-950 text-xs font-bold py-2 px-4 text-center tracking-wider flex items-center justify-center gap-2 animate-pulse">
        <Clock className="w-3.5 h-3.5" />
        DİYARBAKIR GENELİ 7/24 ACİL ELEKTRİKÇİ & ARIZA SERVİSİ: 0543 668 21 47
      </div>

      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-white">Diyarbakır</h1>
              <p className="text-[10px] font-bold uppercase text-amber-500 tracking-widest mt-[-2px]">Elektrik Ustası</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            <a href="#hizmetler" className="hover:text-white transition-colors">Hizmetlerimiz</a>
            <a href="#teklif" className="hover:text-white transition-colors">Fiyat Hesapla</a>
            <a href="#neden-biz" className="hover:text-white transition-colors">Neden Biz?</a>
            <a href="#yorumlar" className="hover:text-white transition-colors">Müşteri Yorumları</a>
          </nav>

          <div className="flex items-center gap-2">
            <a 
              href="tel:05436682147" 
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>Hemen Ara</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent opacity-50" />
        
        {/* Subtle glowing lines in background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" /> Diyarbakır Merkez ve Tüm İlçeler
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
              Elektrik İşini <br />
              <span className="text-amber-500">Şansa Bırakmayın.</span>
            </h2>
            
            <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
              Arızayı doğru tespit eden, işini temiz yapan ve çözümü açıkça anlatan, belgeli ve güvenilir yerel elektrik ustası. Ev ve iş yerleriniz için 7/24 kesintisiz hizmet.
            </p>

            {/* Core Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-900">
                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-200">30 Dakikada Kapıda</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-900">
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-200">Garanti İşçilik</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-900 col-span-2 sm:col-span-1">
                <Wrench className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-200">Belgeli Usta</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <a 
                href="tel:05436682147" 
                className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Phone className="w-5 h-5 fill-current" />
                Tıkla, Hemen Ustayı Ara
              </a>
              <a 
                href="https://wa.me/905436682147" 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-4 bg-slate-900 hover:bg-slate-850 text-white rounded-2xl text-sm font-bold border border-slate-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                WhatsApp'tan Yaz
              </a>
            </div>
          </div>

          {/* Emergency Glow Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-xl animate-pulse" />
              
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> ACİL NÖBETÇİ USTA
                </span>
                <Clock className="w-5 h-5 text-slate-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Elektrik mi Kesildi?</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Sigorta patlamaları, yangın riski taşıyan kablo kokuları veya acil tamirat ihtiyaçlarınızda Diyarbakır genelinde nöbetçi acil destek aracımızla 30 dakikada yanınızdayız.
              </p>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-500">7/24 Telefon Hattı</p>
                  <p className="text-lg font-black text-white font-mono">0543 668 21 47</p>
                </div>
                <a 
                  href="tel:05436682147" 
                  className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                >
                  <Phone className="w-5 h-5 fill-current" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Services Catalog */}
      <section id="hizmetler" className="py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs text-amber-500 font-extrabold uppercase tracking-widest">USTALIK HİZMETLERİMİZ</span>
            <h3 className="text-3xl font-black text-white">Size Nasıl Yardımcı Olabiliriz?</h3>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Elektrik arızasından komple tesisat yenilemeye kadar tüm ihtiyaçlarınızda son teknoloji arıza tespit cihazlarımızla temiz çalışıyoruz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES_DATA.map((service) => {
              const IconComponent = service.icon;
              return (
                <div 
                  key={service.id}
                  className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-6 hover:border-amber-500/20 hover:bg-slate-900/60 transition-all group"
                >
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/20 mb-4 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{service.name}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">{service.desc}</p>
                  <div className="flex items-center justify-between border-t border-slate-950 pt-4">
                    <span className="text-[10px] font-bold uppercase text-slate-500">BAŞLAYAN FİYAT</span>
                    <span className="text-sm font-extrabold text-amber-500 font-mono">~{service.price} TL</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Interactive Estimate Calculator */}
      <section id="teklif" className="py-20 bg-slate-950/50 border-b border-slate-900 relative">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs text-amber-500 font-extrabold uppercase tracking-widest">AKILLI TEKLİF SİSTEMİ</span>
            <h3 className="text-3xl font-black text-white">İnternete Özel Fiyatını Hesapla</h3>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Hizmetleri seçin, tahmini malzeme ve işçilik fiyatını anında görün ve teklifi tek tıkla WhatsApp üzerinden ustaya iletin!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Left Side: Service Selector */}
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">1. Hizmetleri Seçin</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICES_DATA.map((service) => {
                  const isSelected = selectedServices.includes(service.id);
                  return (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                          : 'bg-slate-950/60 border-slate-900 text-slate-300 hover:border-slate-800'
                      }`}
                    >
                      <span className="text-xs font-bold">{service.name}</span>
                      <span className="text-[10px] font-mono text-slate-500 mt-2">Başlangıç: {service.price} TL</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Price Summary and Contact Form */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">2. İletişim & Teklif Bilgileri</h4>
              
              <form onSubmit={handleSendWhatsApp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Adınız Soyadınız</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Örn: Hüseyin Ekinci"
                    className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">İlçe / Bölge</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    >
                      <option value="Kayapınar">Kayapınar</option>
                      <option value="Yenişehir">Yenişehir</option>
                      <option value="Bağlar">Bağlar</option>
                      <option value="Sur">Sur</option>
                      <option value="Dicle">Dicle</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Adres Tarifi</label>
                    <input
                      type="text"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Sokak, bina no, kat..."
                      className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Arıza Detayı / Ek Not</label>
                  <input
                    type="text"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Kısa bilgi veya ek not ekleyin..."
                    className="w-full bg-slate-900/60 border border-slate-900 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                  />
                </div>

                {/* Live Estimator Indicator */}
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-900 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Tahmini Fiyat:</span>
                  <span className="text-lg font-black text-amber-500 font-mono">~{calculateTotal()} TL</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-current text-slate-950" />
                  Teklifi WhatsApp ile Gönder
                </button>
              </form>
            </div>

          </div>

        </div>
      </section>

      {/* Trust Badges section */}
      <section id="neden-biz" className="py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-3 p-4">
              <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">7/24 Hızlı Servis</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Diyarbakır Kayapınar, Bağlar, Yenişehir ve Sur ilçelerine en fazla 30 dakikada ulaşıyoruz.
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                <Award className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">Sertifikalı İşçilik</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Tüm elektrik işlerimizi yönetmeliklere uygun ve Milli Eğitim Bakanlığı onaylı yetki belgemizle yapıyoruz.
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">Uygun Fiyat Garantisi</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Sürpriz ek ödemeler çıkarmadan, malzeme ve usta işçiliğinde en avantajlı fiyatlandırmayı sağlıyoruz.
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">Yüzlerce Mutlu Müşteri</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Diyarbakır genelinde binlerce ev, iş yeri ve ofis tesisatını güvenle onardık ve teslim ettik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (Customer Reviews) */}
      <section id="yorumlar" className="py-20 bg-slate-950/40 border-b border-slate-900">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs text-amber-500 font-extrabold uppercase tracking-widest">MÜŞTERİ MEMNUNİYETİ</span>
            <h3 className="text-3xl font-black text-white">Diyarbakır Bizi Tercih Ediyor</h3>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Hizmet verdiğimiz müşterilerimizin hakkımızdaki görüşleri ve memnuniyet yorumları bizim en büyük gururumuzdur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-slate-300 text-xs leading-relaxed italic">"{t.text}"</p>
                <div className="border-t border-slate-950 pt-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{t.name}</span>
                  <span className="text-[10px] text-amber-500 font-semibold">{t.district}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Emergency Footer Action */}
      <section className="bg-amber-500 py-12 px-4 text-slate-950 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <h3 className="text-2xl sm:text-3xl font-black">7/24 Kesintisiz Güvenli Tesisat Desteği</h3>
          <p className="text-xs sm:text-sm max-w-xl mx-auto font-bold opacity-90 leading-relaxed">
            Diyarbakır genelinde acil elektrik ve tesisat arıza çözümleri için hemen arayın, usta ekibimiz 30 dakika içinde kapınızda olsun.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <a 
              href="tel:05436682147" 
              className="px-8 py-4 bg-slate-950 text-white hover:bg-slate-900 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
            >
              <Phone className="w-5 h-5 fill-current text-amber-500" />
              Hemen Ustayı Ara: 0543 668 21 47
            </a>
          </div>
        </div>
      </section>

      {/* Real Footer */}
      <footer className="bg-slate-950 py-8 px-4 border-t border-slate-900 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-current" />
            <span className="font-semibold text-slate-300">Diyarbakır Elektrikçi © 2026</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-wider">
            <span>Kayapınar</span>
            <span>Bağlar</span>
            <span>Yenişehir</span>
            <span>Sur</span>
          </div>
          <p className="text-[10px]">Tüm Hakları Saklıdır. MEB Yetki Belgeli Elektrik Servisi.</p>
        </div>
      </footer>

    </div>
  );
}
