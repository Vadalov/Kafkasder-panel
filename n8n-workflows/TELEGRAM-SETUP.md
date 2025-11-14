# Telegram Bot Kurulum Rehberi

## 📱 Telegram Bot ile n8n Entegrasyonu

Bu rehber, Kafkasder Panel için Telegram bot kurulumu ve n8n entegrasyonunu adım adım açıklar.

---

## 1️⃣ Telegram Bot Oluşturma (5 dakika)

### Adım 1: BotFather ile Bot Oluşturun

1. Telegram'da **[@BotFather](https://t.me/botfather)** 'ı bulun ve başlatın
2. `/newbot` komutunu gönderin
3. Bot için bir isim girin (örn: "Kafkasder Panel Bot")
4. Bot için bir kullanıcı adı girin (örn: "kafkasder_panel_bot")
   - Kullanıcı adı `bot` ile bitmelidir
   - Benzersiz olmalıdır

5. BotFather size bir **Token** verecek:
   ```
   123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   ```
   ⚠️ **Bu token'ı güvenli saklayın!**

### Adım 2: Bot'u Özelleştirin (Opsiyonel)

```bash
# Bot profil fotoğrafı ekle
/setuserpic @kafkasder_panel_bot
# Fotoğrafı gönderin

# Bot açıklaması ekle
/setdescription @kafkasder_panel_bot
# Açıklama: "Kafkasder Dernek Yönetim Paneli bildirimleri"

# Bot hakkında bilgi
/setabouttext @kafkasder_panel_bot
# "Kafkas Kültür ve Dayanışma Derneği - Panel Bot"
```

---

## 2️⃣ Telegram Grup Oluşturma

### Seçenek A: Grup Chat ID (Önerilen)

1. **Yeni Grup Oluşturun**
   - Telegram'da **New Group**
   - İsim: "Kafkasder Panel Bildirimleri"
   - Bot'u gruba ekleyin: `@kafkasder_panel_bot`

2. **Bot'a Admin Yetkisi Verin**
   - Grup ayarları → Administrators
   - Bot'u admin yapın
   - **Post Messages** yetkisini verin

3. **Chat ID'yi Öğrenin**

   **Yöntem 1: Bot ile mesajlaşma**

   ```bash
   # Gruba bir mesaj gönderin
   # Sonra şu API'yi çağırın:
   curl https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
   ```

   Response:

   ```json
   {
     "ok": true,
     "result": [
       {
         "message": {
           "chat": {
             "id": -1001234567890, // ← Bu sizin Chat ID'niz
             "title": "Kafkasder Panel Bildirimleri",
             "type": "supergroup"
           }
         }
       }
     ]
   }
   ```

   **Yöntem 2: Web tarayıcı**
   - Telegram Web'i açın: https://web.telegram.org/
   - Grubu seçin
   - URL'de chat ID'yi görün: `.../#/im?p=c1234567890`
   - Chat ID: `-1001234567890` (başına -100 ekleyin)

### Seçenek B: Kişisel Bildirimler

Kişisel Telegram ID'nizi öğrenmek için:

1. **[@userinfobot](https://t.me/userinfobot)** 'a `/start` gönderin
2. Bot size ID'nizi verecek: `123456789`

---

## 3️⃣ n8n'de Telegram Credential Oluşturma

### n8n'de Credential Ekleyin

1. n8n → **Settings** → **Credentials** → **New Credential**
2. **Telegram API** seçin
3. Ayarlar:
   ```
   Name: Telegram Bot
   Access Token: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   ```
4. **Save** tıklayın

### Test Edin

1. Test connection
2. Başarılı olursa: ✅ "Connection successful"

---

## 4️⃣ n8n Workflow'u Import Edin

### Workflow Import

1. n8n → **Workflows** → **Import from File**
2. `5-telegram-notifications.json` dosyasını seçin
3. **Save**

### Credential Atama

1. Workflow'daki Telegram node'larını açın:
   - "Telegram Gruba Gönder"
   - "Telegram Kişiye Gönder"
   - "Telegram Dosya Gönder"

2. Her birinde **Credential** dropdown'ından "Telegram Bot" seçin

### Environment Variables

n8n'de Settings → Variables:

```bash
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_GROUP_CHAT_ID=-1001234567890
TELEGRAM_ADMIN_CHAT_ID=123456789
```

### Workflow'u Aktif Edin

Sağ üstten **Active** toggle'ını ON yapın ✅

---

## 5️⃣ Projeye Webhook Entegrasyonu

### Environment Variables Ekleyin

`.env.local` dosyanıza:

```bash
# Telegram Configuration
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_GROUP_CHAT_ID=-1001234567890
TELEGRAM_ADMIN_CHAT_ID=123456789

# n8n Webhook
N8N_TELEGRAM_WEBHOOK_URL=https://vmi2876541.contaboserver.net/webhook/telegram-notify
N8N_WEBHOOK_SECRET=your-secure-random-string
```

### Webhook Route Oluşturun

```bash
mkdir -p src/app/api/webhooks/telegram-notify
cp n8n-workflows/webhooks/telegram-webhook.ts src/app/api/webhooks/telegram-notify/route.ts
```

### Convex'e Entegre Edin

**Bağış Bildirimi** - `convex/donations.ts`:

```typescript
export const create = mutation({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    const donationId = await ctx.db.insert('donations', args);
    const donation = await ctx.db.get(donationId);

    // 🆕 Telegram bildirimi
    if (process.env.NODE_ENV === 'production') {
      fetch('https://your-domain.com/api/webhooks/telegram-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'donation',
          title: 'Yeni Bağış Alındı! 💰',
          description: `${donation.donor_name} tarafından ${donation.amount} ${donation.currency} bağış yapıldı.`,
          details: {
            Bağışçı: donation.donor_name,
            Tutar: `${donation.amount} ${donation.currency}`,
            'Makbuz No': donation.receipt_number,
          },
          url: `https://panel.kafkasder.org/donations/${donation.receipt_number}`,
          recipient_type: 'group',
        }),
      }).catch(console.error);
    }

    return donationId;
  },
});
```

**Hata Bildirimi** - `convex/errors.ts`:

```typescript
export const log = mutation({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    const errorId = await ctx.db.insert('errors', args);
    const error = await ctx.db.get(errorId);

    // 🆕 Kritik hatalar için Telegram
    if (['critical', 'high'].includes(args.severity)) {
      fetch('https://your-domain.com/api/webhooks/telegram-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'error',
          title: `🚨 ${args.severity.toUpperCase()} HATA!`,
          description: args.title,
          details: {
            'Error Code': args.error_code,
            Kategori: args.category,
          },
          url: `https://panel.kafkasder.org/errors/${args.error_code}`,
          recipient_type: 'group',
        }),
      }).catch(console.error);
    }

    return errorId;
  },
});
```

---

## 6️⃣ Test Senaryoları

### Test 1: Genel Bildirim

```bash
curl -X POST http://localhost:3000/api/webhooks/telegram-notify \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret" \
  -d '{
    "type": "general",
    "title": "Test Bildirimi",
    "description": "Bu bir test mesajıdır.",
    "recipient_type": "group"
  }'
```

**Beklenen Sonuç:**

- ✅ Telegram grubunda mesaj görünmeli
- ✅ n8n Executions'da başarılı execution

### Test 2: Bağış Bildirimi

```bash
curl -X POST http://localhost:3000/api/webhooks/telegram-notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "donation",
    "title": "Yeni Bağış! 💰",
    "description": "Test Bağışçı - 1000 TL",
    "details": {
      "Bağışçı": "Test Bağışçı",
      "Tutar": "1000 TL",
      "Makbuz": "BGS-2025-0001"
    },
    "url": "https://panel.kafkasder.org/donations/BGS-2025-0001",
    "recipient_type": "group"
  }'
```

### Test 3: Kişisel Bildirim

```bash
curl -X POST http://localhost:3000/api/webhooks/telegram-notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "meeting",
    "title": "Toplantı Hatırlatması 📅",
    "description": "Yarın saat 14:00 yönetim kurulu toplantısı",
    "details": {
      "Tarih": "14 Ocak 2025, 14:00",
      "Yer": "Dernek Merkezi"
    },
    "recipient_type": "personal",
    "recipient_id": "123456789"
  }'
```

### Test 4: Dosya ile Bildirim

```typescript
// Projenizde
import fs from 'fs';

const pdfBuffer = fs.readFileSync('makbuz.pdf');

await fetch('/api/webhooks/telegram-notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'donation',
    title: 'Bağış Makbuzu 📄',
    description: 'Makbuzunuz ektedir.',
    recipient_type: 'personal',
    recipient_id: '123456789',
    has_attachment: true,
    attachment: {
      data: pdfBuffer.toString('base64'),
      filename: 'bagis_makbuzu.pdf',
      caption: 'Bağışınız için teşekkür ederiz!',
    },
  }),
});
```

---

## 7️⃣ Kullanım Örnekleri

### Örnek 1: Dashboard'da Test Butonu

```typescript
'use client';

export function TelegramTestButton() {
  const sendTest = async () => {
    await fetch('/api/webhooks/telegram-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'general',
        title: 'Test Mesajı',
        description: 'Dashboard test butonu',
        recipient_type: 'group',
      }),
    });
  };

  return <button onClick={sendTest}>Telegram Test</button>;
}
```

### Örnek 2: Otomatik Bağış Bildirimi

```typescript
// Bağış formu submit
async function handleDonationSubmit(data: DonationFormData) {
  // 1. Bağışı kaydet
  const donation = await createDonation(data);

  // 2. Telegram bildirimi
  await fetch('/api/webhooks/telegram-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'donation',
      title: 'Yeni Bağış Alındı! 💰',
      description: `${data.donor_name} - ${data.amount} ${data.currency}`,
      details: {
        Bağışçı: data.donor_name,
        Tutar: `${data.amount} ${data.currency}`,
        Tür: data.donation_type,
      },
      url: `https://panel.kafkasder.org/donations/${donation.receipt_number}`,
      recipient_type: 'group',
    }),
  });
}
```

### Örnek 3: Hata Yakalama

```typescript
// Global error handler
window.onerror = async (message, source, lineno, colno, error) => {
  await fetch('/api/webhooks/telegram-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'error',
      title: '🚨 Frontend Hatası',
      description: String(message),
      details: {
        Dosya: source?.split('/').pop(),
        Satır: lineno,
      },
      recipient_type: 'group',
    }),
  });
};
```

---

## 8️⃣ Telegram Bot Komutları (Opsiyonel)

Bot'a interaktif komutlar ekleyebilirsiniz:

### BotFather'da Komut Tanımlama

```bash
# BotFather'a gidin
/setcommands @kafkasder_panel_bot

# Komutları tanımlayın:
stats - Güncel istatistikleri göster
donations - Bugünkü bağışları listele
help - Yardım menüsü
```

### n8n'de Komut Handling

1. Telegram Trigger node ekleyin
2. Command'leri yakalayın
3. Response gönderin

---

## 9️⃣ Troubleshooting

### Problem: Bot mesaj gönderemiyor

**Çözüm:**

```bash
# 1. Bot token geçerli mi?
curl https://api.telegram.org/bot<TOKEN>/getMe

# 2. Bot grupta admin mi?
# Telegram grubu → Administrators → Bot admin olmalı

# 3. Chat ID doğru mu?
curl https://api.telegram.org/bot<TOKEN>/getUpdates
```

### Problem: Chat ID bulunamıyor

**Çözüm:**

```bash
# 1. Gruba bir mesaj gönderin
# 2. getUpdates ile kontrol edin:
curl https://api.telegram.org/bot<TOKEN>/getUpdates

# 3. Negative olduğundan emin olun
# Grup: -1001234567890
# Kanal: -1001234567890
# Kişi: 123456789 (pozitif)
```

### Problem: "Chat not found" hatası

**Çözüm:**

- Bot grupta/kanalda olmalı
- Bot'a mesaj gönderme yetkisi olmalı
- Chat ID doğru formatta olmalı (-100 prefix)

### Problem: Markdown parse hatası

**Çözüm:**

```typescript
// Özel karakterleri escape edin
const escapeMarkdown = (text: string) => {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
};
```

---

## 🔟 Gelişmiş Özellikler

### Inline Buttons

```json
{
  "type": "donation",
  "title": "Yeni Bağış",
  "description": "1000 TL",
  "recipient_type": "group",
  "inline_keyboard": [
    [
      { "text": "Detayları Gör", "url": "https://panel.kafkasder.org/..." },
      { "text": "Makbuzu İndir", "callback_data": "download_receipt" }
    ]
  ]
}
```

### Rich Formatting

```markdown
_Kalın metin_
_İtalik metin_
`Kod`
[Link](https://example.com)
```

### Polls (Anket)

```typescript
await fetch('/api/webhooks/telegram-notify', {
  method: 'POST',
  body: JSON.stringify({
    type: 'general',
    title: 'Toplantı Anketi',
    poll: {
      question: 'Hangi gün toplantı yapalım?',
      options: ['Pazartesi', 'Salı', 'Çarşamba'],
    },
    recipient_type: 'group',
  }),
});
```

---

## ✅ Başarı Kriterleri

Telegram entegrasyonu çalışıyor ise:

- ✅ Test mesajları gruba/kişiye ulaşıyor
- ✅ Bağış bildirimleri otomatik gidiyor
- ✅ Hata bildirimleri anında geliyor
- ✅ Dosya ekleri gönderiliyor
- ✅ Markdown formatı düzgün görünüyor
- ✅ n8n Executions'da başarılı execution'lar var

---

## 📚 Kaynaklar

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather Komutları](https://core.telegram.org/bots#6-botfather)
- [n8n Telegram Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.telegram/)
- [Markdown Formatting](https://core.telegram.org/bots/api#formatting-options)

---

## 🎉 Tebrikler!

Telegram bot'unuz hazır! Artık tüm önemli olaylardan Telegram üzerinden anlık haberdar olacaksınız.

**İyi çalışmalar!** 📱✨
