# n8n Workflow Kurulum Rehberi

Bu rehber, Kafkasder Panel için hazırlanmış n8n workflow'larının kurulumunu adım adım açıklar.

## 📋 İçindekiler

1. [Ön Gereksinimler](#ön-gereksinimler)
2. [n8n Kurulumu](#n8n-kurulumu)
3. [Credential Yapılandırması](#credential-yapılandırması)
4. [Workflow Import](#workflow-import)
5. [Webhook Entegrasyonu](#webhook-entegrasyonu)
6. [Test ve Doğrulama](#test-ve-doğrulama)
7. [Troubleshooting](#troubleshooting)

---

## 1. Ön Gereksinimler

### Gerekli Servisler

- ✅ n8n instance (https://vmi2876541.contaboserver.net/)
- ✅ Twilio hesabı (SMS için)
- ✅ SMTP email hesabı (Gmail, Outlook, vb.)
- ✅ Convex API erişimi
- ⚠️ Sentry hesabı (opsiyonel)
- ⚠️ Slack workspace (opsiyonel)

### Bilgiler

Aşağıdaki bilgileri hazırlayın:

```bash
# Twilio
- Account SID
- Auth Token
- Telefon numarası

# Email (SMTP)
- SMTP host ve port
- Email adresi
- Şifre/App Password

# Convex
- Deployment URL
- API Token

# Admin İletişim
- Admin email
- Admin telefon
```

---

## 2. n8n Kurulumu

### Adım 1: n8n'e Giriş Yapın

1. Tarayıcınızda açın: https://vmi2876541.contaboserver.net/
2. Kullanıcı adı ve şifrenizle giriş yapın

### Adım 2: API Token Doğrulama

API token'ınız zaten mevcut:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlOTI1MDA2MC01OTFhLTRjZTAtOTk5Ni0wMGNhMzk0NDE5ZTQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzMDE0Nzc1LCJleHAiOjE3NjU2MDIwMDB9.CUWOAfCCXSo3i0JCoZxyyPf2T82yqwyn437qDPq1FC4
```

⚠️ **Not:** Token 2025-02-10 tarihinde sona eriyor. O tarihten önce yenileyin!

---

## 3. Credential Yapılandırması

### Adım 1: Convex API Credential

1. n8n'de **Settings** → **Credentials** → **New Credential**
2. Credential type: **Header Auth**
3. Ayarlar:
   ```
   Name: Convex API
   Header Name: Authorization
   Header Value: Bearer YOUR_CONVEX_TOKEN
   ```

### Adım 2: Twilio Credential

1. **New Credential** → **Twilio API**
2. Ayarlar:
   ```
   Name: Twilio
   Account SID: [Twilio'dan alın]
   Auth Token: [Twilio'dan alın]
   ```

### Adım 3: Email (SMTP) Credential

1. **New Credential** → **SMTP**
2. Ayarlar:
   ```
   Name: Email SMTP
   Host: smtp.gmail.com
   Port: 587
   Secure: false (TLS kullanılacak)
   User: your-email@gmail.com
   Password: [Gmail App Password]
   ```

**Gmail App Password Nasıl Alınır?**

1. Google Account → Security
2. 2-Step Verification'ı aktif edin
3. App Passwords → Select app: Mail → Generate
4. Oluşan 16 haneli şifreyi kullanın

### Adım 4: Sentry Credential (Opsiyonel)

1. **New Credential** → **Header Auth**
2. Ayarlar:
   ```
   Name: Sentry API
   Header Name: Authorization
   Header Value: Bearer YOUR_SENTRY_TOKEN
   ```

---

## 4. Workflow Import

### Her Workflow için:

1. **Workflows** menüsünden **Import from File** tıklayın
2. İlgili JSON dosyasını seçin:
   - `1-user-data-export.json`
   - `2-donation-receipt-automation.json`
   - `3-meeting-reminder-automation.json`
   - `4-error-monitoring-alerts.json`

3. Import sonrası her node'u kontrol edin:
   - Kırmızı ünlem işaretleri varsa credential atanmamıştır
   - Her node'a tıklayıp ilgili credential'ı seçin

4. **Save** butonuna tıklayın

### Workflow Aktivasyonu

Her workflow'u aktif hale getirmek için:

1. Workflow'u açın
2. Sağ üstteki **Active** toggle'ını ON yapın
3. Yeşil "Active" görünmeli

---

## 5. Webhook Entegrasyonu

### Adım 1: Environment Variables Ekleyin

`.env.local` dosyanızı oluşturun:

```bash
cp n8n-workflows/webhooks/.env.example .env.local
```

Değerleri doldurun:

```bash
# n8n Webhook URLs
N8N_DONATION_WEBHOOK_URL=https://vmi2876541.contaboserver.net/webhook/donation-created
N8N_ERROR_WEBHOOK_URL=https://vmi2876541.contaboserver.net/webhook/error-logged
N8N_WEBHOOK_SECRET=your-secure-random-string

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_FROM_NUMBER=+905551234567

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Admin
ADMIN_EMAIL=admin@kafkasder.org
ADMIN_PHONE=+905551234567
DEV_EMAIL=dev@kafkasder.org
```

### Adım 2: Webhook Route'ları Oluşturun

#### Bağış Webhook

`src/app/api/webhooks/donation-created/route.ts` oluşturun:

```bash
mkdir -p src/app/api/webhooks/donation-created
cp n8n-workflows/webhooks/donation-webhook.ts src/app/api/webhooks/donation-created/route.ts
```

#### Hata Webhook

`src/app/api/webhooks/error-logged/route.ts` oluşturun:

```bash
mkdir -p src/app/api/webhooks/error-logged
cp n8n-workflows/webhooks/error-webhook.ts src/app/api/webhooks/error-logged/route.ts
```

### Adım 3: Convex Mutation'lara Webhook Ekleyin

`convex/donations.ts` dosyasını güncelleyin:

```typescript
export const create = mutation({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    // Bağışı kaydet
    const donationId = await ctx.db.insert('donations', {
      ...args,
      receipt_number: generateReceiptNumber(),
    });

    const donation = await ctx.db.get(donationId);

    // 🆕 n8n webhook'u tetikle
    if (process.env.NODE_ENV === 'production') {
      fetch('https://your-domain.com/api/webhooks/donation-created', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donation),
      }).catch(console.error);
    }

    return donationId;
  },
});
```

`convex/errors.ts` için aynı şekilde:

```typescript
export const log = mutation({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    const errorId = await ctx.db.insert('errors', args);
    const error = await ctx.db.get(errorId);

    // 🆕 Kritik hatalar için webhook
    if (['critical', 'high'].includes(args.severity)) {
      fetch('https://your-domain.com/api/webhooks/error-logged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      }).catch(console.error);
    }

    return errorId;
  },
});
```

---

## 6. Test ve Doğrulama

### Test 1: Kullanıcı Export Workflow

1. n8n'de **User Data Export** workflow'unu açın
2. **Execute Workflow** butonuna tıklayın
3. Beklenen sonuç:
   - ✅ Convex'ten kullanıcılar çekildi
   - ✅ Excel dosyası oluşturuldu
   - ✅ Email gönderildi
4. Email'inizi kontrol edin

### Test 2: Bağış Makbuzu Workflow

Test verisi gönderin:

```bash
curl -X POST https://your-domain.com/api/webhooks/donation-created \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret" \
  -d '{
    "donor_name": "Test Bağışçı",
    "donor_email": "test@example.com",
    "donor_phone": "+905551234567",
    "amount": 1000,
    "currency": "TRY",
    "donation_type": "Zekât",
    "donation_purpose": "Genel Bağış",
    "payment_method": "Banka Havalesi",
    "receipt_number": "BGS-2025-0001",
    "status": "completed"
  }'
```

Beklenen sonuç:

- ✅ PDF makbuz oluşturuldu
- ✅ Bağışçıya email gönderildi
- ✅ SMS gönderildi (5000 TL üzeri ise)
- ✅ Analytics güncellendi

### Test 3: Toplantı Hatırlatma Workflow

1. Convex'e yarın için bir toplantı ekleyin
2. n8n'de workflow'u manuel çalıştırın
3. Beklenen sonuç:
   - ✅ Toplantı bulundu
   - ✅ Katılımcılara email gönderildi
   - ✅ Katılımcılara SMS gönderildi
   - ✅ Bildirimler kaydedildi

### Test 4: Hata Monitoring Workflow

Test hatası gönderin:

```bash
curl -X POST https://your-domain.com/api/webhooks/error-logged \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret" \
  -d '{
    "error_code": "ERR_TEST_001",
    "title": "Test Kritik Hata",
    "description": "Bu bir test hatasıdır",
    "category": "runtime",
    "severity": "critical",
    "stack_trace": "Error: Test\n  at testFunction (/app/test.ts:10:5)",
    "url": "https://panel.kafkasder.org/dashboard",
    "component": "DashboardPage",
    "occurrence_count": 1,
    "first_seen": "2025-01-13T10:00:00.000Z",
    "last_seen": "2025-01-13T10:00:00.000Z",
    "status": "new"
  }'
```

Beklenen sonuç:

- ✅ Admin'e SMS gönderildi
- ✅ Detaylı email gönderildi
- ✅ System alert oluşturuldu
- ✅ Slack bildirimi gönderildi (yapılandırıldıysa)

---

## 7. Troubleshooting

### Webhook Çalışmıyor

**Problem:** n8n webhook'a istek ulaşmıyor

**Çözüm:**

```bash
# 1. Webhook URL'ini kontrol edin
echo $N8N_DONATION_WEBHOOK_URL

# 2. n8n'de webhook'un aktif olduğunu kontrol edin
# Workflow → Active toggle ON olmalı

# 3. Firewall kontrolü
curl -X POST https://vmi2876541.contaboserver.net/webhook/test

# 4. n8n loglarını kontrol edin
# n8n dashboard → Executions → Failed
```

### Email Gönderilmiyor

**Problem:** SMTP hatası alıyorsunuz

**Çözüm:**

```bash
# Gmail için:
# 1. 2-Step Verification aktif mi?
# 2. App Password oluşturdunuz mu?
# 3. "Less secure app access" kapalı olmalı (App Password kullanıyorsanız)

# Test:
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.sendMail({
  from: 'your-email@gmail.com',
  to: 'test@example.com',
  subject: 'Test',
  text: 'Test'
}).then(console.log).catch(console.error);
"
```

### SMS Gönderilmiyor

**Problem:** Twilio hatası

**Çözüm:**

```bash
# 1. Account SID ve Auth Token doğru mu?
# 2. Telefon numarası Twilio'da doğrulandı mı?
# 3. Twilio bakiyesi yeterli mi?

# Test:
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
  --data-urlencode "From=$TWILIO_FROM_NUMBER" \
  --data-urlencode "To=+905551234567" \
  --data-urlencode "Body=Test SMS" \
  -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN"
```

### Convex API Hatası

**Problem:** Convex'e erişim yok

**Çözüm:**

```bash
# 1. Convex deployment URL doğru mu?
# 2. API token geçerli mi?

# Test:
curl https://your-deployment.convex.cloud/api/users/list \
  -H "Authorization: Bearer YOUR_TOKEN"

# Token'ı yenileyin:
npx convex dev # Terminal'de token görünecek
```

### PDF Oluşturulmuyor

**Problem:** HTML to PDF dönüşümü başarısız

**Çözüm:**

```bash
# n8n'de HTML node'u Puppeteer kullanır
# Sunucuda Chrome/Chromium yüklü olmalı

# Docker kullanıyorsanız:
# n8n image'i puppeteer destekli olmalı
docker pull n8n/n8n:latest

# Manuel kurulumda:
sudo apt-get install -y chromium-browser
```

### Workflow Çok Yavaş

**Problem:** Workflow 30 saniyeden uzun sürüyor

**Çözüm:**

```bash
# 1. Paralel işlem kullanın
# Split in Batches node'larını kontrol edin

# 2. n8n execution timeout'u artırın
# n8n settings → Executions → Timeout

# 3. Gereksiz node'ları kaldırın
# Debug için geçici node'ları silin

# 4. Webhook'ları asenkron yapın
# Response hemen dönmeli, işlemler arkada devam etmeli
```

---

## 8. Monitoring ve Bakım

### n8n Executions İzleme

1. n8n dashboard → **Executions**
2. Başarılı/başarısız execution'ları görün
3. Error mesajlarını inceleyin

### Webhook Log Kontrolü

```bash
# Next.js logs
npm run dev # Development
# veya
docker logs your-container # Production

# n8n logs
docker logs n8n
```

### Credential Yenileme

n8n API token'ı 2025-02-10'da sona eriyor:

1. n8n dashboard → Settings → API
2. **Create new token**
3. `.env.local` dosyasını güncelleyin
4. Workflow'ları yeniden test edin

---

## 9. Üretim Ortamı Checklist

Üretim ortamına geçmeden önce:

- [ ] Tüm credential'lar güvenli şekilde saklandı (environment variables)
- [ ] Webhook secret'ları güçlü ve rastgele
- [ ] HTTPS kullanılıyor (HTTP değil)
- [ ] Rate limiting eklendi (webhook endpoint'lerine)
- [ ] Error handling tüm workflow'larda mevcut
- [ ] Email/SMS test edildi ve çalışıyor
- [ ] Backup workflow'ları yapılandırıldı
- [ ] Monitoring ve alerting aktif
- [ ] Dokümantasyon tamamlandı

---

## 10. Destek ve Kaynaklar

### n8n Dokümantasyonu

- https://docs.n8n.io/

### Twilio Dokümantasyonu

- https://www.twilio.com/docs

### Convex Dokümantasyonu

- https://docs.convex.dev/

### Kafkasder Panel Desteği

- GitHub Issues: [Repository URL]
- Email: dev@kafkasder.org

---

## Başarılar! 🎉

Workflow'larınız artık hazır. Sorularınız için iletişime geçebilirsiniz.
