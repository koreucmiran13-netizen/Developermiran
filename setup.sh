#!/bin/bash

# Clear screen and show cool banner
clear
echo "================================================================="
echo "   ⚡ DİYARBAKIR ELEKTRİK USTASI - OTOMATİK ÇİFT PORT KURULUMU ⚡"
echo "================================================================="
echo "Bu betik sitenizi (Port 3002) ve WhatsApp botunuzu (Port 3001)"
echo "olarak iki ayrı servis halinde kurup Nginx ile birbirine bağlayacaktır."
echo "Lütfen bekleyin..."
echo "================================================================="
sleep 2

# 1. Update system
echo "🔄 Sistem paket listesi güncelleniyor..."
sudo apt-get update -y

# 2. Check and Install Node.js if not present
if ! command -v node &> /dev/null
then
    echo "📦 Node.js bulunamadı. Node.js v18 kuruluyor..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js zaten kurulu: $(node -v)"
fi

# 3. Check and Install PM2
if ! command -v pm2 &> /dev/null
then
    echo "📦 PM2 paket yöneticisi kuruluyor..."
    sudo npm install -g pm2
else
    echo "✅ PM2 zaten kurulu."
fi

# 4. Check and Install Nginx
if ! command -v nginx &> /dev/null
then
    echo "📦 Nginx Web Sunucusu kuruluyor..."
    sudo apt-get install -y nginx
else
    echo "✅ Nginx zaten kurulu."
fi

# 5. Build the Web App and Bot bundles
echo "🛠️ Proje bağımlılıkları kuruluyor..."
npm install

echo "🏗️ Proje derleniyor (Web sitesi ve WhatsApp botu derleniyor)..."
npm run build

# 6. Start both services in PM2 with separate ports
echo "🚀 Servisler PM2 üzerinde başlatılıyor..."

# Stop existing processes if any
pm2 delete elektrik-site 2>/dev/null || true
pm2 delete elektrik-bot 2>/dev/null || true

# Start Web server on Port 3002
echo "🌐 Web sitesi Port 3002 üzerinde başlatılıyor..."
PORT=3002 NODE_ENV=production pm2 start dist/server.cjs --name "elektrik-site"

# Start Bot server on Port 3001
echo "🤖 WhatsApp Botu Port 3001 üzerinde başlatılıyor..."
NODE_ENV=production pm2 start dist/bot.cjs --name "elektrik-bot"

pm2 save

# 7. Configure Nginx automatically for Split Ports (3001 and 3002)
echo "🌐 Nginx çift port yönlendirme ayarları yapılıyor..."

NGINX_CONF="/etc/nginx/sites-available/diyarbakirelektrikustasi"

sudo bash -c "cat > $NGINX_CONF" << 'EOF'
server {
    listen 80;
    server_name diyarbakirelektrikustasi.com.tr www.diyarbakirelektrikustasi.com.tr;

    # WhatsApp Bot endpoints mapped to Port 3001
    location /api/whatsapp {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Order/Lead notifications mapped to Port 3001
    location /api/teklif {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Web assets and main site mapped to Port 3002
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Activate the Nginx configuration
sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
echo "🔄 Nginx test ediliyor ve yeniden başlatılıyor..."
sudo nginx -t
sudo systemctl restart nginx

echo "================================================================="
echo "🎉 TEBRİKLER! Çift Port Kurulumu başarıyla tamamlandı!"
echo "================================================================="
echo "👉 Siteniz şu an Port 3002 (Web) ve Port 3001 (Bot) olarak aktif."
echo "👉 Ücretsiz SSL (HTTPS - Yeşil Kilit) kurmak ister misiniz?"
echo "================================================================="

read -p "SSL Kurmak istiyor musunuz? (e/h): " ssl_choice

if [[ "$ssl_choice" == "e" || "$ssl_choice" == "E" ]]; then
    echo "🔒 Certbot ve SSL kuruluyor..."
    sudo apt-get install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d diyarbakirelektrikustasi.com.tr -d www.diyarbakirelektrikustasi.com.tr
    echo "✅ SSL başarıyla aktif edildi!"
else
    echo "⚠️ SSL kurulumu atlandı. Siteniz HTTP olarak çalışmaya devam edecek."
fi

echo "================================================================="
echo "⚡ Diyarbakır Elektrik Ustası artık yayında!"
echo "🌐 Web Sitesi: http://diyarbakirelektrikustasi.com.tr"
echo "🤖 Bot Yönetim Paneli: http://diyarbakirelektrikustasi.com.tr/admin"
echo "================================================================="
