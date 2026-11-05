import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Palette, Truck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const PAINT_HERO_PRODUCTS = [
  {
    id: 'paint_asian_royale_20l',
    brand: 'Asian Paints',
    name: 'Royale Luxury Emulsion 20L',
    price: 6450,
    mrp: 7850,
    discount: '18% OFF',
    image: '/categories/interior-emulsion.svg',
    tag: 'Interior Luxury'
  },
  {
    id: 'paint_asian_apex_ultima_20l',
    brand: 'Asian Paints',
    name: 'Apex Ultima Exterior 20L',
    price: 5890,
    mrp: 7200,
    discount: '18% OFF',
    image: '/categories/exterior-paint.svg',
    tag: '7-Yr Weather Shield'
  },
  {
    id: 'paint_birla_opus_style_20l',
    brand: 'Birla Paint',
    name: 'Birla Opus Style Emulsion 20L',
    price: 5200,
    mrp: 6500,
    discount: '20% OFF',
    image: '/categories/interior-emulsion.svg',
    tag: 'Silky Sheen'
  },
  {
    id: 'paint_birla_white_putty_40kg',
    brand: 'Birla Paint',
    name: 'Birla White WallCare Putty 40kg',
    price: 820,
    mrp: 990,
    discount: '17% OFF',
    image: '/categories/birla-wall-putty.svg',
    tag: 'Water-Resistant'
  }
];

const PaintShowcaseBanner = () => {
  const { t } = useLanguage();

  return (
    <section className="paint-mega-banner-section" id="paint-brand-showcase">
      <div className="container">
        <div className="paint-banner-outer-card">
          {/* Top Brand Badges Bar */}
          <div className="paint-banner-brand-strip">
            <div className="paint-brand-partner-badge">
              <span className="paint-partner-pill">OFFICIAL PAINT STATION</span>
              <span className="paint-partner-sub">100% Factory Sealed Buckets</span>
            </div>
            <div className="paint-logos-holder">
              <div className="paint-logo-tile" title="Asian Paints">
                <img
                  src="/brands/asian-paints.svg"
                  alt="Asian Paints"
                  className="paint-brand-svg-img"
                />
              </div>
              <span className="paint-brand-divider">&amp;</span>
              <div className="paint-logo-tile" title="Birla Paint">
                <img
                  src="/brands/birla-paint.svg"
                  alt="Birla Paint"
                  className="paint-brand-svg-img"
                />
              </div>
            </div>
          </div>

          {/* Main Hero Showcase Content */}
          <div className="paint-banner-content-grid">
            {/* Left Column: Headlines, Trust Points, and Call to Actions */}
            <div className="paint-banner-info-col">
              <div className="paint-spotlight-kicker">
                <Palette size={16} color="#FFE082" />
                <span>ASIAN PAINTS &amp; BIRLA OPUS SPOTLIGHT</span>
              </div>
              
              <h2 className="paint-banner-main-heading">
                Transform Every Wall with Vibrant Colors &amp; Waterproof Protection
              </h2>

              <p className="paint-banner-lead-desc">
                From Asian Paints Royale and Apex Ultima to the all-new Birla Opus luxury emulsions and Birla White WallCare Putty. Computerized color shade mixing delivered directly to your construction site in 30 minutes.
              </p>

              {/* Feature Highlights */}
              <div className="paint-perks-row">
                <div className="paint-perk-item">
                  <CheckCircle2 size={16} color="#4ADE80" />
                  <span>Up to 38% OFF Factory Direct</span>
                </div>
                <div className="paint-perk-item">
                  <Truck size={16} color="#60A5FA" />
                  <span>Express 30-Min Site Delivery</span>
                </div>
                <div className="paint-perk-item">
                  <ShieldCheck size={16} color="#FBBF24" />
                  <span>Authentic Batch Guarantee</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="paint-banner-cta-group">
                <Link
                  to="/products?brand=Asian%20Paints"
                  className="paint-cta-btn paint-asian-cta"
                >
                  <span>Shop Asian Paints</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/products?brand=Birla%20Paint"
                  className="paint-cta-btn paint-birla-cta"
                >
                  <span>Shop Birla Paint</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to="/products?category=Paints%20%26%20Wall%20Care"
                  className="paint-cta-btn paint-view-all-cta"
                >
                  <span>All Paint Catalogs</span>
                </Link>
              </div>
            </div>

            {/* Right Column: 4 Featured Product Mini-Cards */}
            <div className="paint-products-preview-col">
              <div className="paint-products-mini-grid">
                {PAINT_HERO_PRODUCTS.map((prod) => (
                  <Link
                    key={prod.id}
                    to={`/products?search=${encodeURIComponent(prod.name.split(' ')[0] + ' ' + prod.name.split(' ')[1])}`}
                    className="paint-product-mini-card"
                  >
                    <div className="paint-mini-top-row">
                      <span className="paint-mini-tag">{prod.tag}</span>
                      <span className="paint-mini-discount">{prod.discount}</span>
                    </div>

                    <div className="paint-mini-img-wrap">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="paint-mini-img"
                      />
                    </div>

                    <div className="paint-mini-details">
                      <span className="paint-mini-brand">{prod.brand}</span>
                      <h4 className="paint-mini-title">{prod.name}</h4>
                      <div className="paint-mini-pricing">
                        <span className="paint-mini-price">₹{prod.price.toLocaleString('en-IN')}</span>
                        <span className="paint-mini-mrp">₹{prod.mrp.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaintShowcaseBanner;

