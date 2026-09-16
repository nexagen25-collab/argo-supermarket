try {
  module.exports = require('../server/src/app');
} catch (err) {
  console.error('[module-load-failure]', err && err.stack ? err.stack : String(err));
  throw err;
}