import 'dotenv/config';
import { connectDB, closeDB } from '../config/db.js';
import {
  releaseStockReservations,
  cleanupStalePayments,
  sweepExpiredQuotations,
  checkLowStockDigest
} from './tasks.js';

let intervals = [];

export const startWorker = async () => {
  console.log('🚀 Starting BuildMart Background Worker...');

  const runSafe = async (name, fn) => {
    try {
      await fn();
    } catch (err) {
      console.error(`[Worker Error in ${name}]:`, err.message);
    }
  };

  // Immediate sweep on startup
  await runSafe('releaseStockReservations', releaseStockReservations);
  await runSafe('cleanupStalePayments', cleanupStalePayments);
  await runSafe('sweepExpiredQuotations', sweepExpiredQuotations);
  await runSafe('checkLowStockDigest', checkLowStockDigest);

  // Periodic schedules
  intervals.push(setInterval(() => runSafe('releaseStockReservations', releaseStockReservations), 60 * 1000));
  intervals.push(setInterval(() => runSafe('cleanupStalePayments', cleanupStalePayments), 5 * 60 * 1000));
  intervals.push(setInterval(() => runSafe('sweepExpiredQuotations', sweepExpiredQuotations), 15 * 60 * 1000));
  intervals.push(setInterval(() => runSafe('checkLowStockDigest', checkLowStockDigest), 60 * 60 * 1000));

  console.log('✅ Background Worker initialized with active job timers.');
};

export const stopWorker = async () => {
  console.log('🛑 Stopping Background Worker timers...');
  for (const timer of intervals) {
    clearInterval(timer);
  }
  intervals = [];
};

// If run directly via CLI
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  connectDB()
    .then(async () => {
      await startWorker();
      const shutdown = async () => {
        await stopWorker();
        await closeDB();
        process.exit(0);
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    })
    .catch((err) => {
      console.error('Fatal error starting worker:', err);
      process.exit(1);
    });
}

export default { startWorker, stopWorker };

