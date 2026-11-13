# Security Policy — BuildMart Platform

## 1. Reporting a Security Vulnerability

The BuildMart Engineering team takes the security of our platform and customer data seriously. If you discover a security vulnerability, please report it responsibly.

- **Primary Contact:** [security@buildmart.in](mailto:security@buildmart.in)
- **Response SLA:** Initial acknowledgment within 24–48 hours; status updates provided within 5 business days.
- **Responsible Disclosure:** Please do not publicly disclose or discuss the vulnerability until a patch has been released and deployed.

---

## 2. Supported Versions

| Version | Supported | Description |
| :--- | :--- | :--- |
| `1.x` (Main / Production) | Yes | Current active production branch |
| `< 1.0` | No | Legacy mock/in-file versions (deprecated) |

---

## 3. Defense-in-Depth Architecture

BuildMart adheres to a multi-layered security model across all tiers:

### 3.1 Authentication & Session Security
- **Passwords:** Hashed using `bcryptjs` with 12 salt rounds; plaintext passwords are never logged or stored.
- **One-Time Recovery Tokens:** Password reset and email verification tokens use 32 crypto-secure random bytes. **Only the SHA-256 hash is persisted in the database** with strict expiration windows (30 min for reset, 24 h for verification). Tokens are single-use.
- **JWT & Rotation:** Access tokens use short lifespans (15 minutes). Refresh tokens are stored in the database (`RefreshToken` collection) with automated rotation and instant revocation on password change or account compromise.
- **Cookies:** Stored with `HttpOnly`, `SameSite=Lax` (or `None` with `Secure=true` in cross-origin environments), and `Secure` flags.

### 3.2 Authorization & Access Control (P0)
- **Role-Based Access Control (RBAC):** Hierarchical permissions (`admin`, `manager`, `support`, `customer`). Protected endpoints enforce real roles via `requireRole(...)`.
- **IDOR Protection:** Customer endpoints strictly restrict access to resources owned by `req.user._id`. Admin endpoints are separated behind authenticated middleware.
- **No Backdoors:** No auto-creation of accounts or guest sessions bypassing authentication.

### 3.3 Transaction & Money Path Security
- **Zero Client Price Trust:** Client-supplied prices and tax amounts are completely discarded. All product pricing, GST splits (Intra-state CGST+SGST vs Inter-state IGST), freight charges, and coupon caps are strictly calculated on the server using authoritative MongoDB catalog data.
- **Payment Verification:** Razorpay payments require real HMAC-SHA256 signature verification (`crypto.createHmac('sha256', secret)`).
- **Webhook Idempotency:** Webhook notifications are verified using raw body signatures and recorded in the `WebhookEvent` collection to eliminate duplicate execution and replay attacks.
- **Stock Decrements:** Atomic stock reservations and decrements prevent overselling and race conditions under concurrent checkouts.

### 3.4 Injection & Transport Protection
- **NoSQL Injection:** Sanitized using `express-mongo-sanitize` which strips leading `$` and `.` operators from request parameters.
- **Parameter Pollution:** Protected via `hpp` (HTTP Parameter Pollution) middleware.
- **Content Security Policy (CSP):** Configured via `helmet` in production to whitelist only necessary domains (Razorpay checkout frames, Cloudinary image CDN, Google Fonts).
- **Sensitive Data Redaction:** Request logs powered by `pino-http` automatically redact `authorization`, `cookie`, `password`, `token`, and secret fields.
- **Rate Limiting:**
  - Global: 300 requests / 15 min per IP.
  - Authentication: 10 requests / 15 min per IP.
  - File Uploads: 20 requests / hour per IP.
  - Coupon Validations: 30 requests / 15 min per IP.

