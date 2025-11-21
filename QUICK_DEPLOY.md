# ⚡ Quick Deploy Guide - Kafkasder Panel

5 dakikada production'a çıkın! 🚀

---

## 📦 Hızlı Başlangıç

### 1️⃣ Secrets Oluştur (2 dakika)

```bash
# CSRF Secret
openssl rand -base64 32

# Session Secret
openssl rand -base64 32
```

İki değeri de kopyala ve kaydet! 📝

### 2️⃣ Convex Setup (1 dakika)

1. https://dashboard.convex.dev açın
2. "Create Project" → `kafkasder-panel`
3. Production URL'yi kopyalayın
4. Terminal'de:

```bash
npx convex login
npm run convex:deploy
```

### 3️⃣ Vercel Setup (2 dakika)

1. https://vercel.com/new açın
2. GitHub repo'yu seçin: `Vadalov/Kafkasder-panel`
3. Settings > Environment Variables:

**Zorunlu 6 değişken:**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex URL'niz |
| `CSRF_SECRET` | İlk secret |
| `SESSION_SECRET` | İkinci secret |
| `NODE_ENV` | `production` |
| `FIRST_ADMIN_EMAIL` | `baskan@dernek.org` |
| `FIRST_ADMIN_PASSWORD` | Güçlü bir şifre |

> 💡 Her variable için **Production** ve **Preview** scope'larını seçin!

4. "Deploy" butonuna tıklayın

---

## ✅ Test Et

Deployment bittiğinde (2-3 dakika):

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Tarayıcıda aç
https://your-app.vercel.app/login
```

Admin bilgilerinizle giriş yapın - **Tamamdır!** 🎉

---

## 📚 Detaylı Dokümantasyon

Daha fazla bilgi için:

- **Tam deployment rehberi:** [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- **Checklist:** [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md)
- **Environment variables:** [`.env.vercel.template`](./.env.vercel.template)

---

## 🔧 Opsiyonel Eklemeler

### Sentry (Error Tracking)

1. https://sentry.io - Proje oluştur
2. Vercel'e ekle:
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`

### Email (SMTP)

Gmail için:
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_USER=your-email@gmail.com`
- `SMTP_PASSWORD=` ([App Password oluştur](https://myaccount.google.com/apppasswords))

### SMS (Twilio)

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

Hesap: https://www.twilio.com/console

---

## 🆘 Sorun mu Yaşıyorsunuz?

### Build hatası

```bash
# Vercel Dashboard > Deployments > Build Logs
# Hatayı kopyalayın ve DEPLOYMENT.md > Troubleshooting'e bakın
```

### Login çalışmıyor

```bash
# İlk admin kullanıcıyı oluşturun
npx convex run seed:default --prod
```

### Convex bağlanamıyor

```
# NEXT_PUBLIC_CONVEX_URL kontrol edin
# https:// ile başlamalı
# .convex.cloud ile bitmeli
```

---

## 🚀 Deployment Komutları

### Otomatik (Git push ile)

```bash
git add .
git commit -m "feat: deploy to production"
git push origin main
```

### Manuel (Vercel CLI ile)

```bash
npm install -g vercel
vercel login
npm run vercel:prod
```

---

## 📊 Post-Deployment

### Health Check

```bash
curl https://your-app.vercel.app/api/health?detailed=true
```

### Monitoring

- **Vercel Analytics:** https://vercel.com/dashboard/analytics
- **Convex Logs:** https://dashboard.convex.dev
- **Sentry Errors:** https://sentry.io (eğer yapılandırıldıysa)

---

## 🎯 Production Checklist

- [x] Convex deployed
- [x] Vercel deployed
- [x] Environment variables eklendi
- [x] Admin login test edildi
- [ ] Custom domain bağlandı (opsiyonel)
- [ ] Sentry yapılandırıldı (önerilen)
- [ ] Email/SMS servisleri yapılandırıldı (opsiyonel)

---

**İyi çalışmalar!** 🎉

Daha detaylı bilgi için `DEPLOYMENT.md` dosyasına göz atın.
