import Counter from '../models/Counter.js';

/**
 * Gets the next integer sequence for a named counter atomically.
 * @param {string} name - e.g. 'order', 'invoice', 'quotation', 'request', 'labour', 'bulk'
 * @returns {Promise<number>}
 */
export async function nextSequence(name) {
  const result = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
}

/**
 * Generates an atomic business ID with standard format.
 */
export async function generateOrderId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`order_${year}`);
  return `BM-ORD-${year}-${seq.toString().padStart(6, '0')}`;
}

export async function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  // Financial Year in India: April to March
  const month = date.getMonth() + 1;
  const fy = month >= 4 ? `${year}-${(year + 1).toString().slice(-2)}` : `${year - 1}-${year.toString().slice(-2)}`;
  const seq = await nextSequence(`invoice_${fy}`);
  return `INV-${fy}-${seq.toString().padStart(5, '0')}`;
}

export async function generateQuotationId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`quotation_${year}`);
  return `BM-QUO-${year}-${seq.toString().padStart(5, '0')}`;
}

export async function generateRequestId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`request_${year}`);
  return `BM-REQ-${year}-${seq.toString().padStart(5, '0')}`;
}

export async function generateLabourId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`labour_${year}`);
  return `BM-LBR-${year}-${seq.toString().padStart(5, '0')}`;
}

export async function generateBulkId() {
  const year = new Date().getFullYear();
  const seq = await nextSequence(`bulk_${year}`);
  return `BM-BLK-${year}-${seq.toString().padStart(5, '0')}`;
}

export async function generateReceiptNumber() {
  const seq = await nextSequence('receipt');
  return `RCPT-${Date.now().toString().slice(-6)}-${seq.toString().padStart(4, '0')}`;
}

export default {
  nextSequence,
  generateOrderId,
  generateInvoiceNumber,
  generateQuotationId,
  generateRequestId,
  generateLabourId,
  generateBulkId,
  generateReceiptNumber
};

