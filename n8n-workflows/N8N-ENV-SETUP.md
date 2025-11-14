# n8n Environment Variables Kurulumu

⚠️ **ÖNEMLİ:** n8n instance'ınız environment variables özelliğini desteklemiyor (lisans gerektiriyor). Bu yüzden workflow'lardaki Convex API URL'leri doğrudan güncellendi.

## ✅ Yapılan İşlemler

Tüm workflow'lardaki Convex API URL'leri güncellendi:

- `https://fleet-octopus-839.convex.cloud/api`

## 📝 Manuel Yapılması Gerekenler

n8n dashboard'da (https://vmi2876541.contaboserver.net/) şu adımları takip edin:

### 1. Credential'ları Oluşturun

#### Convex API Credential

1. **Settings** → **Credentials** → **New Credential**
2. Type: **Header Auth**
3. Ayarlar:
   ```
   Name: Convex API
   Header Name: Authorization
   Header Value: Bearer eyJ2MiI6ImIxMTA2ZTdmZGNkNTQ0ZTU4MzI2OTZkOGY4ODRkMGYxIn0=
   ```

#### Twilio API Credential

1. **New Credential** → **Twilio API**
2. Ayarlar:
   ```
   Name: Twilio
   Account SID: [.env.local'den alın]
   Auth Token: [.env.local'den alın]
   ```

#### Email SMTP Credential

1. **New Credential** → **SMTP**
2. Ayarlar:
   ```
   Name: Email SMTP
   Host: smtp.gmail.com
   Port: 587
   Secure: false
   User: [.env.local'den alın]
   Password: [.env.local'den alın]
   ```

#### Telegram Bot Credential

1. **New Credential** → **Telegram API**
2. Ayarlar:
   ```
   Name: Telegram Bot
   Access Token: [.env.local'den alın]
   ```

### 2. Workflow'lara Credential Atayın

Her workflow'u açın ve node'lara credential'ları atayın:

#### Kullanıcı Veri Export (ID: 7kPTrVuwnvnJRxEq)

- `Convex - Kullanıcı Listesi Al` → Convex API
- `Email Gönder` → Email SMTP

#### Bağış Makbuzu Otomasyonu (ID: TsGuTreAMidp3AH3)

- `Analytics Güncelle` → Convex API
- `Email Makbuz Gönder` → Email SMTP
- `SMS Teşekkür Gönder` → Twilio
- `Admin Bildirim SMS` → Twilio

#### Toplantı Hatırlatma Otomasyonu (ID: 66uUo6by9xXlbKr0)

- `Yaklaşan Toplantılar` → Convex API
- `Katılımcı Bilgileri Al` → Convex API
- `Bildirim Kaydet` → Convex API
- `Email Hatırlatma Gönder` → Email SMTP
- `SMS Hatırlatma Gönder` → Twilio

#### Hata İzleme ve Alarm (ID: XI1AQnOCI5mCGpMD)

- `Hata Kaydını Güncelle` → Convex API
- `System Alert Oluştur` → Convex API
- `Admin'e Acil SMS` → Twilio
- `Detaylı Email Gönder` → Email SMTP

#### Telegram Bildirim Sistemi (ID: FoH5ZFqWtUpV2ygz)

- `Telegram Gruba Gönder` → Telegram Bot
- `Telegram Kişiye Gönder` → Telegram Bot
- `Dosya Gönder` → Telegram Bot
- `İletişim Logu Kaydet` → Convex API

### 3. Workflow'ları Aktif Edin

Her workflow'u açın ve sağ üstteki **Active** toggle'ını ON yapın.

## 🔍 Convex API URL'leri

Tüm workflow'larda Convex API URL'leri şu şekilde güncellendi:

- Base URL: `https://fleet-octopus-839.convex.cloud/api`
- Endpoints:
  - `/users/list`
  - `/users/batch`
  - `/donations/update-analytics`
  - `/meetings/upcoming`
  - `/workflow_notifications/create`
  - `/errors/update-occurrence`
  - `/system_alerts/create`
  - `/communication_logs/create`

## ✅ Test Etme

Workflow'ları test etmek için:

1. **Kullanıcı Veri Export**: Manuel tetikleme ile test edin
2. **Bağış Makbuzu**: Webhook'u test edin: `POST /api/webhooks/donation-created`
3. **Toplantı Hatırlatma**: Schedule trigger'ı bekleyin (09:00'da çalışır)
4. **Hata İzleme**: Webhook'u test edin: `POST /api/webhooks/error-logged`
5. **Telegram Bildirim**: Webhook'u test edin: `POST /api/webhooks/telegram-notify`

## 📊 Durum

| Workflow              | Convex URL     | Credential | Durum    |
| --------------------- | -------------- | ---------- | -------- |
| Kullanıcı Veri Export | ✅ Güncellendi | ⚠️ Manuel  | ⚪ Pasif |
| Bağış Makbuzu         | ✅ Güncellendi | ⚠️ Manuel  | ⚪ Pasif |
| Toplantı Hatırlatma   | ✅ Güncellendi | ⚠️ Manuel  | ⚪ Pasif |
| Hata İzleme           | ✅ Güncellendi | ⚠️ Manuel  | ⚪ Pasif |
| Telegram Bildirim     | ✅ Güncellendi | ✅ Mevcut  | ⚪ Pasif |

## 🚀 Sonraki Adımlar

1. ✅ Convex API URL'leri güncellendi
2. ⚠️ Credential'ları n8n dashboard'da oluşturun
3. ⚠️ Workflow'lara credential'ları atayın
4. ⚠️ Workflow'ları aktif edin
5. ⚠️ Test edin
