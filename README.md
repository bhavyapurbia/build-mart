# BuildMart — Fixxly-Style Construction Materials E-Commerce Platform

A production-oriented, modern, and fully responsive construction materials and building supplies e-commerce platform inspired by [Fixxly](https://fixxly.in/).

---

## 🏗️ Highlights & Core Features

### 1. Fixxly-Style Construction Trade Experience
- **Hyper-Local 30-60 Min Site Delivery** guarantee header and live location switcher (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai).
- **8 Core Construction Categories (Electrical completely removed)**:
  1. **Cement & Steel** (UltraTech PPC/OPC, Tata Tiscon Fe 550D TMT bars, binding wire)
  2. **Tiles & Adhesives** (Kajaria vitrified tiles, Roff tile adhesives, epoxy grouts, spacers)
  3. **Waterproofing** (Dr. Fixit LW+, Newcoat elastomeric roof coating, Crack-X acrylic filler)
  4. **CPVC, PVC & GI Fittings** (Astral CPVC PRO SDR 11, brass fittings, Supreme SWR drainage)
  5. **Hardware & Locks** (Godrej Nav-Tal padlocks, mortise locks, SS 304 bearing hinges)
  6. **Bathware** (Jaquar single-lever basin mixers, rain showers, tabletop vanity basins)
  7. **Tools & Accessories** (Bosch angle grinders, diamond cutting wheels, Stanley tapes)
  8. **Construction Materials** (Washed M-Sand, 20mm blue metal aggregate, red bricks, AAC blocks)

### 2. ⚡ Flagship Feature: "Click Product Image to Create Material List"
- Customers can click on **any product image** or card button to instantly toggle items into an unconfirmed **Material Checklist**.
- Real-time visual badge with checkmark and glowing border indicators on selected cards.
- **Floating Material List Bar** with live counter at the bottom of the screen.
- **Dedicated Material List Review Page** (`/material-list`):
  - Adjust required site quantities and units.
  - Enter project site address, preferred delivery date, and site unloading instructions.
  - Submits enquiry generating unique Request ID (e.g. `BM-REQ-xxxx`).
- **Official Quotation Workflow (Crucial Requirement)**:
  - Submitting a material list does *not* automatically charge or confirm the order.
  - The admin reviews the request, verifies warehouse stock, and issues a formal **Quotation** with locked prices and logistics delivery fees.
  - The customer reviews the quotation in **My Quotations** and can **Accept or Reject** it.
  - Upon acceptance, the customer proceeds to confirmed checkout.

### 3. 👷 Checkout with Optional Labour Service
- Professional checkout form (Customer Name, Phone, Email, Site Address, City, Pincode, Delivery instructions).
- **Checkbox:** *"Do you also need labour for this work?"*
- Interactive trade selector:
  - **Mason**, **Tile worker**, **Plumber**, **General construction worker**, **Waterproofing worker**, **Other**.
  - Number of workers required, preferred start date, duration, scope of work.
- Material costs and labour charges are tracked and displayed separately.

### 4. 🚛 High-Volume Bulk Order Enquiry
- Dedicated section on homepage and `/bulk-enquiry` page for contractors, developers, and commercial builders.
- Multi-item requirement schedule (e.g. 100 Tons TMT Steel, 2,000 Bags Cement).
- Direct WhatsApp integration for rapid contractor negotiation.
- Admin dashboard to manage bulk quotes and convert accepted enquiries into orders.

### 5. 🛡️ Complete Admin Dashboard
- Discrete **Admin Login** link in the footer under *Company*.
- **Sections:**
  - **Overview**: 9 live KPIs (Total Sales, Pending Requests, Orders, Quotations, Bulk Enquiries, Labour Bookings, Active Catalog, Customers, Low-Stock Warnings).
  - **Material Requests Management**: Open customer requests, check stock, update unit rates, set delivery freight, and dispatch formal quotations.
  - **Order Management**: Track status progression (`Pending Review` → `Quotation Sent` → `Confirmed` → `Processing` → `Ready for Dispatch` → `Out for Delivery` → `Delivered` → `Cancelled`), print tax invoice with GST breakdown.
  - **Product Management**: Full CRUD with specs, prices, MRP, discounts, units, stock levels, and image URLs.
  - **Category Management**: Manage 8 categories, subcategories, and banner images.
  - **Labour Services**: Assign supervisor teams, calculate labour charges, and update booking status.
  - **Bulk Enquiries**: Prepare commercial wholesale quotations.
  - **Inventory & Stock**: Set reorder thresholds and update current stock.
  - **Customers Directory**: View registered contractors and purchase records.
  - **Coupons**: Manage percentage discounts (e.g. `BUILD10`, `FIRST500`, `CONTRACTOR20`).
  - **Website Settings**: Configure announcement bar, WhatsApp hotline, support phone, and free delivery thresholds.

---

## 🗄️ Database Architecture (MongoDB)

All data is structured in normalized MongoDB collections with Mongoose ODM models:
1. `User` (Customer & Admin roles, hashed passwords)
2. `Category` (8 categories with subcategories)
3. `Brand` (UltraTech, Astral, Dr. Fixit, Tata Tiscon, Jaquar, etc.)
4. `Product` (Pricing, SKU, stock, units, specs, images)
5. `Inventory` (Current stock, thresholds)
6. `MaterialRequest` (Request ID, customer site details, requested items, status)
7. `Quotation` (Quotation ID, itemized rates, freight, customer approval status)
8. `Order` (Order ID, invoice number, material + labour breakdowns, timeline)
9. `LabourRequest` (Booking ID, trade type, worker count, supervisor assignment)
10. `BulkEnquiry` (Commercial multi-item schedules, quote)
11. `Cart` (User / guest cart)
12. `Coupon` (Promotional codes, discount caps)
13. `Notification` (Live notifications for admin and customers)
14. `SiteSetting` (WhatsApp number, announcement bar, support phone)

> **Zero-Configuration Resiliency:** The backend connects to MongoDB at `MONGODB_URI` (default: `mongodb://127.0.0.1:27017/buildmart`). If no external MongoDB daemon is active on the host machine, it seamlessly uses a persistent local JSON document store in `backend/data/` adhering to the exact same MongoDB model APIs without crashing!

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Seed Database
```bash
npm run seed
```
Seeds 29 authentic products across all 8 categories, brands, coupons, demo customer, and admin accounts.

### 2. Start Backend API Server
```bash
npm run backend
# or for auto-reload:
npm run backend:dev
```
The server will start at `http://localhost:5000`.

### 3. Start Frontend Dev Server
In a separate terminal:
```bash
npm run frontend
```
The Vite development server will start at `http://localhost:5173`.

---

## 🔑 Demo Login Credentials

### Administrator Account
- **URL:** `http://localhost:5173/admin/login` (or click "Admin Login" in website footer)
- **Email:** `admin@buildmart.com`
- **Password:** `admin123`

### Demo Contractor Account
- **URL:** `http://localhost:5173/login`
- **Email:** `customer@buildmart.com`
- **Password:** `customer123`

