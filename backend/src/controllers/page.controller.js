import Page from '../models/Page.js';
import Notification from '../models/Notification.js';
import SiteSetting from '../models/SiteSetting.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendEmail } from '../utils/Email.js';
import { NOTIFICATION_RECIPIENT, NOTIFICATION_TYPE } from '../constants/enums.js';

const DEFAULT_PAGES = {
  'privacy-policy': {
    title: 'Privacy Policy',
    content: `# Privacy Policy\n\n**Last updated:** November 2026\n\nAt BuildMart, we value your trust and are committed to protecting your personal information. This Privacy Policy outlines how we collect, store, and process your data when you use our building materials platform.\n\n### 1. Information We Collect\nWe collect information such as your name, contact phone number, delivery job-site addresses, email address, and order records necessary for order fulfillment and site dispatch.\n\n### 2. Payment Security\nAll electronic transactions are processed through certified PCI-DSS compliant payment gateways. BuildMart never stores your credit card numbers or banking passwords.\n\n### 3. Contact Us\nFor privacy inquiries, contact our data protection team at privacy@buildmart.in.`
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    content: `# Terms & Conditions\n\n**Last updated:** November 2026\n\nWelcome to BuildMart. By accessing or using our website, services, or purchasing materials, you agree to these terms.\n\n### 1. Quotations and Orders\nFormal material quotations are valid for 7 days unless specified otherwise. Material prices locked in formal quotations will be honored upon customer acceptance.\n\n### 2. Unloading & Job-Site Access\nCustomers are responsible for providing clear, safe vehicular access for delivery trucks to the specified site location.\n\n### 3. Governing Law\nThese terms are governed by the laws of India, under the jurisdiction of Bengaluru, Karnataka.`
  },
  'refund-and-return-policy': {
    title: 'Refund & Return Policy',
    content: `# Refund & Return Policy\n\n### 1. Order Cancellation\nOrders may be cancelled free of charge at any time prior to status reaching "Ready for Dispatch". Once dispatched, cancellations require customer support authorization.\n\n### 2. Damaged or Non-Conforming Materials\nInspect all supplies upon job-site unloading. If any items arrive damaged or defective, report them to the unloading supervisor immediately. Replacement or full refund will be processed within 3 business days.\n\n### 3. Refund Timelines\nRefunds for online payments are credited back to the original payment source within 5–7 banking days.`
  },
  'shipping-and-delivery-policy': {
    title: 'Shipping & Delivery Policy',
    content: `# Shipping & Delivery Policy\n\n### 1. Express Job-Site Delivery\nWe offer 30–60 minute express site dispatch in serviceable metro hubs (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai) for in-stock catalog materials.\n\n### 2. Delivery Charges\nOrders of ₹5,000 or above qualify for **Free Job-Site Delivery**. Orders below ₹5,000 incur a standard freight charge of ₹350.\n\n### 3. Bulk & Staggered Deliveries\nFor multi-ton steel rebar and cement truckloads, staggered dispatch schedules are coordinated directly with your project engineer.`
  },
  'about-us': {
    title: 'About BuildMart',
    content: `# About BuildMart\n\nBuildMart is India's premier B2B and consumer construction supplies platform, streamlining job-site procurement for contractors, home builders, and commercial developers.\n\n### Our Promise\n- **100% Genuine Certified Brands**: UltraTech, Tata Tiscon, Dr. Fixit, Astral, Jaquar, Kajaria.\n- **Lightning Site Delivery**: Materials delivered directly to your construction site.\n- **Zero-Friction Quotations**: Instant list-building with trade tier rates.`
  },
  'faq': {
    title: 'Frequently Asked Questions (FAQ)',
    content: `# Frequently Asked Questions\n\n**Q: How do I get a custom quotation?**\nA: Click on products or click "Add to Material List". Go to the Material List page, input your job-site details, and submit. Our materials engineer will issue a formal quotation within 15 minutes.\n\n**Q: Can I hire workers along with materials?**\nA: Yes! Check the "Do you need labour for this work?" option during checkout to request certified masons, plumbers, tile workers, or waterproofers.\n\n**Q: What payment methods are accepted?**\nA: We accept UPI, NetBanking, Credit/Debit Cards via Razorpay, Cash on Delivery (COD), and Credit on Approval for registered trade contractors.`
  },
  'careers': {
    title: 'Careers at BuildMart',
    content: `# Join the BuildMart Team\n\nWe are building the digital backbone of India's construction supply chain. We are looking for talented software engineers, logistics supervisors, and procurement leads.\n\nSend your resume and portfolio to careers@buildmart.in.`
  }
};

/**
 * GET /api/pages/:slug
 * Retrieves CMS content for legal & informational pages.
 */
export const getPageBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const cleanSlug = slug.toLowerCase().trim();

  let page = await Page.findOne({ slug: cleanSlug, isPublished: true }).lean();

  if (!page && DEFAULT_PAGES[cleanSlug]) {
    // Seed default page if missing
    page = await Page.create({
      slug: cleanSlug,
      title: DEFAULT_PAGES[cleanSlug].title,
      content: DEFAULT_PAGES[cleanSlug].content,
      isPublished: true
    });
  }

  if (!page) {
    throw new ApiError(404, `Page "${slug}" not found.`);
  }

  return res.status(200).json(
    new ApiResponse(200, page, 'Page content retrieved successfully')
  );
});

/**
 * PUT /api/pages/admin/:slug
 * Admin edit page content.
 */
export const updatePageContent = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { title, content, metaDescription, isPublished } = req.body;

  const page = await Page.findOneAndUpdate(
    { slug: slug.toLowerCase().trim() },
    { title, content, metaDescription, isPublished },
    { upsert: true, new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, page, 'Page updated successfully')
  );
});

/**
 * POST /api/contact
 * Public contact form handler.
 */
export const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    throw new ApiError(400, 'Name, email, and message are required.');
  }

  const settings = (await SiteSetting.findOne().lean()) || {};

  // Admin notification
  await Notification.create({
    recipient: NOTIFICATION_RECIPIENT.ADMIN,
    title: `📬 New Contact Message: ${subject || 'Customer Enquiry'}`,
    message: `From: ${name} (${phone || email}): "${message.slice(0, 100)}..."`,
    type: NOTIFICATION_TYPE.MATERIAL_REQUEST,
    link: '/admin/overview'
  });

  // Email acknowledgement
  if (email) {
    sendEmail({
      email,
      subject: `Thank you for contacting BuildMart - ${subject || 'Enquiry Received'}`,
      mailgenContent: {
        body: {
          name,
          intro: 'Thank you for reaching out to BuildMart Customer Support.',
          action: {
            instructions: 'Our customer support representative will review your inquiry and get back to you within 2 business hours.',
            button: {
              color: '#e05a00',
              text: 'Visit BuildMart Store',
              link: process.env.CLIENT_URL || 'http://localhost:5173'
            }
          },
          outro: `Need urgent site support? Call our toll-free hotline: ${settings.supportPhone || '1800-890-5000'}.`
        }
      }
    }).catch(err => console.warn('Contact ack email skipped:', err.message));
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Thank you! Your message has been received. Our team will contact you shortly.')
  );
});

export default {
  getPageBySlug,
  updatePageContent,
  submitContactForm
};

