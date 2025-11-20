# Vercel Environment Variables - Hızlı Referans

Bu dokuman, Vercel'de kullanılacak environment variables için hızlı referans sağlar.

## 🚨 Zorunlu Variables (Production)

Bu değişkenler olmadan uygulama çalışmaz:

```bash
# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Security Secrets (min 32 karakter)
CSRF_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# First Admin
FIRST_ADMIN_EMAIL=baskan@dernek.org
FIRST_ADMIN_PASSWORD=YourSecurePassword123!
```

### Ayarlama:

```bash
# Otomatik (Önerilen)
npm run setup:vercel

# Manuel
vercel env add NEXT_PUBLIC_CONVEX_URL production
vercel env add CSRF_SECRET production
vercel env add SESSION_SECRET production
vercel env add FIRST_ADMIN_EMAIL production
vercel env add FIRST_ADMIN_PASSWORD production
```

## 📊 Monitoring & Error Tracking

### Sentry

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
```

**Kaynak:** [sentry.io](https://sentry.io) → Project Settings → Client Keys (DSN)

### Vercel Analytics

```bash
# Otomatik aktif (package.json'da @vercel/analytics)
# Ek ayar gerekmiyor
```

### Google Analytics

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Kaynak:** [analytics.google.com](https://analytics.google.com) → Admin → Data Streams

## 📧 Email Configuration (SMTP)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@kafkasder.org
```

### Gmail için App Password Oluşturma:
1. [Google Account](https://myaccount.google.com) → Security
2. 2-Step Verification'ı aktif edin
3. App Passwords → Mail → Generate

### Diğer SMTP Providers:
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **Amazon SES**: `email-smtp.region.amazonaws.com:587`

## 📱 SMS Configuration (Twilio)

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+905551234567
```

**Kaynak:** [twilio.com/console](https://console.twilio.com)
- Account SID: Dashboard'da görünür
- Auth Token: Dashboard → Show Auth Token
- Phone Number: Phone Numbers → Active Numbers

## 💬 WhatsApp Configuration

```bash
# İlk QR scan sonrası true yapın
WHATSAPP_AUTO_INIT=false
```

**Not:** WhatsApp web.js kullanıyor, ilk kurulumda QR kod okutma gerekir.

## 🤖 AI Features (OpenAI)

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Kaynak:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Azure OpenAI (Alternatif)

```bash
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
```

## 🗺️ Google Maps

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Kaynak:** [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

**Gerekli API'ler:**
- Maps JavaScript API
- Geocoding API
- Places API (opsiyonel)

## 🔔 n8n Webhooks (Opsiyonel)

```bash
N8N_DONATION_WEBHOOK_URL=https://your-n8n-instance.com/webhook/donation-created
N8N_ERROR_WEBHOOK_URL=https://your-n8n-instance.com/webhook/error-logged
N8N_TELEGRAM_WEBHOOK_URL=https://your-n8n-instance.com/webhook/telegram-notify
N8N_WEBHOOK_SECRET=your-webhook-secret-key
```

## ⚙️ Rate Limiting

```bash
# Global limits
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000  # 15 dakika

# API specific
RATE_LIMIT_API_MAX=1000
RATE_LIMIT_API_WINDOW=900000

# Premium multiplier
RATE_LIMIT_PREMIUM_MULTIPLIER=2.0

# IP Whitelist/Blacklist
RATE_LIMIT_WHITELIST_IPS=127.0.0.1,::1
RATE_LIMIT_BLACKLIST_IPS=
```

## 📁 File Upload Limits

```bash
MAX_FILE_SIZE=10485760        # 10MB
MAX_FILES_PER_UPLOAD=5
```

## 🔐 Session Management

```bash
NEXT_PUBLIC_MAX_CONCURRENT_SESSIONS=3
NEXT_PUBLIC_SESSION_INACTIVITY_TIMEOUT=3600000   # 1 saat
NEXT_PUBLIC_SESSION_MAX_AGE=86400000             # 24 saat
```

## 🛠️ Development & Debug

```bash
NODE_ENV=production                    # Vercel'de otomatik
NEXT_PUBLIC_DEMO_MODE=false           # Demo mode (API calls devre dışı)
ANALYZE=false                          # Bundle analysis
DEPLOY_URL=https://your-domain.vercel.app
```

## 📝 Environment Targets

Variables hangi environment'larda kullanılacak:

| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | ✅ | ✅ | ✅ |
| `CSRF_SECRET` | ✅ | ✅ | ❌ |
| `SESSION_SECRET` | ✅ | ✅ | ❌ |
| `FIRST_ADMIN_EMAIL` | ✅ | ❌ | ❌ |
| `FIRST_ADMIN_PASSWORD` | ✅ | ❌ | ❌ |
| `SENTRY_DSN` | ✅ | ✅ | ❌ |
| `SMTP_*` | ✅ | ✅ | ❌ |
| `TWILIO_*` | ✅ | ✅ | ❌ |
| `OPENAI_API_KEY` | ✅ | ✅ | ❌ |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ✅ | ✅ | ✅ |

## 🔍 Variable Kontrolü

### Vercel Dashboard'dan

1. Dashboard → Project → Settings → Environment Variables
2. Her variable için hangi environment'larda aktif olduğunu görün
3. Edit/Delete butonları ile düzenleyin

### CLI ile

```bash
# Tüm variables'ları listele
vercel env ls

# Specific environment için
vercel env ls production
vercel env ls preview
vercel env ls development

# Pull etme (.env.local'e)
vercel env pull .env.local

# Variable ekleme
vercel env add VARIABLE_NAME production

# Variable silme
vercel env rm VARIABLE_NAME production
```

## 🚀 Hızlı Kurulum

### Tüm Zorunlu Variables

```bash
# 1. Secret'ları oluştur
export CSRF_SECRET=$(openssl rand -base64 32)
export SESSION_SECRET=$(openssl rand -base64 32)

# 2. Hepsini tek seferde ekle
cat << EOF | vercel env add
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CSRF_SECRET=$CSRF_SECRET
SESSION_SECRET=$SESSION_SECRET
FIRST_ADMIN_EMAIL=baskan@dernek.org
FIRST_ADMIN_PASSWORD=YourSecurePassword123!
EOF
```

### .env.local'den Import

```bash
# 1. .env.local hazırla
cp .env.example .env.local
# .env.local'i düzenle

# 2. Her variable için loop
while IFS='=' read -r key value; do
  [[ $key =~ ^#.*$ ]] && continue
  [[ -z $key ]] && continue
  echo "Setting $key"
  vercel env add "$key" production <<< "$value"
done < .env.local
```

## 📋 Checklist

Deployment öncesi kontrol:

### Zorunlu
- [ ] `NEXT_PUBLIC_CONVEX_URL` ayarlandı
- [ ] `CSRF_SECRET` (32+ char) oluşturuldu
- [ ] `SESSION_SECRET` (32+ char) oluşturuldu
- [ ] `FIRST_ADMIN_EMAIL` ayarlandı
- [ ] `FIRST_ADMIN_PASSWORD` ayarlandı

### Önerilen
- [ ] Sentry DSN ayarlandı (error tracking)
- [ ] SMTP yapılandırıldı (email)
- [ ] Rate limiting ayarları yapılandırıldı

### Opsiyonel
- [ ] Twilio yapılandırıldı (SMS)
- [ ] OpenAI API key eklendi (AI features)
- [ ] Google Maps API key eklendi (maps)
- [ ] n8n webhooks yapılandırıldı (automation)

## 🆘 Sorun Giderme

### Variable görünmüyor

```bash
# Cache temizle ve tekrar deploy
vercel --force
```

### Build sırasında variable eksik hatası

```bash
# Variable'ın doğru environment'a eklendiğini kontrol et
vercel env ls production

# Yeniden ekle
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

### Runtime'da environment variable undefined

- `NEXT_PUBLIC_` prefix'i client-side variables için **zorunlu**
- Server-side variables sadece API routes ve server components'te erişilebilir
- Build time'da kullanılacak variables build sırasında mevcut olmalı

## 📚 Daha Fazla Bilgi

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Detaylı deployment rehberi
- [.env.example](./.env.example) - Tüm variables'ın açıklaması
- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)

---

**Son Güncelleme:** 2024-11-20  
**Versiyon:** 1.0.0
