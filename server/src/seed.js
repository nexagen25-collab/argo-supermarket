require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect, countUsers, createUser, getProductBySku, createProduct } = require('./db');
const catalog = require('./catalog');

connect();

const adminEmail = process.env.ADMIN_EMAIL || 'admin@freshbasket.shop';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

if (countUsers() === 0) {
  const hash = bcrypt.hashSync(adminPassword, 10);
  createUser({ name: 'FreshBasket Admin', email: adminEmail, passwordHash: hash, role: 'admin' });
  console.log(`[seed] created admin user ${adminEmail} / ${adminPassword}`);
} else {
  console.log('[seed] users table not empty, skipped');
}

let created = 0;
for (const p of catalog) {
  if (!getProductBySku(p.sku)) {
    createProduct(p);
    created++;
  }
}
console.log(`[seed] created ${created} products (${catalog.length} in catalog)`);
console.log('[seed] done');