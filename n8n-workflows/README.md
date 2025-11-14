# n8n Workflow Otomasyonları

Bu klasör Kafkasder Panel için hazırlanmış n8n workflow'larını içerir.

## 📋 Mevcut Workflow'lar

### 1. **user-data-export.json** - Kullanıcı Veri Export

Convex veritabanından kullanıcı bilgilerini çeker ve export eder.

**Özellikler:**

- Tüm kullanıcıları listeler
- Rol ve aktiflik durumuna göre filtreler
- Excel/CSV formatında export
- Email ile gönderim

### 2. **donation-receipt-automation.json** - Bağış Makbuzu Otomasyonu

Yeni bağış geldiğinde otomatik makbuz oluşturur ve gönderir.

**Özellikler:**

- Webhook ile bağış bildirimi
- PDF makbuz oluşturma
- Email ile makbuz gönderimi
- SMS ile teşekkür mesajı
- Dashboard güncelleme

### 3. **meeting-reminder-automation.json** - Toplantı Hatırlatma

Toplantı öncesi otomatik hatırlatmalar gönderir.

**Özellikler:**

- Günlük toplantı kontrolü
- 24 saat önceden hatırlatma
- Email + SMS bildirimi
- Karar maddeleri takibi

### 4. **error-monitoring-alerts.json** - Hata İzleme

Kritik hatalar için anlık bildirim gönderir.

**Özellikler:**

- Webhook ile hata bildirimi
- Severity bazlı filtreleme
- Admin'e SMS/Email
- Sentry entegrasyonu

### 5. **telegram-notifications.json** - Telegram Bildirim Sistemi ⭐ YENİ!

Tüm bildirimleri Telegram üzerinden gönderir.

**Özellikler:**

- Bağış, toplantı, hata, görev bildirimleri
- Grup ve kişisel mesajlar
- Dosya ekleri (PDF, Excel, vb.)
- Markdown formatı desteği
- Inline butonlar
- İletişim logu

## 🔧 Kurulum Adımları

### 1. n8n'e Workflow Import Etme

1. n8n dashboard'unuza gidin: `https://vmi2876541.contaboserver.net/`
2. Sol menüden **Workflows** seçin
3. Sağ üstten **Import from File** tıklayın
4. İlgili `.json` dosyasını seçin
5. **Save** butonuna tıklayın

### 2. Credentials Ayarlama

Her workflow için gerekli credential'ları ekleyin:

#### Convex API Credentials

- Name: `Convex API`
- Type: `HTTP Request`
- Base URL: `https://your-convex-deployment.convex.cloud/api`
- Authentication: `Generic Credential Type`
- Add Header: `Authorization: Bearer YOUR_CONVEX_TOKEN`

#### Twilio SMS Credentials

- Name: `Twilio`
- Account SID: `YOUR_ACCOUNT_SID`
- Auth Token: `YOUR_AUTH_TOKEN`
- From Number: `YOUR_TWILIO_NUMBER`

#### Email (SMTP) Credentials

- Name: `Email SMTP`
- Host: `smtp.gmail.com` (veya kullandığınız SMTP)
- Port: `587`
- User: `your-email@gmail.com`
- Password: `your-app-password`

### 3. Webhook URL'lerini Projeye Ekleme

`n8n-workflows/webhooks/` klasöründeki dosyaları kullanarak Next.js API'lerinize webhook entegrasyonu ekleyin.

## 📊 Workflow Detayları

### User Data Export Workflow

**Trigger:** Manuel veya Scheduled (Günlük)
**Endpoint:** HTTP Request to Convex

```
GET https://your-convex.convex.cloud/api/users/list
```

**Steps:**

1. Convex'ten kullanıcı listesi al
2. Veriyi formatla
3. Excel dosyası oluştur
4. Email ile gönder

### Donation Receipt Automation

**Trigger:** Webhook
**Webhook URL:** `https://vmi2876541.contaboserver.net/webhook/donation-created`

**Steps:**

1. Webhook'tan bağış verisi al
2. Bağışçı bilgilerini doğrula
3. PDF makbuz oluştur
4. Email ile makbuz gönder
5. Büyük bağışlar için SMS gönder
6. Analytics güncelle

### Meeting Reminder Automation

**Trigger:** Schedule (Her gün 09:00)

**Steps:**

1. Yarınki toplantıları sorgula
2. Katılımcıları listele
3. Email hatırlatması gönder
4. SMS hatırlatması gönder
5. Toplantı sonrası karar maddelerini task'a çevir

### Error Monitoring Alerts

**Trigger:** Webhook
**Webhook URL:** `https://vmi2876541.contaboserver.net/webhook/error-logged`

**Steps:**

1. Webhook'tan hata verisi al
2. Severity kontrolü (critical/high)
3. Admin'e SMS gönder
4. Detaylı email gönder
5. Sentry'ye log at

## 🔐 Güvenlik Notları

1. **API Keys:** Tüm API key'leri n8n credential manager'da saklayın
2. **Webhook Security:** Webhook URL'lerine authentication ekleyin
3. **Rate Limiting:** Webhook endpoint'lerinize rate limit ekleyin
4. **Data Privacy:** Hassas verileri (TC, IBAN) mask edin

## 📞 Destek

Workflow'larla ilgili sorunlar için:

- n8n Forum: https://community.n8n.io/
- Proje GitHub: [Repository URL]

## 🔄 Güncelleme Geçmişi

- **v1.0.0** (2025-01-13): İlk sürüm
  - 4 temel workflow eklendi
  - Webhook entegrasyonları hazırlandı
