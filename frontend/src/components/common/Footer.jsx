import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Languages, Phone, Mail, MapPin, Clock, X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';

const LANGUAGE_OPTIONS = [
  { code: 'EN', name: 'English', sub: 'English' },
  { code: 'HI', name: 'हिन्दी', sub: 'Hindi' },
  { code: 'KN', name: 'ಕನ್ನಡ', sub: 'Kannada' },
  { code: 'TE', name: 'తెలుగు', sub: 'Telugu' },
  { code: 'TA', name: 'தமிழ்', sub: 'Tamil' },
  { code: 'GU', name: 'ગુજરાતી', sub: 'Gujarati' }
];

const Footer = () => {
  const { settings } = useSettings();
  const { currentLang, changeLanguage } = useLanguage();

  const [openSection, setOpenSection] = useState(null);
  const [langModalOpen, setLangModalOpen] = useState(false);

  const phone = settings?.supportPhone || '1800-890-5000';
  const email = settings?.supportEmail || 'orders@buildmart.in';
  const address = settings?.officeAddress || 'BuildMart Fulfillment Hub 01, Outer Ring Road, Bengaluru 560103';
  const rawNum = settings?.whatsappNumber || '919876543210';
  const cleanWhatsapp = rawNum.replace(/[^0-9]/g, '') || '919876543210';
  const gstin = settings?.sellerGstin || '29AABCB1234F1Z5';

  const toggleAccordion = (sectionId) => {
    setOpenSection(prev => (prev === sectionId ? null : sectionId));
  };

  const openWhatsApp = () => {
    const url = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hi BuildMart, I want to order materials via WhatsApp")}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentLangLabel = LANGUAGE_OPTIONS.find(l => l.code === currentLang)?.name || 'ENGLISH';

  return (
    <footer className="buildmart-compact-footer" id="footer-section">
      <div className="container">
        {/* Top Tagline */}
        <h2 className="footer-hero-tagline">
          Material In Minutes.
        </h2>

        {/* 1. Language Card */}
        <div className="footer-action-card">
          <div className="action-card-left">
            <div className="action-card-icon-box lang-icon-box">
              <Languages size={22} className="action-card-icon" />
            </div>
            <div className="action-card-text">
              <span className="action-card-title">{currentLang === 'EN' ? 'ENGLISH' : `${currentLangLabel} (${currentLang})`}</span>
              <span className="action-card-sub">हिन्दी • ಕನ್ನಡ • தமிழ் • తెలుగు available</span>
            </div>
          </div>
          <button
            type="button"
            className="action-card-btn"
            onClick={() => setLangModalOpen(true)}
          >
            CHANGE
          </button>
        </div>

        {/* 2. Order on WhatsApp Card */}
        <div className="footer-action-card">
          <div className="action-card-left">
            <div className="action-card-icon-box whatsapp-icon-box" onClick={openWhatsApp}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#FFFFFF" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <div className="action-card-text">
              <span className="action-card-title">ORDER ON WHATSAPP</span>
              <span className="action-card-sub">Order, track and get help without leaving chat</span>
            </div>
          </div>
          <button
            type="button"
            className="action-card-btn"
            onClick={openWhatsApp}
          >
            CHAT
          </button>
        </div>

        {/* 3. Compact Collapsible Accordion Sections */}
        <div className="footer-accordions-group">
          {/* Section 1: TOP CATEGORIES */}
          <div className="footer-accordion-item">
            <button
              type="button"
              className="accordion-trigger"
              onClick={() => toggleAccordion('categories')}
              aria-expanded={openSection === 'categories'}
            >
              <span className="accordion-heading">TOP CATEGORIES</span>
              <ChevronDown
                size={18}
                className={`accordion-chevron ${openSection === 'categories' ? 'rotate-open' : ''}`}
              />
            </button>
            {openSection === 'categories' && (
              <div className="accordion-body">
                <ul className="footer-compact-links-grid">
                  <li><Link to="/products?category=Cement%20%26%20Steel">Cement &amp; Steel</Link></li>
                  <li><Link to="/products?category=Wood%20and%20Hardware">Wood &amp; Hardware</Link></li>
                  <li><Link to="/products?category=Paint%2C%20Fevicol%20%26%20Cement">Paint, Fevicol &amp; Cement</Link></li>
                  <li><Link to="/products?category=Kitchen%2C%20Sanitary%20%26%20Bath%20Fittings">Kitchen, Sanitary &amp; Bath Fittings</Link></li>
                  <li><Link to="/products?category=Tiling%20and%20Waterproofing">Tiling &amp; Waterproofing</Link></li>
                  <li><Link to="/products?category=Electrical%20%26%20Automation">Electrical &amp; Conduits</Link></li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 2: TOP BRANDS */}
          <div className="footer-accordion-item">
            <button
              type="button"
              className="accordion-trigger"
              onClick={() => toggleAccordion('brands')}
              aria-expanded={openSection === 'brands'}
            >
              <span className="accordion-heading">TOP BRANDS</span>
              <ChevronDown
                size={18}
                className={`accordion-chevron ${openSection === 'brands' ? 'rotate-open' : ''}`}
              />
            </button>
            {openSection === 'brands' && (
              <div className="accordion-body">
                <ul className="footer-compact-links-grid">
                  <li><Link to="/products?brand=Dr.%20Fixit">Dr. Fixit Waterproofing</Link></li>
                  <li><Link to="/products?brand=Havells">Havells India</Link></li>
                  <li><Link to="/products?brand=Futura">Futura Sinks</Link></li>
                  <li><Link to="/products?brand=Hettich">Hettich Hardware</Link></li>
                  <li><Link to="/products?brand=Fevicol">Fevicol Adhesives</Link></li>
                  <li><Link to="/products?brand=Goldmedal">Goldmedal Electricals</Link></li>
                  <li><Link to="/products?brand=Jaquar">Jaquar Bath Fittings</Link></li>
                  <li><Link to="/products?brand=Luminous">Luminous Inverters</Link></li>
                  <li><Link to="/products?brand=Philips">Philips Lighting</Link></li>
                  <li><Link to="/products?brand=UltraTech">UltraTech Cement</Link></li>
                  <li><Link to="/products?brand=Tata%20Tiscon">Tata Tiscon Rebars</Link></li>
                  <li><Link to="/products?brand=Asian%20Paints">Asian Paints</Link></li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 3: COMPANY & POLICIES */}
          <div className="footer-accordion-item">
            <button
              type="button"
              className="accordion-trigger"
              onClick={() => toggleAccordion('company')}
              aria-expanded={openSection === 'company'}
            >
              <span className="accordion-heading">COMPANY &amp; POLICIES</span>
              <ChevronDown
                size={18}
                className={`accordion-chevron ${openSection === 'company' ? 'rotate-open' : ''}`}
              />
            </button>
            {openSection === 'company' && (
              <div className="accordion-body">
                <ul className="footer-compact-links-grid">
                  <li><Link to="/about">About BuildMart</Link></li>
                  <li><Link to="/bulk-enquiry">Bulk Orders &amp; Contractor Desk</Link></li>
                  <li><Link to="/track-order">Track Delivery Truck</Link></li>
                  <li><Link to="/shipping-and-delivery-policy">30-Min Delivery Policy</Link></li>
                  <li><Link to="/refund-and-return-policy">Return &amp; Refund Policy</Link></li>
                  <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                  <li><Link to="/terms-and-conditions">Terms &amp; Conditions</Link></li>
                  <li><Link to="/labour-booking">Labour Service Booking</Link></li>
                  <li><Link to="/material-list">Material Checklist Tool</Link></li>
                </ul>
              </div>
            )}
          </div>

          {/* Section 4: CONTACT US */}
          <div className="footer-accordion-item">
            <button
              type="button"
              className="accordion-trigger"
              onClick={() => toggleAccordion('contact')}
              aria-expanded={openSection === 'contact'}
            >
              <span className="accordion-heading">CONTACT US</span>
              <ChevronDown
                size={18}
                className={`accordion-chevron ${openSection === 'contact' ? 'rotate-open' : ''}`}
              />
            </button>
            {openSection === 'contact' && (
              <div className="accordion-body">
                <div className="footer-contact-details">
                  <div className="contact-line">
                    <Phone size={14} className="contact-icon" />
                    <a href={`tel:${phone.replace(/\D/g, '')}`}>{phone} (Toll Free Dispatch)</a>
                  </div>
                  <div className="contact-line">
                    <Mail size={14} className="contact-icon" />
                    <a href={`mailto:${email}`}>{email}</a>
                  </div>
                  <div className="contact-line">
                    <MapPin size={14} className="contact-icon" />
                    <span>{address}</span>
                  </div>
                  <div className="contact-line">
                    <Clock size={14} className="contact-icon" />
                    <span>Mon - Sun: 6:00 AM - 10:00 PM Express Delivery</span>
                  </div>
                  <div className="contact-line gstin-line">
                    <span>Seller GSTIN: <strong>{gstin}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Clean Minimal Copyright */}
        <div className="footer-clean-bottom">
          <span>© {new Date().getFullYear()} BuildMart Technologies India Pvt Ltd. All Rights Reserved.</span>
          <span>•</span>
          <span>GSTIN: {gstin}</span>
          <span>•</span>
          <span>100% Genuine Certified Materials</span>
        </div>
      </div>

      {/* Language Selector Modal / Bottom Sheet */}
      {langModalOpen && (
        <div className="modal-overlay" onClick={() => setLangModalOpen(false)}>
          <div className="lang-modal-box" onClick={e => e.stopPropagation()}>
            <div className="lang-modal-header">
              <h3 className="lang-modal-title">Select Language / भाषा चुनें</h3>
              <button
                type="button"
                className="lang-close-btn"
                onClick={() => setLangModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="lang-options-grid">
              {LANGUAGE_OPTIONS.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  className={`lang-card-choice ${currentLang === lang.code ? 'active' : ''}`}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setLangModalOpen(false);
                  }}
                >
                  <span className="lang-choice-native">{lang.name}</span>
                  <span className="lang-choice-sub">{lang.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
