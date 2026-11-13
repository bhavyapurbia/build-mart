import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Quotation from '../models/Quotation.js';
import MaterialRequest from '../models/MaterialRequest.js';
import BulkEnquiry from '../models/BulkEnquiry.js';
import Counter from '../models/Counter.js';

const isDryRun = process.argv.includes('--dry-run');

console.log(`[Migration] Starting migrations runner ${isDryRun ? '(DRY-RUN MODE)' : '(LIVE EXECUTION)'}...`);

async function runMigrations() {
  await connectDB();

  console.log('\n--- Migration 001: Normalize Product Fields (gstRate, hsnCode, ratings) ---');
  const productsWithoutGst = await Product.find({
    $or: [
      { gstRate: { $exists: false } },
      { hsnCode: { $exists: false } },
      { rating: { $exists: false } },
      { reviewsCount: { $exists: false } }
    ]
  });
  console.log(`Found ${productsWithoutGst.length} products needing field normalization.`);
  if (!isDryRun && productsWithoutGst.length > 0) {
    const res = await Product.updateMany(
      {
        $or: [
          { gstRate: { $exists: false } },
          { hsnCode: { $exists: false } },
          { rating: { $exists: false } },
          { reviewsCount: { $exists: false } }
        ]
      },
      {
        $set: {
          gstRate: 18,
          hsnCode: '2523',
          rating: 0,
          reviewsCount: 0
        }
      }
    );
    console.log(`Updated ${res.modifiedCount} products with default GST & rating fields.`);
  }

  console.log('\n--- Migration 002: Deduplicate Product Slugs ---');
  const allProducts = await Product.find({}).select('_id name slug').lean();
  const slugCounts = new Map();
  for (const p of allProducts) {
    slugCounts.set(p.slug, (slugCounts.get(p.slug) || 0) + 1);
  }

  let dedupeCount = 0;
  for (const [slug, count] of slugCounts.entries()) {
    if (count > 1) {
      console.log(`Duplicate slug detected: "${slug}" (${count} occurrences)`);
      const matches = allProducts.filter(p => p.slug === slug);
      // Keep the first, update remaining
      for (let i = 1; i < matches.length; i++) {
        const item = matches[i];
        const newSlug = `${slug}-${i + 1}`;
        console.log(`  -> Assigning new slug "${newSlug}" to product ${item._id}`);
        if (!isDryRun) {
          await Product.updateOne({ _id: item._id }, { $set: { slug: newSlug } });
        }
        dedupeCount++;
      }
    }
  }
  console.log(`Resolved ${dedupeCount} duplicate slugs.`);

  console.log('\n--- Migration 003: Seed Atomic Counters from Existing Max IDs ---');
  const entities = [
    { name: 'order', model: Order, field: 'orderId', prefix: 'ORD' },
    { name: 'quotation', model: Quotation, field: 'quotationId', prefix: 'QUO' },
    { name: 'material_request', model: MaterialRequest, field: 'requestId', prefix: 'REQ' },
    { name: 'bulk_enquiry', model: BulkEnquiry, field: 'enquiryId', prefix: 'BLK' }
  ];

  for (const { name, model, field, prefix } of entities) {
    const docs = await model.find({}).select(field).lean();
    let maxNum = 1000;

    docs.forEach(doc => {
      const val = doc[field];
      if (typeof val === 'number') {
        if (val > maxNum) maxNum = val;
      } else if (typeof val === 'string') {
        const match = val.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });

    console.log(`Max ID for ${name} found: ${maxNum}`);
    if (!isDryRun) {
      await Counter.findOneAndUpdate(
        { entity: name },
        { $max: { seq: maxNum } },
        { upsert: true, new: true }
      );
      console.log(`  -> Synced counter '${name}' to at least ${maxNum}`);
    }
  }

  console.log('\n[Migration] All database migrations completed successfully.');
  await closeDB();
}

runMigrations().catch(err => {
  console.error('[Migration Error]:', err);
  process.exit(1);
});

