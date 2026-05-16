// Woolworths Nutrition Database — Searchable product index
// Per 100g/100ml macros (user can scale by portion size)
const WOOLWORTHS_PRODUCTS = [
  { id: 'w001', name: '100% Coconut Water', cal: 18, protein: 0, carbs: 4, fat: 0, brand: 'Woolworths' },
  { id: 'w002', name: '100% Juice Orange', cal: 42, protein: 1, carbs: 10, fat: 0, brand: 'Woolworths' },
  { id: 'w003', name: '100% Prune Juice', cal: 65, protein: 1, carbs: 16, fat: 0, brand: 'Woolworths' },
  { id: 'w004', name: 'All Butter Croissants', cal: 380, protein: 7, carbs: 38, fat: 22, brand: 'Woolworths' },
  { id: 'w005', name: 'Almonds Natural', cal: 579, protein: 21, carbs: 22, fat: 50, brand: 'Woolworths' },
  { id: 'w006', name: 'Apple', cal: 52, protein: 0.3, carbs: 14, fat: 0.2, brand: 'Woolworths' },
  { id: 'w007', name: 'Atlantic Salmon', cal: 206, protein: 22, carbs: 0, fat: 13, brand: 'Woolworths' },
  { id: 'w008', name: 'Australian Butter Salted', cal: 717, protein: 0.9, carbs: 0.1, fat: 81, brand: 'Woolworths' },
  { id: 'w009', name: 'Australian Full Cream Milk', cal: 61, protein: 3.2, carbs: 4.8, fat: 3.6, brand: 'Woolworths' },
  { id: 'w010', name: 'Australian Rolled Oats', cal: 389, protein: 17, carbs: 66, fat: 7, brand: 'Woolworths' },
  { id: 'w011', name: 'Avocado', cal: 160, protein: 2, carbs: 9, fat: 15, brand: 'Woolworths' },
  { id: 'w012', name: 'Baked Beans in Tomato Sauce', cal: 82, protein: 5, carbs: 14, fat: 0.5, brand: 'Woolworths' },
  { id: 'w013', name: 'Banana', cal: 89, protein: 1.1, carbs: 23, fat: 0.3, brand: 'Woolworths' },
  { id: 'w014', name: 'Barramundi Fillets', cal: 93, protein: 20, carbs: 0, fat: 1, brand: 'Woolworths' },
  { id: 'w015', name: 'Basmati Rice', cal: 130, protein: 2.7, carbs: 28, fat: 0.3, brand: 'Woolworths' },
  { id: 'w016', name: 'Beef Mince', cal: 250, protein: 25, carbs: 0, fat: 16, brand: 'Woolworths' },
  { id: 'w017', name: 'Beef Sausages', cal: 290, protein: 13, carbs: 2, fat: 25, brand: 'Woolworths' },
  { id: 'w018', name: 'Bell Peppers', cal: 31, protein: 1, carbs: 6, fat: 0.3, brand: 'Woolworths' },
  { id: 'w019', name: 'Blueberries', cal: 57, protein: 0.7, carbs: 14, fat: 0.3, brand: 'Woolworths' },
  { id: 'w020', name: 'Broccoli', cal: 34, protein: 2.8, carbs: 7, fat: 0.4, brand: 'Woolworths' },
  { id: 'w021', name: 'Brown Rice', cal: 111, protein: 2.6, carbs: 23, fat: 0.9, brand: 'Woolworths' },
  { id: 'w022', name: 'Butter Chicken', cal: 157, protein: 15, carbs: 7, fat: 8, brand: 'Woolworths' },
  { id: 'w023', name: 'Carrot', cal: 41, protein: 0.9, carbs: 10, fat: 0.2, brand: 'Woolworths' },
  { id: 'w024', name: 'Cashews', cal: 553, protein: 18, carbs: 30, fat: 44, brand: 'Woolworths' },
  { id: 'w025', name: 'Cheddar Cheese', cal: 403, protein: 23, carbs: 3, fat: 33, brand: 'Woolworths' },
  { id: 'w026', name: 'Chicken Breast', cal: 165, protein: 31, carbs: 0, fat: 3.6, brand: 'Woolworths' },
  { id: 'w027', name: 'Chicken Mince', cal: 155, protein: 23, carbs: 0, fat: 7, brand: 'Woolworths' },
  { id: 'w028', name: 'Chickpeas', cal: 164, protein: 8.9, carbs: 27, fat: 2.4, brand: 'Woolworths' },
  { id: 'w029', name: 'Chilli Beans', cal: 110, protein: 7, carbs: 19, fat: 1, brand: 'Woolworths' },
  { id: 'w030', name: 'Coconut Water', cal: 18, protein: 0.3, carbs: 4, fat: 0.2, brand: 'Woolworths' },
  { id: 'w031', name: 'Corn', cal: 86, protein: 3.3, carbs: 19, fat: 1.2, brand: 'Woolworths' },
  { id: 'w032', name: 'Crumbed Chicken Schnitzels', cal: 215, protein: 18, carbs: 12, fat: 10, brand: 'Woolworths' },
  { id: 'w033', name: 'Egg', cal: 155, protein: 13, carbs: 1.1, fat: 11, brand: 'Woolworths' },
  { id: 'w034', name: 'Feta Cheese', cal: 264, protein: 14, carbs: 4, fat: 21, brand: 'Woolworths' },
  { id: 'w035', name: 'Fish Fillets', cal: 85, protein: 18, carbs: 0, fat: 1, brand: 'Woolworths' },
  { id: 'w036', name: 'Frozen Berries Mix', cal: 45, protein: 1, carbs: 10, fat: 0.3, brand: 'Woolworths' },
  { id: 'w037', name: 'Garlic', cal: 149, protein: 6.4, carbs: 33, fat: 0.5, brand: 'Woolworths' },
  { id: 'w038', name: 'Granola', cal: 425, protein: 9, carbs: 55, fat: 18, brand: 'Woolworths' },
  { id: 'w039', name: 'Greek Yoghurt', cal: 59, protein: 10, carbs: 3.2, fat: 0.4, brand: 'Woolworths' },
  { id: 'w040', name: 'Green Beans', cal: 31, protein: 2.4, carbs: 7, fat: 0.2, brand: 'Woolworths' },
  { id: 'w041', name: 'Ham', cal: 130, protein: 18, carbs: 2, fat: 6, brand: 'Woolworths' },
  { id: 'w042', name: 'Honey', cal: 304, protein: 0.3, carbs: 82, fat: 0, brand: 'Woolworths' },
  { id: 'w043', name: 'Hummus', cal: 170, protein: 5, carbs: 14, fat: 9, brand: 'Woolworths' },
  { id: 'w044', name: 'Ice Cream Vanilla', cal: 207, protein: 3.5, carbs: 24, fat: 11, brand: 'Woolworths' },
  { id: 'w045', name: 'Kangaroo Steak', cal: 113, protein: 22, carbs: 0, fat: 2.5, brand: 'Woolworths' },
  { id: 'w046', name: 'Lamb Mince', cal: 294, protein: 20, carbs: 0, fat: 24, brand: 'Woolworths' },
  { id: 'w047', name: 'Lentils Red', cal: 116, protein: 9, carbs: 20, fat: 0.4, brand: 'Woolworths' },
  { id: 'w048', name: 'Lettuce', cal: 15, protein: 1.2, carbs: 2.9, fat: 0.2, brand: 'Woolworths' },
  { id: 'w049', name: 'Macadamia Nuts', cal: 718, protein: 8.6, carbs: 14, fat: 76, brand: 'Woolworths' },
  { id: 'w050', name: 'Mango', cal: 60, protein: 0.8, carbs: 15, fat: 0.3, brand: 'Woolworths' },
  { id: 'w051', name: 'Mozzarella Cheese', cal: 280, protein: 28, carbs: 3, fat: 17, brand: 'Woolworths' },
  { id: 'w052', name: 'Orange Juice', cal: 45, protein: 0.7, carbs: 11, fat: 0.2, brand: 'Woolworths' },
  { id: 'w053', name: 'Oysters', cal: 68, protein: 7, carbs: 4, fat: 1.5, brand: 'Woolworths' },
  { id: 'w054', name: 'Pasta', cal: 131, protein: 5, carbs: 25, fat: 1.1, brand: 'Woolworths' },
  { id: 'w055', name: 'Peanut Butter', cal: 588, protein: 26, carbs: 20, fat: 50, brand: 'Woolworths' },
  { id: 'w056', name: 'Peas', cal: 81, protein: 5.4, carbs: 14, fat: 0.4, brand: 'Woolworths' },
  { id: 'w057', name: 'Pumpkin', cal: 26, protein: 1, carbs: 6, fat: 0.1, brand: 'Woolworths' },
  { id: 'w058', name: 'Quinoa', cal: 120, protein: 4.4, carbs: 21, fat: 1.9, brand: 'Woolworths' },
  { id: 'w059', name: 'Salmon Fillet', cal: 206, protein: 22, carbs: 0, fat: 13, brand: 'Woolworths' },
  { id: 'w060', name: 'Spinach', cal: 23, protein: 2.7, carbs: 3.6, fat: 0.4, brand: 'Woolworths' },
  { id: 'w061', name: 'Strawberries', cal: 32, protein: 0.8, carbs: 7.7, fat: 0.3, brand: 'Woolworths' },
  { id: 'w062', name: 'Sweet Potato', cal: 86, protein: 1.6, carbs: 20, fat: 0.1, brand: 'Woolworths' },
  { id: 'w063', name: 'Tuna Canned', cal: 100, protein: 23, carbs: 0, fat: 1, brand: 'Woolworths' },
  { id: 'w064', name: 'Turkey Breast', cal: 128, protein: 29, carbs: 0, fat: 0.8, brand: 'Woolworths' },
  { id: 'w065', name: 'Tomato', cal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, brand: 'Woolworths' },
  { id: 'w066', name: 'Tofu', cal: 76, protein: 8.1, carbs: 1.9, fat: 4.8, brand: 'Woolworths' },
  { id: 'w067', name: 'Walnut', cal: 654, protein: 9.1, carbs: 14, fat: 65, brand: 'Woolworths' },
  { id: 'w068', name: 'Watermelon', cal: 30, protein: 0.6, carbs: 7.6, fat: 0.2, brand: 'Woolworths' },
  { id: 'w069', name: 'White Rice', cal: 130, protein: 2.7, carbs: 28, fat: 0.3, brand: 'Woolworths' },
  { id: 'w070', name: 'Whole Wheat Bread', cal: 265, protein: 8.7, carbs: 51, fat: 3.3, brand: 'Woolworths' },
  { id: 'w071', name: 'Yoghurt Plain', cal: 59, protein: 3.5, carbs: 4.7, fat: 0.4, brand: 'Woolworths' },
  { id: 'w072', name: 'Zucchini', cal: 21, protein: 1.4, carbs: 3.9, fat: 0.4, brand: 'Woolworths' },
];

// Search products by name, return closest matches
function searchProducts(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return WOOLWORTHS_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
  ).slice(0, 10);
}

// Get product by ID
function getProductById(id) {
  return WOOLWORTHS_PRODUCTS.find(p => p.id === id);
}

// Calculate macros for a portion (scale from 100g)
function calcMacrosForPortion(product, gramAmount) {
  if (!product || !gramAmount) return { cal: 0, protein: 0, carbs: 0, fat: 0 };
  const scale = gramAmount / 100;
  return {
    cal: Math.round(product.cal * scale),
    protein: Math.round(product.protein * scale * 10) / 10,
    carbs: Math.round(product.carbs * scale * 10) / 10,
    fat: Math.round(product.fat * scale * 10) / 10,
  };
}
