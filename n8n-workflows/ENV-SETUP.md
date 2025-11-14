# n8n Environment Variables ve Credential Kurulumu

## 🔐 Environment Variables (.env.local)

Projenizin `.env.local` dosyasına aşağıdaki değişkenleri ekleyin:

```bash
# ============================================
# n8n Webhook URLs
# ============================================
N8N_DONATION_WEBHOOK_URL=https://vmi2876541.contaboserver.net/webhook/donation-created
N8N_ERROR_WEBHOOK_URL=https://vmi2876541.contaboserver.net/webhook/error-logged
N8N_TELEGRAM_WEBHOOK_URL=https://vmi2876541.contaboserver.net/webhook/telegram-notify
N8N_WEBHOOK_SECRET=your-secure-random-string-here

# ============================================
# Convex API
# ============================================
CONVEX_API_URL=https://your-deployment.convex.cloud/api
CONVEX_DEPLOYMENT=your-deployment-name
CONVEX_TOKEN=your-convex-token-here

# ============================================
# Twilio (SMS için)
# ============================================
TWILIO_ACCOUNT_SID=ACxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=+905551234567

# ============================================
# Email (SMTP)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@kafkasder.org

# ============================================
# Telegram Bot
# ============================================
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_GROUP_CHAT_ID=-1001234567890
TELEGRAM_ADMIN_CHAT_ID=123456789

# ============================================
# Admin İletişim
# ============================================
ADMIN_EMAIL=admin@kafkasder.org
ADMIN_PHONE=+905551234567
DEV_EMAIL=dev@kafkasder.org

# ============================================
# Sentry (Opsiyonel)
# ============================================
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your-sentry-token

# ============================================
# Slack (Opsiyonel)
# ============================================
SLACK_WEBHOOK_PATH=your-slack-webhook-path
```

## 🔑 n8n Credential Kurulumu

n8n dashboard'da (https://vmi2876541.contaboserver.net/) şu credential'ları oluşturun:

### 1. Convex API Credential

**Settings → Credentials → New Credential**

- **Type:** Header Auth
- **Name:** `Convex API`
- **Header Name:** `Authorization`
- **Header Value:** `Bearer YOUR_CONVEX_TOKEN`

### 2. Email SMTP Credential

**Settings → Credentials → New Credential**

- **Type:** SMTP
- **Name:** `Email SMTP`
- **Host:** `smtp.gmail.com`
- **Port:** `587`
- **Secure:** `false` (TLS kullanılacak)
- **User:** `your-email@gmail.com`
- **Password:** `your-gmail-app-password`

**Gmail App Password Nasıl Alınır?**

1. Google Account → Security
2. 2-Step Verification'ı aktif edin
3. App Passwords → Select app: Mail → Generate
4. Oluşan 16 haneli şifreyi kullanın

### 3. Twilio API Credential

**Settings → Credentials → New Credential**

- **Type:** Twilio API
- **Name:** `Twilio`
- **Account SID:** `YOUR_TWILIO_ACCOUNT_SID`
- **Auth Token:** `YOUR_TWILIO_AUTH_TOKEN`

### 4. Telegram Bot Credential

**Settings → Credentials → New Credential**

- **Type:** Telegram API
- **Name:** `Telegram Bot`
- **Access Token:** `YOUR_TELEGRAM_BOT_TOKEN`

**Telegram Bot Token Nasıl Alınır?**

1. Telegram'da @BotFather'a mesaj gönderin
2. `/newbot` komutunu kullanın
3. Bot adını ve username'i belirleyin
4. Verilen token'ı kullanın

### 5. Sentry API Credential (Opsiyonel)

**Settings → Credentials → New Credential**

- **Type:** Header Auth
- **Name:** `Sentry API`
- **Header Name:** `Authorization`
- **Header Value:** `Bearer YOUR_SENTRY_TOKEN`

## 📝 Workflow'lara Credential Atama

Her workflow'u açın ve node'lara credential'ları atayın:

1. **Kullanıcı Veri Export**
   - `Convex - Kullanıcı Listesi Al` → Convex API
   - `Email Gönder` → Email SMTP

2. **Bağış Makbuzu Otomasyonu**
   - `Convex - Kullanıcı Listesi Al` → Convex API
   - `Email Makbuz Gönder` → Email SMTP
   - `SMS Teşekkür Gönder` → Twilio
   - `Admin Bildirim SMS` → Twilio
   - `Analytics Güncelle` → Convex API

3. **Toplantı Hatırlatma Otomasyonu**
   - `Yaklaşan Toplantılar` → Convex API
   - `Katılımcı Bilgileri Al` → Convex API
   - `Email Hatırlatma Gönder` → Email SMTP
   - `SMS Hatırlatma Gönder` → Twilio
   - `Bildirim Kaydet` → Convex API

4. **Hata İzleme ve Alarm**
   - `Admin'e Acil SMS` → Twilio
   - `Detaylı Email Gönder` → Email SMTP
   - `Sentry Event Detayları` → Sentry API (opsiyonel)
   - `Hata Kaydını Güncelle` → Convex API
   - `System Alert Oluştur` → Convex API

5. **Telegram Bildirim Sistemi**
   - `Telegram Gruba Gönder` → Telegram Bot
   - `Telegram Kişiye Gönder` → Telegram Bot
   - `Dosya Gönder` → Telegram Bot
   - `İletişim Logu Kaydet` → Convex API

## ✅ Test Etme

### 1. Bağış Webhook Testi

```bash
curl -X POST http://localhost:3000/api/webhooks/donation-created \
  -H "Content-Type: application/json" \
  -d '{
    "donor_name": "Test Bağışçı",
    "donor_email": "test@example.com",
    "donor_phone": "+905551234567",
    "amount": 1000,
    "currency": "TRY",
    "donation_type": "Zekât",
    "donation_purpose": "Genel Bağış",
    "payment_method": "Banka Havalesi",
    "receipt_number": "BGS-2025-TEST-001",
    "status": "completed"
  }'
```

### 2. Hata Webhook Testi

```bash
curl -X POST http://localhost:3000/api/webhooks/error-logged \
  -H "Content-Type: application/json" \
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

### 3. Telegram Bildirim Testi

```bash
curl -X POST http://localhost:3000/api/webhooks/telegram-notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "general",
    "title": "Test Bildirimi",
    "description": "Bu bir test mesajıdır.",
    "recipient_type": "group"
  }'
```

## 🚀 Workflow'ları Aktif Etme

1. n8n dashboard'a gidin: https://vmi2876541.contaboserver.net/
2. Her workflow'u açın
3. Sağ üstteki **Active** toggle'ını ON yapın
4. Yeşil "Active" görünmeli

## 📊 Workflow Durumları

| Workflow                       | ID               | Durum    | Node Sayısı |
| ------------------------------ | ---------------- | -------- | ----------- |
| Kullanıcı Veri Export          | 7kPTrVuwnvnJRxEq | ⚪ Pasif | 6           |
| Bağış Makbuzu Otomasyonu       | TsGuTreAMidp3AH3 | ⚪ Pasif | 9           |
| Toplantı Hatırlatma Otomasyonu | 66uUo6by9xXlbKr0 | ⚪ Pasif | 11          |
| Hata İzleme ve Alarm           | XI1AQnOCI5mCGpMD | ⚪ Pasif | 10          |
| Telegram Bildirim Sistemi      | FoH5ZFqWtUpV2ygz | ⚪ Pasif | 8           |

## 🔍 Sorun Giderme

### Credential Bulunamıyor Hatası

- n8n dashboard'da credential'ların oluşturulduğundan emin olun
- Credential ID'lerinin workflow'larda doğru olduğunu kontrol edin
- Credential'ları yeniden oluşturup workflow'lara tekrar atayın

### Webhook Çalışmıyor

- Workflow'un aktif olduğundan emin olun
- Webhook URL'ini kontrol edin: `https://vmi2876541.contaboserver.net/webhook/[path]`
- n8n Executions sayfasından hataları kontrol edin

### Email Gönderilmiyor

- Gmail App Password kullandığınızdan emin olun
- 2-Step Verification'ın aktif olduğunu kontrol edin
- SMTP ayarlarını test edin

### SMS Gönderilmiyor

- Twilio hesabında bakiye olduğundan emin olun
- Telefon numarasının doğrulandığını kontrol edin
- Twilio credentials'ın doğru olduğunu kontrol edin
