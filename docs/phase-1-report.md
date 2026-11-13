# Phase 1 Report — Critical Security Fixes

**Date:** 2026-11-13  
**Audit IDs addressed:** S1, S2, S3, S4, S10, S11, S12, S13, S14, S17, S18, S19

---

## What Changed

### S1 — Demo token backdoor removed
- `backend/src/middleware/auth.middleware.js`: removed the `if (token === 'bm_admin_demo_jwt_token')` bypass entirely.
- `frontend/src/context/AuthContext.jsx`: removed all `bm_admin_demo_jwt_token` references, the demo-admin catch-fallback, and the `ensureAdminAccess` function.
- `frontend/src/pages/admin/AdminLayout.jsx`: "Open Admin Console Instantly" button replaced with a redirect `<Link>` to `/admin/login`.

### S2 / S3 — `admin123` / empty-password bypass removed
- `backend/src/controllers/auth.controller.js`: `adminLogin` now requires both `email` and `password`, performs a full bcrypt comparison, and uses a single constant-time failure path. The old "fail-safe bypass" block is gone.

### S4 / S19 — Env validation & secrets
- **New:** `backend/src/config/env.js` — validates env vars with `zod`. In production: `JWT_SECRET` ≥ 32 chars, `MONGODB_URI`, `RAZORPAY_WEBHOOK_SECRET` are required. The server exits with a clear error if any are missing.
- `backend/src/server.js` — imports `./config/env.js` first.
- Removed the fallback `JWT_SECRET = 'buildmart_master_secret_key_2026'`. Dev uses a clearly-labelled dev-only placeholder; production fails fast.
- Removed "auto-create user from JWT claims" logic in `authenticate` and `optionalAuth` — a token for a non-existent user is a 401.
- **New:** `backend/.env.example` and `frontend/.env.example` with all variables documented.

### S19 — Seed guard
- `backend/src/seed/seed.js`: exits with a clear error in `NODE_ENV=production` unless both `--force` and `CONFIRM_WIPE=yes` are given. Prints the target database name before seeding.
- Default credentials (`admin123`/`customer123`) remain in development mode for convenience; production seed uses `ADMIN_PASSWORD` from env.

### S17 — HTTP hardening
- **New packages:** `helmet`, `express-rate-limit`, `hpp`, `express-mongo-sanitize`, `compression`.
- `backend/src/app.js`:
  - Helmet security headers applied.
  - CORS rewritten to allowlist from `CLIENT_URL` env var (comma-separated); `origin: true` removed.
  - Compression enabled.
  - Mongo sanitisation (`express-mongo-sanitize`) with `replaceWith: '_'`.
  - HTTP Parameter Pollution protection (`hpp`).
  - JSON body limit reduced from `20mb` → `1mb`.
  - Rate limiters: global 300/15min, auth routes 10/15min, uploads 20/hr, coupon validate 30/15min.

### S10 / S18 — Ownership and access control
- `backend/src/middleware/auth.middleware.js`: added `assertOwnerOrAdmin(docUserId, reqUser)` helper.
- `quotation.controller.js`: `getQuotationById` now checks ownership; `respondToQuotation` now queries by `user: req.user._id` (ObjectId-matched, not email) + `status: 'Sent'` + expiry check, all in a single atomic `findOneAndUpdate`.
- `quotationRoutes.js`: all customer routes changed from `optionalAuth` → `authenticate`.
- `notificationRoutes.js`: all routes changed from `optionalAuth` → `authenticate`.
- `notification.controller.js`: `recipient=admin` now returns 403 for non-admins; `markAllAsRead` is scoped to the caller's own notifications.
- `cartRoutes.js`: all routes changed from `optionalAuth` → `authenticate`.

### S12 — Upload security
- `upload.middleware.js`: allowed extensions narrowed to `jpeg|jpg|png|webp|gif|pdf`; limit reduced from 20MB → 15MB max.
- `uploadRoutes.js`: now requires `authenticate`; adds **magic-byte verification** after file lands on disk; enforces 8MB for images and 15MB for PDFs; deletes the temp file after upload.

### S13 — Coupon list made admin-only
- `couponRoutes.js`: `GET /api/coupons` now requires `authenticate + requireAdmin`. Public coupon application still works via `POST /validate`.

### S14 / S15 — Operator injection
- **New:** `backend/src/middleware/validate.middleware.js` with `rejectOperatorInjection` middleware.
- `productRoutes.js`: `GET /api/products` now runs `rejectOperatorInjection` — a `?category[$ne]=x` returns 400.
- `express-mongo-sanitize` applied globally (replaces `$` keys in body/query/params with `_`).

### S16 — Password hash exposure
- `backend/src/models/User.js`: `toJSON` transform strips `password` before serialisation.
- `auth.controller.js`: uses `.select('-password').lean()` on all user reads.
- `auth.middleware.js`: `authenticate` and `optionalAuth` both use `.select('-password').lean()`.

### Admin bootstrap
- **New:** `backend/src/scripts/createAdmin.js` — `npm run create-admin`.
- `backend/package.json`: added `"create-admin"` script.

### Repository hygiene
- `.gitignore`: added `backend/src/data/` and `backend/data/` to prevent JSON store files from being committed.

---

## Files Touched

| File | Action |
|------|--------|
| `backend/src/config/env.js` | **Created** |
| `backend/src/middleware/auth.middleware.js` | **Rewritten** |
| `backend/src/middleware/upload.middleware.js` | **Rewritten** |
| `backend/src/middleware/validate.middleware.js` | **Created** |
| `backend/src/controllers/auth.controller.js` | **Rewritten** |
| `backend/src/controllers/notification.controller.js` | **Rewritten** |
| `backend/src/controllers/quotation.controller.js` | **Rewritten** |
| `backend/src/routes/cartRoutes.js` | **Updated** |
| `backend/src/routes/couponRoutes.js` | **Updated** |
| `backend/src/routes/notificationRoutes.js` | **Updated** |
| `backend/src/routes/productRoutes.js` | **Updated** |
| `backend/src/routes/quotationRoutes.js` | **Updated** |
| `backend/src/routes/uploadRoutes.js` | **Rewritten** |
| `backend/src/app.js` | **Rewritten** |
| `backend/src/server.js` | **Updated** |
| `backend/src/seed/seed.js` | **Updated** |
| `backend/src/models/User.js` | **Updated** |
| `backend/src/models/dbAdapter.js` | **Updated** |
| `backend/src/scripts/createAdmin.js` | **Created** |
| `backend/.env.example` | **Created** |
| `backend/package.json` | **Updated** |
| `frontend/src/context/AuthContext.jsx` | **Rewritten** |
| `frontend/src/pages/admin/AdminLayout.jsx` | **Updated** |
| `frontend/.env.example` | **Created** |
| `.gitignore` | **Updated** |

---

## How to Verify Manually (Appendix D checks)

> Replace `$API` with `http://localhost:5000/api`

```bash
# S1 demo token → must be 401
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer bm_admin_demo_jwt_token" $API/admin/overview
# Expected: 401

# S3 passwordless admin login → must be 400
curl -s -o /dev/null -w "%{http_code}\n" -X POST $API/auth/admin-login -H 'Content-Type: application/json' -d '{"email":"admin@buildmart.com"}'
# Expected: 400

# S11 public admin notifications → must be 401
curl -s -o /dev/null -w "%{http_code}\n" "$API/notifications?recipient=admin"
# Expected: 401

# S12 unauthenticated upload → must be 401
curl -s -o /dev/null -w "%{http_code}\n" -F "file=@./any.png" $API/upload
# Expected: 401

# S14 operator injection → must be 400
curl -s -o /dev/null -w "%{http_code}\n" "$API/products?category[\$ne]=x"
# Expected: 400

# Secrets — must print nothing
grep -rn "bm_admin_demo_jwt_token\|buildmart_master_secret_key_2026" backend/src frontend/src
```

---

## Deferred / Remaining

| Item | Reason |
|------|--------|
| Access/Refresh token rotation (S12b) | Phase 1 budget — planned for Phase 2 |
| Login lockout after 5 failures (S13b) | Phase 1 budget — planned for Phase 2 |
| CSRF double-submit cookie | Needs refresh-token flow first (Phase 2) |
| `GET /products/facets` operator validation | Added general middleware; full Zod schema validation in Phase 3 |
| Input Zod schemas on all POST/PUT | Phase 3 (data layer) will add per-route validation |
| Tests / CI | Phase 6 — no test harness exists yet |

---

## Known Issues After This Phase

1. **JSON store** (`backend/src/data/`) still used for all data in development. This is a Phase 3 task (retire `dbAdapter`). The files are now gitignored to prevent leaks.
2. The `dbAdapter.js` `LocalModel` does not enforce the `select('-password')` projection — the `toJSON` transform on the User model provides defence-in-depth, but complete isolation requires the MongoDB migration in Phase 3.

