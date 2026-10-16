// Usage (from backend/):  npm run db:init           -> creates tables
//                         npm run db:init -- --seed -> creates tables + demo data
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const db = require('../config/database');

async function main() {
  const dir = path.join(__dirname, '..', '..', 'database');
  await db.query(fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8'));
  console.log('Schema applied.');
  if (process.argv.includes('--seed')) {
    await db.query(fs.readFileSync(path.join(dir, 'seed.sql'), 'utf8'));
    console.log('Seed data inserted.');
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Database setup failed:', err.message);
  process.exit(1);
});
