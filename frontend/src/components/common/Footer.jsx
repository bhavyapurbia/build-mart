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
  MessageSquare
} from 'lucide-react';

const Footer = () => {
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
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>
                Build<span style={{ color: '#F59E0B' }}>Mart</span>
              </span>
            </div>
            <p style={{ fontSize: '13.5px', lineHeight: 1.6, marginBottom: '20px', color: '#94A3B8' }}>
              India's premier direct construction-materials procurement platform. Delivering authentic cement, TMT rebars, plumbing, tiles, waterproofing, and skilled site labour direct to contractors, builders, and home owners in 30-60 minutes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={15} color="#F59E0B" />
                <span>1800-890-5000 (Toll Free)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} color="#F59E0B" />
                <span>orders@buildmart.in</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={15} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>BuildMart Central Logistics Yard, Outer Ring Road, Bellandur, Bengaluru 560103</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} color="#10B981" />
                <span>Mon - Sun: 6:00 AM - 10:00 PM Dispatch</span>
              </div>
            </div>
          </div>

          {/* Column 2: Top Categories (All 8 categories) */}
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

          {/* Column 3: Customer Support */}
          <div>
            <h4 className="footer-column-title">Customer Support</h4>
            <ul className="footer-links-list">
              <li><a href="#help">Help & Support</a></li>
              <li><a href="#faqs">Frequently Asked Questions</a></li>
              <li><a href="#delivery">30-Min Delivery Policy</a></li>
              <li><a href="#return">Return & Refund Policy</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms & Conditions</a></li>
              <li><Link to="/labour-booking">Labour Service Booking</Link></li>
              <li><Link to="/material-list">Material Checklist Tool</Link></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h4 className="footer-column-title">Company</h4>
            <ul className="footer-links-list">
              <li><Link to="/bulk-enquiry">Bulk Orders & Contractor Desk</Link></li>
              <li><a href="#partner">Partner With Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#press">Press & Media</a></li>
              <li><a href="#about">About BuildMart</a></li>
              {/* Discrete Admin Login link as requested */}
              <li style={{ marginTop: '16px' }}>
                <Link to="/admin/login" className="footer-admin-link">
                  <Lock size={12} />
                  <span>Admin Login</span>
                </Link>
              </li>
            </ul>

            <div style={{ marginTop: '24px' }}>
              <a
                href="https://wa.me/919876543210?text=Hello%20BuildMart%20Support,%20I%20need%20assistance%20with%20construction%20materials"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#FFFFFF',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                <MessageSquare size={16} />
                <span>WhatsApp Support</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} BuildMart Technologies India Private Limited. All Rights Reserved.
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

