# Phase 2 Report — Make the Money Path Correct

**Date:** 2026-11-13  
**Audit IDs addressed:** S5, S6, S7, S8, S9, B1, B2, B3, B4, B5, B6, B7, B8, B10, B19

---

## What Changed

### 1. Server-Authoritative Pricing Service (S5, B1)
- **Created:** `backend/src/services/pricing.service.js` with `computePricing({ items, couponCode, shipping, userId, quotation })`.
- All monetary math computed internally in integer paise to eliminate floating-point rounding errors, rounded once at the rupee boundary.
- **Client prices are discarded completely.** Prices are loaded from the database records (or from locked quotation lines in quotation mode).
- Proportional line-item coupon allocation with maximum discount caps.
- Dynamic GST calculation per line (`Product.gstRate`, defaulting to 18%):
  - **Intra-state** (e.g. Karnataka -> Karnataka): split evenly into CGST and SGST.
  - **Inter-state** (e.g. Karnataka -> Maharashtra): calculated as IGST.
- Delivery freight derived from `SiteSetting.freeDeliveryThreshold` (>= ₹5,000 is free, otherwise ₹350 standard freight). All `"removed for payment testing"` hacks eradicated.
- Labour charges: only approved labour is billable; clients cannot inject custom amounts.

### 2. Atomic Counters (B1)
- **Created:** `backend/src/models/Counter.js` and `backend/src/utils/counter.js`.
- Implemented `nextSequence(name)` using atomic `findOneAndUpdate({ $inc: { seq: 1 } }, { upsert: true, new: true })`.
- Replaced all insecure `countDocuments() + Date.now()` generators with atomic gap-free format:
  - Orders: `BM-ORD-YYYY-000001`
  - Invoices: `INV-YYYY-YY-00001` (Financial year aligned)
  - Quotations: `BM-QUO-YYYY-00001`
  - Material Requests: `BM-REQ-YYYY-00001`
  - Labour Requests: `BM-LBR-YYYY-00001`
  - Bulk Enquiries: `BM-BLK-YYYY-00001`

### 3. Rewritten `createOrder` (COD / Bank Transfer) & Stock Management (B1, B19)
- **Created:** `backend/src/services/order.service.js`.
- `createOrder` accepts only `{ items: [{ productId, quantity }], couponCode, customer, paymentMethod, labourDetails, quotationId }`.
- Direct order payment status is always initialized to `'Pending'`.
- Atomic stock decrements via `Product.updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })`.
- Compensating rollback if any SKU fails mid-transaction, returning HTTP 409 with the failing product details.
- Inventory audit entries recorded in `Inventory.history` for every fulfillment.
- Automatic `'stock'` alert notifications created when inventory drops below `reorderPoint`.
- Atomic coupon redemption recorded in `CouponRedemption` with per-user and campaign usage limits.

### 4. Labour Integration Rewrite (B2)
- **Created:** `backend/src/services/labour.service.js` with `createFromOrder(order, labourInput)`.
- Replaced mismatched schemas in order and payment controllers with proper `LabourRequest` fields: `bookingId`, `orderId`, `labourType`, `workersRequired`, `preferredStartDate`, `expectedDuration`, and site address.
- Labour creation is completely non-fatal after online payment: if it encounters an issue, it logs a warning, alerts the admin, and ensures the confirmed order is never dropped.

### 5. Razorpay Flow Rewrite (S6, S7, S8, B5)
- **`createRazorpayOrder`**:
  - Calculates pricing authoritatively on the server.
  - Reserves stock for 15 minutes (`StockReservation` with `reservedUntil = now + 15m`).
  - Persists `pricingSnapshot` and `itemsSnapshot` on the `Payment` document.
  - Generates atomic gateway receipt.
- **`verifyRazorpayPayment`**:
  - **Completely ignores any client-sent `orderData` or prices.**
  - Verifies cryptographic HMAC-SHA256 signature using `crypto.timingSafeEqual`.
  - Verifies amount and gateway capture status against Razorpay API.
  - Atomically claims payment status: `findOneAndUpdate({ _id, status: { $in: ['created', 'authorized'] } }, { status: 'processing' })` ensuring single-winner execution.
  - Settle failure safety: if internal order creation fails after gateway capture, payment status is transitioned to `needs_attention`, an admin alert is triggered, and a 202 status with a support reference is returned.
- **`handleWebhook`**:
  - Requires `RAZORPAY_WEBHOOK_SECRET` in production.
  - Rejects missing or invalid signatures with HTTP 401.
  - Idempotency enforced via `WebhookEvent` model with `x-razorpay-event-id`.
  - Uses the exact same `settleCapturedPayment` logic as the verify endpoint.
  - Handles `payment.captured`, `order.paid`, `payment.failed`, and `refund.processed`.
- **`refundPayment`**:
  - Accumulates `refundedAmount` on Payment record.
  - Rejects refunds exceeding remaining captured amount.
  - On full refund: sets order status to `'Cancelled'`, restores stock back to inventory, and sends email notification.

### 6. Quotation -> Order Conversion Flow (B3)
- **Backend:**
  - Added `POST /api/quotations/:id/checkout` (owner only, status `Accepted`, not expired). Computes server pricing using locked quotation rates.
  - In `createOrderRecord`: transitions `Quotation` status to `'Converted to Order'` (with `orderId`), updates parent `MaterialRequest` to `'Converted to Order'`, and logs timeline entry.
  - Validates stock before checkout and alerts admin if warehouse shortage occurs.
- **Frontend (`CheckoutPage.jsx` & `AccountPage.jsx`):**
  - Checkout supports `/checkout?quotation=BM-QUO-...`.
  - Line items are locked and marked with a prominent "🔒 Formal Builder Quotation (Locked Pricing)" banner.
  - On `AccountPage.jsx`, replaced the static `"Warehouse dispatch scheduled"` text with an active **Accept & Pay** button leading straight to `/checkout?quotation=...`.
  - Expired quotations display `"Expired — request a refresh"`.

### 7. Order Lifecycle State Machine & Customer Cancellation
- **Created:** `backend/src/utils/order.stateMachine.js`.
- Strictly enforces allowed transitions: `Pending Review` -> `Confirmed` -> `Processing` -> `Ready for Dispatch` -> `Out for Delivery` -> `Delivered`.
- Rejects illegal transitions with HTTP 409 Conflict.
- Restores product stock automatically whenever an order transitions to `Cancelled`.
- `POST /api/orders/:id/cancel`: customer self-service cancellation allowed before `Ready for Dispatch`.
- `POST /api/orders/track`: public rate-limited guest order status tracking without leaking PII.

### 8. Product Model & Admin Refinements (B8, B10)
- Added `gstRate`, `hsnCode`, and `deletedAt` to `Product.js`.
- Allows `stock: 0`.
- Generates unique SKUs via atomic counter and unique slug with collision suffix.
- Soft-delete implemented when existing orders reference a product.
- Whitelisted updates on `PUT /api/products/:id`.
- Payment transactions list paginated and enriched with order data.

---

## Files Touched / Created

| File | Action | Purpose |
|------|--------|---------|
| `backend/src/services/pricing.service.js` | **Created** | Server-authoritative pricing, GST split, coupon allocation |
| `backend/src/services/order.service.js` | **Created** | Atomic stock management, order persistence, inventory logging |
| `backend/src/services/labour.service.js` | **Created** | Non-fatal labour request creation aligned with model |
| `backend/src/utils/counter.js` | **Created** | Atomic sequence and business ID generators |
| `backend/src/utils/order.stateMachine.js` | **Created** | State machine validation and cancellation rules |
| `backend/src/models/Counter.js` | **Created** | Counter model for atomic numbering |
| `backend/src/models/CouponRedemption.js` | **Created** | Tracks coupon usage per user |
| `backend/src/models/StockReservation.js` | **Created** | 15-minute stock hold for payment gateways |
| `backend/src/models/WebhookEvent.js` | **Created** | Webhook deduplication store |
| `backend/src/models/dbAdapter.js` | **Updated** | Added `findOneAndUpdate`, `$inc`, `$push`, `upsert`, `.lean()` to `LocalModel` |
| `backend/src/models/Order.js` | **Updated** | Added flat pricing fields, tax breakup, and unique invoice indexes |
| `backend/src/models/Payment.js` | **Updated** | Added server pricing/items snapshots and refund tracking |
| `backend/src/models/Product.js` | **Updated** | Added `gstRate`, `hsnCode`, `deletedAt`, allowed stock: 0 |
| `backend/src/models/Coupon.js` | **Updated** | Added real date windows and per-user limits |
| `backend/src/controllers/order.controller.js` | **Rewritten** | Server pricing, state machine, customer cancellation, tracking |
| `backend/src/controllers/payment.controller.js` | **Rewritten** | Tamper-proof Razorpay verify, webhook deduplication, refund ledger |
| `backend/src/controllers/quotation.controller.js` | **Updated** | Added checkout quotation endpoint, atomic numbering |
| `backend/src/controllers/product.controller.js` | **Updated** | Soft delete, SKU counter, slug collision suffix, whitelist updates |
| `backend/src/controllers/coupon.controller.js` | **Updated** | Real date windows, per-user redemption limits |
| `backend/src/controllers/materialRequest.controller.js`| **Updated** | Atomic request ID numbering |
| `backend/src/controllers/labour.controller.js` | **Updated** | Atomic labour ID numbering |
| `backend/src/controllers/bulkEnquiry.controller.js` | **Updated** | Atomic bulk ID numbering |
| `backend/src/routes/orderRoutes.js` | **Updated** | Added `/track` and `/:id/cancel` endpoints |
| `backend/src/routes/quotationRoutes.js` | **Updated** | Added `/:id/checkout` and `/admin/:id` endpoints |
| `backend/tests/pricing.test.js` | **Created** | Unit test suite covering pricing, GST, caps, and stock |
| `frontend/src/pages/CheckoutPage.jsx` | **Updated** | Locked quotation mode banner, server-authoritative payload |
| `frontend/src/pages/AccountPage.jsx` | **Updated** | Added "Accept & Pay" button linking to checkout |
| `frontend/src/context/CartContext.jsx` | **Updated** | Free delivery threshold and coupon recalculation |

---

## Verification & Test Results

### 1. Automated Test Suite
Ran `npm test` in `backend/`:
```
✔ 1. Pricing Service: GST split (Intra-state CGST+SGST vs Inter-state IGST) (19.0872ms)
✔ 2. Pricing Service: Free delivery threshold vs below threshold freight (11.8721ms)
✔ 3. Pricing Service: Coupon cap and proportional line allocation (17.28ms)
✔ 4. Pricing Service: Client-sent prices are strictly ignored (9.3925ms)
✔ 5. Order State Machine: Valid and Invalid status transitions (1.7215ms)
✔ 6. Atomic Counter: Sequential gap-free ID generation (12.2196ms)
✔ 7. Stock Management: Atomic decrement and insufficient stock rejection (10.3115ms)
✔ 8. Quotation Pricing: Locked quotation unit rate overrides regular price (1.3396ms)

ℹ tests 8
ℹ pass 8
ℹ fail 0
```

### 2. Frontend Build
Ran `npm run build` in `frontend/`:
```
✓ 1695 modules transformed.
dist/index.html                   1.15 kB │ gzip:   0.66 kB
dist/assets/index-txmOojy3.css  100.85 kB │ gzip:  15.76 kB
dist/assets/index-DI4WOz21.js   608.66 kB │ gzip: 154.83 kB
✓ built in 10.55s
```

### 3. Appendix D Manual Verification

```bash
# 1. Price tampering check: Client sends price: 1 for ₹500 item -> stored order uses DB price
# Verified by test #4: tampered price: 1 was ignored, stored line price was 3200.

# 2. Unsigned webhook check -> returns 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:5000/api/webhooks/razorpay \
  -H 'Content-Type: application/json' -d '{"event":"payment.captured"}'
# Response: 401 (Missing x-razorpay-signature header)

# 3. Quotation IDOR check -> 403 Forbidden / 404 Not Found
# Verified by assertOwnerOrAdmin in getQuotationById and respondToQuotation.

# 4. Search for "removed for payment testing" -> returns 0 results
grep -rn "removed for payment testing" backend/src frontend/src
# Returned 0 results
```

---

## Remaining Risks & Next Steps (Phase 3)
1. In development mode without a running MongoDB daemon, `LocalModel` persists in JSON files (`backend/src/data/`). Phase 3 will introduce `mongodb-memory-server` to retire `dbAdapter.js` completely.
2. Background worker queue (BullMQ / Redis) for auto-expiring stale quotations and abandoned payment reservations will be introduced in Phase 3.

