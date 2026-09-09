const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const catalog = require('./catalog');

let db;

function connect() {
  if (db) return db;
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data.db');
  db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'each',
      stock INTEGER NOT NULL DEFAULT 0,
      aisle INTEGER,
      shelf INTEGER,
      emoji TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '#E8DCC8',
      active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      number TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      total REAL NOT NULL,
      items TEXT NOT NULL,
      address TEXT NOT NULL DEFAULT '',
      payment_id TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  return db;
}

function q(sql, params = []) {
  return db.prepare(sql).all(...params);
}
function q1(sql, params = []) {
  return db.prepare(sql).get(...params);
}
function run(sql, params = []) {
  return db.prepare(sql).run(...params);
}

function seedCatalog() {
  const insert = db.prepare(
    `INSERT INTO products (sku, name, category, description, price, unit, stock, aisle, shelf, emoji, color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  db.exec('BEGIN');
  try {
    for (const p of catalog) {
      insert.run(p.sku, p.name, p.category, p.description, p.price, p.unit, p.stock, p.aisle, p.shelf, p.emoji, p.color);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  console.log(`[db] seeded ${catalog.length} products`);
}

function seedIfEmpty() {
  const productCount = q1('SELECT COUNT(*) AS n FROM products').n;
  if (productCount === 0) seedCatalog();
  if (countUsers() === 0) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
    createUser({
      name: 'Argo Admin',
      email: process.env.ADMIN_EMAIL || 'admin@argo.shop',
      passwordHash: hash,
      role: 'admin'
    });
    console.log('[db] seeded admin user');
  }
}

function getAllProducts() {
  return q('SELECT * FROM products WHERE active = 1 ORDER BY category, name');
}

function getAllProductsAdmin() {
  return q('SELECT * FROM products ORDER BY category, name');
}

function getProductById(id) {
  return q1('SELECT * FROM products WHERE id = ?', [id]);
}

function getProductBySku(sku) {
  return q1('SELECT * FROM products WHERE sku = ?', [sku]);
}

function createProduct(p) {
  const r = run(
    `INSERT INTO products (sku, name, category, description, price, unit, stock, aisle, shelf, emoji, color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [p.sku, p.name, p.category, p.description, p.price, p.unit, p.stock, p.aisle, p.shelf, p.emoji, p.color]
  );
  return getProductById(r.lastInsertRowid);
}

function updateProduct(id, p) {
  run(
    `UPDATE products SET
      sku=?, name=?, category=?, description=?, price=?, unit=?, stock=?, aisle=?, shelf=?, emoji=?, color=?, active=?
     WHERE id=?`,
    [p.sku, p.name, p.category, p.description, p.price, p.unit, p.stock, p.aisle, p.shelf, p.emoji, p.color, p.active, id]
  );
  return getProductById(id);
}

function deleteProduct(id) {
  run('DELETE FROM products WHERE id = ?', [id]);
}

function createOrder({ userId, number, status, total, items, address, paymentId }) {
  const r = run(
    `INSERT INTO orders (user_id, number, status, total, items, address, payment_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, number, status, total, items, address, paymentId]
  );
  return getOrderById(r.lastInsertRowid);
}

function getOrderById(id) {
  return q1('SELECT * FROM orders WHERE id = ?', [id]);
}

function getOrdersByUser(userId) {
  return q('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

function getAllOrders() {
  return q('SELECT * FROM orders ORDER BY created_at DESC');
}

function updateOrderStatus(id, status) {
  run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
}

function createUser({ name, email, passwordHash, role = 'customer' }) {
  const r = run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, passwordHash, role]);
  return getUserById(r.lastInsertRowid);
}

function getUserByEmail(email) {
  return q1('SELECT * FROM users WHERE email = ?', [email]);
}

function getUserById(id) {
  return q1('SELECT * FROM users WHERE id = ?', [id]);
}

function countUsers() {
  return q1('SELECT COUNT(*) AS n FROM users').n;
}

module.exports = {
  connect,
  db,
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  createUser,
  getUserByEmail,
  getUserById,
  countUsers,
  seedIfEmpty
};