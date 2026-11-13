import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, closeDB } from '../src/config/db.js';
import { computePricing } from '../src/services/pricing.service.js';
import { validateOrderTransition, canCustomerCancel } from '../src/utils/order.stateMachine.js';
import { nextSequence, generateOrderId, generateInvoiceNumber } from '../src/utils/counter.js';
import Product from '../src/models/Product.js';
import SiteSetting from '../src/models/SiteSetting.js';
import Coupon from '../src/models/Coupon.js';

before(async () => {
  await connectDB();
});

after(async () => {
  await closeDB();
});

test('1. Pricing Service: GST split (Intra-state CGST+SGST vs Inter-state IGST)', async () => {
  // Create a mock product
  const testProduct = await Product.create({
    name: 'Test OPC Cement 50kg',
    slug: `test-opc-cement-${Date.now()}`,
    sku: `TEST-SKU-${Date.now()}`,
    category: 'Cement & Steel',
    brand: 'UltraTech',
    price: 400,
    mrp: 450,
    gstRate: 18,
    stock: 100,
    minOrderQty: 1,
    isActive: true
  });

  // Intra-state (Karnataka to Karnataka)
  const intraStatePricing = await computePricing({
    items: [{ productId: testProduct._id, quantity: 10 }],
    shipping: { state: 'Karnataka', pincode: '560100' }
  });

  assert.equal(intraStatePricing.subtotal, 4000);
  assert.equal(intraStatePricing.taxBreakup.igst, 0);
  // 18% of 4000 = 720, split 360 CGST + 360 SGST
  assert.equal(intraStatePricing.taxBreakup.cgst, 360);
  assert.equal(intraStatePricing.taxBreakup.sgst, 360);
  assert.equal(intraStatePricing.tax, 720);

  // Inter-state (Karnataka to Maharashtra)
  const interStatePricing = await computePricing({
    items: [{ productId: testProduct._id, quantity: 10 }],
    shipping: { state: 'Maharashtra', pincode: '400001' }
  });

  assert.equal(interStatePricing.subtotal, 4000);
  assert.equal(interStatePricing.taxBreakup.cgst, 0);
  assert.equal(interStatePricing.taxBreakup.sgst, 0);
  assert.equal(interStatePricing.taxBreakup.igst, 720);
  assert.equal(interStatePricing.tax, 720);

  // Clean up
  await Product.findByIdAndDelete(testProduct._id);
});

test('2. Pricing Service: Free delivery threshold vs below threshold freight', async () => {
  const prod = await Product.create({
    name: 'Steel TMT Bar 12mm',
    slug: `test-tmt-bar-${Date.now()}`,
    sku: `TEST-TMT-${Date.now()}`,
    category: 'Cement & Steel',
    brand: 'Tata Tiscon',
    price: 600,
    mrp: 650,
    stock: 50,
    minOrderQty: 1,
    isActive: true
  });

  // Below threshold: 4 * 600 = 2400 (< 5000) -> delivery should be ₹350
  const belowThreshold = await computePricing({
    items: [{ productId: prod._id, quantity: 4 }],
    shipping: { state: 'Karnataka' }
  });
  assert.equal(belowThreshold.subtotal, 2400);
  assert.equal(belowThreshold.delivery, 350);

  // Above threshold: 10 * 600 = 6000 (>= 5000) -> delivery should be FREE (0)
  const aboveThreshold = await computePricing({
    items: [{ productId: prod._id, quantity: 10 }],
    shipping: { state: 'Karnataka' }
  });
  assert.equal(aboveThreshold.subtotal, 6000);
  assert.equal(aboveThreshold.delivery, 0);

  await Product.findByIdAndDelete(prod._id);
});

test('3. Pricing Service: Coupon cap and proportional line allocation', async () => {
  const prodA = await Product.create({
    name: 'Ceramic Floor Tile 60x60',
    slug: `tile-a-${Date.now()}`,
    sku: `TILE-A-${Date.now()}`,
    category: 'Tiles',
    brand: 'Kajaria',
    price: 1000,
    mrp: 1200,
    stock: 50,
    minOrderQty: 1,
    isActive: true
  });

  const couponCode = `BUILDTEST${Date.now().toString().slice(-4)}`;
  await Coupon.create({
    code: couponCode,
    discountPercent: 20, // 20%
    maxDiscount: 500,     // capped at 500
    minOrderValue: 1000,
    isActive: true
  });

  // Subtotal = 1000 * 5 = 5000. 20% of 5000 is 1000, but capped at 500.
  const pricing = await computePricing({
    items: [{ productId: prodA._id, quantity: 5 }],
    couponCode,
    shipping: { state: 'Karnataka' }
  });

  assert.equal(pricing.subtotal, 5000);
  assert.equal(pricing.discount, 500); // capped at maxDiscount!
  assert.equal(pricing.lines[0].discountAllocation, 500);

  await Product.findByIdAndDelete(prodA._id);
  await Coupon.deleteOne({ code: couponCode });
});

test('4. Pricing Service: Client-sent prices are strictly ignored', async () => {
  const realProduct = await Product.create({
    name: 'Waterproofing Chemical 20L',
    slug: `wp-chem-${Date.now()}`,
    sku: `WP-CHEM-${Date.now()}`,
    category: 'Waterproofing',
    brand: 'Dr. Fixit',
    price: 3200,
    mrp: 3500,
    stock: 20,
    minOrderQty: 1,
    isActive: true
  });

  // Client attempts tampering price: 1 instead of 3200
  const tamperedPricing = await computePricing({
    items: [{ productId: realProduct._id, price: 1, quantity: 2 }],
    shipping: { state: 'Karnataka' }
  });

  // Must use the DB price of 3200!
  assert.equal(tamperedPricing.lines[0].price, 3200);
  assert.equal(tamperedPricing.subtotal, 6400);

  await Product.findByIdAndDelete(realProduct._id);
});

test('5. Order State Machine: Valid and Invalid status transitions', () => {
  // Valid transitions
  assert.doesNotThrow(() => validateOrderTransition('Confirmed', 'Processing'));
  assert.doesNotThrow(() => validateOrderTransition('Processing', 'Ready for Dispatch'));
  assert.doesNotThrow(() => validateOrderTransition('Ready for Dispatch', 'Out for Delivery'));
  assert.doesNotThrow(() => validateOrderTransition('Out for Delivery', 'Delivered'));
  assert.doesNotThrow(() => validateOrderTransition('Confirmed', 'Cancelled'));

  // Invalid transition: skipping straight from Confivered to Delivered
  assert.throws(
    () => validateOrderTransition('Confirmed', 'Delivered'),
    /Invalid order status transition/
  );

  // Invalid transition: cannot cancel after Ready for Dispatch
  assert.throws(
    () => validateOrderTransition('Ready for Dispatch', 'Cancelled'),
    /Invalid order status transition/
  );

  // Cancellation rule helper
  assert.equal(canCustomerCancel('Confirmed'), true);
  assert.equal(canCustomerCancel('Processing'), true);
  assert.equal(canCustomerCancel('Ready for Dispatch'), false);
  assert.equal(canCustomerCancel('Delivered'), false);
});

test('6. Atomic Counter: Sequential gap-free ID generation', async () => {
  const seq1 = await nextSequence('test_seq');
  const seq2 = await nextSequence('test_seq');
  assert.equal(seq2, seq1 + 1);

  const orderId = await generateOrderId();
  const currentYear = new Date().getFullYear();
  assert.match(orderId, new RegExp(`^BM-ORD-${currentYear}-\\d{6}$`));

  const invNumber = await generateInvoiceNumber();
  assert.match(invNumber, /^INV-\d{4}-\d{2}-\d{5}$/);
});

test('7. Stock Management: Atomic decrement and insufficient stock rejection', async () => {
  const limitedProduct = await Product.create({
    name: 'Rare Ceramic Border Tile',
    slug: `rare-tile-${Date.now()}`,
    sku: `RARE-SKU-${Date.now()}`,
    category: 'Tiles',
    brand: 'Somany',
    price: 150,
    mrp: 180,
    stock: 2, // only 2 in stock
    minOrderQty: 1,
    isActive: true
  });

  // Attempting to price 5 units must throw 409 insufficient stock
  await assert.rejects(
    () => computePricing({
      items: [{ productId: limitedProduct._id, quantity: 5 }],
      shipping: { state: 'Karnataka' }
    }),
    /Insufficient stock/
  );

  await Product.findByIdAndDelete(limitedProduct._id);
});

test('8. Quotation Pricing: Locked quotation unit rate overrides regular price', async () => {
  const mockQuotation = {
    quotationId: 'BM-QUO-2026-99999',
    deliveryCharge: 0,
    labourCharge: 0,
    items: [
      {
        productId: 'special_item_1',
        name: 'Structural Steel Column Beam',
        brand: 'Jindal',
        unitPrice: 2800, // special contracted price
        quantity: 5,
        unit: 'Beam',
        gstRate: 18
      }
    ]
  };

  const quotedPricing = await computePricing({
    items: [{ productId: 'special_item_1', quantity: 5 }],
    shipping: { state: 'Karnataka' },
    quotation: mockQuotation
  });

  // 5 * 2800 = 14000
  assert.equal(quotedPricing.subtotal, 14000);
  assert.equal(quotedPricing.lines[0].price, 2800);
  assert.equal(quotedPricing.lines[0].pricePaise, 280000);
});

