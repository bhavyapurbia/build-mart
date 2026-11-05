import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, ClipboardList, Zap, HardHat, Building2 } from 'lucide-react';

const SLIDES = [
  {
    title: 'Building Materials Delivered to Your Job Site in Minutes',
    subtitle: 'From foundation to finishing: UltraTech Cement, Tata Tiscon TMT, Kajaria Tiles & Astral CPVC dispatched directly to sites in 30-45 mins.',
    tag: 'EXPRESS SITE DELIVERY',
    badge: '30-45 Min Rapid Dispatch',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1200&q=80',
    ctaPrimaryText: 'Shop All Materials',
    ctaPrimaryLink: '/products',
    ctaSecondaryText: 'Build Material List',
    ctaSecondaryLink: '/material-list'
  },
  {
    title: 'Tap Any Product Image to Create Your Material List',
    subtitle: 'Contractor checklist feature: Select all needed items with a single tap. Zero upfront payment required until our materials engineer confirms stock & sends formal quotation.',
    tag: 'CONTRACTOR FAVORITE',
    badge: 'Zero Upfront Risk',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
    ctaPrimaryText: 'Explore & Tap Images',
    ctaPrimaryLink: '/products',
    ctaSecondaryText: 'View Checklist',
    ctaSecondaryLink: '/material-list'
  },
  {
    title: 'Need High-Volume Steel, Cement or AAC Blocks?',
    subtitle: 'Direct plant dispatch with factory tax invoices for developers, commercial builders, and registered contractors. Dedicated project manager assigned.',
    tag: 'BULK ENQUIRY HUB',
    badge: 'Tier-1 Trade Pricing',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80',
    ctaPrimaryText: 'Request Bulk Quote',
    ctaPrimaryLink: '/bulk-enquiry',
    ctaSecondaryText: 'Chat on WhatsApp',
    ctaSecondaryLink: 'https://wa.me/919876543210'
  }
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <section className="hero-section">
      <div className="container">
        {/* Main Banner Card */}
        <div className="hero-banner-card">
          <div className="hero-banner-content">
            <div className="hero-tag">
              <Zap size={14} color="#F59E0B" />
              <span>{slide.tag}</span>
              <span className="hero-tag-dot">•</span>
              <span>{slide.badge}</span>
            </div>

            <h1 className="hero-title">{slide.title}</h1>
            <p className="hero-subtitle">{slide.subtitle}</p>

            <div className="hero-actions">
              <Link to={slide.ctaPrimaryLink} className="btn-primary">
                <span>{slide.ctaPrimaryText}</span>
                <ArrowRight size={16} />
              </Link>
              {slide.ctaSecondaryLink.startsWith('http') ? (
                <a href={slide.ctaSecondaryLink} target="_blank" rel="noreferrer" className="btn-secondary">
                  <span>{slide.ctaSecondaryText}</span>
                </a>
              ) : (
                <Link to={slide.ctaSecondaryLink} className="btn-secondary">
                  <ClipboardList size={16} />
                  <span>{slide.ctaSecondaryText}</span>
                </Link>
              )}
            </div>

            {/* Slider Dots */}
            <div className="hero-dots-wrap">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`hero-dot ${idx === currentSlide ? 'active' : ''}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="hero-banner-visual">
            <img
              src={slide.image}
              alt={slide.title}
              className="hero-image"
            />
            <div className="hero-floating-badge">
              <div className="floating-badge-icon">
                <Zap size={18} color="#0F172A" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>
                  30-45 Mins
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Job Site Delivery
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Service Strip (BuildMart Feature Pills) */}
        <div className="hero-service-strip">
          <Link to="/products" className="service-strip-item">
            <div className="service-strip-icon bg-amber">
              <Zap size={18} />
            </div>
            <div>
              <div className="service-strip-title">Express Delivery</div>
              <div className="service-strip-sub">30-45 mins to site</div>
            </div>
          </Link>

          <Link to="/material-list" className="service-strip-item">
            <div className="service-strip-icon bg-blue">
              <ClipboardList size={18} />
            </div>
            <div>
              <div className="service-strip-title">Material List Builder</div>
              <div className="service-strip-sub">Click images to quote</div>
            </div>
          </Link>

          <Link to="/labour-booking" className="service-strip-item">
            <div className="service-strip-icon bg-orange">
              <HardHat size={18} />
            </div>
            <div>
              <div className="service-strip-title">Book Labour</div>
              <div className="service-strip-sub">Masons, Plumbers, Tilers</div>
            </div>
          </Link>

          <Link to="/bulk-enquiry" className="service-strip-item">
            <div className="service-strip-icon bg-green">
              <Building2 size={18} />
            </div>
            <div>
              <div className="service-strip-title">Wholesale & Bulk</div>
              <div className="service-strip-sub">Factory truckloads</div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
