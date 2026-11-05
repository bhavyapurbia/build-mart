import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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
    tileBg: '#FFFFFF'
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
    tileBg: '#FFFFFF'
  },
  {
    id: 'fevicol',
    name: 'Fevicol by Pidilite',
    queryName: 'Fevicol by Pidilite',
    logo: '/brands/fevicol.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'goldmedal',
    name: 'Goldmedal Electricals',
    queryName: 'Goldmedal Electricals',
    logo: '/brands/goldmedal.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'jaquar',
    name: 'Jaquar Group',
    queryName: 'Jaquar Group',
    logo: '/brands/jaquar.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'luminous',
    name: 'Luminous Power Technologies',
    queryName: 'Luminous Power Technologies',
    logo: '/brands/luminous.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'philips',
    name: 'Philips Lighting',
    queryName: 'Philips Lighting',
    logo: '/brands/philips.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'lorazzo',
    name: 'Lorazzo',
    queryName: 'Lorazzo',
    logo: '/brands/lorazzo.svg',
    tileBg: '#0A0A0A'
  }
];

const BrandShowcase = ({ brands = [] }) => {
  const { t } = useLanguage();

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

        {/* 10 Brand Cards (5 cols x 2 rows on desktop, 2 cols on mobile) */}
        <div className="brand-cards-grid">
          {OFFICIAL_10_BRANDS.map(brand => (
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
                    backgroundColor: brand.tileBg || '#FFFFFF',
                    border: brand.tileBg === '#0A0A0A' ? '1px solid #334155' : '1px solid rgba(0,0,0,0.04)'
                  }}
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="brand-logo-img"
                    loading="eager"
                  />
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
