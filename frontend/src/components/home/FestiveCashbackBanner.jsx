import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Copy, Check, ShieldCheck, Building2, Truck } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const FestiveCashbackBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast(`Coupon code ${code} copied! Apply at checkout.`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="festive-carousel-section">
      <div className="container">
        <div className="festive-banner-slider">
          {/* SLIDE 0: CONTRACTOR 5% CASHBACK BANNER */}
          {currentSlide === 0 ? (
            <div className="festive-cashback-card">
              <div className="cashback-content-left">
                {/* 3D Golden Coin Graphic */}
                <div className="golden-coin-graphic">
                  <div className="coin-outer-ring">
                    <span className="coin-pct-num">5</span>
                    <span className="coin-pct-sign">%</span>
                  </div>
                  <div className="coin-caption">CASHBACK</div>
                </div>

                {/* Offer Details */}
                <div className="cashback-text-group">
                  <div className="megabuildmart-tag" style={{ background: '#D97706' }}>
                    BUILDMART PRO
                  </div>
                  <h3 className="cashback-heading">
                    FLAT 5% CASHBACK
                  </h3>
                  <p className="cashback-terms">
                    on orders above <strong>₹50,000</strong>. No upper limits for registered contractors.
                  </p>

                  <div className="cashback-action-group">
                    <div
                      className="coupon-pill-box"
                      onClick={() => handleCopyCode('BUILD50K')}
                      title="Click to copy coupon code"
                    >
                      <span className="coupon-use-label">USE COUPON</span>
                      <span className="coupon-code-bold">BUILD50K</span>
                      {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                    </div>

                    <Link to="/products" className="cashback-shop-now-btn">
                      <span>SHOP NOW</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="cashback-fineprint">*T&Cs Apply • Valid on all construction materials</div>
                </div>
              </div>
            </div>
          ) : (
            /* SLIDE 1: CONTRACTOR TRADE DESK & DIRECT FACTORY DISPATCH */
            <div className="contractor-trade-desk-card">
              <div className="trade-desk-left">
                <span className="trade-desk-badge">
                  <ShieldCheck size={14} color="#F59E0B" />
                  <span>COMMERCIAL & PROJECT PROCUREMENT</span>
                </span>
                <h3 className="trade-desk-heading">
                  High-Volume Plant Dispatch
                </h3>
                <p className="trade-desk-desc">
                  Direct truckload delivery for developers & builders. Cement bags, Tata Tiscon TMT rebars, and AAC blocks with 100% factory GST invoices.
                </p>
                <div className="trade-desk-actions">
                  <Link to="/bulk-enquiry" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                    <span>Get Wholesale Quote</span>
                    <ArrowRight size={14} />
                  </Link>
                  <a
                    href="https://wa.me/919876543210?text=Hi%20BuildMart,%20I%20need%20bulk%20construction%20material%20quotation"
                    target="_blank"
                    rel="noreferrer"
                    className="trade-desk-wa-link"
                  >
                    <span>Chat with Project Manager ➔</span>
                  </a>
                </div>
              </div>

              <div className="trade-desk-right-stats">
                <div className="trade-stat-box">
                  <Truck size={24} color="#F59E0B" />
                  <span className="stat-bold">30-60 Mins</span>
                  <span className="stat-sub">Site Fulfillment</span>
                </div>
                <div className="trade-stat-box">
                  <Building2 size={24} color="#10B981" />
                  <span className="stat-bold">Direct Plant</span>
                  <span className="stat-sub">Manufacturer Invoices</span>
                </div>
              </div>
            </div>
          )}

          {/* Dots Indicator */}
          <div className="festive-dots-row">
            <button
              type="button"
              className={`festive-dot ${currentSlide === 0 ? 'active' : ''}`}
              onClick={() => setCurrentSlide(0)}
              aria-label="Slide 1"
            />
            <button
              type="button"
              className={`festive-dot ${currentSlide === 1 ? 'active' : ''}`}
              onClick={() => setCurrentSlide(1)}
              aria-label="Slide 2"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FestiveCashbackBanner;
