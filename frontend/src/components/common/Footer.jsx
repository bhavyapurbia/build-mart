import React from 'react';
import { Link } from 'react-router-dom';
import {
  Hammer,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Lock,
  MessageSquare,
  Truck
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();

  const phone = settings?.supportPhone || '1800-890-5000';
  const email = settings?.supportEmail || 'orders@buildmart.in';
  const address = settings?.officeAddress || 'BuildMart Fulfillment Hub 01, Outer Ring Road, Bellandur, Bengaluru 560103';
  const whatsapp = (settings?.whatsappNumber || '+919876543210').replace(/\+/g, '');
  const gstin = settings?.sellerGstin || '29AABCB1234F1Z5';

  return (
    <footer className="footer-main">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: About Us & Contact */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div className="brand-logo-icon" style={{ width: '36px', height: '36px' }}>
                <Hammer size={20} />
              </div>
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--bg-card)' }}>
                Build<span style={{ color: 'var(--color-accent)' }}>Mart</span>
              </span>
            </div>
            <p style={{ fontSize: '13.5px', lineHeight: 1.6, marginBottom: '20px', color: 'var(--text-light)' }}>
              India's premier direct construction-materials procurement platform. Delivering authentic cement, TMT rebars, plumbing, tiles, waterproofing, and skilled site labour direct to contractors, builders, and home owners in 30-60 minutes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color='var(--color-accent)' />
                <a href={`tel:${phone.replace(/\D/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {phone} (Toll Free)
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} color='var(--color-accent)' />
                <a href={`mailto:${email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {email}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={15} color='var(--color-accent)' style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} color='var(--color-success)' />
                <span>Mon - Sun: 6:00 AM - 10:00 PM Dispatch</span>
              </div>
            </div>
          </div>

          {/* Column 2: Top Categories */}
          <div>
            <h4 className="footer-column-title">Top Categories</h4>
            <ul className="footer-links-list">
              <li><Link to="/products?category=Cement%20%26%20Steel">Cement & Steel</Link></li>
              <li><Link to="/products?category=Tiles%20%26%20Adhesives">Tiles & Adhesives</Link></li>
              <li><Link to="/products?category=Waterproofing">Waterproofing</Link></li>
              <li><Link to="/products?category=CPVC%2C%20PVC%20%26%20GI%20Fittings">CPVC, PVC & GI Fittings</Link></li>
              <li><Link to="/products?category=Hardware%20%26%20Locks">Hardware & Locks</Link></li>
              <li><Link to="/products?category=Bathware">Bathware</Link></li>
              <li><Link to="/products?category=Tools%20%26%20Accessories">Tools & Accessories</Link></li>
              <li><Link to="/products?category=Construction%20Materials">Construction Materials</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Support & Legal */}
          <div>
            <h4 className="footer-column-title">Customer Support</h4>
            <ul className="footer-links-list">
              <li><Link to="/contact">Help & Support</Link></li>
              <li><Link to="/faq">Frequently Asked Questions</Link></li>
              <li><Link to="/track-order">Track Delivery Truck</Link></li>
              <li><Link to="/shipping-and-delivery-policy">30-Min Delivery Policy</Link></li>
              <li><Link to="/refund-and-return-policy">Return & Refund Policy</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions">Terms & Conditions</Link></li>
              <li><Link to="/labour-booking">Labour Service Booking</Link></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="footer-column-title">Company</h4>
            <ul className="footer-links-list">
              <li><Link to="/bulk-enquiry">Bulk Orders & Contractor Desk</Link></li>
              <li><Link to="/about">About BuildMart</Link></li>
              <li><Link to="/careers">Careers at BuildMart</Link></li>
              <li><Link to="/contact">Partner With Us</Link></li>
              <li><Link to="/material-list">Material Checklist Tool</Link></li>
              {/* Discrete Admin Login link */}
              <li style={{ marginTop: '16px' }}>
                <Link to="/admin/login" className="footer-admin-link">
                  <Lock size={12} />
                  <span>Admin Login</span>
                </Link>
              </li>
            </ul>

            <div style={{ marginTop: '24px' }}>
              <a
                href={`https://wa.me/${whatsapp}?text=Hello%20BuildMart%20Support,%20I%20need%20assistance%20with%20construction%20materials`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--color-success)',
                  color: 'var(--bg-card)',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  textDecoration: 'none'
                }}
              >
                <MessageSquare size={16} />
                <span>WhatsApp Support</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Seller GSTIN */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} BuildMart Technologies India Private Limited. All Rights Reserved. • GSTIN: <strong>{gstin}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Verified Genuine Materials</span>
            <span>•</span>
            <span>RERA Compliant Batch Certifications</span>
            <span>•</span>
            <span>SSL 256-bit Secure Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
