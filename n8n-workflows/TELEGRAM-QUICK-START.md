# Telegram Entegrasyonu - Hızlı Başlangıç

## 🚀 3 Dakikada Telegram ile Başlayın

### 1️⃣ Bot Oluştur (1 dk)

Telegram'da [@BotFather](https://t.me/botfather) ile konuşun:

```
/newbot
Bot adı: Kafkasder Panel Bot
Kullanıcı adı: kafkasder_panel_bot

✅ Token aldınız: 123456:ABC-DEF1234...
```

### 2️⃣ Grup Oluştur (1 dk)

1. Telegram'da **New Group**
2. İsim: "Kafkasder Bildirimleri"
3. Bot'u ekleyin: `@kafkasder_panel_bot`
4. Bot'u **admin** yapın

**Chat ID Öğrenin:**

```bash
curl https://api.telegram.org/bot<TOKEN>/getUpdates
```

Response'dan chat ID'yi kopyalayın: `-1001234567890`

### 3️⃣ n8n'e Ekle (1 dk)

1. n8n → Settings → Credentials → **New Credential**
2. **Telegram API** seçin
3. Token'ı yapıştırın
4. **Save**

5. Workflow import: `5-telegram-notifications.json`
6. Credential atayın
7. **Active** yapın ✅

---

## 📱 Test Et

```bash
curl -X POST http://localhost:3000/api/webhooks/telegram-notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "general",
    "title": "Test! 🚀",
    "description": "Telegram çalışıyor!",
    "recipient_type": "group"
  }'
```

✅ **Telegram grubunuzda mesajı görmelisiniz!**

---

## 💡 Neden Telegram?

### SMS (Twilio) vs Telegram

| Özellik             | SMS (Twilio)           | Telegram              |
| ------------------- | ---------------------- | --------------------- |
| **Maliyet**         | Ücretli (~0.05 TL/SMS) | **Ücretsiz** ✅       |
| **Mesaj Limiti**    | 160 karakter           | 4096 karakter         |
| **Dosya Gönderimi** | ❌ Yok                 | ✅ PDF, Excel, Resim  |
| **Zengin Format**   | ❌ Sadece text         | ✅ Markdown, Butonlar |
| **Hız**             | 3-5 saniye             | **Anında** (<1 sn)    |
| **Geçmiş**          | ❌ Yok                 | ✅ Mesaj geçmişi      |
| **Gruplar**         | ❌ Yok                 | ✅ Grup bildirimleri  |
| **İnteraktif**      | ❌ Yok                 | ✅ Butonlar, anketler |

**Sonuç:** Telegram çok daha güçlü ve ücretsiz! 🎉

---

## 📊 Örnek Bildirimler

### Bağış Bildirimi

```
💰 Yeni Bağış Alındı!

Ahmet Yılmaz tarafından 1000 TL bağış yapıldı.

📋 Detaylar:
• Bağışçı: Ahmet Yılmaz
• Tutar: 1000 TL
• Makbuz No: BGS-2025-0001

🔗 Detayları Görüntüle

⏰ 13 Ocak 2025 14:30
📱 Kafkasder Panel
```

### Hata Bildirimi

```
🚨 CRITICAL HATA!

Database bağlantısı koptu

📋 Detaylar:
• Error Code: ERR_DB_001
• Kategori: system

🔗 Hatayı Panel'de Görüntüle

⏰ 13 Ocak 2025 15:45
📱 Kafkasder Panel
```

### Toplantı Hatırlatması

```
📅 Toplantı Hatırlatması

Yönetim Kurulu Toplantısı

📋 Detaylar:
• Tarih: 14 Ocak 2025, 14:00
• Yer: Dernek Merkezi

Kalan: 24 saat

🔗 Detayları Görüntüle

⏰ 13 Ocak 2025 14:00
📱 Kafkasder Panel
```

---

## 🔗 Projeye Entegre Et

### Bağış Yapıldığında

```typescript
// convex/donations.ts
export const create = mutation({
  handler: async (ctx, args) => {
    const donation = await ctx.db.insert('donations', args);

    // 🆕 Telegram bildirimi
    fetch('/api/webhooks/telegram-notify', {
      method: 'POST',
      body: JSON.stringify({
        type: 'donation',
        title: 'Yeni Bağış! 💰',
        description: `${args.donor_name} - ${args.amount} TL`,
        recipient_type: 'group',
      }),
    });

    return donation;
  },
});
```

### Hata Oluştuğunda

```typescript
// Global error handler
window.onerror = (message) => {
  fetch('/api/webhooks/telegram-notify', {
    method: 'POST',
    body: JSON.stringify({
      type: 'error',
      title: '🚨 Frontend Hatası',
      description: String(message),
      recipient_type: 'group',
    }),
  });
};
```

---

## 🎯 Sonuç

✅ **5 workflow hazır:**

1. Kullanıcı Export
2. Bağış Makbuzu (Email + Telegram)
3. Toplantı Hatırlatma (SMS + Telegram)
4. Hata İzleme (Email + SMS + Telegram)
5. **Telegram Bildirimler** ⭐ YENİ!

✅ **Avantajlar:**

- Ücretsiz ve hızlı
- Zengin format (Markdown, butonlar)
- Dosya gönderimi
- Grup bildirimleri
- Mesaj geçmişi

✅ **Telegram, SMS'ten çok daha iyi!** 📱✨

---

## 📚 Detaylı Rehber

Daha fazla bilgi için:

- [TELEGRAM-SETUP.md](TELEGRAM-SETUP.md) - Komple kurulum rehberi
- [README.md](README.md) - Genel dokümantasyon

---

**Telegram ile bildirimleriniz artık hızlı, ücretsiz ve güçlü! 🚀**
