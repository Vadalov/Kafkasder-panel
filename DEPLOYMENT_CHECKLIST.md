# 🚀 Kafkasder Panel - Deployment Checklist

Hızlı ve eksiksiz deployment için adım adım checklist.

---

## 📝 Pre-Deployment Checklist

### 1. Hesap Hazırlığı

- [ ] **Convex hesabı oluşturuldu**
  - URL: https://dashboard.convex.dev
  - Tier: Free/Pro seçildi

- [ ] **Vercel hesabı oluşturuldu**
  - URL: https://vercel.com
  - GitHub bağlantısı yapıldı

- [ ] **Sentry hesabı oluşturuldu** (önerilen)
  - URL: https://sentry.io
  - Kafkasder Panel projesi oluşturuldu

### 2. Lokal Kurulum

- [ ] **Node.js 20.x kurulu**
  ```bash
  node --version  # Output: v20.x.x
  ```

- [ ] **Dependencies yüklendi**
  ```bash
  npm install
  ```

- [ ] **Convex CLI kuruldu**
  ```bash
  npm install -g convex
  convex --version
  ```

- [ ] **Vercel CLI kuruldu**
  ```bash
  npm install -g vercel
  vercel --version
  ```

### 3. Kod Kalite Kontrolleri

- [ ] **Type checking başarılı**
  ```bash
  npm run typecheck
  ```

- [ ] **Linting temiz**
  ```bash
  npm run lint
  ```

- [ ] **Tests geçiyor**
  ```bash
  npm run test:run
  ```

- [ ] **Build başarılı**
  ```bash
  npm run build
  ```

---

## 🔐 Secrets Hazırlama

### 1. CSRF ve Session Secrets

- [ ] **CSRF Secret oluşturuldu** (32+ karakter)
  ```bash
  openssl rand -base64 32
  ```
  Çıktıyı kopyala: `__________________`

- [ ] **Session Secret oluşturuldu** (32+ karakter)
  ```bash
  openssl rand -base64 32
  ```
  Çıktıyı kopyala: `__________________`

### 2. Admin Credentials

- [ ] **İlk admin email belirlendi**
  - Email: `__________________`

- [ ] **İlk admin password oluşturuldu** (güçlü şifre)
  - Password: `__________________` (güvenli bir yerde sakla!)

---

## ☁️ Convex Backend Setup

### Adım 1: Proje Oluşturma

- [ ] **Convex Dashboard'a giriş yapıldı**
  - URL: https://dashboard.convex.dev

- [ ] **Yeni proje oluşturuldu**
  - Proje adı: `kafkasder-panel`
  - Region: `Frankfurt (fra1)` veya en yakın

- [ ] **Convex URL kaydedildi**
  - URL: `https://__________________.convex.cloud`

### Adım 2: CLI Login ve Deploy

- [ ] **Convex CLI'ye login olundu**
  ```bash
  npx convex login
  ```

- [ ] **İlk Convex deployment yapıldı**
  ```bash
  npm run convex:deploy
  ```

  Kontrol:
  - ✅ Schema deployed
  - ✅ Functions deployed
  - ✅ Production URL görüntülendi

### Adım 3: Seed Data (İlk Admin)

- [ ] **Lokal .env.local dosyası oluşturuldu**
  ```bash
  cp .env.example .env.local
  ```

- [ ] **.env.local'de FIRST_ADMIN credentials tanımlandı**
  ```bash
  FIRST_ADMIN_EMAIL=baskan@dernek.org
  FIRST_ADMIN_PASSWORD=YourSecurePassword123!
  ```

- [ ] **Seed script çalıştırıldı**
  ```bash
  npx convex run seed:default --prod
  ```

  Beklenen çıktı: "✓ Admin user created successfully"

---

## 🌐 Vercel Frontend Setup

### Adım 1: Proje Bağlantısı

- [ ] **Vercel CLI'ye login olundu**
  ```bash
  vercel login
  ```

- [ ] **Vercel Dashboard'da new project oluşturuldu**
  - GitHub repository seçildi: `Vadalov/Kafkasder-panel`
  - Framework: Next.js (otomatik algılandı)

### Adım 2: Build Settings

- [ ] **Build ayarları doğru**
  - Framework Preset: `Next.js`
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`
  - Node.js Version: `20.x`

### Adım 3: Environment Variables

#### Zorunlu Variables

- [ ] **NEXT_PUBLIC_CONVEX_URL** eklendi
  ```
  Scope: Production, Preview
  Value: [Convex'ten aldığınız URL]
  ```

- [ ] **CSRF_SECRET** eklendi
  ```
  Scope: Production, Preview
  Value: [openssl ile oluşturduğunuz secret]
  ```

- [ ] **SESSION_SECRET** eklendi
  ```
  Scope: Production, Preview
  Value: [openssl ile oluşturduğunuz secret]
  ```

- [ ] **NODE_ENV** eklendi
  ```
  Scope: Production
  Value: production
  ```

- [ ] **FIRST_ADMIN_EMAIL** eklendi
  ```
  Scope: Production, Preview
  Value: [Belirlediğiniz admin email]
  ```

- [ ] **FIRST_ADMIN_PASSWORD** eklendi
  ```
  Scope: Production, Preview
  Value: [Belirlediğiniz admin password]
  ```

#### Önerilen Variables (Sentry)

- [ ] **NEXT_PUBLIC_SENTRY_DSN** eklendi (opsiyonel)
  ```
  Scope: Production, Preview
  Value: [Sentry project DSN]
  ```

- [ ] **SENTRY_ORG** eklendi (opsiyonel)
  ```
  Scope: Production
  Value: [Sentry organization slug]
  ```

- [ ] **SENTRY_PROJECT** eklendi (opsiyonel)
  ```
  Scope: Production
  Value: kafkasder-panel
  ```

#### Opsiyonel Servisler

- [ ] **Email (SMTP)** variables eklendi (ihtiyaç varsa)
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_USER
  - SMTP_PASSWORD
  - SMTP_FROM

- [ ] **Twilio (SMS)** variables eklendi (ihtiyaç varsa)
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_PHONE_NUMBER

- [ ] **OpenAI (AI Chat)** variable eklendi (ihtiyaç varsa)
  - OPENAI_API_KEY

- [ ] **Google Maps** variable eklendi (ihtiyaç varsa)
  - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

---

## 🚢 Deployment

### İlk Deployment

- [ ] **Git repository temiz**
  ```bash
  git status  # No uncommitted changes
  ```

- [ ] **Main branch'e push yapıldı**
  ```bash
  git push origin main
  ```

- [ ] **Vercel otomatik deployment başladı**
  - Vercel Dashboard > Deployments kontrol et

- [ ] **Build başarılı**
  - Build logs kontrol edildi
  - Hiç error yok

- [ ] **Deployment URL alındı**
  - URL: `https://__________________.vercel.app`

---

## ✅ Post-Deployment Verification

### 1. Health Check

- [ ] **API health endpoint çalışıyor**
  ```bash
  curl https://[your-url].vercel.app/api/health
  ```

  Beklenen:
  ```json
  {"status":"ok","timestamp":"...","uptime":...}
  ```

- [ ] **Detailed health check başarılı**
  ```bash
  curl https://[your-url].vercel.app/api/health?detailed=true
  ```

### 2. Login Test

- [ ] **Login sayfası açılıyor**
  - URL: `https://[your-url].vercel.app/login`

- [ ] **Admin ile login başarılı**
  - Email: [FIRST_ADMIN_EMAIL]
  - Password: [FIRST_ADMIN_PASSWORD]
  - Dashboard'a yönlendiriliyor

### 3. Dashboard Test

- [ ] **Ana dashboard yükleniyor**
  - URL: `https://[your-url].vercel.app/genel`
  - Hiç console error yok

- [ ] **Menü navigasyonu çalışıyor**
  - Sidebar açılıp kapanıyor
  - Sayfa geçişleri sorunsuz

### 4. Convex Bağlantısı

- [ ] **Convex Dashboard'da activity görünüyor**
  - Real-time queries aktif
  - Functions çalışıyor

- [ ] **Database tables oluşturulmuş**
  - users table var ve admin kullanıcı görünüyor
  - Diğer tablolar oluşturulmuş

### 5. Security Headers

- [ ] **Security headers mevcut**
  ```bash
  curl -I https://[your-url].vercel.app
  ```

  Kontrol et:
  - ✅ X-Frame-Options: DENY
  - ✅ X-Content-Type-Options: nosniff
  - ✅ Content-Security-Policy: ...
  - ✅ Strict-Transport-Security: ... (production)

### 6. Monitoring

- [ ] **Vercel Analytics aktif**
  - Vercel Dashboard > Analytics
  - İlk page view kaydedildi

- [ ] **Sentry çalışıyor** (eğer yapılandırıldıysa)
  - Sentry Dashboard
  - Test event gönderildi ve görünüyor

---

## 🎨 Optional: Custom Domain

- [ ] **Domain satın alındı** (ihtiyaç varsa)
  - Domain: `__________________`

- [ ] **Vercel'de domain eklendi**
  - Settings > Domains > Add Domain

- [ ] **DNS kayıtları güncellendi**
  - A/CNAME records Vercel'e yönlendiriliyor

- [ ] **SSL sertifikası aktif**
  - Otomatik Let's Encrypt sertifikası oluşturuldu
  - HTTPS çalışıyor

---

## 📊 Monitoring Setup

### Vercel Analytics

- [ ] **Analytics enabled**
  - Vercel Dashboard > Settings > Analytics
  - Web Vitals tracking aktif

### Sentry (Önerilen)

- [ ] **Sentry integration doğrulandı**
  - Test error gönderildi
  - Sentry'de görünüyor

- [ ] **Source maps yükleniyor**
  - Build sırasında Sentry'ye source maps upload ediliyor

### Performance Monitoring

- [ ] **Vercel Speed Insights aktif**
  - Dashboard'da performans metrikleri görünüyor

---

## 🔄 Continuous Deployment Setup

- [ ] **GitHub Actions (opsiyonel) yapılandırıldı**
  - PR'larda otomatik test çalışıyor
  - Type check + lint + test

- [ ] **Branch protection rules ayarlandı** (önerilen)
  - Main branch protected
  - Require PR reviews
  - Require status checks

- [ ] **Deployment notifications ayarlandı**
  - Slack/Discord webhook (opsiyonel)
  - Email notifications

---

## 📚 Documentation

- [ ] **Team üyeleri için deployment dökümantasyonu paylaşıldı**
  - DEPLOYMENT.md
  - .env.example
  - Bu checklist

- [ ] **Credentials güvenli bir yerde saklanıyor**
  - Password manager kullanılıyor
  - Team'de sadece gerekli kişilerle paylaşılıyor

---

## 🎉 Final Checklist

- [ ] **Production URL test edildi ve çalışıyor**
- [ ] **Admin login başarılı**
- [ ] **Convex real-time bağlantı aktif**
- [ ] **Security headers mevcut**
- [ ] **Monitoring ve analytics çalışıyor**
- [ ] **Credentials güvenli bir şekilde saklanıyor**
- [ ] **Team bilgilendirildi**

---

## 📝 Deployment Bilgileri

**Deployment Tarihi:** _______________

**Deployment URL:** _______________

**Custom Domain:** _______________ (varsa)

**Convex Project URL:** _______________

**Sentry Project URL:** _______________ (varsa)

**Deployment Yapan:** _______________

**Notlar:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

## 🚨 Troubleshooting Quick Links

Sorun yaşıyorsanız:

1. **Deployment Hatası:**
   - Vercel Dashboard > Deployments > Latest > Build Logs
   - `DEPLOYMENT.md` > Troubleshooting bölümü

2. **Convex Bağlantı Sorunu:**
   - `NEXT_PUBLIC_CONVEX_URL` doğru mu?
   - Convex Dashboard > Logs

3. **Login Çalışmıyor:**
   - Seed script çalıştırıldı mı?
   - Convex Dashboard > users tablosunda admin var mı?

4. **Environment Variable Eksik:**
   - Vercel Dashboard > Settings > Environment Variables
   - Redeploy: Deployments > ... > Redeploy

---

**Son Güncelleme:** 2025-11-21
**Versiyon:** 1.0.0
