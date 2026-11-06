import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Copy, Check, ShieldCheck, Building2, Truck, Sparkles } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../utils/api';

const DEFAULT_BANNERS = [
  {
    _id: 'banner_build50k_pro',
    title: 'FLAT 5% CASHBACK',
    subtitle: 'on orders above ₹50,000. No upper limits for registered contractors.',
    badge: 'BUILDMART PRO',
    couponCode: 'BUILD50K',
    ctaText: 'SHOP NOW',
    link: '/products',
    bgGradient: 'linear-gradient(135deg, #091E3A 0%, #1B4965 100%)',
    active: true,
    type: 'hero'
  },
  {
    _id: 'banner_wholesale_club',
    title: 'High-Volume Plant Dispatch',
    subtitle: 'Direct truckload delivery for developers & builders. Cement bags, TMT rebars & AAC blocks with GST invoices.',
    badge: 'COMMERCIAL & TRADE DESK',
    couponCode: 'PROCONTRACT',
    ctaText: 'GET WHOLESALE QUOTE',
    link: '/bulk-enquiry',
    bgGradient: 'linear-gradient(135deg, #14532D 0%, #15803D 100%)',
    active: true,
    type: 'trade'
  },
  {
    _id: 'banner_express_dispatch',
    title: 'FREE EXPRESS 30-MIN SITE DISPATCH',
    subtitle: 'Direct from micro-fulfillment hubs across Bengaluru. Guaranteed on-site before your crew starts.',
    badge: 'SITE DELIVERY',
    couponCode: 'FASTSITE',
    ctaText: 'ORDER NOW',
    link: '/products',
    bgGradient: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)',
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
  const [copied, setCopied] = useState(false);
  const { showToast } = useNotification();

  // Fetch live banners from backend API so admin changes reflect immediately
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
        // Fallback to local storage if API is unreachable
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

  // Auto-rotation timer across all active banners
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast(`Coupon code ${code} copied! Apply at checkout.`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentSlide] || activeBanners[0];

  return (
    <section className="festive-carousel-section" id="home-banner-block">
      <div className="container">
        <div className="festive-banner-slider">
          <div
            className="festive-cashback-card"
            style={{
              background: currentBanner.bgGradient || 'linear-gradient(135deg, #07152B 0%, #0F2D59 100%)',
              transition: 'background 0.5s ease'
            }}
          >
            <div className="cashback-content-left" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: '1 1 500px' }}>
                {/* Visual Graphic Left: Image or 3D Coin or Shield Icon */}
                {currentBanner.image ? (
                  <div style={{ width: '90px', height: '90px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.1)', padding: '6px' }}>
                    <img
                      src={currentBanner.image}
                      alt={currentBanner.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                ) : (
                  <div className="golden-coin-graphic" style={{ flexShrink: 0 }}>
                    <div className="coin-outer-ring">
                      <span className="coin-pct-num">
                        {currentBanner.title?.match(/\d+/)?.[0] || '★'}
                      </span>
                      <span className="coin-pct-sign">
                        {currentBanner.title?.includes('%') ? '%' : '★'}
                      </span>
                    </div>
                    <div className="coin-caption">OFFER</div>
                  </div>
                )}

                {/* Offer Details */}
                <div className="cashback-text-group" style={{ flex: 1 }}>
                  {currentBanner.badge && (
                    <div className="megabuildmart-tag" style={{ background: '#D97706', display: 'inline-block' }}>
                      {currentBanner.badge}
                    </div>
                  )}

                  <h3 className="cashback-heading" style={{ margin: '6px 0', color: '#FFFFFF' }}>
                    {currentBanner.title}
                  </h3>

                  <p className="cashback-terms" style={{ color: '#E2E8F0', margin: '4px 0 14px' }}>
                    {currentBanner.subtitle}
                  </p>

                  <div className="cashback-action-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {currentBanner.couponCode && (
                      <div
                        className="coupon-pill-box"
                        onClick={() => handleCopyCode(currentBanner.couponCode)}
                        title="Click to copy coupon code"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="coupon-use-label">USE COUPON</span>
                        <span className="coupon-code-bold">{currentBanner.couponCode}</span>
                        {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                      </div>
                    )}

                    <Link to={currentBanner.link || '/products'} className="cashback-shop-now-btn">
                      <span>{currentBanner.ctaText || 'SHOP NOW'}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Side Stats / Trust Badges */}
              <div className="trade-desk-right-stats" style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                <div className="trade-stat-box" style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Truck size={20} color="#F59E0B" style={{ margin: '0 auto 4px' }} />
                  <span className="stat-bold" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>30-Min</span>
                  <span className="stat-sub" style={{ fontSize: '11px', color: '#CBD5E1' }}>Site Delivery</span>
                </div>
                <div className="trade-stat-box" style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <ShieldCheck size={20} color="#10B981" style={{ margin: '0 auto 4px' }} />
                  <span className="stat-bold" style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>100% Factory</span>
                  <span className="stat-sub" style={{ fontSize: '11px', color: '#CBD5E1' }}>GST Invoices</span>
                </div>
              </div>

            </div>
          </div>

          {/* Dynamic Dots Indicator (One dot for each active banner) */}
          {activeBanners.length > 1 && (
            <div className="festive-dots-row">
              {activeBanners.map((b, idx) => (
                <button
                  key={b._id || b.id || idx}
                  type="button"
                  className={`festive-dot ${currentSlide === idx ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
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
