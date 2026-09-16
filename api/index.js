console.error(
  '[boot]',
  process.version,
  process.platform,
  process.arch,
  'VERCEL=' + (process.env.VERCEL || ''),
  'DB=' + (process.env.DATABASE_PATH || '(default)')
);
try {
  const app = require('../server/src/app');
  module.exports = app;
} catch (err) {
  console.error('[module-load-failure]', err && err.stack ? err.stack : String(err));
  throw err;
}