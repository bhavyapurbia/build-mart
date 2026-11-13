import React from 'react';
import { ShoppingBag, Headphones, ClipboardList, Search, ChevronLeft, MoreVertical, CheckCheck, Check } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const WhatsAppBanner = () => {
  const { settings } = useSettings();
  const rawNum = settings?.whatsappNumber || '919876543210';
  const cleanNum = rawNum.replace(/[^0-9]/g, '') || '919876543210';

  const openWhatsApp = (msg) => {
    const url = `https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="buildmart-whatsapp-banner-section" id="whatsapp-support-section">
      <div className="container">
        <div className="whatsapp-banner-container">
          {/* Subtle Ambient Decorative Glows / Sparkles */}
          <div className="whatsapp-decor-glow" aria-hidden="true" />
          <div className="whatsapp-sparkle sparkle-1" aria-hidden="true">✦</div>
          <div className="whatsapp-sparkle sparkle-2" aria-hidden="true">✦</div>
          <div className="whatsapp-sparkle sparkle-3" aria-hidden="true">✦</div>

          {/* LEFT SIDE: WhatsApp Logo, Headline, Subtitle & 4 Action Chips */}
          <div className="whatsapp-content-left">
            {/* Header row: Big WhatsApp Icon + 2-Line Headline */}
            <div className="whatsapp-heading-wrap">
              <div
                className="whatsapp-main-logo"
                onClick={() => openWhatsApp("Hi BuildMart, I want to connect on WhatsApp")}
                title="Open WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="38" height="38" fill="#FFFFFF" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>

              <div className="whatsapp-title-block">
                <h3 className="whatsapp-hero-headline">
                  <span className="headline-white">Shop Smarter,</span>
                  <span className="headline-green">get support instantly.</span>
                </h3>
                <p className="whatsapp-hero-subtitle">
                  Everything you need, right on <span className="green-highlight">Whatsapp</span>
                </p>
              </div>
            </div>

            {/* Subtle Divider Line matching screenshot */}
            <div className="whatsapp-horizontal-divider" />

            {/* 4 Action Chips */}
            <div className="whatsapp-chips-container">
              <button
                type="button"
                className="whatsapp-pill-btn"
                onClick={() => openWhatsApp("Hi BuildMart, I want to place an order via WhatsApp")}
              >
                <ShoppingBag size={17} className="pill-icon" aria-hidden="true" />
                <span className="pill-text">Order via Whatsapp</span>
              </button>

              <button
                type="button"
                className="whatsapp-pill-btn"
                onClick={() => openWhatsApp("Hi BuildMart, I need Help & Support for my construction site")}
              >
                <Headphones size={17} className="pill-icon" aria-hidden="true" />
                <span className="pill-text">Help &amp; Support</span>
              </button>

              <button
                type="button"
                className="whatsapp-pill-btn"
                onClick={() => openWhatsApp("Hi BuildMart, please share my live Order Status")}
              >
                <ClipboardList size={17} className="pill-icon" aria-hidden="true" />
                <span className="pill-text">Order Status</span>
              </button>

              <button
                type="button"
                className="whatsapp-pill-btn"
                onClick={() => openWhatsApp("Hi BuildMart, help me discover product catalogs and bulk prices")}
              >
                <Search size={17} className="pill-icon" aria-hidden="true" />
                <span className="pill-text">Product Discovery</span>
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Realistic Phone Mockup showing WhatsApp Chat */}
          <div className="whatsapp-phone-mockup-wrapper">
            <div className="smartphone-body">
              {/* Phone Speaker & Camera Notch */}
              <div className="smartphone-speaker-notch" />

              {/* WhatsApp App Header */}
              <div className="whatsapp-chat-topbar">
                <div className="chat-topbar-left">
                  <ChevronLeft size={18} className="chat-back-arrow" />
                  <div className="chat-avatar-badge">
                    <span className="chat-avatar-initials">BM</span>
                  </div>
                  <div className="chat-contact-info">
                    <div className="chat-contact-name-row">
                      <span className="chat-contact-name">BuildMart</span>
                      <span className="chat-verified-check" title="Verified Business">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    </div>
                    <span className="chat-status-text">Online</span>
                  </div>
                </div>

                <div className="chat-topbar-right">
                  <MoreVertical size={16} className="chat-menu-dots" />
                </div>
              </div>

              {/* Chat Conversation Area */}
              <div className="whatsapp-chat-canvas">
                {/* Message 1: Incoming greeting bubble */}
                <div className="chat-incoming-bubble">
                  <p className="chat-bubble-msg">
                    Hi! How can we help you today?
                  </p>
                  <div className="chat-bubble-meta">
                    <span className="chat-bubble-time">10:30 am</span>
                    <CheckCheck size={13} className="chat-double-ticks" />
                  </div>
                </div>

                {/* Message 2: Interactive Menu Card */}
                <div className="chat-interactive-menu-card">
                  <p className="menu-card-title">You can:</p>

                  <div className="menu-card-options-list">
                    <div
                      className="menu-card-option-row"
                      onClick={() => openWhatsApp("Hi BuildMart, I want to place an order")}
                    >
                      <span className="menu-option-icon">🛒</span>
                      <span className="menu-option-label">Place an order</span>
                    </div>

                    <div
                      className="menu-card-option-row"
                      onClick={() => openWhatsApp("Hi BuildMart, track my order")}
                    >
                      <span className="menu-option-icon">📋</span>
                      <span className="menu-option-label">Track your order</span>
                    </div>

                    <div
                      className="menu-card-option-row"
                      onClick={() => openWhatsApp("Hi BuildMart, I need help & support")}
                    >
                      <span className="menu-option-icon">🎧</span>
                      <span className="menu-option-label">Get help &amp; support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppBanner;
