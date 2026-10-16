// Entry point: loads .env, then starts the HTTP server.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`ScopeLock running at http://localhost:${PORT}`);
  if (!process.env.DATABASE_URL) {
    console.warn('WARNING: DATABASE_URL is not set. Copy .env.example to .env and fill it in. /api/health works, database endpoints will return 503.');
  }
});
