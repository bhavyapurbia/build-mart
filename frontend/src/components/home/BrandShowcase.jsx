import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../utils/api';

export const OFFICIAL_BRANDS = [
  {
    id: 'dr_fixit',
    name: 'Dr. Fixit by Pidilite',
    queryName: 'Dr. Fixit',
    logo: '/brands/dr-fixit.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'havells',
    name: 'Havells India Ltd.',
    queryName: 'Havells',
    logo: '/brands/havells.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'futura',
    name: 'Futura',
    queryName: 'Futura',
    logo: '/brands/futura.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'hettich',
    name: 'Hettich India',
    queryName: 'Hettich',
    logo: '/brands/hettich.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'fevicol',
    name: 'Fevicol by Pidilite',
    queryName: 'Fevicol',
    logo: '/brands/fevicol.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'goldmedal',
    name: 'Goldmedal Electricals',
    queryName: 'Goldmedal',
    logo: '/brands/goldmedal.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'jaquar',
    name: 'Jaquar Group',
    queryName: 'Jaquar',
    logo: '/brands/jaquar.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'luminous',
    name: 'Luminous Power Technologies',
    queryName: 'Luminous',
    logo: '/brands/luminous.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'philips',
    name: 'Philips Lighting',
    queryName: 'Philips',
    logo: '/brands/philips.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'asian_paints',
    name: 'Asian Paints',
    queryName: 'Asian Paints',
    logo: '/brands/asian-paints.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'ultratech',
    name: 'UltraTech Cement',
    queryName: 'UltraTech',
    logo: '/brands/ultratech.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'tata_tiscon',
    name: 'Tata Tiscon',
    queryName: 'Tata Tiscon',
    logo: '/brands/tata-tiscon.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'kajaria',
    name: 'Kajaria Ceramics',
    queryName: 'Kajaria',
    logo: '/brands/kajaria.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'astral',
    name: 'Astral Pipes',
    queryName: 'Astral',
    logo: '/brands/astral.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'greenply',
    name: 'Greenply Plywood',
    queryName: 'Greenply',
    logo: '/brands/greenply.svg',
    tileBg: '#FFFFFF'
  },
  {
    id: 'godrej',
    name: 'Godrej Locks',
    queryName: 'Godrej',
    logo: '/brands/godrej.svg',
    tileBg: '#FFFFFF'
  }
];

const BRAND_PRESETS = {
  'dr. fixit': { logo: '/brands/dr-fixit.svg', query: 'Dr. Fixit' },
  'dr fixit': { logo: '/brands/dr-fixit.svg', query: 'Dr. Fixit' },
  'dr. fixit by pidilite': { logo: '/brands/dr-fixit.svg', query: 'Dr. Fixit' },
  'havells': { logo: '/brands/havells.svg', query: 'Havells' },
  'havells india': { logo: '/brands/havells.svg', query: 'Havells' },
  'havells india ltd.': { logo: '/brands/havells.svg', query: 'Havells' },
  'futura': { logo: '/brands/futura.svg', query: 'Futura' },
  'futura sinks': { logo: '/brands/futura.svg', query: 'Futura' },
  'hettich': { logo: '/brands/hettich.svg', query: 'Hettich' },
  'hettich india': { logo: '/brands/hettich.svg', query: 'Hettich' },
  'fevicol': { logo: '/brands/fevicol.svg', query: 'Fevicol' },
  'pidilite': { logo: '/brands/fevicol.svg', query: 'Fevicol' },
  'fevicol by pidilite': { logo: '/brands/fevicol.svg', query: 'Fevicol' },
  'fevicol (pidilite)': { logo: '/brands/fevicol.svg', query: 'Fevicol' },
  'goldmedal': { logo: '/brands/goldmedal.svg', query: 'Goldmedal' },
  'goldmedal electricals': { logo: '/brands/goldmedal.svg', query: 'Goldmedal' },
  'jaquar': { logo: '/brands/jaquar.svg', query: 'Jaquar' },
  'jaquar group': { logo: '/brands/jaquar.svg', query: 'Jaquar' },
  'luminous': { logo: '/brands/luminous.svg', query: 'Luminous' },
  'luminous power': { logo: '/brands/luminous.svg', query: 'Luminous' },
  'luminous power technologies': { logo: '/brands/luminous.svg', query: 'Luminous' },
  'philips': { logo: '/brands/philips.svg', query: 'Philips' },
  'philips lighting': { logo: '/brands/philips.svg', query: 'Philips' },
  'asian paints': { logo: '/brands/asian-paints.svg', query: 'Asian Paints' },
  'asian': { logo: '/brands/asian-paints.svg', query: 'Asian Paints' },
  'ultratech': { logo: '/brands/ultratech.svg', query: 'UltraTech' },
  'ultratech cement': { logo: '/brands/ultratech.svg', query: 'UltraTech' },
  'tata tiscon': { logo: '/brands/tata-tiscon.svg', query: 'Tata Tiscon' },
  'tata': { logo: '/brands/tata-tiscon.svg', query: 'Tata Tiscon' },
  'astral': { logo: '/brands/astral.svg', query: 'Astral' },
  'astral pipes': { logo: '/brands/astral.svg', query: 'Astral' },
  'kajaria': { logo: '/brands/kajaria.svg', query: 'Kajaria' },
  'kajaria ceramics': { logo: '/brands/kajaria.svg', query: 'Kajaria' },
  'greenply': { logo: '/brands/greenply.svg', query: 'Greenply' },
  'greenply plywood': { logo: '/brands/greenply.svg', query: 'Greenply' },
  'godrej': { logo: '/brands/godrej.svg', query: 'Godrej' },
  'godrej locks': { logo: '/brands/godrej.svg', query: 'Godrej' }
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
          if (list && list.length > 0) {
            setLiveBrands(list);
          }
        })
        .catch(() => {});
    }
  }, [brands]);

  // Merge database brands with presets to guarantee authentic logos and correct search query
  const displayBrands = (liveBrands && liveBrands.length > 0)
    ? liveBrands.map(b => {
        const key = (b.name || '').toLowerCase().trim();
        const preset = BRAND_PRESETS[key] || {};
        return {
          id: b._id || b.id || b.slug || b.name,
          name: b.name,
          queryName: preset.query || b.queryName || b.name,
          logo: b.logo || preset.logo || '/brands/asian-paints.svg',
          tileBg: '#FFFFFF'
        };
      })
    : OFFICIAL_BRANDS;

  return (
    <section className="buildmart-brand-section" id="shop-by-brand-section">
      <div className="container">
        {/* Section Header */}
        <div className="brand-section-header">
          <h2 className="brand-main-title">
            Shop by brand
          </h2>
          <Link to="/products" className="brand-view-all">
            <span>{t('viewAll') || 'View All'}</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* 3-Column Responsive Grid matching Reference Screenshot */}
        <div className="brand-cards-grid">
          {displayBrands.map(brand => (
            <Link
              key={brand.id || brand.name}
              to={`/products?brand=${encodeURIComponent(brand.queryName || brand.name)}`}
              className="brand-card-item"
              title={`View all ${brand.name} products`}
            >
              <div className="brand-peach-box">
                <div className="brand-white-tile">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="brand-logo-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const fallbackText = document.createElement('div');
                        fallbackText.style.fontWeight = '900';
                        fallbackText.style.fontSize = '13px';
                        fallbackText.style.color = '#0F172A';
                        fallbackText.style.textAlign = 'center';
                        fallbackText.innerText = brand.name;
                        e.target.parentNode.appendChild(fallbackText);
                      }}
                    />
                  ) : (
                    <div style={{ fontWeight: 900, fontSize: '13px', color: '#0F172A', textAlign: 'center' }}>
                      {brand.name}
                    </div>
                  )}
                </div>
              </div>
              <span className="brand-name-label">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
