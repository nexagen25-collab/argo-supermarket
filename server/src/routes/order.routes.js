const router = require('express').Router();
const { nanoid } = require('nanoid');
const { z } = require('zod');
const {
  createOrder,
  getOrdersByUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getProductById
} = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { httpError } = require('../middleware/error');

const itemSchema = z.object({
  id: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  qty: z.number().int().min(1).max(99)
});

const orderSchema = z.object({
  items: z.array(itemSchema).min(1),
  address: z.string().min(5).max(300),
  paymentId: z.string().max(200).default('')
});

router.post('/', requireAuth, (req, res, next) => {
  try {
    const { items, address, paymentId } = orderSchema.parse(req.body);
    let total = 0;
    const lines = items.map((it) => {
      const product = getProductById(it.id);
      if (!product) throw httpError(404, `Product ${it.id} not found`);
      total += product.price * it.qty;
      return { id: product.id, sku: product.sku, name: product.name, price: product.price, qty: it.qty };
    });
    const number = `ARGO-${nanoid(8).toUpperCase()}`;
    const order = createOrder({
      userId: req.user.id,
      number,
      status: 'paid',
      total: Math.round(total * 100) / 100,
      items: JSON.stringify(lines),
      address,
      paymentId
    });
    res.status(201).json({ order });
  } catch (err) {
    if (err.name === 'ZodError') return next(httpError(400, err.issues[0].message));
    next(err);
  }
});

router.get('/', requireAuth, (req, res) => {
  const orders = (req.user.role === 'admin' ? getAllOrders() : getOrdersByUser(req.user.id)).map(decorate);
  res.json({ orders });
});

router.get('/:id', requireAuth, (req, res, next) => {
  const order = getOrderById(Number(req.params.id));
  if (!order) return next(httpError(404, 'Order not found'));
  if (order.user_id !== req.user.id && req.user.role !== 'admin') return next(httpError(403, 'Not your order'));
  res.json({ order: decorate(order) });
});

router.patch('/:id/status', requireAuth, requireAdmin, (req, res, next) => {
  const order = getOrderById(Number(req.params.id));
  if (!order) return next(httpError(404, 'Order not found'));
  const schema = z.object({ status: z.enum(['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled']) });
  const { status } = schema.parse(req.body);
  updateOrderStatus(order.id, status);
  res.json({ order: decorate(getOrderById(order.id)) });
});

function decorate(order) {
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    total: order.total,
    address: order.address,
    paymentId: order.payment_id,
    createdAt: order.created_at,
    userId: order.user_id,
    items: JSON.parse(order.items)
  };
}

module.exports = router;