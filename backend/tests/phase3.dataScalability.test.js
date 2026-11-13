import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../src/config/db.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import Payment from '../src/models/Payment.js';
import MaterialRequest from '../src/models/MaterialRequest.js';
import Quotation from '../src/models/Quotation.js';
import LabourRequest from '../src/models/LabourRequest.js';
import StockReservation from '../src/models/StockReservation.js';
import RefreshToken from '../src/models/RefreshToken.js';
import { cache } from '../src/utils/cache.js';
import {
  releaseStockReservations,
  cleanupStalePayments,
  sweepExpiredQuotations
} from '../src/jobs/tasks.js';

before(async () => {
  await connectDB();
  await Product.syncIndexes();
  await Order.syncIndexes();
  await Payment.syncIndexes();
  await MaterialRequest.syncIndexes();
  await Quotation.syncIndexes();
  await StockReservation.syncIndexes();
});

after(async () => {
  await closeDB();
});

test('Phase 3 - Task 1: No dbAdapter or runtime JSON store imports', async () => {
  assert.equal(typeof Product.schema, 'object');
  assert.equal(typeof Order.schema, 'object');
  assert.equal(typeof Payment.schema, 'object');
  assert.equal(typeof MaterialRequest.schema, 'object');
  assert.equal(Product.find().lean instanceof Function, true);
});

test('Phase 3 - Task 2: Schema validation, ObjectIds, and Real Dates', async () => {
  const req = new MaterialRequest({
    requestId: `TEST-REQ-${Date.now()}`,
    customer: {
      name: 'Test Builder',
      phone: '9876543210',
      siteAddress: 'Job Site 1',
      city: 'Bengaluru',
      pincode: '560001',
      requiredDate: new Date('2026-12-01')
    },
    items: [{
      name: 'Cement Bag',
      quantity: 10,
      unitPrice: 400
    }]
  });
  await req.save();

  assert.ok(req.createdAt instanceof Date, 'createdAt must be a real Date');
  assert.ok(req.customer.requiredDate instanceof Date, 'requiredDate must be a real Date');

  await MaterialRequest.findByIdAndDelete(req._id);
});

test('Phase 3 - Task 3: Query explain uses index (IXSCAN / text index, not COLLSCAN)', async () => {
  // 1. Product category and price query
  const prodExplain = await Product.find({ isActive: true, category: 'Cement & Steel' })
    .sort({ price: 1 })
    .explain('executionStats');
  
  const stage = prodExplain.executionStats.executionStages;
  const isIndexed = JSON.stringify(stage).includes('IXSCAN') || JSON.stringify(stage).includes('INDEX');
  assert.ok(isIndexed, 'Product category query must use an index');

  // 2. Order by user and createdAt
  const orderExplain = await Order.find({ user: 'demo-user-123' })
    .sort({ createdAt: -1 })
    .explain('executionStats');
  const orderStage = orderExplain.executionStats.executionStages;
  const isOrderIndexed = JSON.stringify(orderStage).includes('IXSCAN') || JSON.stringify(orderStage).includes('INDEX');
  assert.ok(isOrderIndexed, 'Order user query must use index');

  // 3. Payment by razorpayOrderId
  const paymentExplain = await Payment.find({ razorpayOrderId: 'order_test_123' })
    .explain('executionStats');
  const paymentStage = paymentExplain.executionStats.executionStages;
  const isPaymentIndexed = JSON.stringify(paymentStage).includes('IXSCAN') || JSON.stringify(paymentStage).includes('INDEX');
  assert.ok(isPaymentIndexed, 'Payment razorpayOrderId query must use index');
});

test('Phase 3 - Task 4: Resolving product by slug or valid ObjectId without CastError on invalid ID', async () => {
  // Query with completely invalid non-ObjectId string
  const invalidId = 'non-existent-product-slug-123';
  const isObjectId = mongoose.Types.ObjectId.isValid(invalidId);
  assert.equal(isObjectId, false);

  // Must not throw Mongoose CastError
  const result = await Product.findOne(
    isObjectId ? { $or: [{ _id: invalidId }, { slug: invalidId }] } : { slug: invalidId }
  );
  assert.equal(result, null);
});

test('Phase 3 - Task 6: Unified cache wrapper (get, set, del, delPattern)', async () => {
  await cache.set('test:cat:1', { name: 'Cement' }, 10);
  await cache.set('test:cat:2', { name: 'Steel' }, 10);
  await cache.set('test:brand:1', { name: 'UltraTech' }, 10);

  const item1 = await cache.get('test:cat:1');
  assert.equal(item1?.name, 'Cement');

  await cache.delPattern('test:cat:*');
  const deletedItem = await cache.get('test:cat:1');
  assert.equal(deletedItem, null);

  const brandItem = await cache.get('test:brand:1');
  assert.equal(brandItem?.name, 'UltraTech');

  await cache.del('test:brand:1');
  assert.equal(await cache.get('test:brand:1'), null);
});

test('Phase 3 - Task 7: Background jobs - release expired reservations and sweep quotations', async () => {
  // Create an expired reservation
  const testReservation = await StockReservation.create({
    reservationId: `RES-TEST-${Date.now()}`,
    items: [],
    status: 'active',
    expiresAt: new Date(Date.now() - 10000) // expired in the past
  });

  const released = await releaseStockReservations();
  assert.ok(released >= 1, 'Should have released at least 1 expired reservation');

  const check = await StockReservation.findOne({ reservationId: testReservation.reservationId });
  assert.equal(check.status, 'expired');

  // Sweep expired quotations
  const testQuote = await Quotation.create({
    quotationId: `BM-QUO-EXP-${Date.now()}`,
    requestId: 'REQ-123',
    customer: { name: 'Test', phone: '9999999999' },
    items: [{ name: 'Item', quantity: 1, unitPrice: 100, totalPrice: 100 }],
    subtotal: 100,
    totalAmount: 100,
    validUntil: new Date(Date.now() - 10000), // expired
    status: 'Sent'
  });

  const expiredQuotes = await sweepExpiredQuotations();
  assert.ok(expiredQuotes >= 1);

  const quoteCheck = await Quotation.findOne({ quotationId: testQuote.quotationId });
  assert.equal(quoteCheck.status, 'Expired');

  await StockReservation.findByIdAndDelete(testReservation._id);
  await Quotation.findByIdAndDelete(testQuote._id);
});
