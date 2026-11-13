import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { validateOrderTransition, canCustomerCancel } from '../src/utils/order.stateMachine.js';
import { computePricing } from '../src/services/pricing.service.js';

test('1. Order State Machine: Valid transitions', () => {
  assert.doesNotThrow(() => validateOrderTransition('Confirmed', 'Processing'));
  assert.doesNotThrow(() => validateOrderTransition('Processing', 'Ready for Dispatch'));
  assert.doesNotThrow(() => validateOrderTransition('Ready for Dispatch', 'Out for Delivery'));
  assert.doesNotThrow(() => validateOrderTransition('Out for Delivery', 'Delivered'));
  assert.doesNotThrow(() => validateOrderTransition('Confirmed', 'Cancelled'));
  assert.doesNotThrow(() => validateOrderTransition('Processing', 'Cancelled'));
});

test('2. Order State Machine: Invalid transitions and terminal constraints', () => {
  assert.throws(
    () => validateOrderTransition('Confirmed', 'Delivered'),
    /Invalid order status transition/
  );
  assert.throws(
    () => validateOrderTransition('Ready for Dispatch', 'Cancelled'),
    /Invalid order status transition/
  );
  assert.throws(
    () => validateOrderTransition('Delivered', 'Cancelled'),
    /Invalid order status transition/
  );
});

test('3. Customer Cancellation Permission Rules', () => {
  assert.equal(canCustomerCancel('Confirmed'), true);
  assert.equal(canCustomerCancel('Processing'), true);
  assert.equal(canCustomerCancel('Ready for Dispatch'), false);
  assert.equal(canCustomerCancel('Out for Delivery'), false);
  assert.equal(canCustomerCancel('Delivered'), false);
  assert.equal(canCustomerCancel('Cancelled'), false);
});

test('4. Quotation Locked Pricing (Offline Calculation & Intra-State GST)', async () => {
  const mockQuotation = {
    quotationId: 'BM-QUO-2026-0001',
    deliveryCharge: 0,
    labourCharge: 0,
    items: [
      {
        productId: 'item_rebar_12mm',
        name: 'Tata Tiscon 550D 12mm Rebar',
        brand: 'Tata Tiscon',
        unitPrice: 2450,
        quantity: 10,
        unit: 'Piece',
        gstRate: 18,
        hsnCode: '7214'
      }
    ]
  };

  const pricing = await computePricing({
    items: [{ productId: 'item_rebar_12mm', quantity: 10 }],
    shipping: { state: 'Karnataka', pincode: '560001' },
    quotation: mockQuotation
  });

  assert.equal(pricing.subtotal, 24500);
  assert.equal(pricing.taxBreakup.cgst, 2205);
  assert.equal(pricing.taxBreakup.sgst, 2205);
  assert.equal(pricing.taxBreakup.igst, 0);
  assert.equal(pricing.tax, 4410);
  assert.equal(pricing.delivery, 0);
  assert.equal(pricing.total, 28910);
});

test('5. Inter-State IGST Tax Allocation', async () => {
  const mockQuotation = {
    quotationId: 'BM-QUO-2026-0002',
    deliveryCharge: 500,
    labourCharge: 0,
    items: [
      {
        productId: 'item_cement_50kg',
        name: 'UltraTech Super PPC Cement',
        brand: 'UltraTech',
        unitPrice: 400,
        quantity: 20,
        unit: 'Bag',
        gstRate: 28,
        hsnCode: '2523'
      }
    ]
  };

  // Inter-state shipping to Tamil Nadu (seller state Karnataka)
  const pricing = await computePricing({
    items: [{ productId: 'item_cement_50kg', quantity: 20 }],
    shipping: { state: 'Tamil Nadu', pincode: '600001' },
    quotation: mockQuotation
  });

  assert.equal(pricing.subtotal, 8000);
  assert.equal(pricing.taxBreakup.cgst, 0);
  assert.equal(pricing.taxBreakup.sgst, 0);
  // 28% of 8000 = 2240 IGST
  assert.equal(pricing.taxBreakup.igst, 2240);
  assert.equal(pricing.tax, 2240);
  assert.equal(pricing.delivery, 500);
  assert.equal(pricing.total, 10740);
});

test('6. Auth Token & Reset Security Hashing', () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  assert.equal(rawToken.length, 64);
  assert.equal(tokenHash.length, 64);

  // Verifying token matching without exposing raw token
  const verifyHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  assert.equal(verifyHash, tokenHash);
});
