# 🥗 GlowAI Nutrition Tracker — Barcode Scanning & Macro Logging

## Features

### 1. **Manual Food Entry** 📝
- Search from 70+ built-in Woolworths products
- Auto-calculate macros based on portion size (in grams)
- All macros per 100g stored, scales to your amount
- Quick entry with food name, amount, calories, protein, carbs, fat

### 2. **Barcode Scanning** 📱
- **Device camera** scanning with QuaggaJS library (free, works always)
- Supports: EAN, UPC, Code128, Code39, EAN-8
- Auto-lookup from **Open Food Facts** (free global database)
- Falls back to manual entry if barcode not found

### 3. **Smart Macro Calculation** 🧮
- Select product → Input amount (grams/ml)
- System auto-calculates: Calories, Protein, Carbs, Fat
- All calculations per 100g base, scaled to your portion
- Works with Woolworths DB or Open Food Facts products

### 4. **Nutrition Dashboard**
- Daily calorie tracker with goal progress
- Macro breakdown: Protein, Carbs, Fat with progress bars
- Weekly calorie trend chart (Premium)
- Food log with add/remove functionality

---

## How to Use

### **Option A: Search & Manual Entry**
1. Tap **🥗 Nutrition** in sidebar
2. Tap **+ Add Food** button
3. In "📝 Manual" tab:
   - Type food name (e.g. "chicken") → see matching products
   - Click product to select
   - Enter amount in grams (e.g. 150g)
   - Macros auto-fill → tap **Add to Log ✓**

### **Option B: Barcode Scanning**
1. Tap **🥗 Nutrition** → **+ Add Food**
2. Switch to **📱 Scan** tab
3. Tap **🎥 Start Scanning**
4. Hold barcode in front of camera
5. System auto-looks up product from Open Food Facts
6. Confirm amount and add to log

### **Manual Override**
- If barcode doesn't find product, you can manually enter:
  - Food name
  - Calories, Protein, Carbs, Fat
  - Tap **Add to Log ✓**

---

## Product Database

### Current Database: **Woolworths Australia**
- 70+ common products
- Per 100g nutritional values
- Includes: meats, dairy, vegetables, grains, fruits, pantry items

### Adding More Products
Products are in `products.js`:
```javascript
{ 
  id: 'w001', 
  name: 'Product Name',
  brand: 'Woolworths',
  cal: 100,
  protein: 10,
  carbs: 20,
  fat: 5
}
```

To add products:
1. Edit `products.js`
2. Add entries to `WOOLWORTHS_PRODUCTS` array
3. Reload app

### External Lookup
- Barcode scanning queries **Open Food Facts** (global free DB)
- Works for any product with valid barcode
- Supports 2M+ food items worldwide

---

## Technical Details

### Files
- **products.js** — Product database (72 items)
- **barcode-scanner.js** — QuaggaJS wrapper for camera scanning
- **dashboard.html** — Updated nutrition modal with tabs

### Libraries
- **QuaggaJS** — Free barcode scanning (CDN)
- **Open Food Facts API** — Free product lookup (no auth)
- **Chart.js** — Nutrition charts

### Data Storage
- All food logs stored in **localStorage** (client-side, private)
- Firebase backup optional
- No backend required

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Camera won't start | Check browser permissions for camera access |
| Barcode not scanning | Better lighting, hold still for 2–3 seconds |
| Product not in DB | Use manual entry or check Open Food Facts |
| Macros not auto-calculating | Ensure product is selected from dropdown |
| Missing decimal places | Long-press amount field to edit manually |

---

## Privacy & Data

✅ **No tracking** — all food data stays on your device
✅ **No login required** for nutrition logging
✅ **Optional Firebase** backup if you enable it
✅ **Open Food Facts** queries are anonymous

---

## Roadmap

- [ ] CSV import/export for food logs
- [ ] Weekly macro reports
- [ ] Custom product database upload
- [ ] Meal prep templates
- [ ] Quick-add favorites
- [ ] Barcode history (recently scanned items)

---

**Questions?** The system will always suggest manual entry if any lookup fails. You control all data.
