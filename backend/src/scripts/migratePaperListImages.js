import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { connectDB, closeDB } from '../config/db.js';
import MaterialRequest from '../models/MaterialRequest.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

export const migratePaperListImages = async () => {
  const isExecute = process.argv.includes('--execute');
  console.log(`\n🔄 Paper-List Image Migration to Cloudinary [Mode: ${isExecute ? 'EXECUTE' : 'DRY-RUN (default)'}]`);
  console.log('   Pass --execute to actually upload images and update database records.\n');

  await connectDB();

  // Find all MaterialRequests with base64 images
  const requests = await MaterialRequest.find({
    paperListImage: { $regex: /^data:image\//i }
  });

  console.log(`Found ${requests.length} MaterialRequest(s) with raw base64 paper-list images.`);

  if (requests.length === 0) {
    console.log('✨ No legacy base64 images found. All images are already migrated.');
    return;
  }

  let migratedCount = 0;
  for (const doc of requests) {
    const preview = doc.paperListImage.slice(0, 50) + '... (' + doc.paperListImage.length + ' chars)';
    console.log(`- Request #${doc.requestId}: ${preview}`);

    if (isExecute) {
      try {
        // Extract base64 data and extension
        const matches = doc.paperListImage.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (!matches || matches.length < 3) {
          console.warn(`  ⚠️ Could not parse base64 for #${doc.requestId}. Skipping.`);
          continue;
        }

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');

        const tempFilePath = path.join(os.tmpdir(), `migrate_paper_${doc.requestId}_${Date.now()}.${ext}`);
        fs.writeFileSync(tempFilePath, buffer);

        const uploadResult = await uploadOnCloudinary(tempFilePath, 'buildmart/paper-lists');
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

        if (uploadResult && uploadResult.secure_url) {
          doc.paperListImage = uploadResult.secure_url;
          await doc.save();
          console.log(`  ✅ Successfully migrated #${doc.requestId} → ${uploadResult.secure_url}`);
          migratedCount++;
        } else {
          console.error(`  ❌ Cloudinary upload failed for #${doc.requestId}`);
        }
      } catch (err) {
        console.error(`  ❌ Error migrating #${doc.requestId}:`, err.message);
      }
    }
  }

  if (isExecute) {
    console.log(`\n🎉 Migration complete. Successfully migrated ${migratedCount}/${requests.length} images.`);
  } else {
    console.log(`\n💡 Dry-run complete. Run with --execute to perform migration.`);
  }
};

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  migratePaperListImages()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal migration error:', err);
      await closeDB();
      process.exit(1);
    });
}

export default migratePaperListImages;

