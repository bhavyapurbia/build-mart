import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { PassThrough } from 'node:stream';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../src/config/db.js';

import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import Review from '../src/models/Review.js';
import Wishlist from '../src/models/Wishlist.js';
import ServiceArea from '../src/models/ServiceArea.js';
import BulkEnquiry from '../src/models/BulkEnquiry.js';
import Page from '../src/models/Page.js';
import { BULK_ENQUIRY_STATUS } from '../src/constants/enums.js';
import { numberToWordsINR, generateInvoicePDF } from '../src/services/invoice.service.js';
import { updateProductRatingStats } from '../src/controllers/review.controller.js';

before(async () => {
  await connectDB();
  await User.syncIndexes();
  await Product.syncIndexes();
  await Order.syncIndexes();
  await Review.syncIndexes();
  await Wishlist.syncIndexes();
  await ServiceArea.syncIndexes();
  await BulkEnquiry.syncIndexes();
  await Page.syncIndexes();
});

after(async () => {
  await closeDB();
});

test('Phase 4 - Task 1: Account recovery tokens & SHA-256 storage', async () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const testUser = await User.create({
    name: 'Token Test User',
    email: `tokentest-${Date.now()}@buildmart.in`,
    password: 'Password123!',
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: new Date(Date.now() + 3600000)
  });

  assert.ok(testUser._id);
  // Verify token lookup by SHA-256 hash matches
  const found = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() }
  });
  assert.ok(found);
  assert.equal(String(found._id), String(testUser._id));
});

test('Phase 4 - Task 2: Review spam prevention & rating denormalization', async () => {
  const testProduct = await Product.create({
    name: 'UltraTech Cement 53 Grade',
    slug: `ultratech-test-${Date.now()}`,
    sku: `SKU-CEM-${Date.now()}`,
    brand: 'UltraTech',
    category: 'Cement & Steel',
    price: 420,
    mrp: 460,
    unit: 'bag',
    stock: 500,
    rating: 0,
    reviewsCount: 0
  });

  const userId = new mongoose.Types.ObjectId();

  // 1. First review succeeds
  const rev1 = await Review.create({
    user: String(userId),
    userName: 'Contractor Suresh',
    productId: String(testProduct._id),
    rating: 5,
    comment: 'Cured perfectly on high-rise slab.',
    verifiedPurchase: true
  });
  assert.ok(rev1._id);

  // Denormalize rating onto Product
  const stats = await updateProductRatingStats(testProduct._id);
  assert.equal(stats.avgRating, 5);
  assert.equal(stats.count, 1);

  const prodAfter = await Product.findById(testProduct._id).lean();
  assert.equal(prodAfter.rating, 5);
  assert.equal(prodAfter.reviewsCount, 1);

  // 2. Duplicate review from same user on same product throws duplicate key error
  await assert.rejects(
    async () => {
      await Review.create({
        user: String(userId),
        userName: 'Contractor Suresh Duplicate',
        productId: String(testProduct._id),
        rating: 4,
        comment: 'Trying to post again.'
      });
    },
    /E11000.*duplicate key error/
  );
});

test('Phase 4 - Task 3: Wishlist uniqueness per user and item operations', async () => {
  const userId = new mongoose.Types.ObjectId();
  const prod1 = new mongoose.Types.ObjectId();
  const prod2 = new mongoose.Types.ObjectId();

  const wl = await Wishlist.create({
    user: userId,
    products: [prod1]
  });
  assert.equal(wl.products.length, 1);

  // Add another product (idempotent)
  await Wishlist.updateOne(
    { user: userId },
    { $addToSet: { products: prod2 } }
  );

  const updated = await Wishlist.findOne({ user: userId });
  assert.equal(updated.products.length, 2);

  // Attempting duplicate wishlist doc for same user throws duplicate key error
  await assert.rejects(
    async () => {
      await Wishlist.create({ user: userId, products: [] });
    },
    /E11000.*duplicate key error/
  );
});

test('Phase 4 - Task 4: ServiceArea pincode lookup & ETA resolution', async () => {
  const area = await ServiceArea.create({
    city: 'Hyderabad',
    state: 'Telangana',
    pincodes: ['500001', '500002', '500003'],
    etaLabel: '45-60 Mins',
    deliveryFee: 150,
    minOrder: 1000,
    freeDeliveryThreshold: 4000,
    isAvailable: true
  });

  // Query by pincode inside array
  const matched = await ServiceArea.findOne({
    pincodes: '500002',
    isAvailable: true
  }).lean();

  assert.ok(matched);
  assert.equal(matched.city, 'Hyderabad');
  assert.equal(matched.etaLabel, '45-60 Mins');
  assert.equal(matched.freeDeliveryThreshold, 4000);

  // Unserviced pincode
  const unserviced = await ServiceArea.findOne({ pincodes: '999999', isAvailable: true });
  assert.equal(unserviced, null);
});

test('Phase 4 - Task 5: Number to Words (INR) currency converter', () => {
  assert.equal(numberToWordsINR(0), 'Zero Rupees Only');
  assert.equal(numberToWordsINR(500), 'Rupees Five Hundred Only');
  assert.equal(numberToWordsINR(5420), 'Rupees Five Thousand Four Hundred and Twenty Only');
  assert.equal(numberToWordsINR(125000), 'Rupees One Lakh Twenty Five Thousand Only');
});

test('Phase 4 - Task 6: Tax Invoice PDF streaming generator', async () => {
  const sampleOrder = {
    orderId: 'BM-2026-TEST',
    invoiceNumber: 'INV-2026-TEST',
    createdAt: new Date(),
    customer: {
      name: 'Ramesh Construction Corp',
      phone: '9876543210',
      email: 'ramesh@corp.in',
      address: 'Site 44, Tech Park Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      gstin: '29ABCDE1234F1Z5'
    },
    items: [
      {
        name: 'Tata Tiscon 550D Rebar 12mm',
        hsn: '7214',
        quantity: 20,
        unit: 'pieces',
        price: 780,
        taxRate: 18,
        taxableAmount: 13220,
        cgst: 1189.8,
        sgst: 1189.8,
        igst: 0,
        total: 15600
      }
    ],
    taxBreakup: {
      cgst: 1189.8,
      sgst: 1189.8,
      igst: 0,
      totalGst: 2379.6
    },
    subtotal: 13220,
    tax: 2380,
    shippingFee: 0,
    totalAmount: 15600,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid'
  };

  const passThrough = new PassThrough();
  passThrough.setHeader = () => {};
  const chunks = [];

  passThrough.on('data', chunk => chunks.push(chunk));

  await generateInvoicePDF(sampleOrder, passThrough);

  await new Promise(resolve => passThrough.on('end', resolve));

  const pdfBuffer = Buffer.concat(chunks);
  assert.ok(pdfBuffer.length > 500, 'PDF buffer should contain generated content');
  // Check PDF magic header '%PDF-'
  const magic = pdfBuffer.slice(0, 5).toString('ascii');
  assert.equal(magic, '%PDF-');
});

test('Phase 4 - Task 7: Bulk Enquiry model & order conversion status validation', async () => {
  const enquiry = await BulkEnquiry.create({
    enquiryId: `BE-TEST-${Date.now()}`,
    customer: {
      fullName: 'Prestige Builders',
      email: 'procurement@prestige.in',
      phone: '9845012345',
      companyName: 'Prestige Group',
      projectLocation: 'Whitefield Site B'
    },
    items: [
      { productName: 'Coromandel King Cement', quantity: 1000, unit: 'bags' }
    ],
    status: BULK_ENQUIRY_STATUS.RECEIVED
  });

  assert.equal(enquiry.status, BULK_ENQUIRY_STATUS.RECEIVED);

  // Customer responds / accepts
  enquiry.status = BULK_ENQUIRY_STATUS.ACCEPTED;
  await enquiry.save();
  assert.equal(enquiry.status, BULK_ENQUIRY_STATUS.ACCEPTED);

  // Admin converts to order
  enquiry.status = BULK_ENQUIRY_STATUS.CONVERTED_TO_ORDER;
  enquiry.adminNotes = 'Net 30 Days payment approved by finance.';
  await enquiry.save();

  const refreshed = await BulkEnquiry.findById(enquiry._id).lean();
  assert.equal(refreshed.status, BULK_ENQUIRY_STATUS.CONVERTED_TO_ORDER);
  assert.equal(refreshed.adminNotes, 'Net 30 Days payment approved by finance.');
});

test('Phase 4 - Task 8: Content CMS Page model & slug lookup', async () => {
  const page = await Page.create({
    title: 'Testing CMS Page',
    slug: `test-cms-${Date.now()}`,
    content: '### Welcome\nThis is automated test content.',
    isPublished: true
  });

  const found = await Page.findOne({ slug: page.slug, isPublished: true }).lean();
  assert.ok(found);
  assert.equal(found.title, 'Testing CMS Page');
});
