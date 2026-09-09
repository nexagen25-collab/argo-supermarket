module.exports = {
  errorHandler: (err, _req, res, _next) => {
    const status = err.status || 500;
    if (status >= 500) console.error('[error]', err);
    res.status(status).json({ error: err.message || 'Something went wrong' });
  },
  httpError: (status, message) => {
    const e = new Error(message);
    e.status = status;
    return e;
  }
};