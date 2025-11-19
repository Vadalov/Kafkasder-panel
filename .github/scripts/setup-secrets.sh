#!/bin/bash

# GitHub Secrets Setup Script
# Bu script, GitHub CLI kullanarak secrets'ları ayarlamanıza yardımcı olur

set -e

echo "🔐 GitHub Secrets Setup Script"
echo "================================"
echo ""

# GitHub CLI kontrolü
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) bulunamadı!"
    echo "📥 Kurulum: https://cli.github.com/"
    exit 1
fi

# Login kontrolü
if ! gh auth status &> /dev/null; then
    echo "🔑 GitHub'a login olun..."
    gh auth login
fi

echo "✅ GitHub CLI hazır"
echo ""

# Repository bilgisi
REPO="Vadalov/Kafkasder-panel"
echo "📦 Repository: $REPO"
echo ""

# Secrets listesi
declare -A SECRETS=(
    ["CONVEX_DEPLOY_KEY"]="Convex deployment key (Convex Dashboard → Settings → Deploy Keys)"
    ["NEXT_PUBLIC_CONVEX_URL"]="Convex production URL (https://your-project.convex.cloud)"
    ["SENTRY_DSN"]="Sentry DSN (https://xxx@sentry.io/xxx)"
    ["SENTRY_ORG"]="Sentry organization name"
    ["SENTRY_PROJECT"]="Sentry project name"
    ["PRODUCTION_URL"]="Production URL (https://your-app.vercel.app)"
)

# Zorunlu secrets
REQUIRED=("CONVEX_DEPLOY_KEY" "NEXT_PUBLIC_CONVEX_URL")

echo "📋 Secrets Listesi:"
echo "-------------------"
for secret in "${!SECRETS[@]}"; do
    required_mark=""
    if [[ " ${REQUIRED[@]} " =~ " ${secret} " ]]; then
        required_mark=" [ZORUNLU]"
    fi
    echo "  • $secret$required_mark"
    echo "    ${SECRETS[$secret]}"
    echo ""
done

echo ""
read -p "Devam etmek istiyor musunuz? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ İptal edildi"
    exit 1
fi

# Her secret için değer iste
for secret in "${!SECRETS[@]}"; do
    echo ""
    echo "🔑 $secret"
    echo "   ${SECRETS[$secret]}"
    
    # Mevcut secret kontrolü
    if gh secret list --repo "$REPO" | grep -q "^$secret"; then
        echo "   ⚠️  Mevcut secret var. Güncellemek ister misiniz?"
        read -p "   Güncelle? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "   ⏭️  Atlandı"
            continue
        fi
    fi
    
    # Secret değeri iste
    read -sp "   Değer: " secret_value
    echo ""
    
    if [ -z "$secret_value" ]; then
        if [[ " ${REQUIRED[@]} " =~ " ${secret} " ]]; then
            echo "   ❌ Zorunlu secret boş olamaz!"
            exit 1
        else
            echo "   ⏭️  Boş değer, atlandı"
            continue
        fi
    fi
    
    # Secret'ı ekle
    echo "$secret_value" | gh secret set "$secret" --repo "$REPO"
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Secret eklendi/güncellendi"
    else
        echo "   ❌ Secret eklenirken hata oluştu!"
        exit 1
    fi
done

echo ""
echo "✅ Tüm secrets ayarlandı!"
echo ""
echo "📋 Mevcut secrets:"
gh secret list --repo "$REPO"

