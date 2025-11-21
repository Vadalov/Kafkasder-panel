#!/bin/bash

# ===================================
# Vercel Environment Variables Setup Script
# ===================================
# Bu script, .env.production dosyasındaki değişkenleri
# otomatik olarak Vercel'e ekler.
#
# KULLANIM:
# 1. .env.vercel.template dosyasını .env.production olarak kopyalayın
# 2. .env.production dosyasını gerçek değerlerle doldurun
# 3. Bu script'i çalıştırın: bash scripts/setup-vercel-env.sh
#
# GEREKSINIMLER:
# - Vercel CLI kurulu olmalı (npm install -g vercel)
# - vercel login yapılmış olmalı
# ===================================

set -e  # Hata durumunda script'i durdur

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Kafkasder Panel                       ║${NC}"
echo -e "${BLUE}║  Vercel Environment Variables Setup    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI bulunamadı!${NC}"
    echo -e "${YELLOW}Lütfen önce Vercel CLI'yi kurun:${NC}"
    echo -e "   npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI bulundu${NC}"

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}❌ Vercel'e giriş yapılmamış!${NC}"
    echo -e "${YELLOW}Lütfen önce giriş yapın:${NC}"
    echo -e "   vercel login"
    exit 1
fi

VERCEL_USER=$(vercel whoami)
echo -e "${GREEN}✅ Vercel kullanıcısı: ${VERCEL_USER}${NC}"
echo ""

# Check for .env.production file
ENV_FILE="$PROJECT_ROOT/.env.production"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ .env.production dosyası bulunamadı!${NC}"
    echo -e "${YELLOW}Lütfen önce .env.production dosyasını oluşturun:${NC}"
    echo -e "   cp .env.vercel.template .env.production"
    echo -e "   # Dosyayı düzenleyin ve gerçek değerleri ekleyin"
    exit 1
fi

echo -e "${GREEN}✅ .env.production dosyası bulundu${NC}"
echo ""

# Ask for confirmation
echo -e "${YELLOW}Bu script, .env.production dosyasındaki tüm değişkenleri${NC}"
echo -e "${YELLOW}Vercel Production ve Preview environment'larına ekleyecek.${NC}"
echo ""
read -p "Devam etmek istiyor musunuz? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}İşlem iptal edildi.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE} Environment Variables Ekleniyor...    ${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Counters
SUCCESS_COUNT=0
SKIP_COUNT=0
ERROR_COUNT=0

# Read .env.production and add each variable to Vercel
while IFS='=' read -r key value; do
    # Skip empty lines and comments
    if [[ -z "$key" ]] || [[ "$key" =~ ^[[:space:]]*# ]]; then
        continue
    fi

    # Trim whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)

    # Skip if value is empty
    if [[ -z "$value" ]]; then
        echo -e "${YELLOW}⚠️  Atlanıyor: $key (değer boş)${NC}"
        ((SKIP_COUNT++))
        continue
    fi

    echo -n "   Ekleniyor: $key ... "

    # Add to Production
    if echo "$value" | vercel env add "$key" production 2>/dev/null; then
        # Add to Preview as well
        if echo "$value" | vercel env add "$key" preview 2>/dev/null; then
            echo -e "${GREEN}✅${NC}"
            ((SUCCESS_COUNT++))
        else
            echo -e "${YELLOW}⚠️ (Preview'a eklenemedi)${NC}"
            ((ERROR_COUNT++))
        fi
    else
        echo -e "${RED}❌ (Zaten var veya hata)${NC}"
        ((ERROR_COUNT++))
    fi

done < "$ENV_FILE"

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE} Özet                                  ${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Başarıyla eklendi: $SUCCESS_COUNT${NC}"
echo -e "${YELLOW}⚠️  Atlandı: $SKIP_COUNT${NC}"
echo -e "${RED}❌ Hata/Zaten var: $ERROR_COUNT${NC}"
echo ""

if [ $SUCCESS_COUNT -gt 0 ]; then
    echo -e "${GREEN}🎉 Environment variables başarıyla eklendi!${NC}"
    echo ""
    echo -e "${YELLOW}Önemli:${NC}"
    echo -e "1. Vercel Dashboard'dan variables'ı kontrol edin"
    echo -e "2. Yeni bir deployment tetikleyin veya redeploy yapın"
    echo -e "3. .env.production dosyasını GIT'e commit ETMEYİN!"
    echo ""
    echo -e "${BLUE}Vercel Dashboard:${NC}"
    echo -e "https://vercel.com/dashboard > Your Project > Settings > Environment Variables"
else
    echo -e "${RED}⚠️  Hiçbir variable eklenemedi.${NC}"
    echo -e "${YELLOW}Muhtemelen tüm variables zaten mevcut.${NC}"
    echo -e "Vercel Dashboard'dan kontrol edin."
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
