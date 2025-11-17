# 🚀 Sistem Ayarları Modülü - Kurulum ve Kullanım Rehberi

## 📋 İÇİNDEKİLER

1. [Kurulum Adımları](#kurulum-adımları)
2. [Seed Data Yükleme](#seed-data-yükleme)
3. [Sayfalar ve Özellikler](#sayfalar-ve-özellikler)
4. [Test Senaryoları](#test-senaryoları)
5. [Sorun Giderme](#sorun-giderme)

---

## 🔧 KURULUM ADIMLARI

### 1. Dependencies Kurulumu

```bash
npm install
# veya
yarn install
```

### 2. Convex Setup

```bash
# Convex dev server'ı başlat (yeni bir terminal'de)
npx convex dev

# İlk kez çalıştırıyorsanız:
# 1. Login olmanız istenecek
# 2. Project seçmeniz gerekecek
# 3. Deployment seçmeniz gerekecek
```

Bu komut:

- ✅ API type'larını generate edecek
- ✅ Schema değişikliklerini deploy edecek
- ✅ Real-time sync'i aktif edecek

### 3. Next.js Dev Server

```bash
# Yeni bir terminal'de
npm run dev
```

---

## 🌱 SEED DATA YÜKLEME

### Convex Dashboard Üzerinden (Önerilen)

1. **Convex Dashboard'a git**: https://dashboard.convex.dev
2. **Projenizi seçin**
3. **"Functions" sekmesine gidin**
4. **Aşağıdaki mutation'ları sırayla çalıştırın:**

#### a) Tema Presetlerini Yükle

```javascript
// Function: seedThemes.seedDefaultThemes
// Args: {} (boş object)
// Sonuç: 5 tema oluşturulacak
```

**Oluşturulacak Temalar:**

- 🔵 Kafkasder Blue (Varsayılan)
- 🟢 Ocean Green
- 🟠 Sunset Orange
- ⚫ Professional Gray
- ⚪ Minimal Black & White

#### b) Branding Varsayılanlarını Yükle

```javascript
// Function: branding.seedDefaultBranding
// Args: {} (boş object)
// Sonuç: 7 ayar oluşturulacak
```

**Oluşturulacak Ayarlar:**

- organizationName: "Kafkasder"
- slogan: "Yardımlaşma ve Dayanışma Derneği"
- footerText: "© 2024 Kafkasder. Tüm hakları saklıdır."
- contactEmail: "info@kafkasder.org"
- contactPhone: "+90 XXX XXX XX XX"
- address: "İstanbul, Türkiye"
- website: "https://kafkasder.org"

#### c) İletişim Ayarlarını Yükle

```javascript
// Function: communication.seedDefaultCommunication
// Args: {} (boş object)
// Sonuç: 20+ ayar oluşturulacak
```

**Oluşturulacak Ayarlar:**

- Email/SMTP: Gmail defaults (smtp.gmail.com:587)
- SMS/Twilio: Boş template (credentials girilmeli)
- WhatsApp: Boş template (API keys girilmeli)

#### d) Güvenlik Politikalarını Yükle

```javascript
// Function: security.seedDefaultSecurity
// Args: {} (boş object)
// Sonuç: 25+ ayar oluşturulacak
```

**Oluşturulacak Ayarlar:**

- Password: Min 8 karakter, tüm gereksinimler, 90 gün expiry
- Session: 120 dakika timeout, 3 concurrent session
- 2FA: Disabled by default
- General: Audit log, rate limiting, CSRF enabled

### Manuel Seed (Terminal'den)

```bash
# Convex console üzerinden manuel çalıştırma
npx convex run seedThemes:seedDefaultThemes
npx convex run branding:seedDefaultBranding
npx convex run communication:seedDefaultCommunication
npx convex run security:seedDefaultSecurity
```

---

## 📄 SAYFALAR VE ÖZELLİKLER

### 1. Ana Dashboard - `/ayarlar`

**Erişim:** Admin (MODULE_PERMISSIONS.SETTINGS)

**Özellikler:**

- 📊 4 istatistik kartı (tema, kanal, güvenlik, ayar sayısı)
- 🎯 5 kategori kartı (tıklanabilir)
- ℹ️ Bilgilendirme kartları
- 📖 Yardım ve dokümantasyon

**Navigation:**

- Sidebar → Sistem Ayarları → Genel Ayarlar

---

### 2. Tema Ayarları - `/ayarlar/tema`

**Erişim:** Admin (MODULE_PERMISSIONS.SETTINGS)

**Özellikler:**

- 🌓 **Mod Seçimi:** Light / Dark / Auto
  - System preference detection
  - LocalStorage persistence
- 🎨 **Hazır Temalar:** 5 preset
  - Renk önizleme
  - Tek tıkla uygulama
- 🖌️ **Özel Renkler:** 6 color picker
  - Primary, Secondary, Accent
  - Success, Warning, Error
  - Live preview

**Navigation:**

- Sidebar → Sistem Ayarları → Tema Ayarları

**Test:**

```
1. Light/Dark/Auto mode değiştir → Tema anında değişmeli
2. Preset tema seç → Renkler anında uygulanmalı
3. Özel renk seç → Preview güncellemeli (kaydetme TODO)
4. Sayfayı yenile → Tema tercihi hatırlanmalı (LocalStorage)
```

---

### 3. Marka ve Organizasyon - `/ayarlar/marka`

**Erişim:** Admin (MODULE_PERMISSIONS.SETTINGS)

**Özellikler:**

- 🖼️ **Logo Yönetimi:** 4 tip
  - Ana Logo (light theme)
  - Koyu Logo (dark theme)
  - Favicon (browser icon)
  - Email Logo (email templates)
- 🏢 **Organizasyon Bilgileri:**
  - İsim, slogan, footer
  - Email, telefon, adres, website
- 📋 **Canlı Önizleme:** Değişiklikleri göster

**Navigation:**

- Sidebar → Sistem Ayarları → Marka ve Organizasyon

**Test:**

```
1. Logo yükle (PNG/JPG/SVG, max 5MB) → Önizleme görünmeli
2. Organizasyon bilgilerini düzenle → Önizleme güncellemeli
3. Kaydet → Toast success mesajı
4. Sayfayı yenile → Değişiklikler kalmalı
5. Logo sil → Önizleme boş olmalı
```

**Not:** Logo şu an base64 olarak saklanıyor. Production'da Convex File Storage kullanılmalı.

---

### 4. İletişim Ayarları - `/ayarlar/iletisim`

**Erişim:** Admin (MODULE_PERMISSIONS.SETTINGS)

**Özellikler:**

- 📧 **Email/SMTP:**
  - Host, port, user, password
  - TLS/SSL switch
  - From email/name, Reply-to
  - Enable/disable switch
- 📱 **SMS/Twilio:**
  - Account SID, Auth Token
  - Phone number, Messaging Service SID
  - Test mode switch
- 💬 **WhatsApp Business API:**
  - Phone Number ID, Access Token
  - Business Account ID, Webhook Token
  - Test mode switch

**Navigation:**

- Sidebar → Sistem Ayarları → İletişim Ayarları

**Test:**

```
1. Email SMTP bilgilerini gir → Kaydet
2. SMS Twilio credentials gir → Kaydet
3. WhatsApp API keys gir → Kaydet
4. Test mode enable et → Kaydet
5. Test gönderim butonu (TODO - şu an toast gösterir)
```

**Güvenlik:**

- Hassas alanlar şifreli saklanıyor (is_encrypted: true)
- Passwords, tokens, SID'ler şifreli

---

### 5. Güvenlik Ayarları - `/ayarlar/guvenlik`

**Erişim:** ⚠️ SUPER ADMIN ONLY (SPECIAL_PERMISSIONS.USERS_MANAGE)

**Özellikler:**

- 🔐 **Şifre Politikası:**
  - Min uzunluk (4-32)
  - Büyük/küçük harf, rakam, özel karakter
  - Geçerlilik süresi (0=sınırsız)
  - Geçmiş şifre kontrolü
  - Lockout ayarları
- ⏱️ **Oturum Yönetimi:**
  - Timeout (5-1440 dakika)
  - Max concurrent sessions
  - Remember me duration
  - Re-auth for sensitive ops
  - Session monitoring
- 🔑 **2FA:**
  - Enable/disable
  - Required for all users
  - Grace period
  - Methods: TOTP, SMS, Email
- 🛡️ **Genel Güvenlik:**
  - Audit log
  - IP whitelist
  - Rate limiting
  - Brute force protection
  - CSRF protection
  - Security email alerts
  - Suspicious activity threshold

**Navigation:**

- Sidebar → Sistem Ayarları → Güvenlik Ayarları

**Test:**

```
1. Super admin ile giriş yap → Sayfa açılmalı
2. Normal admin ile dene → 403 Forbidden
3. Şifre politikası değiştir → Kaydet
4. Oturum timeout ayarla → Kaydet
5. 2FA enable et → Kaydet (uygulanması TODO)
```

**⚠️ Önemli:**

- Sadece Super Admin erişebilir
- Değişiklikler tüm kullanıcıları etkiler
- Test ortamında test edin!

---

### 6. Parametreler - `/ayarlar/parametreler`

**Erişim:** Admin (MODULE_PERMISSIONS.SETTINGS)

**Özellikler:**

- Mevcut sistem parametreleri
- Kategori bazlı yönetim
- Aktif/Pasif durum kontrolü

**Navigation:**

- Sidebar → Sistem Ayarları → Parametreler

---

## 🧪 TEST SENARYOLARI

### Temel Fonksiyonellik Testi

```bash
✅ 1. Sidebar'dan "Sistem Ayarları"na tıkla
   → Alt menü açılmalı (6 link)

✅ 2. Ana sayfaya git (/ayarlar)
   → 4 stat card, 5 kategori kartı görünmeli

✅ 3. Her kategori kartına tıkla
   → İlgili sayfaya yönlendirilmeli

✅ 4. Tema değiştir
   → Renkler anında değişmeli
   → LocalStorage'da saklanmalı

✅ 5. Logo yükle
   → Önizleme görünmeli
   → Kaydet → Success toast

✅ 6. İletişim ayarları kaydet
   → Success toast
   → Veritabanında görünmeli

✅ 7. Güvenlik ayarları (Super Admin)
   → Normal admin 403 almalı
   → Super admin erişebilmeli
```

### Permission Testi

```bash
✅ 1. Admin kullanıcı:
   - Tema, Marka, İletişim, Parametreler → ✅ Erişebilir
   - Güvenlik → ❌ 403 Forbidden

✅ 2. Super Admin kullanıcı:
   - Tüm sayfalara → ✅ Erişebilir

✅ 3. Normal kullanıcı:
   - Sistem Ayarları menüsü → ❌ Görünmemeli
```

### Real-time Sync Testi

```bash
✅ 1. İki tarayıcı aç (aynı kullanıcı)
✅ 2. Birinde tema değiştir
✅ 3. Diğerinde → Anında güncellenmeli (Convex sync)
```

### LocalStorage Testi

```bash
✅ 1. Tema mod seç (light/dark/auto)
✅ 2. Preset tema seç
✅ 3. Tarayıcıyı kapat
✅ 4. Tekrar aç
✅ 5. Tercihler hatırlanmalı
```

---

## 🔍 SORUN GİDERME

### Problem: TypeScript hataları var

**Çözüm:**

```bash
# Convex dev çalıştır (API type generation)
npx convex dev

# veya API type'ları manuel güncelledim
# (convex/_generated/api.d.ts)
```

### Problem: "api.settings is undefined"

**Çözüm:**

```bash
# Convex dev server çalıştırılmış mı kontrol et
npx convex dev

# Schema push edilmiş mi kontrol et
# Convex dashboard → Data → Tables
# system_settings ve theme_presets olmalı
```

### Problem: Tema değişmiyor

**Çözüm:**

```bash
# 1. theme-variables.css import edilmiş mi?
#    globals.css'de @import '../styles/theme-variables.css';

# 2. SettingsProvider sarmalanmış mı?
#    src/app/providers.tsx kontrol et

# 3. LocalStorage temizle
localStorage.clear()
```

### Problem: Logo upload çalışmıyor

**Çözüm:**

```bash
# 1. Dosya boyutu kontrol et (max 5MB)
# 2. Dosya tipi kontrol et (PNG, JPG, WEBP, SVG)
# 3. Browser console'da hata var mı kontrol et
# 4. Network tab'de API request başarılı mı kontrol et

# Not: Şu an base64 kullanıyor
# Production'da Convex File Storage gerekecek
```

### Problem: Güvenlik sayfası 403 veriyor

**Çözüm:**

```bash
# Kullanıcı rolü kontrol et
# Sadece Super Admin erişebilir

# Database'de user role kontrol:
# role: 'SUPER_ADMIN' olmalı (büyük harf)
```

---

## 📊 VERİTABANI YAPISI

### system_settings Table

```typescript
{
  category: string;      // 'theme', 'branding', 'email', 'sms', 'whatsapp', 'security'
  key: string;           // Setting key
  value: any;            // Setting value (string, number, boolean, object)
  label?: string;        // Human-readable label
  description?: string;  // Description
  is_public: boolean;    // Public visible
  is_encrypted: boolean; // Encrypted storage (passwords, tokens)
  data_type: string;     // 'string', 'number', 'boolean', 'json', 'array'
  default_value?: any;   // Default value for reset
  updated_by?: string;   // User ID
  updated_at: number;    // Timestamp
  version?: number;      // Version for rollback
}
```

### theme_presets Table

```typescript
{
  name: string;
  description?: string;
  colors: {
    primary: string;
    primary_hover?: string;
    // ... 20+ color fields
  };
  typography?: {
    font_family?: string;
    base_size?: number;
    // ...
  };
  layout?: {
    sidebar_width?: number;
    // ...
  };
  is_default?: boolean;
  is_custom?: boolean;
  created_at: number;
}
```

---

## 🚀 PRODUCTION HAZIRLIĞI

### Yapılacaklar (TODO)

- [ ] **Logo Upload:** Base64 → Convex File Storage migration
- [ ] **Test Email:** SMTP test email gönderim fonksiyonu
- [ ] **Test SMS:** Twilio test SMS fonksiyonu
- [ ] **Test WhatsApp:** WhatsApp test mesaj fonksiyonu
- [ ] **2FA Implementation:** Tam 2FA kurulumu (TOTP generation, verification)
- [ ] **IP Whitelist UI:** IP whitelist yönetim sayfası
- [ ] **Custom Theme Save:** Özel tema kaydetme (şu an TODO)
- [ ] **Audit Log UI:** Değişiklikleri görüntüleme sayfası
- [ ] **Performance Monitoring:** Settings page analytics

### Güvenlik Kontrolleri

- ✅ Admin-only mutations
- ✅ Super Admin-only security page
- ✅ Rate limiting on all API endpoints
- ✅ Encrypted storage for sensitive data
- ✅ Input validation
- ✅ CORS protection
- ⚠️ Add CSRF tokens (if not already)
- ⚠️ Add request signing
- ⚠️ Add IP whitelist enforcement

### Performans İyileştirmeleri

- ✅ React Query caching
- ✅ Optimistic updates
- ✅ Lazy loading (tab-based)
- ⚠️ Add service worker for offline support
- ⚠️ Add image optimization for logos
- ⚠️ Add CDN for static assets

---

## 📞 DESTEK

Sorun yaşarsanız:

1. **Loglara bakın:**

   ```bash
   # Browser console
   # Convex dashboard logs
   # Next.js dev server logs
   ```

2. **Veritabanını kontrol edin:**
   - Convex dashboard → Data
   - system_settings tablosunda data var mı?
   - theme_presets tablosunda 5 tema var mı?

3. **GitHub issue açın:**
   - Branch: `claude/cleanup-duplicate-code-012Sm572Y76jVEQ6GNaS8aUD`
   - Detaylı açıklama ile

---

## ✅ BAŞARIYLA KURULDU!

Eğer bu adımları tamamladıysanız, sistem tamamen çalışır durumda!

🎉 **Tebrikler! Sistem Ayarları modülü hazır!**
