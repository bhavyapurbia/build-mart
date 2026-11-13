import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import CouponRedemption from '../models/CouponRedemption.js';
import SiteSetting from '../models/SiteSetting.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Server-authoritative pricing calculation.
 * All intermediate money calculations are done in integer paise to avoid float errors.
 */
export async function computePricing({
  items = [],
  couponCode = '',
  shipping = {},
  userId = null,
  quotation = null
}) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Cart items cannot be empty.');
  }

  // Load site settings for delivery threshold & seller state
  const settings = await SiteSetting.findOne().lean();
  const sellerState = (settings?.sellerState || 'Karnataka').toLowerCase().trim();
  const customerState = (shipping.state || 'Karnataka').toLowerCase().trim();
  const isInterState = customerState !== sellerState;
  const freeDeliveryThreshold = Number(settings?.freeDeliveryThreshold) || 5000;

  const lines = [];
  let subtotalPaise = 0;

  if (quotation) {
    // ─── Quotation Mode: Use locked quotation rates ─────────────────────────
    const quoItems = quotation.items || [];
    for (const item of items) {
      const pId = String(item.productId || item._id);
      const matchedQuoItem = quoItems.find(qi => String(qi.productId) === pId || qi.name === item.name);
      if (!matchedQuoItem) {
        throw new ApiError(400, `Item ${item.name || pId} is not part of quotation #${quotation.quotationId}`);
      }

      const qty = Math.max(1, Number(item.quantity) || Number(matchedQuoItem.quantity) || 1);
      const unitPriceRupees = Number(matchedQuoItem.unitPrice) || 0;
      const unitPricePaise = Math.round(unitPriceRupees * 100);
      const lineTotalPaise = unitPricePaise * qty;

      subtotalPaise += lineTotalPaise;
      lines.push({
        productId: pId,
        name: matchedQuoItem.name,
        brand: matchedQuoItem.brand || '',
        image: matchedQuoItem.image || '',
        unit: matchedQuoItem.unit || 'Piece',
        quantity: qty,
        price: unitPriceRupees,
        pricePaise: unitPricePaise,
        gstRate: Number(matchedQuoItem.gstRate) || 18,
        hsnCode: matchedQuoItem.hsnCode || '2523',
        lineTotalPaise
      });
    }
  } else {
    // ─── Standard Catalogue Mode: Load from database ─────────────────────────
    for (const item of items) {
      const pId = String(item.productId || item._id || '');
      if (!pId) {
        throw new ApiError(400, 'Every line item must have a valid productId.');
      }

      const prod = await Product.findById(pId).lean();
      if (!prod || prod.isActive === false || prod.deletedAt) {
        throw new ApiError(404, `Product not found or is currently unavailable (ID: ${pId}).`);
      }

      const qty = Number(item.quantity);
      if (!qty || qty < 1 || !Number.isInteger(qty)) {
        throw new ApiError(400, `Invalid quantity for ${prod.name}. Must be an integer >= 1.`);
      }

      const minQty = Number(prod.minOrderQty) || 1;
      if (qty < minQty) {
        throw new ApiError(400, `Minimum order quantity for ${prod.name} is ${minQty} ${prod.unit || 'units'}.`);
      }

      const currentStock = Number(prod.stock) || 0;
      if (qty > currentStock) {
        throw new ApiError(409, `Insufficient stock for ${prod.name}. Requested: ${qty}, Available: ${currentStock}.`);
      }

      const priceRupees = Number(prod.price) || 0;
      const pricePaise = Math.round(priceRupees * 100);
      const lineTotalPaise = pricePaise * qty;

      subtotalPaise += lineTotalPaise;
      lines.push({
        productId: String(prod._id),
        name: prod.name,
        brand: prod.brand || '',
        image: prod.images?.[0] || prod.image || '',
        unit: prod.unit || 'Piece',
        quantity: qty,
        price: priceRupees,
        pricePaise,
        gstRate: Number(prod.gstRate) || 18,
        hsnCode: prod.hsnCode || '2523',
        lineTotalPaise
      });
    }
  }

  // ─── Coupon Validation & Discount Allocation ─────────────────────────────
  let discountPaise = 0;
  let appliedCouponCode = '';

  if (couponCode && !quotation) {
    const cleanCode = String(couponCode).toUpperCase().trim();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true }).lean();

    if (coupon) {
      const now = new Date();
      const isExpired = coupon.validUntil && new Date(coupon.validUntil) < now;
      const isNotStarted = coupon.startsAt && new Date(coupon.startsAt) > now;
      const subtotalRupees = subtotalPaise / 100;
      const meetsMinOrder = subtotalRupees >= (Number(coupon.minOrderValue) || 1000);
      const meetsUsageLimit = !coupon.usageLimit || (Number(coupon.usageCount) || 0) < coupon.usageLimit;

      let meetsPerUserLimit = true;
      if (userId && coupon.perUserLimit) {
        const redemptionCount = await CouponRedemption.countDocuments({
          code: cleanCode,
          user: String(userId)
        });
        meetsPerUserLimit = redemptionCount < coupon.perUserLimit;
      }

      if (!isExpired && !isNotStarted && meetsMinOrder && meetsUsageLimit && meetsPerUserLimit) {
        const pct = Number(coupon.discountPercent) || 0;
        const rawDiscountPaise = Math.round((subtotalPaise * pct) / 100);
        const maxDiscountPaise = (Number(coupon.maxDiscount) || 5000) * 100;
        discountPaise = Math.min(rawDiscountPaise, maxDiscountPaise);
        appliedCouponCode = cleanCode;
      }
    }
  }

  // Proportional discount allocation per line
  let remainingDiscountPaise = discountPaise;
  lines.forEach((line, index) => {
    if (subtotalPaise === 0) {
      line.discountAllocationPaise = 0;
    } else if (index === lines.length - 1) {
      line.discountAllocationPaise = remainingDiscountPaise;
    } else {
      const share = line.lineTotalPaise / subtotalPaise;
      const lineDisc = Math.round(discountPaise * share);
      line.discountAllocationPaise = Math.min(remainingDiscountPaise, lineDisc);
      remainingDiscountPaise -= line.discountAllocationPaise;
    }
    line.discountAllocation = Number((line.discountAllocationPaise / 100).toFixed(2));
  });

  // ─── GST Calculation Per Line ───────────────────────────────────────────
  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;

  lines.forEach(line => {
    const taxablePaise = Math.max(0, line.lineTotalPaise - line.discountAllocationPaise);
    const lineGstRate = line.gstRate || 18;
    const lineTaxPaise = Math.round((taxablePaise * lineGstRate) / 100);

    line.taxPaise = lineTaxPaise;
    line.tax = Number((lineTaxPaise / 100).toFixed(2));
    line.total = Number(((line.lineTotalPaise - line.discountAllocationPaise + lineTaxPaise) / 100).toFixed(2));

    if (isInterState) {
      igstPaise += lineTaxPaise;
    } else {
      const halfTax = Math.round(lineTaxPaise / 2);
      cgstPaise += halfTax;
      sgstPaise += (lineTaxPaise - halfTax);
    }
  });

  const totalTaxPaise = isInterState ? igstPaise : (cgstPaise + sgstPaise);

  // ─── Delivery Fee Calculation ───────────────────────────────────────────
  let deliveryFeeRupees = 0;
  const subtotalRupees = subtotalPaise / 100;

  if (quotation && quotation.deliveryCharge != null) {
    deliveryFeeRupees = Number(quotation.deliveryCharge);
  } else {
    // Free delivery if subtotal meets or exceeds threshold
    if (subtotalRupees >= freeDeliveryThreshold) {
      deliveryFeeRupees = 0;
    } else {
      // Zone / standard heavy material freight: standard ₹350 below threshold
      deliveryFeeRupees = 350;
    }
  }
  const deliveryPaise = Math.round(deliveryFeeRupees * 100);

  // ─── Labour Cost ────────────────────────────────────────────────────────
  let labourFeeRupees = 0;
  if (quotation && quotation.labourCharge != null) {
    labourFeeRupees = Number(quotation.labourCharge);
  }
  const labourPaise = Math.round(labourFeeRupees * 100);

  // ─── Final Total in Paise & Rupee Boundary ───────────────────────────────
  const totalPaise = Math.max(
    0,
    subtotalPaise - discountPaise + totalTaxPaise + deliveryPaise + labourPaise
  );

  return {
    lines,
    subtotal: Number((subtotalPaise / 100).toFixed(2)),
    subtotalPaise,
    discount: Number((discountPaise / 100).toFixed(2)),
    discountPaise,
    appliedCouponCode,
    taxBreakup: {
      cgst: Number((cgstPaise / 100).toFixed(2)),
      sgst: Number((sgstPaise / 100).toFixed(2)),
      igst: Number((igstPaise / 100).toFixed(2))
    },
    tax: Number((totalTaxPaise / 100).toFixed(2)),
    taxPaise: totalTaxPaise,
    delivery: deliveryFeeRupees,
    deliveryPaise,
    labour: labourFeeRupees,
    labourPaise,
    total: Number((totalPaise / 100).toFixed(2)),
    totalPaise,
    currency: 'INR'
  };
}

export default { computePricing };

