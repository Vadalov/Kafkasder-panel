# n8n Workflow - Hızlı Başlangıç

## 🚀 5 Dakikada Başlayın

### 1️⃣ Workflow'ları Import Edin (2 dakika)

```bash
# n8n'e gidin
https://vmi2876541.contaboserver.net/

# Her workflow için:
Workflows → Import from File → [Dosyayı seçin] → Save
```

Import edilecek dosyalar:

- ✅ `1-user-data-export.json` - Kullanıcı listesi
- ✅ `2-donation-receipt-automation.json` - Bağış makbuzu
- ✅ `3-meeting-reminder-automation.json` - Toplantı hatırlatma
- ✅ `4-error-monitoring-alerts.json` - Hata izleme

### 2️⃣ Credential'ları Ekleyin (2 dakika)

n8n'de **Settings → Credentials**:

#### Convex API

```
Type: Header Auth
Name: Convex API
Header: Authorization
Value: Bearer YOUR_CONVEX_TOKEN
```

#### Twilio (SMS için)

```
Type: Twilio API
Account SID: [Twilio'dan]
Auth Token: [Twilio'dan]
```

#### Email (SMTP)

```
Type: SMTP
Host: smtp.gmail.com
Port: 587
User: your-email@gmail.com
Password: [App Password]
```

### 3️⃣ Workflow'ları Aktif Edin (1 dakika)

Her workflow'u açın ve **Active** toggle'ını ON yapın.

---

## 📊 Kullanıcı Bilgilerini Çekme

### Manuel Çalıştırma

1. n8n'de **"Kullanıcı Veri Export"** workflow'unu açın
2. **Execute Workflow** butonuna tıklayın
3. Email'inizde Excel dosyası gelecek

### Otomatik (Günlük)

Workflow'da Schedule node'u aktif edin:

- Her gün saat 09:00'da otomatik çalışır
- Admin email'ine kullanıcı listesi gönderir

### API ile Kullanıcı Listesi

Convex API'yi doğrudan kullanabilirsiniz:

```bash
curl https://your-deployment.convex.cloud/api/users/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Veya projenizde:

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function UsersList() {
  const users = useQuery(api.users.list, {});

  return (
    <div>
      <h1>Kullanıcılar ({users?.total})</h1>
      {users?.documents.map(user => (
        <div key={user._id}>
          <p>{user.name} - {user.email}</p>
          <p>Rol: {user.role} | Aktif: {user.isActive ? 'Evet' : 'Hayır'}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Önerilen İlk Adımlar

### 1. Test Çalıştırmaları

Önce her workflow'u test edin:

```bash
# Test 1: Kullanıcı Export
n8n'de manuel Execute → Email kontrolü

# Test 2: Bağış Webhook
curl -X POST http://localhost:3000/api/webhooks/donation-created \
  -H "Content-Type: application/json" \
  -d '{"donor_name": "Test", "amount": 100, "receipt_number": "TEST-001"}'

# Test 3: Hata Webhook
curl -X POST http://localhost:3000/api/webhooks/error-logged \
  -H "Content-Type: application/json" \
  -d '{"error_code": "TEST", "title": "Test", "severity": "critical"}'
```

### 2. Üretim Hazırlığı

```bash
# 1. Environment variables ekleyin
cp n8n-workflows/webhooks/.env.example .env.local
# Değerleri doldurun

# 2. Webhook route'larını oluşturun
mkdir -p src/app/api/webhooks/{donation-created,error-logged}
cp n8n-workflows/webhooks/donation-webhook.ts src/app/api/webhooks/donation-created/route.ts
cp n8n-workflows/webhooks/error-webhook.ts src/app/api/webhooks/error-logged/route.ts

# 3. Deploy edin
git add .
git commit -m "feat: Add n8n workflow integrations"
git push
```

### 3. İzleme ve Optimizasyon

- n8n Executions sayfasından workflow loglarını kontrol edin
- Başarısız execution'ları inceleyin
- Gerekirse timeout süresini artırın

---

## 📞 Hızlı Sorun Çözme

### Webhook Çalışmıyor?

```bash
# n8n'de workflow Active mi kontrol edin
# Webhook URL'i doğru mu kontrol edin
curl -X POST https://vmi2876541.contaboserver.net/webhook/test
```

### Email Gitmiyor?

```bash
# Gmail App Password kullanıyor musunuz?
# 2-Step Verification aktif mi?
```

### SMS Gitmiyor?

```bash
# Twilio hesabında bakiye var mı?
# Telefon numarası doğrulandı mı?
```

### Convex Bağlantı Hatası?

```bash
# API token geçerli mi?
# Deployment URL doğru mu?
curl https://your-deployment.convex.cloud/api/health
```

---

## 📚 Detaylı Dokümantasyon

- [README.md](README.md) - Genel bakış
- [SETUP-GUIDE.md](SETUP-GUIDE.md) - Detaylı kurulum
- [webhooks/](webhooks/) - Webhook kod örnekleri

---

## ✅ Başarı Kriterleri

Workflow'lar doğru çalışıyorsa:

- ✅ Kullanıcı export workflow'u email gönderiyor
- ✅ Bağış yapıldığında makbuz otomatik oluşuyor
- ✅ Toplantı hatırlatmaları gidiyor
- ✅ Kritik hatalar için admin'e SMS gidiyor
- ✅ n8n Executions'da başarısız execution yok

---

## 🎉 Tebrikler!

n8n workflow'larınız hazır. Artık:

- 📊 Otomatik raporlar alıyorsunuz
- 📧 Bağış makbuzları otomatik gönderiliyor
- 📅 Toplantı hatırlatmaları otomatik
- 🚨 Kritik hatalarda anlık bildirim alıyorsunuz

**İyi çalışmalar!** 🚀
