import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../utils/api';

export const OFFICIAL_10_BRANDS = [
  {
    id: 'dr_fixit',
    name: 'Dr. Fixit by Pidilite',
    queryName: 'Dr. Fixit by Pidilite',
    logo: '/brands/dr-fixit.svg',
    tileBg: '#FFE500'
  },
  {
    id: 'havells',
    name: 'Havells India Ltd.',
    queryName: 'Havells India Ltd.',
    logo: '/brands/havells.svg',
    tileBg: 'var(--bg-card)'
  },
  {
    id: 'futura',
    name: 'Futura',
    queryName: 'Futura',
    logo: '/brands/futura.svg',
    tileBg: '#D32F2F'
  },
  {
    id: 'hettich',
    name: 'Hettich India',
    queryName: 'Hettich India',
    logo: '/brands/hettich.svg',
    tileBg: 'var(--bg-card)'
  },
  {
    id: 'fevicol',
    name: 'Fevicol by Pidilite',
    queryName: 'Fevicol by Pidilite',
    logo: '/brands/fevicol.svg',
    tileBg: 'var(--bg-card)'
  },
  {
    id: 'goldmedal',
    name: 'Goldmedal Electricals',
    queryName: 'Goldmedal Electricals',
    logo: '/brands/goldmedal.svg',
    tileBg: 'var(--bg-card)'
  },
  {
    id: 'jaquar',
    name: 'Jaquar Group',
    queryName: 'Jaquar Group',
    logo: '/brands/jaquar.svg',
    tileBg: 'var(--bg-card)'
  },
  {
    id: 'luminous',
    name: 'Luminous Power Technologies',
    queryName: 'Luminous Power Technologies',
    logo: '/brands/luminous.svg',
    tileBg: 'var(--bg-card)'
  },
  {
    id: 'philips',
    name: 'Philips Lighting',
    queryName: 'Philips Lighting',
    logo: '/brands/philips.svg',
    tileBg: 'var(--bg-card)'
  },
  {
    id: 'lorazzo',
    name: 'Lorazzo',
    queryName: 'Lorazzo',
    logo: '/brands/lorazzo.svg',
    tileBg: '#0A0A0A'
  }
];

const BRAND_PRESETS = {
  'dr. fixit by pidilite': { logo: '/brands/dr-fixit.svg', tileBg: '#FFE500' },
  'dr. fixit': { logo: '/brands/dr-fixit.svg', tileBg: '#FFE500' },
  'havells india ltd.': { logo: '/brands/havells.svg', tileBg: 'var(--bg-card)' },
  'havells': { logo: '/brands/havells.svg', tileBg: 'var(--bg-card)' },
  'futura': { logo: '/brands/futura.svg', tileBg: '#D32F2F' },
  'hettich india': { logo: '/brands/hettich.svg', tileBg: 'var(--bg-card)' },
  'hettich': { logo: '/brands/hettich.svg', tileBg: 'var(--bg-card)' },
  'fevicol by pidilite': { logo: '/brands/fevicol.svg', tileBg: 'var(--bg-card)' },
  'fevicol': { logo: '/brands/fevicol.svg', tileBg: 'var(--bg-card)' },
  'goldmedal electricals': { logo: '/brands/goldmedal.svg', tileBg: 'var(--bg-card)' },
  'goldmedal': { logo: '/brands/goldmedal.svg', tileBg: 'var(--bg-card)' },
  'jaquar group': { logo: '/brands/jaquar.svg', tileBg: 'var(--bg-card)' },
  'jaquar': { logo: '/brands/jaquar.svg', tileBg: 'var(--bg-card)' },
  'luminous power technologies': { logo: '/brands/luminous.svg', tileBg: 'var(--bg-card)' },
  'luminous': { logo: '/brands/luminous.svg', tileBg: 'var(--bg-card)' },
  'philips lighting': { logo: '/brands/philips.svg', tileBg: 'var(--bg-card)' },
  'philips': { logo: '/brands/philips.svg', tileBg: 'var(--bg-card)' },
  'lorazzo': { logo: '/brands/lorazzo.svg', tileBg: '#0A0A0A' },
  'asian paints': { logo: '/brands/asian-paints.svg', tileBg: 'var(--bg-card)' },
  'birla paint': { logo: '/brands/birla-paint.svg', tileBg: 'var(--bg-card)' },
  'birla opus': { logo: '/brands/birla-paint.svg', tileBg: 'var(--bg-card)' }
};

const BrandShowcase = ({ brands = [] }) => {
  const { t } = useLanguage();
  const [liveBrands, setLiveBrands] = useState(brands);

  useEffect(() => {
    if (brands && brands.length > 0) {
      setLiveBrands(brands);
    } else {
      api.get('/brands')
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
          if (list.length > 0) {
            setLiveBrands(list);
          }
        })
        .catch(() => {});
    }
  }, [brands]);

  // Combine live brands from database so any admin-added brand shows up immediately
  const displayBrands = liveBrands && liveBrands.length > 0
    ? liveBrands.map(b => {
        const key = (b.name || '').toLowerCase().trim();
        const preset = BRAND_PRESETS[key] || {};
        return {
          id: b._id || b.id || b.slug || b.name,
          name: b.name,
          queryName: b.name,
          logo: b.logo || preset.logo || '/brands/havells.svg',
          tileBg: preset.tileBg || (b.tileBg || 'var(--bg-card)')
        };
      })
    : OFFICIAL_10_BRANDS;

  return (
    <section className="buildmart-brand-section" id="shop-by-brand-section">
      <div className="container">
        <div className="brand-section-header">
          <h2 className="brand-main-title">
            {t('shopByBrand') || 'Shop by brand'}
          </h2>
          <Link to="/products" className="brand-view-all">
            <span>{t('viewAll') || 'View All'}</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Dynamic Brand Cards Grid (Shows official 10 brands + any newly added brand by Admin) */}
        <div className="brand-cards-grid">
          {displayBrands.map(brand => (
            <Link
              key={brand.id || brand.name}
              to={`/products?brand=${encodeURIComponent(brand.queryName || brand.name)}`}
              className="brand-card-item"
              title={`Shop ${brand.name} Products`}
            >
              <div className="brand-peach-box">
                <div
                  className="brand-white-tile"
                  style={{
                    backgroundColor: brand.tileBg || 'var(--bg-card)',
                    border: brand.tileBg === 'var(--color-ink)' ? '1px solid var(--secondary-light)' : '1px solid rgba(0,0,0,0.04)'
                  }}
                >
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="brand-logo-img"
                      loading="eager"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const fallbackText = document.createElement('div');
                        fallbackText.style.fontWeight = '900';
                        fallbackText.style.fontSize = '13px';
                        fallbackText.style.color = brand.tileBg === '#0A0A0A' ? '#FFFFFF' : '#0F172A';
                        fallbackText.innerText = brand.name;
                        e.target.parentNode.appendChild(fallbackText);
                      }}
                    />
                  ) : (
                    <span style={{ fontWeight: 900, fontSize: '13px', color: 'var(--color-ink)' }}>
                      {brand.name}
                    </span>
                  )}
                </div>
              </div>
              <span className="brand-name-label">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
