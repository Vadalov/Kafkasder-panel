# Repository Setup Recommendations

Bu dosya, repository için yapılması önerilen ek ayarları içerir.

## ✅ Tamamlanan İyileştirmeler

1. ✅ Gereksiz GitHub Actions workflow'ları silindi (5 adet)
2. ✅ Workflow'lar optimize edildi
3. ✅ `.editorconfig` eklendi (kod formatı tutarlılığı)
4. ✅ `CONTRIBUTING.md` eklendi (katkıda bulunma rehberi)

## 🔧 Yapılması Önerilen Ayarlar

### 1. Environment Variables Template

**Durum:** `.env.example` dosyası oluşturulmalı

**Neden:** Yeni geliştiricilerin hangi environment variable'ları ayarlaması gerektiğini bilmesi için.

**Nasıl:**
```bash
# .env.example dosyasını manuel olarak oluşturun
# veya .gitignore'dan .env.example'ı çıkarın
```

**İçerik:** `src/lib/env-validation.ts` dosyasına bakarak tüm environment variable'ları listeleyin.

### 2. Husky Pre-commit Hooks

**Durum:** Husky kurulu ama hooks yok

**Neden:** Commit öncesi otomatik lint ve format kontrolü için.

**Nasıl:**
```bash
# Husky'yi initialize et
npx husky init

# Pre-commit hook oluştur
npx husky add .husky/pre-commit "npm run lint-staged"
```

**Önerilen hook içeriği (`.husky/pre-commit`):**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint-staged
```

### 3. GitHub Branch Protection Rules

**Durum:** Manuel olarak GitHub'da ayarlanmalı

**Neden:** `main` branch'ini korumak ve yanlışlıkla direkt push'u önlemek için.

**Ayarlar (GitHub Settings → Branches → Add rule):**

1. **Branch name pattern:** `main`
2. **Protect matching branches:**
   - ✅ Require a pull request before merging
     - Require approvals: 1
     - Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
     - Required checks: `CI Pipeline`, `lint`, `typecheck`, `test`
   - ✅ Require conversation resolution before merging
   - ✅ Require linear history
   - ✅ Include administrators
   - ✅ Restrict who can push to matching branches: (sadece belirli kişiler)

### 4. GitHub Repository Settings

**Settings → General:**

- ✅ **Features:**
  - Issues: Enabled
  - Projects: Enabled (opsiyonel)
  - Wiki: Disabled (README yeterli)
  - Discussions: Enabled (opsiyonel)

- ✅ **Pull Requests:**
  - Allow merge commits: Disabled
  - Allow squash merging: Enabled ✅
  - Allow rebase merging: Disabled
  - Automatically delete head branches: Enabled ✅

**Settings → Security:**

- ✅ **Code security and analysis:**
  - Dependency graph: Enabled ✅
  - Dependabot alerts: Enabled ✅
  - Dependabot security updates: Enabled ✅
  - Code scanning: Enabled (opsiyonel, GitHub Advanced Security gerekir)

### 5. GitHub Actions Permissions

**Settings → Actions → General:**

- ✅ **Workflow permissions:**
  - Read and write permissions: Selected
  - Allow GitHub Actions to create and approve pull requests: Enabled (auto-merge için)

### 6. Pre-commit Hooks (Husky)

**Kurulum:**
```bash
# Husky zaten package.json'da var, sadece hooks ekleyin
npx husky init

# Pre-commit hook
echo "npm run lint-staged" > .husky/pre-commit
chmod +x .husky/pre-commit

# Pre-push hook (opsiyonel)
echo "npm run test:run && npm run typecheck" > .husky/pre-push
chmod +x .husky/pre-push
```

**Not:** Windows'ta `chmod` çalışmayabilir, Git Bash kullanın.

### 7. GitHub Labels

**Önerilen label'lar:**

**Type:**
- `type:bug` - Bug fix
- `type:feature` - New feature
- `type:docs` - Documentation
- `type:refactor` - Code refactoring

**Priority:**
- `priority:high` - High priority
- `priority:medium` - Medium priority
- `priority:low` - Low priority

**Status:**
- `status:blocked` - Blocked
- `status:in-progress` - In progress
- `status:ready-for-review` - Ready for review

**Size:**
- `size/xs` - Extra small (<10 lines)
- `size/s` - Small (<100 lines)
- `size/m` - Medium (<500 lines)
- `size/l` - Large (<1000 lines)
- `size/xl` - Extra large (>1000 lines)

### 8. GitHub Issue Templates

**Oluşturulması önerilen template'ler:**

`.github/ISSUE_TEMPLATE/bug_report.md`
`.github/ISSUE_TEMPLATE/feature_request.md`

### 9. GitHub PR Template

**Oluşturulması önerilen:**

`.github/pull_request_template.md`

### 10. Code Owners

**Oluşturulması önerilen:**

`.github/CODEOWNERS`

```
# Global owners
* @Vadalov

# Specific paths
/.github/ @Vadalov
/src/lib/security/ @Vadalov
/convex/ @Vadalov
```

## 📝 Öncelik Sırası

### Yüksek Öncelik (Hemen Yapılmalı)
1. ✅ `.editorconfig` - Tamamlandı
2. ✅ `CONTRIBUTING.md` - Tamamlandı
3. 🔲 `.env.example` - Manuel oluşturulmalı
4. 🔲 Husky pre-commit hooks - Kurulum gerekli
5. 🔲 GitHub branch protection - Manuel ayar gerekli

### Orta Öncelik (Yakında Yapılmalı)
6. GitHub repository settings
7. GitHub labels
8. Issue/PR templates

### Düşük Öncelik (İsteğe Bağlı)
9. CODEOWNERS
10. Pre-push hooks

## 🚀 Hızlı Başlangıç

Tüm önerilen ayarları yapmak için:

```bash
# 1. Husky hooks kurulumu
npx husky init
echo "npm run lint-staged" > .husky/pre-commit

# 2. GitHub'da manuel ayarlar:
# - Settings → Branches → Branch protection rules
# - Settings → Actions → Workflow permissions
# - Settings → General → Pull request settings
```

## 📚 Referanslar

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Son Güncelleme:** 2025-11-19

