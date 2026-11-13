/**
 * env.js — Env validation with zod.
 * Import this FIRST in server.js so the app never starts with missing secrets.
 */
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  TRUST_PROXY: z.string().default('0'),

  // MongoDB — required in production
  MONGODB_URI: z.string().optional(),

  // JWT — required in production, min 32 chars
  JWT_SECRET: z.string().optional(),
  JWT_ACCESS_TTL: z.string().default('7d'),

  // Razorpay — required in production
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Cloudinary — optional (gracefully degrades to local disk)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Mailer — optional in dev
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('BuildMart <support@buildmart.com>'),

  LOG_LEVEL: z.string().default('info'),
});

// Extra production rules
const productionSchema = envSchema.superRefine((val, ctx) => {
  if (val.NODE_ENV === 'production') {
    if (!val.MONGODB_URI) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'MONGODB_URI is required in production', path: ['MONGODB_URI'] });
    }
    if (!val.JWT_SECRET || val.JWT_SECRET.length < 32) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'JWT_SECRET must be at least 32 characters in production', path: ['JWT_SECRET'] });
    }
    if (!val.RAZORPAY_WEBHOOK_SECRET) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'RAZORPAY_WEBHOOK_SECRET is required in production', path: ['RAZORPAY_WEBHOOK_SECRET'] });
    }
  }
});

const result = productionSchema.safeParse(process.env);

if (!result.success) {
  console.error('\n❌ Environment variable validation failed:\n');
  result.error.issues.forEach(issue => {
    console.error(`  • ${issue.path.join('.')}: ${issue.message}`);
  });
  console.error('\nPlease check your .env file against backend/.env.example\n');
  process.exit(1);
}

export const env = result.data;
export default env;

