# Auto-Merge Workflow Kullanım Kılavuzu

Bu workflow, belirli koşullarda Pull Request'lerin otomatik olarak `main` branch'e merge edilmesini sağlar.

## Nasıl Çalışır?

### Otomatik Merge Koşulları

PR otomatik olarak merge edilir eğer:

1. **Label Kontrolü**: PR'da `auto-merge` veya `claude` label'ı varsa
2. **Yazar Kontrolü**: PR'ı `Vadalov` kullanıcısı açtıysa
3. **Başlık Kontrolü**: PR başlığında "claude" kelimesi geçiyorsa

### Merge Öncesi Kontroller

PR merge edilmeden önce şunlar kontrol edilir:

- ✅ Tüm CI kontrolleri başarılı olmalı
- ✅ PR mergeable durumda olmalı (conflict yok)
- ✅ PR açık (open) durumda olmalı
- ✅ Kritik kontroller (build, test, lint, typecheck) başarılı olmalı

### Merge Yöntemi

PR'lar **squash merge** yöntemiyle merge edilir:
- Commit başlığı: `PR Başlığı (#PR_NUMARASI)`
- Commit mesajı: `Auto-merged by GitHub Actions`

## Kullanım

### Yöntem 1: Label Ekleme

PR açtıktan sonra `auto-merge` veya `claude` label'ını ekleyin:

```bash
# GitHub UI'dan label ekleyin veya:
gh pr edit <PR_NUMARASI> --add-label "auto-merge"
```

### Yöntem 2: PR Başlığına "claude" Ekleme

PR başlığında "claude" kelimesi geçerse otomatik merge aktif olur:

```
feat: Claude ile yeni özellik eklendi
fix: Claude tarafından düzeltme yapıldı
```

### Yöntem 3: Vadalov Kullanıcısı Olarak PR Açma

`Vadalov` kullanıcısı olarak açılan tüm PR'lar otomatik merge için uygun olur.

## Güvenlik

- ⚠️ Sadece `main` branch'e açılan PR'lar için çalışır
- ⚠️ Draft PR'lar merge edilmez
- ⚠️ Tüm CI kontrolleri başarılı olmalı
- ⚠️ Conflict olan PR'lar merge edilmez

## İptal Etme

Otomatik merge'ü iptal etmek için:

1. `auto-merge` veya `claude` label'ını kaldırın
2. PR başlığından "claude" kelimesini çıkarın

## Loglar ve Hata Ayıklama

Workflow çalıştığında:
- GitHub Actions sekmesinden logları görüntüleyebilirsiniz
- PR'a otomatik yorum eklenir (merge edildiğinde)
- Hata durumunda detaylı hata mesajları gösterilir

## Örnek Kullanım

```bash
# 1. Değişiklikleri yapın
git checkout -b feature/claude-update
git add .
git commit -m "feat: Claude ile güncelleme yapıldı"
git push origin feature/claude-update

# 2. PR açın (GitHub UI veya CLI)
gh pr create --title "feat: Claude ile güncelleme yapıldı" --body "..."

# 3. Label ekleyin (opsiyonel - başlıkta "claude" varsa gerekmez)
gh pr edit <PR_NUMARASI> --add-label "auto-merge"

# 4. CI kontrolleri tamamlandığında otomatik merge edilir! 🎉
```

## Notlar

- Workflow her PR güncellemesinde çalışır
- CI kontrolleri tamamlanana kadar bekler (maksimum süre yok)
- Merge edildikten sonra PR'a bilgilendirme yorumu eklenir

