import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import MaterialRequest from '../models/MaterialRequest.js';
import Quotation from '../models/Quotation.js';
import LabourRequest from '../models/LabourRequest.js';
import BulkEnquiry from '../models/BulkEnquiry.js';
import Notification from '../models/Notification.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import CouponRedemption from '../models/CouponRedemption.js';
import StockReservation from '../models/StockReservation.js';
import RefreshToken from '../models/RefreshToken.js';
import AuditLog from '../models/AuditLog.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Banner from '../models/Banner.js';
import Inventory from '../models/Inventory.js';
import SiteSetting from '../models/SiteSetting.js';
import Cart from '../models/Cart.js';
import ServiceArea from '../models/ServiceArea.js';
import Wishlist from '../models/Wishlist.js';
import Page from '../models/Page.js';

export const syncIndexes = async () => {
  console.log('🔄 Connecting to MongoDB to synchronize indexes...');
  await connectDB();

  const models = [
    User,
    Product,
    Order,
    Payment,
    MaterialRequest,
    Quotation,
    LabourRequest,
    BulkEnquiry,
    Notification,
    Review,
    Coupon,
    CouponRedemption,
    StockReservation,
    RefreshToken,
    AuditLog,
    Category,
    Brand,
    Banner,
    Inventory,
    SiteSetting,
    Cart,
    ServiceArea,
    Wishlist,
    Page
  ];

  console.log(`📊 Synchronizing indexes for ${models.length} models...`);

  for (const model of models) {
    try {
      const modelName = model.modelName || 'Unknown';
      await model.syncIndexes();
      const indexes = await model.collection.indexes();
      console.log(`✅ [${modelName}] synced ${indexes.length} indexes: ${indexes.map(i => i.name).join(', ')}`);
    } catch (err) {
      console.error(`❌ Failed syncing indexes for ${model.modelName}:`, err.message);
    }
  }

  console.log('✨ All collection indexes synchronized successfully.');
};

// If run directly from CLI
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  syncIndexes()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal error during index synchronization:', err);
      await closeDB();
      process.exit(1);
    });
}

export default syncIndexes;

