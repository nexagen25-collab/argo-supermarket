const C = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const base = {
  1: { name: 'Cavendish Bananas', category: 'Fruit & Veg', price: 1.49, unit: 'per kg', emoji: '🍌', color: '#F4E0A0', aisle: 1, shelf: 1 },
  2: { name: 'Gala Apples', category: 'Fruit & Veg', price: 2.99, unit: 'per kg', emoji: '🍎', color: '#C9503A', aisle: 1, shelf: 1 },
  3: { name: 'Naval Oranges', category: 'Fruit & Veg', price: 2.49, unit: 'per kg', emoji: '🍊', color: '#F5A93C', aisle: 1, shelf: 2 },
  4: { name: 'Avocado Hass', category: 'Fruit & Veg', price: 1.25, unit: 'each', emoji: '🥑', color: '#6E8B3D', aisle: 1, shelf: 2 },
  5: { name: 'Cherry Tomatoes', category: 'Fruit & Veg', price: 2.29, unit: 'per box', emoji: '🍅', color: '#D64737', aisle: 1, shelf: 3 },
  6: { name: 'Baby Spinach', category: 'Fruit & Veg', price: 1.99, unit: 'per bag', emoji: '🥬', color: '#3C6E3E', aisle: 1, shelf: 3 },
  7: { name: 'Carrots', category: 'Fruit & Veg', price: 0.99, unit: 'per kg', emoji: '🥕', color: '#E07A2A', aisle: 2, shelf: 1 },
  8: { name: 'Hayward Kiwis', category: 'Fruit & Veg', price: 3.49, unit: 'per kg', emoji: '🥝', color: '#7A9C3F', aisle: 2, shelf: 1 },
  9: { name: 'Romaine Lettuce', category: 'Fruit & Veg', price: 1.79, unit: 'each', emoji: '🥬', color: '#7FA35A', aisle: 2, shelf: 2 },
  10: { name: 'Strawberries', category: 'Fruit & Veg', price: 3.99, unit: 'per punnet', emoji: '🍓', color: '#C73B4E', aisle: 2, shelf: 2 },
  11: { name: 'Whole Milk 1L', category: 'Dairy & Eggs', price: 1.19, unit: 'each', emoji: '🥛', color: '#EAF0F2', aisle: 3, shelf: 1 },
  12: { name: 'Free-Range Eggs x12', category: 'Dairy & Eggs', price: 3.79, unit: 'crate', emoji: '🥚', color: '#EFE0C8', aisle: 3, shelf: 1 },
  13: { name: 'Butter 250g', category: 'Dairy & Eggs', price: 2.49, unit: 'each', emoji: '🧈', color: '#F2E198', aisle: 3, shelf: 2 },
  14: { name: 'Cheddar 300g', category: 'Dairy & Eggs', price: 4.49, unit: 'each', emoji: '🧀', color: '#F0C24F', aisle: 3, shelf: 2 },
  15: { name: 'Greek Yogurt 500g', category: 'Dairy & Eggs', price: 2.89, unit: 'each', emoji: '🍶', color: '#F5F2EA', aisle: 3, shelf: 3 },
  16: { name: 'Mozzarella 250g', category: 'Dairy & Eggs', price: 3.29, unit: 'each', emoji: '🧀', color: '#FFF6E8', aisle: 3, shelf: 3 },
  17: { name: 'Sourdough Loaf', category: 'Bakery', price: 3.49, unit: 'each', emoji: '🍞', color: '#C89B5F', aisle: 4, shelf: 1 },
  18: { name: 'Croissants x4', category: 'Bakery', price: 3.99, unit: 'pack', emoji: '🥐', color: '#D9A260', aisle: 4, shelf: 1 },
  19: { name: 'Baguette', category: 'Bakery', price: 1.89, unit: 'each', emoji: '🥖', color: '#CBA469', aisle: 4, shelf: 2 },
  20: { name: 'Chocolate Chip Cookies', category: 'Bakery', price: 2.99, unit: 'pack', emoji: '🍪', color: '#A97142', aisle: 4, shelf: 2 },
  21: { name: 'Blueberry Muffins x2', category: 'Bakery', price: 2.49, unit: 'pack', emoji: '🧁', color: '#9C6FA0', aisle: 4, shelf: 3 },
  22: { name: 'Chicken Breast 500g', category: 'Meat & Fish', price: 5.49, unit: 'tray', emoji: '🍗', color: '#E8B0A0', aisle: 5, shelf: 1 },
  23: { name: 'Atlantic Salmon Fillet', category: 'Meat & Fish', price: 8.99, unit: 'per kg', emoji: '🐟', color: '#F0956E', aisle: 5, shelf: 1 },
  24: { name: 'Beef Mince 500g', category: 'Meat & Fish', price: 4.99, unit: 'tray', emoji: '🥩', color: '#C0453E', aisle: 5, shelf: 2 },
  25: { name: 'King Prawns 300g', category: 'Meat & Fish', price: 6.49, unit: 'tray', emoji: '🦐', color: '#F2A08C', aisle: 5, shelf: 2 },
  26: { name: 'Tofu Firm 350g', category: 'Meat & Fish', price: 2.29, unit: 'each', emoji: '🧊', color: '#F1EDE4', aisle: 5, shelf: 3 },
  27: { name: 'Basmati Rice 1kg', category: 'Pantry', price: 3.29, unit: 'each', emoji: '🍚', color: '#F3EAD6', aisle: 6, shelf: 1 },
  28: { name: 'Penne Pasta 500g', category: 'Pantry', price: 1.49, unit: 'each', emoji: '🍝', color: '#E2C98E', aisle: 6, shelf: 1 },
  29: { name: 'Olive Oil 750ml', category: 'Pantry', price: 6.99, unit: 'bottle', emoji: '🫒', color: '#9EB35A', aisle: 6, shelf: 2 },
  30: { name: 'Sea Salt 500g', category: 'Pantry', price: 2.19, unit: 'each', emoji: '🧂', color: '#F4F0E6', aisle: 6, shelf: 2 },
  31: { name: 'Honey 340g', category: 'Pantry', price: 4.49, unit: 'jar', emoji: '🍯', color: '#D9A536', aisle: 6, shelf: 3 },
  32: { name: 'Ground Coffee 250g', category: 'Pantry', price: 5.99, unit: 'bag', emoji: '☕', color: '#5B4232', aisle: 6, shelf: 3 },
  33: { name: 'Sparkling Water 1.5L', category: 'Drinks', price: 0.99, unit: 'bottle', emoji: '💧', color: '#BFE3EE', aisle: 7, shelf: 1 },
  34: { name: 'Orange Juice 1L', category: 'Drinks', price: 2.79, unit: 'carton', emoji: '🧃', color: '#F0A13C', aisle: 7, shelf: 1 },
  35: { name: 'Cold Brew 500ml', category: 'Drinks', price: 3.49, unit: 'can', emoji: '🖤', color: '#3A2E28', aisle: 7, shelf: 2 },
  36: { name: 'Green Tea 20 bags', category: 'Drinks', price: 2.99, unit: 'box', emoji: '🍵', color: '#8FB573', aisle: 7, shelf: 2 },
  37: { name: 'Mango Smoothie 400ml', category: 'Drinks', price: 2.49, unit: 'bottle', emoji: '🥭', color: '#F2B33C', aisle: 7, shelf: 3 },
  38: { name: 'Dark Chocolate 70%', category: 'Snacks', price: 2.89, unit: 'bar', emoji: '🍫', color: '#4A3126', aisle: 8, shelf: 1 },
  39: { name: 'Salted Potato Chips', category: 'Snacks', price: 2.49, unit: 'bag', emoji: '🍟', color: '#E3C14F', aisle: 8, shelf: 1 },
  40: { name: 'Roasted Almonds 200g', category: 'Snacks', price: 3.99, unit: 'bag', emoji: '🥜', color: '#A77B4E', aisle: 8, shelf: 2 },
  41: { name: 'Hummus 200g', category: 'Snacks', price: 2.19, unit: 'tub', emoji: '🫘', color: '#D8C08A', aisle: 8, shelf: 2 },
  42: { name: 'Saltine Crackers', category: 'Snacks', price: 1.79, unit: 'box', emoji: '🥨', color: '#E6C98F', aisle: 8, shelf: 3 }
};

const catalog = Object.entries(base).map(([skuNum, p]) => ({
  sku: `ARG-${String(skuNum).padStart(3, '0')}`,
  name: p.name,
  category: p.category,
  description: `${p.name} — freshly stocked on the ${p.aisle}${suffix(p.aisle)} floor aisle. Picked and packed daily by the Argo crew.`,
  price: p.price,
  unit: p.unit,
  stock: 40 + (skuNum * 7) % 80,
  aisle: p.aisle,
  shelf: p.shelf,
  emoji: p.emoji,
  color: p.color
}));

function suffix(n) {
  const mod = n % 100;
  if (mod >= 11 && mod <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

module.exports = catalog;