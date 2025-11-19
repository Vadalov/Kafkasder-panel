#!/bin/bash

# GitHub Secrets Kontrol Script
# Bu script, gerekli secrets'ların ayarlı olup olmadığını kontrol eder

set -e

echo "🔍 GitHub Secrets Kontrol"
echo "========================="
echo ""

# GitHub CLI kontrolü
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) bulunamadı!"
    echo "📥 Kurulum: https://cli.github.com/"
    exit 1
fi

# Login kontrolü
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub'a login olun: gh auth login"
    exit 1
fi

REPO="Vadalov/Kafkasder-panel"

# Zorunlu secrets
REQUIRED=("CONVEX_DEPLOY_KEY" "NEXT_PUBLIC_CONVEX_URL")

# Önerilen secrets
RECOMMENDED=("SENTRY_DSN" "SENTRY_ORG" "SENTRY_PROJECT" "PRODUCTION_URL")

echo "📦 Repository: $REPO"
echo ""

# Mevcut secrets'ları al
EXISTING_SECRETS=$(gh secret list --repo "$REPO" | awk '{print $1}')

echo "🔐 Mevcut Secrets:"
echo "------------------"

# Zorunlu secrets kontrolü
MISSING_REQUIRED=()
for secret in "${REQUIRED[@]}"; do
    if echo "$EXISTING_SECRETS" | grep -q "^$secret$"; then
        echo "  ✅ $secret (ZORUNLU)"
    else
        echo "  ❌ $secret (ZORUNLU) - EKSİK!"
        MISSING_REQUIRED+=("$secret")
    fi
done

echo ""

# Önerilen secrets kontrolü
MISSING_RECOMMENDED=()
for secret in "${RECOMMENDED[@]}"; do
    if echo "$EXISTING_SECRETS" | grep -q "^$secret$"; then
        echo "  ✅ $secret (Önerilen)"
    else
        echo "  ⚠️  $secret (Önerilen) - Eksik"
        MISSING_RECOMMENDED+=("$secret")
    fi
done

echo ""

# Sonuç
if [ ${#MISSING_REQUIRED[@]} -eq 0 ]; then
    echo "✅ Tüm zorunlu secrets ayarlı!"
    
    if [ ${#MISSING_RECOMMENDED[@]} -gt 0 ]; then
        echo "⚠️  Önerilen secrets eksik: ${MISSING_RECOMMENDED[*]}"
        echo "   Bu secrets opsiyoneldir ama önerilir."
    else
        echo "✅ Tüm önerilen secrets da ayarlı!"
    fi
    
    exit 0
else
    echo "❌ Eksik zorunlu secrets: ${MISSING_REQUIRED[*]}"
    echo ""
    echo "📝 Secrets eklemek için:"
    echo "   1. GitHub Web: https://github.com/$REPO/settings/secrets/actions"
    echo "   2. GitHub CLI: .github/scripts/setup-secrets.sh"
    exit 1
fi

