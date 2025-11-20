# Vercel Deployment Rehberi

Bu dokuman, Kafkasder Panel uygulamasını Vercel'e deploy etmek için adım adım rehber sağlar.

## 📋 İçindekiler

- [Ön Gereksinimler](#ön-gereksinimler)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Detaylı Kurulum](#detaylı-kurulum)
- [Environment Variables](#environment-variables)
- [Convex Backend Kurulumu](#convex-backend-kurulumu)
- [Deploy İşlemi](#deploy-işlemi)
- [Deploy Sonrası](#deploy-sonrası)
- [Sorun Giderme](#sorun-giderme)

## 🎯 Ön Gereksinimler

### 1. Hesaplar

- ✅ [Vercel hesabı](https://vercel.com/signup) (GitHub ile ücretsiz)
- ✅ [Convex hesabı](https://dashboard.convex.dev) (ücretsiz tier yeterli)
- ✅ GitHub repository erişimi

### 2. Yerel Gereksinimler

```bash
# Node.js sürümü kontrolü (>=20.9.0 gerekli)
node --version

# Vercel CLI kurulumu
npm install -g vercel

# Vercel'e giriş
vercel login
```

## ⚡ Hızlı Başlangıç

### Otomatik Kurulum (Önerilen)

```bash
# 1. Projeyi klonlayın
git clone https://github.com/Vadalov/Kafkasder-panel.git
cd Kafkasder-panel

# 2. Bağımlılıkları yükleyin
npm install

# 3. Vercel'e link edin
vercel link

# 4. Environment variables'ları ayarlayın (interaktif)
node scripts/setup-vercel-env.js

# 5. Convex'i deploy edin
npm run convex:deploy

# 6. Vercel'e deploy edin
vercel --prod
```

## 📝 Detaylı Kurulum

### Adım 1: Vercel Projesi Oluşturma

#### GitHub Integration (Önerilen)

1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
2. **"New Project"** butonuna tıklayın
3. GitHub repository'nizi seçin: `Vadalov/Kafkasder-panel`
4. **Framework Preset**: Next.js (otomatik algılanır)
5. **Root Directory**: `.` (varsayılan)
6. **Build Settings**: Varsayılan ayarları kullanın
   - Build Command: `npm run build`
   - Output Directory: `.next` (otomatik)
   - Install Command: `npm install`

#### CLI ile Link

```bash
# Mevcut dizinde Vercel'e link edin
vercel link

# Sorulara cevaplar:
# - Set up and deploy? No (sadece link)
# - Which scope? Your-Username veya Organization
# - Link to existing project? Yes/No
# - Project name? Kafkasder-panel
```

### Adım 2: Environment Variables Ayarlama

#### Yöntem 1: Otomatik Setup Script (Önerilen)

```bash
# İnteraktif mod (tek tek girilir)
node scripts/setup-vercel-env.js

# .env.local dosyasından yükle
node scripts/setup-vercel-env.js
# Seçenek 2'yi seçin
```

#### Yöntem 2: Vercel Dashboard

1. Vercel Dashboard → Projeniz → **Settings** → **Environment Variables**
2. Her bir değişkeni manuel olarak ekleyin
3. Environment seçin: Production, Preview, Development

#### Yöntem 3: Vercel CLI

```bash
# Tek tek environment variable ekleme
vercel env add NEXT_PUBLIC_CONVEX_URL production
vercel env add CSRF_SECRET production
vercel env add SESSION_SECRET production

# .env.local dosyasını pull etme
vercel env pull .env.local
```

### Adım 3: Zorunlu Environment Variables

Production için **mutlaka** gerekli değişkenler:

```env
# Convex Backend (ZORUNLU)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Security Secrets (ZORUNLU - minimum 32 karakter)
CSRF_SECRET=your-generated-32-char-secret
SESSION_SECRET=your-generated-32-char-secret

# First Admin Setup (ZORUNLU - ilk kurulum için)
FIRST_ADMIN_EMAIL=baskan@dernek.org
FIRST_ADMIN_PASSWORD=YourSecurePassword123!
```

**Secret Oluşturma:**

```bash
# Linux/Mac/Git Bash
openssl rand -base64 32

# Node.js ile
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# PowerShell
[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))
```

### Adım 4: Opsiyonel Environment Variables

İhtiyaç duyduğunuz servislere göre ekleyin:

<details>
<summary><b>Sentry Error Tracking</b></summary>

```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
```

[Sentry.io](https://sentry.io)'dan DSN alın.
</details>

<details>
<summary><b>Email Servisi (SMTP)</b></summary>

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@kafkasder.org
```

Gmail için [App Password](https://myaccount.google.com/apppasswords) oluşturun.
</details>

<details>
<summary><b>SMS Servisi (Twilio)</b></summary>

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+905551234567
```

[Twilio Console](https://console.twilio.com/)'dan credentials alın.
</details>

<details>
<summary><b>AI Chat (OpenAI)</b></summary>

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

[OpenAI Platform](https://platform.openai.com/api-keys)'dan API key alın.
</details>

<details>
<summary><b>Google Maps</b></summary>

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

[Google Cloud Console](https://console.cloud.google.com/apis/credentials)'dan API key alın.
</details>

## 🔧 Convex Backend Kurulumu

### 1. Convex Projesi Oluşturma

```bash
# Convex dev mode'u başlatın (ilk kez)
npx convex dev

# Tarayıcı açılacak, Convex'e giriş yapın
# Yeni proje oluşturun veya mevcut projeyi seçin
```

### 2. Convex URL'ini Alma

1. [Convex Dashboard](https://dashboard.convex.dev) → Projeniz
2. **Settings** → **URL Settings**
3. Production URL'inizi kopyalayın: `https://your-project.convex.cloud`

### 3. Convex Deploy Key Alma

```bash
# Deploy key oluşturma
npx convex deploy --cmd-url-env-var-name CONVEX_URL

# Deploy key'i Vercel'e ekleme
vercel env add CONVEX_DEPLOY_KEY production
# Deploy key'i yapıştırın
```

### 4. Convex'i Production'a Deploy

```bash
# Production deployment
npm run convex:deploy

# Başarılı olursa, production URL'ini göreceksiniz
# Bu URL'i NEXT_PUBLIC_CONVEX_URL olarak kullanın
```

## 🚀 Deploy İşlemi

### İlk Deploy

#### GitHub Integration ile (Önerilen)

1. Environment variables'ları ayarladıktan sonra
2. Ana branch'e push yapın:
   ```bash
   git push origin main
   ```
3. Vercel otomatik olarak deploy edecek
4. Dashboard'da deploy durumunu izleyin

#### CLI ile Manuel Deploy

```bash
# Production deployment
vercel --prod

# Preview deployment (test için)
vercel

# Deployment durumunu izleme
vercel inspect [deployment-url]
```

### Deploy Adımları Sırası

```bash
# 1. Environment variables kontrolü
vercel env ls

# 2. Convex'i deploy et
npm run convex:deploy

# 3. Yerel build testi
npm run build

# 4. Production'a deploy
vercel --prod

# 5. Health check
curl https://your-domain.vercel.app/api/health
```

## ✅ Deploy Sonrası

### 1. İlk Admin Kullanıcısı Oluşturma

Deploy sonrası, Convex seed fonksiyonu otomatik olarak çalışır ve `FIRST_ADMIN_EMAIL` ile `FIRST_ADMIN_PASSWORD` kullanarak ilk admin kullanıcısını oluşturur.

```bash
# Manuel seed çalıştırma (gerekirse)
npx convex run seed:createFirstAdmin
```

### 2. Health Check

```bash
# Basit health check
curl https://your-domain.vercel.app/api/health

# Detaylı health check
curl https://your-domain.vercel.app/api/health?detailed=true
```

Beklenen yanıt:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 3. Domain Ayarlama

1. Vercel Dashboard → Projeniz → **Settings** → **Domains**
2. **Add Domain** butonuna tıklayın
3. Domain'inizi girin (örn: `kafkasder.org`)
4. DNS kayıtlarını yapılandırın:
   - A record veya CNAME ekleyin
   - Vercel'in verdiği IP/CNAME'i kullanın

### 4. SSL Sertifikası

Vercel otomatik olarak SSL sertifikası sağlar (Let's Encrypt). Deploy sonrası 5-10 dakika içinde aktif olur.

### 5. Analytics Kurulumu

```env
# Vercel Analytics (otomatik aktif)
# Package.json'da zaten mevcut: @vercel/analytics

# Google Analytics (opsiyonel)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 🔍 Sorun Giderme

### Build Hataları

#### "Module not found" hatası

```bash
# Cache temizleme
vercel --force

# Veya yerel olarak
npm run clean:all
npm install
npm run build
```

#### TypeScript hataları

```bash
# Type check
npm run typecheck

# TypeScript strict mode kapalıysa açın
# tsconfig.json'da "strict": true
```

### Environment Variable Sorunları

```bash
# Tüm environment variables'ları listele
vercel env ls

# Specific variable'ı kontrol et
vercel env pull .env.local
cat .env.local | grep NEXT_PUBLIC_CONVEX_URL

# Variable'ı güncelle
vercel env rm NEXT_PUBLIC_CONVEX_URL production
vercel env add NEXT_PUBLIC_CONVEX_URL production
```

### Convex Bağlantı Sorunları

```bash
# Convex URL'i kontrol et
echo $NEXT_PUBLIC_CONVEX_URL

# Convex deployment durumu
npx convex status

# Convex'i yeniden deploy et
npm run convex:deploy
```

### Deploy Sonrası 404/500 Hataları

1. **Logs kontrol et:**
   ```bash
   vercel logs [deployment-url]
   ```

2. **Sentry'de error kontrolü:**
   - Sentry dashboard'a gidin
   - Son hataları inceleyin

3. **Health endpoint test:**
   ```bash
   curl https://your-domain.vercel.app/api/health?detailed=true
   ```

### Performance Sorunları

```bash
# Bundle size analizi
npm run analyze

# Logs inceleme
vercel logs --follow

# Speed Insights kontrol
# Vercel Dashboard → Analytics → Speed Insights
```

## 📊 Monitoring & Maintenance

### Vercel Analytics

1. Vercel Dashboard → Projeniz → **Analytics**
2. Web Vitals, sayfa görüntülemeleri, hata oranları
3. Speed Insights ile performance metrikleri

### Sentry Error Tracking

1. [Sentry Dashboard](https://sentry.io)
2. Real-time error tracking
3. Performance monitoring
4. Release tracking

### Log Monitoring

```bash
# Real-time logs
vercel logs --follow

# Son 100 log
vercel logs --limit 100

# Error logs
vercel logs | grep ERROR
```

## 🔄 Güncelleme ve Yeniden Deploy

### Kod Güncellemeleri

```bash
# 1. Değişiklikleri commit edin
git add .
git commit -m "feat: new feature"

# 2. Push yapın (otomatik deploy tetiklenir)
git push origin main

# Veya manuel deploy
vercel --prod
```

### Environment Variable Güncellemeleri

```bash
# 1. Variable'ı güncelleyin
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production

# 2. Yeniden deploy
vercel --prod --force
```

### Convex Schema Değişiklikleri

```bash
# 1. Schema'yı güncelleyin (convex/schema.ts)

# 2. Deploy edin
npm run convex:deploy

# 3. Uygulama deploy
vercel --prod
```

## 📋 Deploy Checklist

Deployment öncesi kontrol listesi:

### Ön Hazırlık
- [ ] Node.js >= 20.9.0 kurulu
- [ ] Vercel CLI kurulu ve login yapılmış
- [ ] Convex hesabı oluşturulmuş
- [ ] GitHub repository hazır

### Environment Variables
- [ ] `NEXT_PUBLIC_CONVEX_URL` ayarlandı
- [ ] `CSRF_SECRET` (32+ char) oluşturuldu
- [ ] `SESSION_SECRET` (32+ char) oluşturuldu
- [ ] `FIRST_ADMIN_EMAIL` ayarlandı
- [ ] `FIRST_ADMIN_PASSWORD` ayarlandı
- [ ] Opsiyonel servisler yapılandırıldı (Sentry, SMTP, vb.)

### Convex Setup
- [ ] Convex projesi oluşturuldu
- [ ] Convex production deploy key alındı
- [ ] Schema deploy edildi
- [ ] Seed fonksiyonu çalıştı

### Deploy
- [ ] Yerel build başarılı (`npm run build`)
- [ ] Type check geçti (`npm run typecheck`)
- [ ] Tests başarılı (`npm run test:run`)
- [ ] Production deploy yapıldı
- [ ] Health check başarılı

### Deploy Sonrası
- [ ] İlk admin kullanıcısı oluşturuldu
- [ ] Domain yapılandırıldı (opsiyonel)
- [ ] SSL sertifikası aktif
- [ ] Analytics çalışıyor
- [ ] Error tracking aktif (Sentry)

## 🆘 Destek ve Kaynaklar

### Resmi Dokümantasyon
- [Vercel Documentation](https://vercel.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Next.js Documentation](https://nextjs.org/docs)

### Proje Kaynakları
- [GitHub Repository](https://github.com/Vadalov/Kafkasder-panel)
- [Issues](https://github.com/Vadalov/Kafkasder-panel/issues)
- [Security Policy](./SECURITY.md)
- [Contributing Guide](./CONTRIBUTING.md)

### Hızlı Linkler
- [.env.example](./.env.example) - Tüm environment variables
- [README.md](./README.md) - Genel proje dokümantasyonu
- [CLAUDE.md](./CLAUDE.md) - Geliştirici rehberi

---

**Son Güncelleme:** 2024-11-20  
**Versiyon:** 1.0.0

Bu dokümanda sorun yaşarsanız veya ekleme öneriniz varsa, lütfen [issue](https://github.com/Vadalov/Kafkasder-panel/issues) açın.
