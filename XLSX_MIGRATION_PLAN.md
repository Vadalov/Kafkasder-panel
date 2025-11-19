# xlsx → exceljs Migration Plan

**Tarih:** 19 Kasım 2025  
**Öncelik:** YÜKSEK (Güvenlik Riski)  
**Durum:** Planlama Aşaması

---

## 🎯 Amaç

`xlsx` kütüphanesini güvenlik açıkları nedeniyle `exceljs` ile değiştirmek.

### Güvenlik Açıkları

- **Prototype Pollution** (GHSA-4r6h-8v6p-xvw6)
- **Regular Expression DoS** (GHSA-5pgg-2g8v-p4x9)
- **Durum:** Düzeltme mevcut değil

---

## 📊 Mevcut Kullanım

### Etkilenen Dosyalar

1. **`src/lib/export/export-service.ts`** (Ana kullanım)
   - `exportToExcel()` fonksiyonu
   - XLSX import ve kullanımı
   - Satır 8: `import * as XLSX from 'xlsx';`
   - Satır 189-213: Excel export logic

2. **`src/app/(dashboard)/fon/gelir-gider/_components/ExportButton.tsx`**
   - Placeholder comment (henüz implement edilmemiş)
   - Satır 84-85: xlsx kullanımı için placeholder

3. **`e2e/beneficiaries.spec.ts`**
   - Test assertion (sadece dosya uzantısı kontrolü)
   - Satır 370: `.xlsx` uzantısı kontrolü

### Kullanım Analizi

**Toplam Kullanım:** 1 aktif, 1 placeholder, 1 test

**Ana Fonksiyon:** `exportToExcel()` - Excel dosyası oluşturma

---

## 🔄 Migration Stratejisi

### Adım 1: exceljs Kurulumu

```bash
npm install exceljs
npm uninstall xlsx
```

### Adım 2: export-service.ts Güncelleme

**Mevcut Kod:**
```typescript
import * as XLSX from 'xlsx';

export async function exportToExcel<T>(options: ExcelExportOptions<T>): Promise<void> {
  // XLSX kullanımı
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}
```

**Yeni Kod (exceljs):**
```typescript
import ExcelJS from 'exceljs';

export async function exportToExcel<T>(options: ExcelExportOptions<T>): Promise<void> {
  const {
    title = 'Rapor',
    filename = `${title}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`,
    sheetName = 'Sayfa1',
    columns,
    data,
    includeTotal = false,
    totalColumns = [],
  } = options;

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Prepare headers
  const headers = columns.map((col) => col.header);
  worksheet.addRow(headers);

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data rows
  data.forEach((row) => {
    const rowData = columns.map((col) => {
      const value = row[col.key];
      return col.formatter ? col.formatter(value) : (value ?? '');
    });
    worksheet.addRow(rowData);
  });

  // Add totals if requested
  if (includeTotal && totalColumns.length > 0) {
    const totalRow = columns.map((col) => {
      if (totalColumns.includes(col.key)) {
        const sum = data.reduce((acc, row) => {
          const value = parseFloat(String(row[col.key])) || 0;
          return acc + value;
        }, 0);
        return col.formatter ? col.formatter(sum) : sum;
      }
      return col.key === columns[0].key ? 'TOPLAM' : '';
    });
    worksheet.addRow(totalRow);
    
    // Style total row
    const totalRowIndex = worksheet.rowCount;
    const totalRowObj = worksheet.getRow(totalRowIndex);
    totalRowObj.font = { bold: true };
  }

  // Set column widths
  columns.forEach((col, index) => {
    const column = worksheet.getColumn(index + 1);
    column.width = col.width ? col.width / 5 : 15;
  });

  // Save the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  
  // Download
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}
```

### Adım 3: ExportButton.tsx Güncelleme

**Mevcut:** Placeholder comment
**Yeni:** exceljs kullanarak implement et (veya export-service.ts'yi kullan)

### Adım 4: Test Güncelleme

E2E testleri zaten sadece dosya uzantısını kontrol ediyor, değişiklik gerekmez.

---

## ✅ Migration Checklist

- [ ] exceljs paketini kur
- [ ] xlsx paketini kaldır
- [ ] `export-service.ts`'yi güncelle
- [ ] `ExportButton.tsx`'i güncelle (gerekirse)
- [ ] Unit testleri yaz/güncelle
- [ ] E2E testleri çalıştır
- [ ] Manuel test (Excel export)
- [ ] Type definitions kontrol et
- [ ] Build test et
- [ ] Documentation güncelle

---

## 🧪 Test Senaryoları

### 1. Basit Export
```typescript
await exportToExcel({
  title: 'Test Rapor',
  columns: [
    { header: 'Ad', key: 'name' },
    { header: 'Yaş', key: 'age' },
  ],
  data: [
    { name: 'Ahmet', age: 25 },
    { name: 'Mehmet', age: 30 },
  ],
});
```

### 2. Toplam ile Export
```typescript
await exportToExcel({
  title: 'Gelir Raporu',
  columns: [
    { header: 'Tarih', key: 'date' },
    { header: 'Tutar', key: 'amount' },
  ],
  data: [
    { date: '2025-01-01', amount: 1000 },
    { date: '2025-01-02', amount: 2000 },
  ],
  includeTotal: true,
  totalColumns: ['amount'],
});
```

### 3. Formatter ile Export
```typescript
await exportToExcel({
  columns: [
    { header: 'Tutar', key: 'amount', formatter: (v) => `${v} TL` },
  ],
  data: [{ amount: 1000 }],
});
```

---

## 📦 exceljs Avantajları

1. ✅ **Güvenlik:** Aktif olarak maintain ediliyor
2. ✅ **Performans:** Daha hızlı
3. ✅ **Özellikler:** Daha zengin API (styling, formulas, vb.)
4. ✅ **TypeScript:** Native TypeScript desteği
5. ✅ **Modern:** ES modules desteği

---

## ⚠️ Dikkat Edilmesi Gerekenler

1. **Browser vs Node.js:** exceljs hem browser hem Node.js'de çalışır
2. **File Download:** Browser'da Blob API kullanılmalı
3. **Async:** exceljs async API kullanır (xlsx sync idi)
4. **Bundle Size:** exceljs biraz daha büyük olabilir

---

## 🚀 Uygulama Zaman Çizelgesi

### Hafta 1: Hazırlık
- [ ] exceljs dokümantasyonunu incele
- [ ] Test senaryolarını hazırla
- [ ] Migration branch oluştur

### Hafta 1: Implementation
- [ ] exceljs kurulumu
- [ ] export-service.ts migration
- [ ] Unit testleri

### Hafta 1: Testing
- [ ] Manuel test
- [ ] E2E testleri
- [ ] Performance test

### Hafta 1: Deployment
- [ ] Code review
- [ ] Merge to main
- [ ] Production deploy

**Toplam Süre:** 1 hafta

---

## 📚 Kaynaklar

- [exceljs Documentation](https://github.com/exceljs/exceljs)
- [xlsx Security Advisories](https://github.com/advisories?query=xlsx)
- [Migration Guide](https://github.com/exceljs/exceljs#readme)

---

**Son Güncelleme:** 19 Kasım 2025

