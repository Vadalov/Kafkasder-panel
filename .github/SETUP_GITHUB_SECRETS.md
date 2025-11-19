# GitHub Secrets Setup Guide

Bu rehber, GitHub Actions için gerekli secrets'ları nasıl ayarlayacağınızı gösterir.

## 🔐 Gerekli GitHub Secrets

GitHub Actions workflow'ları için aşağıdaki secrets'ları ayarlamanız gerekir:

### Zorunlu Secrets

1. **CONVEX_DEPLOY_KEY**
   - Convex deployment key
   - Convex Dashboard → Settings → Deploy Keys
   - Production deployment için kullanılır

2. **NEXT_PUBLIC_CONVEX_URL**
   - Convex production deployment URL
   - Format: `https://your-project.convex.cloud`
   - Build sırasında kullanılır

### Önerilen Secrets

3. **SENTRY_DSN**
   - Sentry error tracking DSN (server-side)
   - Format: `https://xxx@sentry.io/xxx`

4. **SENTRY_ORG**
   - Sentry organization name

5. **SENTRY_PROJECT**
   - Sentry project name

6. **PRODUCTION_URL**
   - Production deployment URL
   - Health check için kullanılır
   - Format: `https://your-app.vercel.app`

## 📝 GitHub Secrets Ekleme Adımları

### Yöntem 1: GitHub Web Interface

1. **Repository'ye gidin:**
   ```
   https://github.com/Vadalov/Kafkasder-panel/settings/secrets/actions
   ```

2. **"New repository secret" butonuna tıklayın**

3. **Her secret için:**
   - **Name:** Secret adı (örn: `CONVEX_DEPLOY_KEY`)
   - **Secret:** Değer
   - **"Add secret" butonuna tıklayın**

4. **Tüm secrets eklendikten sonra:**
   - Secrets listesinde görünecektir
   - Workflow'lar otomatik olarak kullanabilecektir

### Yöntem 2: GitHub CLI

```bash
# GitHub CLI kurulumu
# https://cli.github.com/

# Login
gh auth login

# Secret ekleme
gh secret set CONVEX_DEPLOY_KEY --body "your-deploy-key"
gh secret set NEXT_PUBLIC_CONVEX_URL --body "https://your-project.convex.cloud"
gh secret set SENTRY_DSN --body "https://xxx@sentry.io/xxx"
gh secret set SENTRY_ORG --body "your-org"
gh secret set SENTRY_PROJECT --body "kafkasder-panel"
gh secret set PRODUCTION_URL --body "https://your-app.vercel.app"

# Secret listesi
gh secret list
```

## 🔍 Secrets Kullanımı

Workflow dosyalarında secrets şu şekilde kullanılır:

```yaml
env:
  CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
  NEXT_PUBLIC_CONVEX_URL: ${{ secrets.NEXT_PUBLIC_CONVEX_URL }}
```

## ✅ Kontrol Listesi

- [ ] `CONVEX_DEPLOY_KEY` eklendi
- [ ] `NEXT_PUBLIC_CONVEX_URL` eklendi (production URL)
- [ ] `SENTRY_DSN` eklendi (opsiyonel)
- [ ] `SENTRY_ORG` eklendi (opsiyonel)
- [ ] `SENTRY_PROJECT` eklendi (opsiyonel)
- [ ] `PRODUCTION_URL` eklendi (opsiyonel)

## 🚨 Güvenlik Notları

- ⚠️ Secrets asla commit edilmemeli
- ⚠️ Secrets sadece GitHub repository settings'den yönetilmeli
- ⚠️ Secrets değerleri loglarda görünmez
- ⚠️ Secrets sadece workflow çalışırken erişilebilir

## 📚 İlgili Dokümantasyon

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel Deployment Guide](../VERCEL_DEPLOYMENT.md)

---

**Not:** Vercel environment variables GitHub secrets'tan farklıdır ve Vercel Dashboard'dan ayarlanmalıdır.
