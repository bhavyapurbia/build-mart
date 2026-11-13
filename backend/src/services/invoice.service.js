import PDFDocument from 'pdfkit';
import SiteSetting from '../models/SiteSetting.js';

/**
 * Converts integer numbers to Indian English currency words.
 */
export const numberToWordsINR = (num) => {
  if (!num || isNaN(num) || num === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : ' ');
  };

  let n = Math.floor(Math.abs(num));
  let str = '';

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  if (crore > 0) str += inWords(crore) + 'Crore ';

  const lakh = Math.floor(n / 100000);
  n %= 100000;
  if (lakh > 0) str += inWords(lakh) + 'Lakh ';

  const thousand = Math.floor(n / 1000);
  n %= 1000;
  if (thousand > 0) str += inWords(thousand) + 'Thousand ';

  const hundred = Math.floor(n / 100);
  n %= 100;
  if (hundred > 0) str += inWords(hundred) + 'Hundred ';

  if (n > 0) {
    if (str !== '') str += 'and ';
    str += inWords(n);
  }

  return `Rupees ${str.trim()} Only`;
};

/**
 * Generates a GST-compliant Tax Invoice PDF stream.
 */
export const generateInvoicePDF = async (order, res) => {
  const settings = (await SiteSetting.findOne().lean()) || {};

  const doc = new PDFDocument({ margin: 36, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Invoice-${order.invoiceNumber || order.orderId}.pdf"`
  );

  doc.pipe(res);

  const primaryColor = '#0F172A';
  const secondaryColor = '#475569';
  const accentColor = '#D97706';

  // 1. Header
  doc
    .fillColor(primaryColor)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(settings.siteName || 'BuildMart', 36, 36);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor(secondaryColor)
    .text(settings.officeAddress || 'BuildMart HQ, Bengaluru, Karnataka 560100', 36, 60)
    .text(`GSTIN: ${settings.sellerGstin || '29AABCB1234F1Z5'} | PAN: ${settings.sellerPan || 'AABCB1234F'}`)
    .text(`State: ${settings.sellerState || 'Karnataka'} (Code: 29) | Support: ${settings.supportPhone || '1800-890-5000'}`);

  // Right-side invoice badge
  doc
    .fillColor(accentColor)
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('TAX INVOICE', 380, 36, { align: 'right', width: 180 })
    .fillColor(primaryColor)
    .fontSize(9)
    .font('Helvetica')
    .text(`Invoice No: ${order.invoiceNumber || 'INV-DRAFT'}`, 380, 56, { align: 'right', width: 180 })
    .text(`Order ID: #${order.orderId}`, 380, 68, { align: 'right', width: 180 })
    .text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 380, 80, { align: 'right', width: 180 });

  doc.moveDown(2);
  doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(36, 105).lineTo(560, 105).stroke();

  // 2. Billing & Shipping Info
  const billY = 115;
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(primaryColor)
    .text('Billed To / Delivered To:', 36, billY);

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(secondaryColor)
    .text(`Name: ${order.customer?.name || 'Valued Customer'}`, 36, billY + 16)
    .text(`Phone: ${order.customer?.phone || ''}`, 36, billY + 28)
    .text(`Address: ${order.customer?.address || ''}, ${order.customer?.city || ''} - ${order.customer?.pincode || ''}`, 36, billY + 40)
    .text(`State: ${order.customer?.state || 'Karnataka'}`, 36, billY + 52);

  if (order.customer?.gstin) {
    doc.text(`Buyer GSTIN: ${order.customer.gstin}`, 36, billY + 64);
  }

  // Payment Status Card
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(primaryColor)
    .text(`Payment Method: ${order.paymentMethod || 'COD'}`, 380, billY + 16, { align: 'right', width: 180 })
    .text(`Payment Status: ${order.paymentStatus || 'Pending'}`, 380, billY + 28, { align: 'right', width: 180 })
    .text(`Order Status: ${order.orderStatus || 'Confirmed'}`, 380, billY + 40, { align: 'right', width: 180 });

  // 3. Items Table
  const tableY = billY + 85;
  doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(36, tableY).lineTo(560, tableY).stroke();

  // Table header background
  doc.rect(36, tableY + 1, 524, 20).fill('#F1F5F9');

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(primaryColor)
    .text('#', 42, tableY + 6)
    .text('Description of Materials', 65, tableY + 6)
    .text('HSN', 250, tableY + 6)
    .text('Qty', 295, tableY + 6)
    .text('Unit Price (₹)', 340, tableY + 6)
    .text('GST %', 420, tableY + 6)
    .text('Total (₹)', 485, tableY + 6, { align: 'right', width: 70 });

  let curY = tableY + 25;
  const items = order.items || [];

  items.forEach((item, index) => {
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(primaryColor)
      .text(String(index + 1), 42, curY)
      .text(`${item.name} (${item.brand || 'Standard'})`, 65, curY, { width: 180 })
      .text(item.hsnCode || '2523', 250, curY)
      .text(`${item.quantity} ${item.unit || ''}`, 295, curY)
      .text(Number(item.price || 0).toLocaleString('en-IN'), 340, curY)
      .text(`${item.gstRate || 18}%`, 420, curY)
      .text(Number(item.total || (item.price * item.quantity)).toLocaleString('en-IN'), 485, curY, { align: 'right', width: 70 });

    curY += 22;
  });

  doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(36, curY).lineTo(560, curY).stroke();

  // 4. Summary Totals
  curY += 10;
  const isInterState = order.taxBreakup?.igst > 0;

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(secondaryColor)
    .text('Material Subtotal:', 340, curY)
    .text(`₹${Number(order.materialCost || 0).toLocaleString('en-IN')}`, 460, curY, { align: 'right', width: 95 });

  curY += 14;
  if (order.discount > 0) {
    doc
      .text('Coupon Discount:', 340, curY)
      .text(`-₹${Number(order.discount).toLocaleString('en-IN')}`, 460, curY, { align: 'right', width: 95 });
    curY += 14;
  }

  if (isInterState) {
    doc
      .text('IGST (Integrated Tax):', 340, curY)
      .text(`₹${Number(order.taxBreakup.igst).toLocaleString('en-IN')}`, 460, curY, { align: 'right', width: 95 });
    curY += 14;
  } else {
    doc
      .text('CGST (Central Tax):', 340, curY)
      .text(`₹${Number(order.taxBreakup?.cgst || (order.tax / 2)).toLocaleString('en-IN')}`, 460, curY, { align: 'right', width: 95 });
    curY += 14;
    doc
      .text('SGST (State Tax):', 340, curY)
      .text(`₹${Number(order.taxBreakup?.sgst || (order.tax / 2)).toLocaleString('en-IN')}`, 460, curY, { align: 'right', width: 95 });
    curY += 14;
  }

  if (order.deliveryCharge > 0) {
    doc
      .text('Site Delivery Freight:', 340, curY)
      .text(`₹${Number(order.deliveryCharge).toLocaleString('en-IN')}`, 460, curY, { align: 'right', width: 95 });
    curY += 14;
  }

  if (order.labourCost > 0) {
    doc
      .text('Labour Services:', 340, curY)
      .text(`₹${Number(order.labourCost).toLocaleString('en-IN')}`, 460, curY, { align: 'right', width: 95 });
    curY += 14;
  }

  doc.strokeColor(primaryColor).lineWidth(1.5).moveTo(340, curY).lineTo(560, curY).stroke();
  curY += 6;

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(primaryColor)
    .text('Total Invoice Value:', 340, curY)
    .text(`₹${Number(order.totalAmount).toLocaleString('en-IN')}`, 460, curY, { align: 'right', width: 95 });

  curY += 24;

  // Amount in words
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(primaryColor)
    .text('Amount in Words: ', 36, curY)
    .font('Helvetica')
    .text(numberToWordsINR(order.totalAmount), 115, curY);

  // Footer & Authorised Signatory
  const footerY = 720;
  doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(36, footerY).lineTo(560, footerY).stroke();

  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor(secondaryColor)
    .text('This is a computer-generated tax invoice issued in terms of Section 31 of CGST Act, 2017.', 36, footerY + 8)
    .text('All building materials are certified genuine and sourced directly from authorized brand plants.', 36, footerY + 18);

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(primaryColor)
    .text(`For ${settings.siteName || 'BuildMart'}`, 420, footerY + 8, { align: 'right', width: 140 })
    .font('Helvetica')
    .fontSize(7)
    .fillColor(secondaryColor)
    .text('Authorized Signatory', 420, footerY + 35, { align: 'right', width: 140 });

  doc.end();
};

export default {
  numberToWordsINR,
  generateInvoicePDF
};

