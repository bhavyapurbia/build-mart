/**
 * createAdmin.js — safely create or update the admin user.
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123! node src/scripts/createAdmin.js
 *
 * Requirements:
 *   - ADMIN_EMAIL must be set
 *   - ADMIN_PASSWORD must be at least 12 characters
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email) {
  console.error('❌ ADMIN_EMAIL environment variable is required.');
  process.exit(1);
}
if (!password || password.length < 8) {
  console.error('❌ ADMIN_PASSWORD must be at least 8 characters.');
  process.exit(1);
}

const run = async () => {
  await connectDB();

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const existing = await User.findOne({ email: email.toLowerCase().trim() });

  if (existing) {
    await User.updateOne(
      { email: email.toLowerCase().trim() },
      { password: hashedPassword, role: 'admin', isActive: true, emailVerified: true }
    );
    console.log(`✅ Admin user updated: ${email}`);
  } else {
    await User.create({
      name: 'BuildMart Administrator',
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      phone: ''
    });
    console.log(`✅ Admin user created: ${email}`);
  }

  process.exit(0);
};

run().catch(err => {
  console.error('❌ Failed to create admin:', err.message);
  process.exit(1);
});

