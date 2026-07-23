import { initDatabase } from './db.js';

Promise.resolve(initDatabase())
  .then(() => {
    console.log('Database initialized successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database init failed:', err.message);
    process.exit(1);
  });
