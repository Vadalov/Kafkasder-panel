# Vercel Deployment Guide

Bu rehber, Kafkasder Panel projesini Vercel'e deploy etmek için gerekli tüm adımları içerir.

## 📋 İçindekiler

- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Convex Kurulumu](#convex-kurulumu)
- [Vercel Environment Variables](#vercel-environment-variables)
- [Deployment Adımları](#deployment-adımları)
- [Troubleshooting](#troubleshooting)

## 🚀 Hızlı Başlangıç

### 1. Vercel Projesi Oluştur

```bash
# Vercel CLI ile (önerilen)
npm i -g vercel
vercel login
vercel

# Veya Vercel Dashboard'dan
# https://vercel.com/new → GitHub repo'yu bağla
```

### 2. Convex Deployment Oluştur

```bash
# Convex CLI ile
npm install -g convex
npx convex dev  # Development deployment
npx convex deploy --prod  # Production deployment
```

## 🔧 Convex Kurulumu

### Convex URL'ini Alma

1. **Convex Dashboard'a git:** https://dashboard.convex.dev
2. **Projenizi seçin** veya yeni proje oluşturun
3. **Settings → Deployment** bölümüne gidin
4. **Production Deployment URL'ini kopyalayın:**
   ```
   https://your-project-name.convex.cloud
   ```

### Convex Deploy Key Alma

1. **Convex Dashboard → Settings → Deploy Keys**
2. **"Create Deploy Key"** butonuna tıklayın
3. **Oluşturulan key'i kopyalayın** (sadece bir kez gösterilir!)

**Not:** Bu key'i güvenli bir yerde saklayın. Kaybederseniz yeni bir tane oluşturmanız gerekir.

## 🔐 Vercel Environment Variables

### Vercel Dashboard'dan Ayarlama

1. **Vercel Dashboard → Projeniz → Settings → Environment Variables**
2. Her environment variable'ı ekleyin (aşağıdaki listeye bakın)
3. **Environment** seçimi yapın:
   - **Development** - Local development için
   - **Preview** - PR preview'ları için
   - **Production** - Production deployment için

### Gerekli Environment Variables

#### 🔴 Zorunlu (Required)

Aşağıdaki değişkenler **mutlaka** ayarlanmalıdır:

| Variable | Description | Example | Environment |
|----------|-------------|---------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | `https://your-project.convex.cloud` | All |
| `CSRF_SECRET` | CSRF koruması için secret (min 32 karakter) | `your-random-32-char-secret` | Production |
| `SESSION_SECRET` | Session yönetimi için secret (min 32 karakter) | `your-random-32-char-secret` | Production |

#### 🟡 Önerilen (Recommended)

| Variable | Description | Example | Environment |
|----------|-------------|---------|-------------|
| `SENTRY_DSN` | Sentry error tracking (server-side) | `https://xxx@sentry.io/xxx` | Production |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking (client-side) | `https://xxx@sentry.io/xxx` | Production |
| `SENTRY_ORG` | Sentry organization | `your-org` | Production |
| `SENTRY_PROJECT` | Sentry project name | `kafkasder-panel` | Production |

#### 🟢 Opsiyonel (Optional)

| Variable | Description | Example | Environment |
|----------|-------------|---------|-------------|
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` | Production |
| `SMTP_PORT` | Email SMTP port | `587` | Production |
| `SMTP_USER` | Email SMTP kullanıcı adı | `noreply@example.com` | Production |
| `SMTP_PASSWORD` | Email SMTP şifresi | `your-app-password` | Production |
| `SMTP_FROM` | Gönderen email adresi | `noreply@example.com` | Production |
| `TWILIO_ACCOUNT_SID` | Twilio hesap SID | `ACxxxxxxxxxxxxx` | Production |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `your-auth-token` | Production |
| `TWILIO_PHONE_NUMBER` | Twilio telefon numarası | `+1234567890` | Production |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit max istek sayısı | `100` | All |
| `RATE_LIMIT_WINDOW_MS` | Rate limit zaman penceresi (ms) | `900000` | All |
| `MAX_FILE_SIZE` | Max dosya boyutu (bytes) | `10485760` | All |
| `MAX_FILES_PER_UPLOAD` | Max dosya sayısı | `5` | All |
| `NEXT_PUBLIC_APP_NAME` | Uygulama adı | `Dernek Yönetim Sistemi` | All |
| `NEXT_PUBLIC_APP_VERSION` | Uygulama versiyonu | `1.0.0` | All |
| `NEXT_PUBLIC_ENABLE_REALTIME` | Realtime özellikler | `true` | All |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Analytics | `false` | All |

### Secret Oluşturma

**CSRF_SECRET ve SESSION_SECRET için güvenli random string oluşturma:**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Online tool
# https://randomkeygen.com/ (256-bit key)
```

**Minimum 32 karakter olmalı!**

### Vercel Environment Variables Ayarlama Adımları

1. **Vercel Dashboard'a gidin:**
   ```
   https://vercel.com/your-username/your-project/settings/environment-variables
   ```

2. **Her variable için:**
   - **Key:** Variable adı (örn: `NEXT_PUBLIC_CONVEX_URL`)
   - **Value:** Variable değeri (örn: `https://your-project.convex.cloud`)
   - **Environment:** Seçin (Development, Preview, Production)

3. **"Add"** butonuna tıklayın

4. **Tüm variables eklendikten sonra:**
   - **"Save"** butonuna tıklayın
   - Yeni deployment tetikleyin (veya otomatik olarak tetiklenir)

## 📦 Deployment Adımları

### İlk Deployment

1. **GitHub repo'yu Vercel'e bağla:**
   - Vercel Dashboard → Add New Project
   - GitHub repo'yu seç
   - Framework: Next.js (otomatik algılanır)

2. **Environment Variables ekle:**
   - Settings → Environment Variables
   - Yukarıdaki listedeki tüm zorunlu variables'ı ekle

3. **Deploy:**
   - Vercel otomatik olarak deploy edecek
   - İlk deployment genellikle 2-3 dakika sürer

### Production Deployment

1. **Convex Production Deployment:**
   ```bash
   npx convex deploy --prod
   ```
   Bu komut:
   - Production deployment oluşturur
   - Deployment URL'ini gösterir
   - Bu URL'i `NEXT_PUBLIC_CONVEX_URL` olarak kullanın

2. **Vercel Production Environment Variables:**
   - Vercel Dashboard → Settings → Environment Variables
   - Production environment için tüm variables'ı ekleyin
   - Özellikle `NEXT_PUBLIC_CONVEX_URL` production Convex URL'i olmalı

3. **Deploy to Production:**
   ```bash
   vercel --prod
   ```
   Veya GitHub'dan `main` branch'e push yapın (otomatik deploy)

### Preview Deployment

Her PR için otomatik olarak preview deployment oluşturulur:

- **Preview Environment Variables:**
  - Development Convex URL kullanabilirsiniz
  - Veya ayrı bir preview Convex deployment oluşturabilirsiniz

## 🔍 Environment Variables Kontrolü

### Deployment Öncesi Kontrol

Deployment'tan önce tüm environment variables'ın doğru ayarlandığından emin olun:

```bash
# Vercel CLI ile kontrol
vercel env ls

# Belirli bir environment için
vercel env ls production
```

### Build Logs Kontrolü

1. **Vercel Dashboard → Deployments → [Deployment] → Build Logs**
2. Environment variables eksikse hata mesajları görünecektir:
   ```
   ❌ Error: NEXT_PUBLIC_CONVEX_URL is not defined
   ```

## 🛠️ Troubleshooting

### Problem: "Convex URL is not defined"

**Çözüm:**
1. Vercel Dashboard → Settings → Environment Variables
2. `NEXT_PUBLIC_CONVEX_URL` variable'ının eklendiğinden emin olun
3. Doğru environment'ı seçtiğinizden emin olun (Production, Preview, Development)
4. Yeni bir deployment tetikleyin

### Problem: "CSRF_SECRET must be at least 32 characters"

**Çözüm:**
1. `CSRF_SECRET` ve `SESSION_SECRET` değerlerinin en az 32 karakter olduğundan emin olun
2. Güvenli random string kullanın (yukarıdaki komutlara bakın)

### Problem: "Convex connection failed"

**Çözüm:**
1. Convex Dashboard'da deployment'ın aktif olduğundan emin olun
2. `NEXT_PUBLIC_CONVEX_URL` değerinin doğru olduğundan emin olun
3. Convex deployment URL formatı: `https://your-project.convex.cloud`
4. URL'de `http://` değil `https://` kullanın

### Problem: "Build fails with environment variable errors"

**Çözüm:**
1. Tüm zorunlu environment variables'ın eklendiğinden emin olun
2. Variable isimlerinin doğru yazıldığından emin olun (büyük/küçük harf duyarlı)
3. `NEXT_PUBLIC_` prefix'li variables'ın client-side'da kullanılabilir olduğundan emin olun

### Problem: "Preview deployments don't have environment variables"

**Çözüm:**
1. Vercel Dashboard → Settings → Environment Variables
2. Her variable için **Preview** environment'ını da seçin
3. Veya sadece Production için ayarlayın (preview'lar production variables'ı kullanır)

## 📝 Vercel.json Yapılandırması

Mevcut `vercel.json` dosyası:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "env": {
    "NEXT_PUBLIC_CONVEX_URL": "@convex_url",
    "BACKEND_PROVIDER": "convex",
    "NEXT_PUBLIC_BACKEND_PROVIDER": "convex",
    "CSRF_SECRET": "@csrf_secret",
    "SESSION_SECRET": "@session_secret"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_CONVEX_URL": "@convex_url",
      "BACKEND_PROVIDER": "convex",
      "NEXT_PUBLIC_BACKEND_PROVIDER": "convex"
    }
  }
}
```

**Not:** `@convex_url`, `@csrf_secret`, `@session_secret` Vercel Secrets'a referans verir. Bu secrets'ları Vercel Dashboard'dan oluşturmanız gerekir:

1. **Vercel Dashboard → Settings → Secrets**
2. Her secret için:
   - **Name:** `convex_url`, `csrf_secret`, `session_secret`
   - **Value:** Gerçek değerler
   - **Add** butonuna tıklayın

**Alternatif:** `vercel.json`'daki `env` bölümünü kaldırıp, tüm environment variables'ı Vercel Dashboard'dan ayarlayabilirsiniz (önerilen).

## 🔄 CI/CD Integration

GitHub Actions ile otomatik deployment:

- `main` branch'e push → Production deployment
- PR açıldığında → Preview deployment
- Environment variables otomatik olarak kullanılır

## 📚 Ek Kaynaklar

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Convex Deployment Guide](https://docs.convex.dev/deployment)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## ✅ Deployment Checklist

Deployment öncesi kontrol listesi:

- [ ] Convex production deployment oluşturuldu
- [ ] `NEXT_PUBLIC_CONVEX_URL` production URL ile ayarlandı
- [ ] `CSRF_SECRET` oluşturuldu ve eklendi (min 32 karakter)
- [ ] `SESSION_SECRET` oluşturuldu ve eklendi (min 32 karakter)
- [ ] Sentry DSN eklendi (opsiyonel ama önerilen)
- [ ] SMTP ayarları yapıldı (email gönderimi için)
- [ ] Twilio ayarları yapıldı (SMS gönderimi için)
- [ ] Tüm environment variables doğru environment'lara eklendi
- [ ] Build başarılı bir şekilde tamamlandı
- [ ] Production URL'de uygulama çalışıyor
- [ ] Convex bağlantısı başarılı

---

**Son Güncelleme:** 2025-11-19

