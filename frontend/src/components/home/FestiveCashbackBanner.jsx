import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

export const DEFAULT_BANNERS = [
  {
    _id: 'banner_wirebonanza_promo',
    id: 'banner_wirebonanza_promo',
    title: 'Flat 5% OFF on Electrical Wires',
    subtitle: 'on orders above 10000. Use Coupon WIREBONANZA',
    badge: 'WIRE BONANZA',
    couponCode: 'WIREBONANZA',
    ctaText: 'ORDER NOW',
    link: '/products?category=Electrical%20%26%20Automation',
    image: '/banners/wirebonanza-offer.jpg',
    order: 1,
    active: true,
    type: 'hero'
  },
  {
    _id: 'banner_diwali_offer',
    id: 'banner_diwali_offer',
    title: 'diwali offer',
    subtitle: 'on order above 4000 get flat 200 off',
    badge: 'SPECIAL PROMO',
    couponCode: 'DIWALI200',
    ctaText: 'EXPLORE SUPPLIES',
    link: '/products',
    bgGradient: 'linear-gradient(135deg, #1E22AA 0%, #2A2DC9 100%)',
    benefit1Text: '30-Min',
    benefit1Sub: 'Site Delivery',
    benefit2Text: '100% Factory',
    benefit2Sub: 'GST Invoices',
    coinText: 'OFFER',
    order: 2,
    active: true,
    type: 'hero'
  },
  {
    _id: 'banner_build50k_pro',
    id: 'banner_build50k_pro',
    title: 'FLAT 5% CASHBACK',
    subtitle: 'on orders above ₹50,000. No limits on bulk supplies.',
    badge: 'MEGABUILDMART',
    couponCode: 'BUILD50K',
    ctaText: 'SHOP NOW',
    link: '/products',
    bgGradient: 'linear-gradient(135deg, #091E3A 0%, #1B4965 100%)',
    benefit1Text: 'Express 30-Min',
    benefit1Sub: 'Dispatch to Site',
    benefit2Text: '100% Genuine',
    benefit2Sub: 'Factory MTC',
    coinText: '5% OFF',
    order: 3,
    active: true,
    type: 'hero'
  }
];

const FestiveCashbackBanner = () => {
  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('bm_admin_banners');
      return saved ? JSON.parse(saved) : DEFAULT_BANNERS;
    } catch {
      return DEFAULT_BANNERS;
    }
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  // Fetch live banners from database so admin edits reflect immediately
  useEffect(() => {
    const fetchLiveBanners = async () => {
      try {
        const res = await api.get('/banners');
        const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        if (list.length > 0) {
          setBanners(list);
          localStorage.setItem('bm_admin_banners', JSON.stringify(list));
        }
      } catch (err) {
        try {
          const saved = localStorage.getItem('bm_admin_banners');
          if (saved) setBanners(JSON.parse(saved));
        } catch {}
      }
    };

    fetchLiveBanners();
  }, []);

  const activeBanners = banners.filter(b => b.active !== false);
  const totalSlides = activeBanners.length || 1;

  // Auto-rotation timer every 5 seconds
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const handlePrev = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  };

  // Mobile Touch Swipe support
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || totalSlides <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentSlide] || activeBanners[0];

  return (
    <section className="festive-carousel-section" id="home-banner-block">
      <div className="container">
        <div
          className="festive-banner-slider"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* If banner has an image uploaded by admin, render the image as it is */}
          {currentBanner.image ? (
            <Link
              to={currentBanner.link || '/products'}
              className="festive-image-banner-link"
              title={currentBanner.title}
            >
              <img
                src={currentBanner.image}
                alt={currentBanner.title}
                className="festive-image-banner-img"
                loading="eager"
              />
            </Link>
          ) : (
            /* Fallback HTML banner for non-image promos */
            <div
              className="festive-promo-card-photo1"
              style={{
                background: currentBanner.bgGradient || 'linear-gradient(135deg, #1E22AA 0%, #2A2DC9 100%)'
              }}
            >
              {/* Top Area: Gold Coin on Left + Offer Details on Right */}
              <div className="promo-top-flex-row">
                <div className="promo-coin-wrapper">
                  <div className="gold-coin-circle">
                    <div className="gold-coin-inner-disc">
                      <div className="coin-stars-pair">
                        <Star size={18} fill="#D97706" color="#D97706" />
                        <Star size={18} fill="#D97706" color="#D97706" />
                      </div>
                    </div>
                  </div>
                  <span className="coin-offer-caption">
                    {currentBanner.coinText || 'OFFER'}
                  </span>
                </div>

                <div className="promo-details-stack">
                  <span className="promo-pill-label">
                    {currentBanner.badge || 'SPECIAL PROMO'}
                  </span>
                  <h3 className="promo-headline-h3">
                    {currentBanner.title || 'diwali offer'}
                  </h3>
                  <p className="promo-sub-instruction">
                    {currentBanner.subtitle || 'on order above 4000 get flat 200 off'}
                  </p>
                  <Link
                    to={currentBanner.link || '/products'}
                    className="promo-action-button"
                  >
                    <span>{currentBanner.ctaText || 'EXPLORE SUPPLIES'}</span>
                    <ArrowRight size={15} strokeWidth={2.5} />
                  </Link>
                </div>
              </div>

              {/* Bottom Row: 2 Glassmorphic Trust Badges */}
              <div className="promo-bottom-trust-grid">
                <div className="trust-card-glass">
                  <div className="trust-icon-box orange">
                    <Truck size={18} color="#FF9900" />
                  </div>
                  <div className="trust-text-block">
                    <span className="trust-bold-title">{currentBanner.benefit1Text || '30-Min'}</span>
                    <span className="trust-sub-caption">{currentBanner.benefit1Sub || 'Site Delivery'}</span>
                  </div>
                </div>

                <div className="trust-card-glass">
                  <div className="trust-icon-box green">
                    <ShieldCheck size={18} color="#22C55E" />
                  </div>
                  <div className="trust-text-block">
                    <span className="trust-bold-title">{currentBanner.benefit2Text || '100% Factory'}</span>
                    <span className="trust-sub-caption">{currentBanner.benefit2Sub || 'GST Invoices'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Left & Right Chevrons (visible on hover or tap when multiple banners exist) */}
          {activeBanners.length > 1 && (
            <>
              <button
                type="button"
                className="festive-nav-arrow prev-arrow"
                onClick={handlePrev}
                aria-label="Previous promotional banner"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="festive-nav-arrow next-arrow"
                onClick={handleNext}
                aria-label="Next promotional banner"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Dots Indicator: Elongated Active Navy Pill + Light Gray Dots */}
          {activeBanners.length > 1 && (
            <div className="festive-dots-row">
              {activeBanners.map((b, idx) => (
                <button
                  key={b._id || b.id || idx}
                  type="button"
                  className={`festive-dot ${currentSlide === idx ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to banner slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FestiveCashbackBanner;
