const router = require('express').Router();
const { z } = require('zod');
const {
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { httpError } = require('../middleware/error');

router.get('/', (_req, res) => {
  res.json({ products: getAllProducts() });
});

router.get('/admin', requireAuth, requireAdmin, (_req, res) => {
  res.json({ products: getAllProductsAdmin() });
});

router.get('/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const product = getProductById(id);
  if (!product || !product.active) return next(httpError(404, 'Product not found'));
  res.json({ product });
});

const productSchema = z.object({
  sku: z.string().min(3),
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().default(''),
  price: z.coerce.number().positive(),
  unit: z.string().default('each'),
  stock: z.coerce.number().int().min(0).default(0),
  aisle: z.coerce.number().int().min(1).default(1),
  shelf: z.coerce.number().int().min(1).default(1),
  emoji: z.string().default('🛒'),
  color: z.string().default('#E8DCC8'),
  active: z.coerce.number().int().default(1)
});

router.post('/', requireAuth, requireAdmin, (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    res.status(201).json({ product: createProduct(data) });
  } catch (err) {
    if (err.name === 'ZodError') return next(httpError(400, err.issues[0].message));
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return next(httpError(409, 'That SKU already exists'));
    next(err);
  }
});

router.put('/:id', requireAuth, requireAdmin, (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!getProductById(id)) return next(httpError(404, 'Product not found'));
    const data = productSchema.parse(req.body);
    res.json({ product: updateProduct(id, data) });
  } catch (err) {
    if (err.name === 'ZodError') return next(httpError(400, err.issues[0].message));
    next(err);
  }
});

router.delete('/:id', requireAuth, requireAdmin, (req, res, next) => {
  const id = Number(req.params.id);
  if (!getProductById(id)) return next(httpError(404, 'Product not found'));
  deleteProduct(id);
  res.json({ ok: true });
});

module.exports = router;