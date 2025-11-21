# Kafkasder Panel - Vercel & Convex Deployment Guide

Bu rehber, Kafkasder Panel uygulamasını Vercel ve Convex platformlarına deploy etmek için gereken tüm adımları içermektedir.

## 📋 İçindekiler

1. [Gereksinimler](#gereksinimler)
2. [Convex Backend Kurulumu](#convex-backend-kurulumu)
3. [Vercel Frontend Kurulumu](#vercel-frontend-kurulumu)
4. [Environment Variables Yapılandırması](#environment-variables-yapılandırması)
5. [Deployment Adımları](#deployment-adımları)
6. [Post-Deployment Kontroller](#post-deployment-kontroller)
7. [Troubleshooting](#troubleshooting)

---

## Gereksinimler

### Hesaplar
- ✅ [Convex Account](https://dashboard.convex.dev) (ücretsiz tier mevcut)
- ✅ [Vercel Account](https://vercel.com) (ücretsiz tier mevcut)
- ✅ GitHub hesabı (repository bağlantısı için)

### Yerel Kurulum
```bash
# Node.js 20.x gerekli
node --version  # 20.x olmalı

# npm güncel olmalı
npm --version   # >=9.0.0 olmalı

# Convex CLI kurulumu
npm install -g convex
```

---

## Convex Backend Kurulumu

### Adım 1: Convex Projesi Oluşturma

1. [Convex Dashboard](https://dashboard.convex.dev)'a gidin
2. "Create a project" butonuna tıklayın
3. Proje adı girin: `kafkasder-panel`
4. Region seçin (önerilen: Frankfurt - fra1)

### Adım 2: Convex CLI ile Bağlantı

```bash
# Proje dizininde
cd /home/user/Kafkasder-panel

# Convex'e giriş yapın
npx convex login

# Convex projesini bağlayın
npx convex dev --once

# İlk deployment
npm run convex:deploy
```

### Adım 3: Convex URL'yi Kaydetme

Deployment tamamlandıktan sonra, terminal çıktısında şunu göreceksiniz:

```
✓ Deployed!
  Production URL: https://your-project-name-123456.convex.cloud
```

Bu URL'yi kaydedin - Vercel environment variables için gerekli!

### Adım 4: İlk Admin Kullanıcı Oluşturma

```bash
# Seed script'i çalıştırın (ilk admin kullanıcıyı oluşturur)
# Not: .env.local'de FIRST_ADMIN_EMAIL ve FIRST_ADMIN_PASSWORD tanımlı olmalı
npx convex run seed:default
```

---

## Vercel Frontend Kurulumu

### Adım 1: Vercel'e Giriş

```bash
# Vercel CLI kurulumu (global)
npm install -g vercel

# Vercel'e giriş
vercel login
```

### Adım 2: GitHub Repository Bağlantısı

1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
2. "New Project" butonuna tıklayın
3. GitHub repository'sini seçin: `Vadalov/Kafkasder-panel`
4. Framework preset: "Next.js" otomatik algılanacak

### Adım 3: Build & Output Ayarları

Vercel proje ayarlarında:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next (default)
Install Command: npm install
Development Command: npm run dev
Node.js Version: 20.x
```

**ÖNEMLİ**: Root Directory'yi boş bırakın (monorepo değil)

---

## Environment Variables Yapılandırması

### Adım 1: Vercel Dashboard'da Environment Variables Ekleme

Vercel proje ayarlarında **Settings > Environment Variables** sekmesine gidin.

### Zorunlu Environment Variables

#### 1. CONVEX BACKEND

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-project-name-123456.convex.cloud
```
> Convex deployment'ınızdan aldığınız Production URL

#### 2. SECURITY SECRETS

```bash
# CSRF koruması için (32+ karakter)
CSRF_SECRET=

# Session yönetimi için (32+ karakter)
SESSION_SECRET=
```

**Secret oluşturma:**
```bash
# Terminal'de çalıştırın
openssl rand -base64 32
```

#### 3. NODE ENVIRONMENT

```bash
NODE_ENV=production
```

#### 4. İLK ADMIN KULLANICI

```bash
FIRST_ADMIN_EMAIL=baskan@dernek.org
FIRST_ADMIN_PASSWORD=GüçlüŞifre123!
```
> İlk deployment sonrası Convex seed script'i için gerekli

### Opsiyonel Ama Önerilen Variables

#### SENTRY (Error Tracking)

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=kafkasder-panel
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

[Sentry hesabı oluşturun](https://sentry.io) ve proje oluşturun.

#### VERCEL ANALYTICS

```bash
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

Vercel Analytics otomatik aktif olur, ID opsiyoneldir.

### Opsiyonel Servisler

<details>
<summary><strong>EMAIL (SMTP) - Tıklayın</strong></summary>

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@kafkasder.org
```

Gmail için: [App Passwords](https://myaccount.google.com/apppasswords) oluşturun.
</details>

<details>
<summary><strong>SMS (Twilio) - Tıklayın</strong></summary>

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+905551234567
```

[Twilio hesabı](https://www.twilio.com/console) oluşturun.
</details>

<details>
<summary><strong>WHATSAPP - Tıklayın</strong></summary>

```bash
WHATSAPP_AUTO_INIT=false
```

> İlk deployment sonrası QR kod taraması yapılıp bağlantı kurulduktan sonra `true` yapın.
</details>

<details>
<summary><strong>AI CHAT (OpenAI) - Tıklayın</strong></summary>

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

[OpenAI API Key](https://platform.openai.com/api-keys) oluşturun.
</details>

<details>
<summary><strong>GOOGLE MAPS - Tıklayın</strong></summary>

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

[Google Cloud Console](https://console.cloud.google.com/apis/credentials) - Maps JavaScript API
</details>

<details>
<summary><strong>N8N WEBHOOKS (Automation) - Tıklayın</strong></summary>

```bash
N8N_DONATION_WEBHOOK_URL=https://your-n8n.com/webhook/donation-created
N8N_ERROR_WEBHOOK_URL=https://your-n8n.com/webhook/error-logged
N8N_TELEGRAM_WEBHOOK_URL=https://your-n8n.com/webhook/telegram-notify
N8N_WEBHOOK_SECRET=your-webhook-secret-key
```
</details>

### Environment Variable Scope

Vercel'de her environment variable için scope belirleyin:

- ✅ **Production**: Canlı environment (zorunlu)
- ✅ **Preview**: PR ve branch deployments (önerilen)
- ⬜ **Development**: Local geliştirme (opsiyonel - `.env.local` kullanılabilir)

---

## Deployment Adımları

### Otomatik Deployment (Önerilen)

GitHub'a push yapıldığında Vercel otomatik deploy eder:

```bash
# Değişikliklerinizi commit edin
git add .
git commit -m "feat: production deployment setup"

# Main branch'e push (production deployment)
git push origin main

# Veya preview deployment için feature branch
git push origin feature/your-feature
```

### Manuel Deployment

```bash
# Production deployment
npm run vercel:prod

# Preview deployment
npm run vercel:preview
```

### İlk Deployment Sonrası

1. **Convex Seed Script'i Çalıştırın** (ilk admin kullanıcı)

```bash
# Vercel dashboard'dan Functions > Logs kısmında kontrol edin
# Veya local'den Convex production'a bağlanarak:
npx convex run seed:default --prod
```

2. **Deployment URL'yi Not Edin**

Vercel size bir URL verecek:
```
https://kafkasder-panel.vercel.app
```

3. **Custom Domain Bağlama** (opsiyonel)

Vercel Dashboard > Settings > Domains

```
kafkasder.org → kafkasder-panel.vercel.app
```

---

## Post-Deployment Kontroller

### 1. Health Check

```bash
# Deployment URL'nizi kullanın
curl https://kafkasder-panel.vercel.app/api/health

# Detaylı kontrol
curl https://kafkasder-panel.vercel.app/api/health?detailed=true
```

**Beklenen Yanıt:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-21T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### 2. Login Test

1. Tarayıcıda açın: `https://kafkasder-panel.vercel.app/login`
2. İlk admin bilgileri ile giriş yapın:
   - Email: `.env`'de tanımladığınız `FIRST_ADMIN_EMAIL`
   - Password: `.env`'de tanımladığınız `FIRST_ADMIN_PASSWORD`

### 3. Convex Dashboard Kontrolü

[Convex Dashboard](https://dashboard.convex.dev) > Your Project:

- ✅ Functions deployed
- ✅ Tables created (users, beneficiaries, donations, vb.)
- ✅ Indexes oluşturulmuş
- ✅ Real-time connection active

### 4. Vercel Dashboard Kontrolü

[Vercel Dashboard](https://vercel.com/dashboard):

- ✅ Deployment successful
- ✅ Build logs clean
- ✅ Environment variables configured
- ✅ Domain connected (eğer custom domain varsa)

### 5. Sentry Error Tracking (Eğer yapılandırıldıysa)

[Sentry Dashboard](https://sentry.io):

- ✅ Project created
- ✅ First event received (test için bir hata oluşturabilirsiniz)

---

## Troubleshooting

### Deployment Hataları

#### 1. Build Timeout

**Hata:** `Error: Command "npm run build" exceeded timeout`

**Çözüm:**
- Vercel Dashboard > Settings > General > Build & Development Settings
- Build timeout'u artırın (max 45 dakika Hobby plan için)

#### 2. Module Not Found

**Hata:** `Module not found: Can't resolve 'xyz'`

**Çözüm:**
```bash
# package.json'da dependencies kontrolü
npm install xyz --save

# Commit ve push
git add package.json package-lock.json
git commit -m "fix: add missing dependency"
git push
```

#### 3. Environment Variable Missing

**Hata:** `Error: NEXT_PUBLIC_CONVEX_URL is not defined`

**Çözüm:**
- Vercel Dashboard > Settings > Environment Variables
- Eksik variable'ı ekleyin
- Redeploy tetikleyin: Deployments > Latest > ... > Redeploy

### Convex Hataları

#### 1. Invalid Deployment URL

**Hata:** `Failed to connect to Convex backend`

**Çözüm:**
- Convex Dashboard'dan doğru URL'yi kopyalayın
- `https://` ile başlamalı ve `.convex.cloud` ile bitmelidir
- Vercel'de `NEXT_PUBLIC_CONVEX_URL` güncelleyin

#### 2. Schema Mismatch

**Hata:** `Schema validation failed`

**Çözüm:**
```bash
# Convex schema'yı yeniden deploy edin
npm run convex:deploy
```

#### 3. Authentication Errors

**Hata:** `Invalid credentials` veya `User not found`

**Çözüm:**
```bash
# Seed script'i tekrar çalıştırın
npx convex run seed:default --prod

# Veya Convex Dashboard'dan users tablosunu kontrol edin
```

### Performance İyileştirmeleri

#### 1. Slow Page Loads

**Çözümler:**
- Vercel Analytics ile sayfa yükleme sürelerini analiz edin
- `npm run analyze` ile bundle size'ı kontrol edin
- Resim optimizasyonunu kontrol edin (AVIF/WebP kullanımı)

#### 2. API Rate Limiting

**Durum:** Çok fazla istek

**Çözüm:**
- `src/lib/rate-limit-config.ts` dosyasında limitleri ayarlayın
- Vercel Serverless Function limits'i kontrol edin

### Güvenlik Kontrolleri

```bash
# Security headers kontrolü
curl -I https://kafkasder-panel.vercel.app

# Beklenen headers:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: max-age=63072000
# Content-Security-Policy: ...
```

---

## Maintenance & Updates

### Dependency Updates

```bash
# Dependencies güncelleme
npm update

# Security audit
npm audit
npm audit fix

# Test
npm run test
npm run build

# Deploy
git add package.json package-lock.json
git commit -m "chore: update dependencies"
git push
```

### Convex Schema Updates

```bash
# Schema değişikliği yaptıktan sonra
npm run convex:deploy

# Vercel otomatik yeni deployment yapacak (schema değişikliği commit edildiğinde)
```

### Rollback

Vercel Dashboard > Deployments > Previous Deployment > Promote to Production

---

## Monitoring & Analytics

### 1. Vercel Analytics

Dashboard: `https://vercel.com/[your-username]/kafkasder-panel/analytics`

Metrikler:
- Sayfa görüntüleme sayıları
- Web Vitals (LCP, FID, CLS)
- Top sayfalar
- Traffic kaynakları

### 2. Sentry Error Tracking

Dashboard: `https://sentry.io/organizations/[your-org]/projects/kafkasder-panel/`

İzlenen:
- JavaScript errors
- API errors
- Performance issues
- User sessions

### 3. Convex Dashboard

Dashboard: `https://dashboard.convex.dev/t/[your-team]/[your-project]`

İzlenen:
- Database queries
- Function calls
- Real-time connections
- Storage usage

---

## Production Checklist

### Deployment Öncesi

- [ ] Tüm environment variables tanımlandı
- [ ] CSRF_SECRET ve SESSION_SECRET oluşturuldu (32+ chars)
- [ ] Convex production deployment yapıldı
- [ ] First admin credentials belirlendi
- [ ] Sentry projesi oluşturuldu (önerilen)
- [ ] Custom domain hazırlandı (opsiyonel)

### İlk Deployment

- [ ] Vercel'e GitHub repository bağlandı
- [ ] Environment variables Vercel'e eklendi
- [ ] İlk deployment başarılı
- [ ] Health check endpoint çalışıyor
- [ ] Convex seed script çalıştırıldı
- [ ] İlk admin ile login test edildi

### Post-Deployment

- [ ] Custom domain bağlandı (eğer varsa)
- [ ] SSL sertifikası aktif
- [ ] Sentry'ye ilk event geldi
- [ ] Analytics çalışıyor
- [ ] Email/SMS servisleri test edildi (eğer yapılandırıldıysa)
- [ ] Security headers doğrulandı
- [ ] Performance metrikleri kabul edilebilir

### Sürekli Bakım

- [ ] Haftalık dependency güvenlik kontrolü
- [ ] Aylık Vercel ve Convex dashboard analizi
- [ ] Sentry error log takibi
- [ ] Database backup stratejisi (Convex otomatik yapar)
- [ ] API rate limiting monitoring

---

## Faydalı Komutlar

```bash
# Health check
curl https://kafkasder-panel.vercel.app/api/health

# Vercel logs
vercel logs https://kafkasder-panel.vercel.app

# Convex logs
npx convex logs --prod

# Bundle analizi
npm run analyze

# Type check (deployment öncesi)
npm run typecheck

# Linting (deployment öncesi)
npm run lint

# Tests (deployment öncesi)
npm run test:run

# Build local test
npm run build
npm run start
```

---

## Destek & Kaynaklar

### Dokümantasyon

- **Next.js 16:** https://nextjs.org/docs
- **Convex:** https://docs.convex.dev
- **Vercel:** https://vercel.com/docs
- **Sentry:** https://docs.sentry.io

### Proje Dokümantasyonu

- `CLAUDE.md` - Proje genel bakış ve geliştirme rehberi
- `TESTING_GUIDE.md` - Test yazma rehberi
- `.env.example` - Environment variables şablonu
- `package.json` - Available scripts

### İletişim

- **GitHub Issues:** https://github.com/Vadalov/Kafkasder-panel/issues
- **Convex Discord:** https://convex.dev/community
- **Vercel Support:** https://vercel.com/support

---

## Version History

- **v1.0.0** (2025-11-21): İlk deployment rehberi oluşturuldu
  - Convex & Vercel entegrasyonu
  - Environment variables yapılandırması
  - Post-deployment kontrolleri
  - Troubleshooting rehberi

---

**Hazırlayan:** Claude Code
**Son Güncelleme:** 2025-11-21
**Proje:** Kafkasder Panel v1.0.0
