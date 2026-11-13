import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { connectDB, closeDB } from '../src/config/db.js';
import app from '../src/app.js';
import Product from '../src/models/Product.js';
import Cart from '../src/models/Cart.js';
import User from '../src/models/User.js';
import { JWT_SECRET } from '../src/middleware/auth.middleware.js';
import jwt from 'jsonwebtoken';

let server;
let baseUrl;

before(async () => {
  await connectDB();
  await Product.deleteMany({});
  await Cart.deleteMany({});
  await User.deleteMany({});

  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await closeDB();
});

test('Phase 5 - Task 1: GET /robots.txt serves SEO rules with Sitemap directive', async () => {
  const res = await fetch(`${baseUrl}/robots.txt`);
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes('User-agent: *'));
  assert.ok(text.includes('Disallow: /admin'));
  assert.ok(text.includes('Disallow: /checkout'));
  assert.ok(text.includes('Disallow: /account'));
  assert.ok(text.includes('Sitemap:'));
});

test('Phase 5 - Task 2: GET /sitemap.xml generates valid XML with products and core routes', async () => {
  await Product.create({
    name: 'TMT Steel Bars 12mm Fe550D',
    sku: 'TMT-12MM-FE550D',
    slug: 'tmt-steel-bars-12mm-fe550d',
    category: 'Cement & Steel',
    brand: 'Tata Tiscon',
    price: 65000,
    mrp: 72000,
    stock: 50,
    unit: 'Tonne',
    isActive: true
  });

  const res = await fetch(`${baseUrl}/sitemap.xml`);
  assert.equal(res.status, 200);
  assert.ok(res.headers.get('content-type').includes('xml'));
  const text = await res.text();
  assert.ok(text.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(text.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
  assert.ok(text.includes('/p/tmt-steel-bars-12mm-fe550d'));
  assert.ok(text.includes('/products'));
  assert.ok(text.includes('/bulk-enquiry'));
});

test('Phase 5 - Task 3: POST /api/cart/validate verifies server prices and inventory flags', async () => {
  const prod = await Product.create({
    name: 'Ultratech Super Cement 50kg',
    sku: 'UTC-SUP-50KG',
    slug: 'ultratech-super-cement-50kg',
    category: 'Cement & Steel',
    brand: 'UltraTech',
    price: 395,
    mrp: 440,
    stock: 5,
    unit: 'Bag',
    isActive: true
  });

  // Client submits outdated price ₹350 and qty 10 (exceeding stock 5)
  const res = await fetch(`${baseUrl}/api/cart/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [
        {
          product: prod._id.toString(),
          name: prod.name,
          quantity: 10,
          price: 350
        }
      ]
    })
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  const validated = json.data;
  assert.equal(validated.hasChanges, true);
  assert.ok(validated.alerts.length >= 1);
  // Validated items should contain the real server price
  assert.equal(validated.items[0].price, 395);
  // And cap or flag the quantity
  assert.equal(validated.items[0].quantity, 5);
});

test('Phase 5 - Task 4: POST /api/cart/merge merges guest cart items on customer login', async () => {
  const prodA = await Product.create({
    name: 'Astral CPVC Pipe 1 Inch',
    sku: 'AST-CPVC-1IN',
    slug: 'astral-cpvc-pipe-1-inch',
    category: 'Plumbing',
    brand: 'Astral',
    price: 420,
    mrp: 480,
    stock: 100,
    unit: 'Piece',
    isActive: true
  });

  const prodB = await Product.create({
    name: 'Dr Fixit Waterproofing Chemical 5L',
    sku: 'DF-WP-5L',
    slug: 'dr-fixit-waterproofing-chemical-5l',
    category: 'Waterproofing',
    brand: 'Dr. Fixit',
    price: 850,
    mrp: 990,
    stock: 50,
    unit: 'Can',
    isActive: true
  });

  const testUser = await User.create({
    name: 'Cart Merge Tester',
    email: 'cartmerge@buildmart.in',
    password: 'Password123!',
    phone: '9988776655'
  });

  const token = jwt.sign(
    { id: testUser._id.toString(), email: testUser.email, role: 'customer' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Pre-existing user cart with prodA qty 2
  await Cart.create({
    user: testUser._id.toString(),
    items: [
      {
        productId: prodA._id.toString(),
        name: prodA.name,
        quantity: 2,
        price: 420
      }
    ]
  });

  // Guest cart to merge has prodA qty 3 and prodB qty 1
  const res = await fetch(`${baseUrl}/api/cart/merge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      guestItems: [
        { productId: prodA._id.toString(), name: prodA.name, quantity: 3, price: 420 },
        { productId: prodB._id.toString(), name: prodB.name, quantity: 1, price: 850 }
      ]
    })
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  const cart = json.data;
  assert.equal(cart.items.length, 2);

  const mergedItemA = cart.items.find(i => String(i.productId) === prodA._id.toString());
  assert.ok(mergedItemA);
  assert.equal(mergedItemA.quantity, 5); // 2 + 3

  const mergedItemB = cart.items.find(i => String(i.productId) === prodB._id.toString());
  assert.ok(mergedItemB);
  assert.equal(mergedItemB.quantity, 1);
});
