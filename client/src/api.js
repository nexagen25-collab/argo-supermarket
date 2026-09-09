const API_BASE = import.meta.env.VITE_API_URL || '';

function authHeaders() {
  const token = localStorage.getItem('argo_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),

  products: () => api.get('/api/products'),
  product: (id) => api.get(`/api/products/${id}`),
  adminProducts: () => api.get('/api/products/admin'),

  register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  me: () => api.get('/api/auth/me'),

  checkoutSession: (items, successUrl, cancelUrl) =>
    api.post('/api/payments/checkout', { items, successUrl, cancelUrl }),

  createOrder: (items, address, paymentId) => api.post('/api/orders', { items, address, paymentId }),
  orders: () => api.get('/api/orders'),
  order: (id) => api.get(`/api/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),

  createProduct: (product) => api.post('/api/products', product),
  updateProduct: (id, product) => api.put(`/api/products/${id}`, product),
  deleteProduct: (id) => api.del(`/api/products/${id}`)
};