import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';

const CATEGORIES = [
  'Cement & Steel', 'Tiles & Adhesives', 'Plumbing & Sanitaryware',
  'Paints & Waterproofing', 'Electricals & Lighting', 'Hardware & Tools',
  'Wood & Plywood', 'Sand & Aggregates'
];

const BRANDS = [
  'UltraTech', 'Tata Tiscon', 'Dr. Fixit', 'Astral Pipes',
  'Jaquar', 'Asian Paints', 'Bosch', 'Kajaria', 'ACC', 'Supreme', 'Pidilite'
];

const UNITS = ['Piece', '50kg Bag', '12m Piece', 'Box', 'Liter Bottle', 'Kg'];

export const generateLoadData = async () => {
  const productCountArg = process.argv.find(a => a.startsWith('--products='));
  const orderCountArg = process.argv.find(a => a.startsWith('--orders='));

  const numProducts = productCountArg ? parseInt(productCountArg.split('=')[1], 10) : 10000;
  const numOrders = orderCountArg ? parseInt(orderCountArg.split('=')[1], 10) : 10000; // default 10k for fast execution, can do 50k

  console.log(`\n⚡ Generating High-Volume Load Dataset: ${numProducts} products, ${numOrders} orders...`);
  await connectDB();

  console.log('🔄 Wiping previous performance-test datasets...');
  await Product.deleteMany({ sku: { $regex: /^PERF-/ } });
  await Inventory.deleteMany({ sku: { $regex: /^PERF-/ } });
  await Order.deleteMany({ orderId: { $regex: /^BM-PERF-/ } });

  console.log(`📦 Generating and inserting ${numProducts} products in batches of 1,000...`);
  const batchSize = 1000;
  const productBatches = Math.ceil(numProducts / batchSize);

  let insertedProductIds = [];

  for (let b = 0; b < productBatches; b++) {
    const products = [];
    const inventories = [];
    const count = Math.min(batchSize, numProducts - b * batchSize);

    for (let i = 0; i < count; i++) {
      const idx = b * batchSize + i + 1;
      const brand = BRANDS[idx % BRANDS.length];
      const category = CATEGORIES[idx % CATEGORIES.length];
      const name = `${brand} Performance Grade Spec ${category} #${idx}`;
      const slug = `perf-${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${idx}`;
      const sku = `PERF-${String(idx).padStart(7, '0')}`;
      const price = 100 + (idx % 5000);
      const mrp = price + 50;
      const stock = idx % 2 === 0 ? 100 + (idx % 200) : 0;
      const unit = UNITS[idx % UNITS.length];

      const pId = new mongoose.Types.ObjectId();
      products.push({
        _id: pId,
        name,
        slug,
        sku,
        category,
        brand,
        price,
        mrp,
        discount: 10,
        unit,
        stock,
        minOrderQty: 1,
        gstRate: 18,
        hsnCode: '2523',
        weightKg: 10,
        description: `High performance construction material batch item ${idx} for testing query latency.`,
        searchKeywords: [brand, category, unit, 'quality'],
        images: ['/placeholder-material.jpg'],
        isActive: true,
        isFeatured: idx % 20 === 0,
        isDeal: idx % 15 === 0,
        rating: 0,
        reviewsCount: 0
      });

      inventories.push({
        productId: String(pId),
        productName: name,
        sku,
        currentStock: stock,
        unit
      });

      if (insertedProductIds.length < 500) {
        insertedProductIds.push({ id: String(pId), name, price, brand, unit });
      }
    }

    await Product.insertMany(products, { ordered: false });
    await Inventory.insertMany(inventories, { ordered: false });
    process.stdout.write(`  Inserted ${(b + 1) * batchSize < numProducts ? (b + 1) * batchSize : numProducts}/${numProducts} products...\r`);
  }
  console.log(`\n✅ ${numProducts} products inserted.`);

  console.log(`📦 Generating and inserting ${numOrders} orders in batches of 1,000...`);
  const orderBatches = Math.ceil(numOrders / batchSize);

  for (let b = 0; b < orderBatches; b++) {
    const orders = [];
    const count = Math.min(batchSize, numOrders - b * batchSize);

    for (let i = 0; i < count; i++) {
      const idx = b * batchSize + i + 1;
      const sampleProd = insertedProductIds[idx % insertedProductIds.length];
      const qty = 1 + (idx % 10);
      const matCost = sampleProd.price * qty;
      const tax = Math.round(matCost * 0.18);
      const total = matCost + tax;

      const orderDate = new Date(Date.now() - (idx % 60) * 24 * 60 * 60 * 1000);

      orders.push({
        orderId: `BM-PERF-${String(idx).padStart(7, '0')}`,
        invoiceNumber: `INV-PERF-${String(idx).padStart(7, '0')}`,
        user: `perf-user-${idx % 1000}`,
        customer: {
          name: `Contractor ${idx % 500}`,
          phone: `98765${String(idx % 100000).padStart(5, '0')}`,
          email: `builder${idx % 500}@example.com`,
          address: `Job Site #${idx % 200}, Industrial Area`,
          city: idx % 2 === 0 ? 'Bengaluru' : 'Mumbai',
          pincode: '560001'
        },
        items: [{
          productId: sampleProd.id,
          name: sampleProd.name,
          brand: sampleProd.brand,
          quantity: qty,
          unit: sampleProd.unit,
          price: sampleProd.price,
          total: matCost
        }],
        materialCost: matCost,
        tax,
        taxBreakup: {
          cgst: Math.round(tax / 2),
          sgst: Math.round(tax / 2),
          igst: 0
        },
        deliveryCharge: 0,
        labourCost: 0,
        discount: 0,
        totalAmount: total,
        paymentMethod: idx % 3 === 0 ? 'Online' : 'COD',
        paymentStatus: idx % 4 === 0 ? 'Pending' : 'Paid',
        orderStatus: idx % 10 === 0 ? 'Delivered' : 'Processing',
        createdAt: orderDate,
        updatedAt: orderDate
      });
    }

    await Order.insertMany(orders, { ordered: false });
    process.stdout.write(`  Inserted ${(b + 1) * batchSize < numOrders ? (b + 1) * batchSize : numOrders}/${numOrders} orders...\r`);
  }

  console.log(`\n✅ ${numOrders} orders inserted successfully.`);
  console.log('✨ High-volume performance dataset generation complete.');
};

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  generateLoadData()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal load seed error:', err);
      await closeDB();
      process.exit(1);
    });
}

export default generateLoadData;

