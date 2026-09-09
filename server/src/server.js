require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { connect, seedIfEmpty } = require('./db');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const { errorHandler } = require('./middleware/error');

const app = express();
const PORT = process.env.PORT || 4000;

connect();
seedIfEmpty();

app.use(
  cors({
    origin: (_origin, cb) => cb(null, true),
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));

app.use('/api/health', (_req, res) => res.json({ ok: true, name: 'argo-api', time: Date.now() }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Serve client build in production (Render)
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));

app.use(errorHandler);

app.listen(PORT, () => console.log(`[argo] API listening on :${PORT}`));