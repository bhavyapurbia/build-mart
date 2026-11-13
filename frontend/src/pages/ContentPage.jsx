import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import { ChevronDown, ChevronUp, Shield, FileText, Truck, RefreshCw, HelpCircle, Briefcase, Info } from 'lucide-react';

const FALLBACK_PAGES = {
  'privacy-policy': {
    title: 'Privacy Policy',
    icon: Shield,
    lastUpdated: 'November 2026',
    content: `
### 1. Introduction
BuildMart Technologies India Private Limited ("BuildMart", "we", "us", or "our") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, process, and safeguard your information when you access our platform, mobile application, and job-site delivery services.

### 2. Information We Collect
- **Personal Information:** Name, billing address, site delivery address, GSTIN, phone number, and email address.
- **Transactional Data:** Details about orders, quotes, payments, invoices, and credit terms.
- **Device & Location Data:** IP address, browser type, job-site GPS coordinates or pincode to calculate serviceability and delivery ETAs.

### 3. How We Use Your Information
- Process and fulfill purchase orders, job-site dispatches, and material quotes.
- Issue statutory GST tax invoices and maintain regulatory audit trails.
- Communicate real-time delivery tracking, driver status, and dispatch OTPs.
- Prevent fraudulent transactions and safeguard contractor credit terms.

### 4. Data Sharing & Disclosure
We do not sell your personal information. We only share details with authorized logistics fleet partners, verified warehouse dispatch yards, and payment aggregators (such as Razorpay) strictly for fulfilling your orders.

### 5. Security of Your Data
We implement enterprise-grade 256-bit SSL encryption, hash all stored passwords using bcrypt, and process credit/debit payments through RBI-authorized payment gateways.
    `
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    icon: FileText,
    lastUpdated: 'November 2026',
    content: `
### 1. Acceptance of Terms
By accessing or using BuildMart, you agree to be bound by these Terms of Service. If you are ordering on behalf of an enterprise, contractor firm, or real estate developer, you represent that you have legal authority to bind that entity.

### 2. Quotations & Bulk Pricing
- Quotation prices are strictly valid until the expiration timestamp specified in your quote document (typically 48 hours due to commodity price fluctuations in steel and cement).
- Invoices are generated strictly upon factory dispatch with verified manufacturer batch test certificates.

### 3. Payment Terms
- All payments must be settled using supported UPI, Net Banking, Credit/Debit Cards, or approved Contractor Credit Lines.
- BuildMart reserves the right to withhold dispatch if payment authentication fails or credit limits are exceeded.

### 4. Site Access & Unloading
- Customers are responsible for ensuring unhindered heavy vehicle access (including 10-wheeler trucks or mini-trucks) to the specified job-site address.
- Standard delivery rates include standard ground unloading. Crane or multi-story rooftop lifting requires additional handling charges requested at checkout.
    `
  },
  'refund-and-return-policy': {
    title: 'Refund & Return Policy',
    icon: RefreshCw,
    lastUpdated: 'November 2026',
    content: `
### 1. Inspection at Site Delivery
Customers and site engineers are required to inspect delivered building materials (cement bags, steel rebars, tiles, plumbing fixtures) at the time of truck arrival before signing the electronic proof-of-delivery (e-POD).

### 2. Eligible Returns
- **Damaged or Tampered Goods:** Any burst cement bags, corroded steel bars, or broken tiles reported at the time of delivery will be replaced immediately or refunded to your original payment method.
- **Incorrect Specifications:** If received materials differ in brand, grade (e.g. OPC 53 vs PPC), or dimension from your approved order or quotation, we offer 100% no-questions-asked replacement within 24 hours.

### 3. Non-Returnable Goods
- Custom cut TMT steel rebars cut to non-standard bending schedules.
- Mixed paints, tinted coatings, or opened chemical waterproofing adhesives.
- Bagged cement exposed to moisture after successful delivery sign-off.

### 4. Refund Processing Timelines
Approved refunds are processed back to the original source account within 3 to 5 business days, in compliance with RBI guidelines.
    `
  },
  'shipping-and-delivery-policy': {
    title: 'Shipping & Delivery Policy',
    icon: Truck,
    lastUpdated: 'November 2026',
    content: `
### 1. Express Delivery Fleet
BuildMart operates dedicated heavy commercial vehicles, medium pickup trucks, and 3-wheeler express cargo vehicles equipped with real-time GPS tracking.

### 2. Delivery Timelines
- **30-60 Minute Express Dispatch:** Available in serviceable pin codes for fast-moving items (adhesives, plumbing fittings, electricals, bagged repair mortar) from our hyper-local dark hubs.
- **Same-Day Direct Site Dispatches:** Available for high-volume structural materials (cement trailers, TMT steel bundles, AAC block trailers) ordered before 2:00 PM.

### 3. Delivery Charges & Thresholds
- Standard orders above our configured free delivery threshold qualify for Free Express Site Delivery.
- Heavy structural commodities (sand, aggregates, high-tonnage steel) include transparent freight charges calculated per kilometer from the nearest partner stockyard.
    `
  },
  'about': {
    title: 'About BuildMart',
    icon: Info,
    lastUpdated: 'November 2026',
    content: `
### Transforming Construction Procurement in India
Founded by civil engineers and logistics veterans, BuildMart is India's leading technology-first construction materials platform.

We eliminate multiple layers of intermediaries, fraudulent sub-standard brands, and unpredictable delivery delays. By linking authorized manufacturers directly to builders, residential contractors, and individual home builders, we ensure transparent pricing, verified batch test certifications, and express delivery direct to construction sites.

### Key Milestones
- Over 500,000 MT of cement and steel supplied to construction sites.
- 98.4% on-time delivery record across Bengaluru, Mumbai, Hyderabad, and Delhi NCR.
- Direct partnership with top brands: UltraTech, Tata Tiscon, Astral Pipes, Asian Paints, Dr. Fixit, and ACC.
    `
  },
  'careers': {
    title: 'Careers at BuildMart',
    icon: Briefcase,
    lastUpdated: 'November 2026',
    content: `
### Build the Future of Construction Supply Chains
We are an ambitious team of software engineers, logistics planners, and civil procurement experts building the operating system for India's construction industry.

### Open Positions
- **Full Stack Engineer (Node.js & React):** Location: Bengaluru (Hybrid)
- **Fleet Dispatch Logistics Lead:** Location: Bengaluru, Mumbai
- **B2B Key Account Manager (Contractor Sales):** Location: Hyderabad, Pune
- **Quality Assurance Materials Engineer:** Location: Bengaluru

Interested candidates may email their resumes to **careers@buildmart.in** with the job title in the subject line.
    `
  }
};

const FAQ_ITEMS = [
  {
    q: 'How does BuildMart guarantee 30-60 minute delivery?',
    a: 'We operate micro-fulfillment warehouses (dark hubs) stocked with top-selling plumbing, waterproofing, electrical, and hardware supplies across serviceable city clusters. Once an order is confirmed, our automated dispatch system assigns the nearest available fleet vehicle.'
  },
  {
    q: 'Are the materials original and accompanied by manufacturer test certificates?',
    a: 'Yes, 100%. BuildMart is an authorized Tier-1 distributor for all listed brands including UltraTech, Tata Tiscon, Astral, and Asian Paints. Every batch of structural steel and cement comes with an official manufacturer Test Certificate (MTC).'
  },
  {
    q: 'Can I request a custom formal quotation for a high-volume site project?',
    a: 'Absolutely! Use our Material Checklist Tool, Bulk Enquiry page, or simply upload a photo of your handwritten site list. Our senior materials estimator will send a comprehensive formal quotation with locked volume prices within 15 minutes.'
  },
  {
    q: 'What payment modes are accepted?',
    a: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit & Debit cards, Net Banking, and NEFT/RTGS for corporate orders. Pre-approved contractors can also access 15-30 day credit lines.'
  },
  {
    q: 'Can I track my delivery truck in real-time?',
    a: 'Yes. As soon as your order is dispatched from our hub, you receive a real-time tracking link with live GPS coordinates, driver contact details, and dynamic ETA updates.'
  },
  {
    q: 'What is the return policy if goods arrive damaged?',
    a: 'Inspect the items at the time of delivery. If any bag or unit is damaged or does not match your ordered specifications, point it out to our driver or site supervisor and we will replace it or process an immediate refund.'
  },
  {
    q: 'Do you deliver on Sundays and public holidays?',
    a: 'Yes, our delivery fleet operates 7 days a week from 6:00 AM to 10:00 PM to ensure your site work never halts.'
  },
  {
    q: 'Can I book certified masons, plumbers, or painters along with materials?',
    a: 'Yes! Visit our Labour Booking page to reserve background-verified, skilled trade technicians directly to your site.'
  }
];

export default function ContentPage() {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, '');
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/pages/${slug}`);
        const data = res.data?.data || res.data;
        if (isMounted && data && data.title) {
          setPageData(data);
        } else {
          setPageData(FALLBACK_PAGES[slug] || null);
        }
      } catch (err) {
        if (isMounted) {
          setPageData(FALLBACK_PAGES[slug] || null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPage();
    return () => { isMounted = false; };
  }, [slug]);

  if (slug === 'faq') {
    return (
      <div className="container" style={{ maxWidth: '840px', padding: '40px 16px', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--bg-accent-subtle, #EFF6FF)', borderRadius: '50%', color: 'var(--primary, #0284C7)', marginBottom: '12px' }}>
            <HelpCircle size={32} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Everything you need to know about BuildMart express procurement, pricing, and job-site delivery.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border-light, #E5E7EB)',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-card, #FFFFFF)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s ease'
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 20px 16px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, borderTop: '1px solid var(--border-light, #F3F4F6)', paddingTop: '12px' }}>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '48px', padding: '24px', background: 'var(--bg-subtle, #F9FAFB)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-light, #E5E7EB)' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>Still have questions?</h3>
          <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Our construction materials engineers are available 7 days a week to assist your site team.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/contact" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px', textDecoration: 'none' }}>
              Contact Support
            </Link>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '8px', textDecoration: 'none' }}>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    );
  }

  const page = pageData || FALLBACK_PAGES[slug];
  const IconComponent = page?.icon || FileText;

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading content...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '16px 0' }}>The requested document could not be located.</p>
        <Link to="/" className="btn btn-primary">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '860px', padding: '40px 16px', minHeight: '65vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div style={{ padding: '12px', background: 'var(--bg-accent-subtle, #EFF6FF)', borderRadius: '10px', color: 'var(--primary, #0284C7)' }}>
          <IconComponent size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            {page.title}
          </h1>
          {page.lastUpdated && (
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              Last updated: {page.lastUpdated}
            </p>
          )}
        </div>
      </div>

      <div
        className="content-page-body"
        style={{
          backgroundColor: 'var(--bg-card, #FFFFFF)',
          border: '1px solid var(--border-light, #E5E7EB)',
          borderRadius: '12px',
          padding: '32px',
          lineHeight: 1.7,
          color: 'var(--text-secondary)',
          fontSize: '15px'
        }}
      >
        {page.content.split('\n\n').map((block, idx) => {
          const trimmed = block.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} style={{ color: 'var(--text-primary)', fontSize: '18px', fontWeight: 700, margin: '24px 0 10px' }}>
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('- ')) {
            const listItems = trimmed.split('\n').filter(Boolean);
            return (
              <ul key={idx} style={{ paddingLeft: '20px', margin: '10px 0' }}>
                {listItems.map((li, lIdx) => (
                  <li key={lIdx} style={{ marginBottom: '6px' }}>
                    {li.replace(/^- \*\*([^*]+)\*\*:\s*/, '')}
                    {li.match(/^- \*\*([^*]+)\*\*:\s*/) && (
                      <strong style={{ color: 'var(--text-primary)' }}>{li.match(/^- \*\*([^*]+)\*\*:\s*/)[1]}: </strong>
                    )}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={idx} style={{ margin: '0 0 16px' }}>
              {trimmed}
            </p>
          );
        })}
      </div>
    </div>
  );
}

