import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, ClipboardList, ShieldCheck } from 'lucide-react';
import FeaturePillStrip from '../components/home/FeaturePillStrip';
import ProjectStageStrip from '../components/home/ProjectStageStrip';
import FestiveCashbackBanner from '../components/home/FestiveCashbackBanner';
import DealsSection from '../components/home/DealsSection';
import CategoryGrid from '../components/home/CategoryGrid';
import BrandShowcase from '../components/home/BrandShowcase';
import WhatsAppBanner from '../components/home/WhatsAppBanner';
import ProductCard from '../components/product/ProductCard';
import SEO from '../components/common/SEO';
import api, { subscribeCatalogUpdates } from '../utils/api';

const DEFAULT_BESTSELLERS = [
  {
    _id: 'asian_paints_damp_proof_20l',
    name: 'Asian Paints SmartCare Damp Proof Advanced 20L',
    brand: 'Asian Paints',
    category: 'Waterproofing',
    price: 5400,
    mrp: 6774,
    unit: '20L Bucket',
    stock: 120,
    discount: 20,
    images: [
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    _id: 'ultratech_super_ppc',
    name: 'UltraTech Super Portland Pozzolana Cement (PPC)',
    brand: 'UltraTech',
    category: 'Cement & Steel',
    price: 395,
    mrp: 440,
    unit: '50kg Bag',
    stock: 450,
    discount: 10,
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    _id: 'tata_tiscon_550d_12mm',
    name: 'Tata Tiscon 550D TMT Rebar (12mm)',
    brand: 'Tata Tiscon',
    category: 'Cement & Steel',
    price: 68,
    mrp: 75,
    unit: 'Per Kg',
    stock: 800,
    discount: 9,
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    _id: 'dr_fixit_lw_plus',
    name: 'Dr. Fixit LW+ Integral Liquid Waterproofing Compound',
    brand: 'Dr. Fixit',
    category: 'Waterproofing',
    price: 195,
    mrp: 240,
    unit: '1 Liter Bottle',
    stock: 400,
    discount: 19,
    images: [
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
    ]
  }
];

const loadHomeCache = () => {
  try {
    const raw = sessionStorage.getItem('bm_home_cache') || localStorage.getItem('bm_home_cache');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const HomePage = ({ onOpenPaperList }) => {
  const initialCache = loadHomeCache();
  const [categories, setCategories] = useState(initialCache?.categories || []);
  const [deals, setDeals] = useState(initialCache?.deals || []);
  const [bestsellers, setBestsellers] = useState(initialCache?.bestsellers || []);
  const [brands, setBrands] = useState(initialCache?.brands || []);
  const [loading, setLoading] = useState(!initialCache);

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const [catRes, dealsRes, bestRes, brandsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/deals'),
          api.get('/products/bestsellers'),
          api.get('/brands')
        ]);

        if (!isMounted) return;
        const rawCats = Array.isArray(catRes.data) ? catRes.data : (Array.isArray(catRes.data?.data) ? catRes.data.data : []);
        const rawDeals = Array.isArray(dealsRes.data) ? dealsRes.data : (Array.isArray(dealsRes.data?.data) ? dealsRes.data.data : []);
        const rawBest = Array.isArray(bestRes.data) ? bestRes.data : (Array.isArray(bestRes.data?.data) ? bestRes.data.data : []);
        const rawBrands = Array.isArray(brandsRes.data) ? brandsRes.data : (Array.isArray(brandsRes.data?.data) ? brandsRes.data.data : []);

        setCategories(rawCats);
        setDeals(rawDeals);
        setBestsellers(rawBest);
        setBrands(rawBrands);

        try {
          const cacheData = { categories: rawCats, deals: rawDeals, bestsellers: rawBest, brands: rawBrands };
          sessionStorage.setItem('bm_home_cache', JSON.stringify(cacheData));
          localStorage.setItem('bm_home_cache', JSON.stringify(cacheData));
        } catch {}
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();
    const unsubscribe = subscribeCatalogUpdates(fetchHomeData);
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BuildPlace',
    url: 'https://buildplace.in',
    logo: 'https://buildplace.in/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-1800-890-5000',
      contactType: 'customer service',
      areaServed: 'IN'
    }
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://buildplace.in',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://buildplace.in/products?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <div className="homepage-buildmart-wrapper">
      <SEO
        title="Direct Job-Site Procurement & 30-60 Min Materials Delivery"
        description="Order genuine UltraTech cement, Tata Tiscon steel rebars, Astral pipes, tiles, and waterproofing. 30-60 min job-site express delivery with verified test certificates."
        jsonLd={[organizationJsonLd, websiteJsonLd]}
      />
      {/* 1. 4-Pill Feature Strip (Free Delivery in 30 mins, 5% Cashback, ₹2,500 on ₹50k, Genuine Products) */}
      <FeaturePillStrip />

      {/* 2. Construction Stages & Paper List Navigator (Replaces old persona strip) */}
      <ProjectStageStrip onOpenPaperList={onOpenPaperList} />

      {/* 3. Promotional Carousel Banner (5% Cashback with coupon BUILD50K + Contractor Trade Desk) */}
      <FestiveCashbackBanner />

      {/* 4. Today's Deals Section (Orange Background + Countdown Timer + Outlined ADD) */}
      <DealsSection deals={deals} />

      {/* 5. Shop by Category (Orange Background + Peach Cards with Product Photos) */}
      <CategoryGrid categories={categories} />

      {/* 6. Bestselling Construction Materials */}
      <section className="bestsellers-section" style={{ padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)', marginTop: '4px' }}>
                Bestselling Materials
              </h2>
            </div>
            <Link
              to="/products?featured=true"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13.5px', fontWeight: 700, color: 'var(--primary-dark)' }}
            >
              <span>Explore All</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="product-grid">
            {bestsellers && bestsellers.length > 0 ? (
              bestsellers.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))
            ) : loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: '300px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ aspectRatio: '1', background: '#E2E8F0', borderRadius: '10px' }} />
                  <div style={{ height: '14px', width: '75%', background: '#E2E8F0', borderRadius: '4px' }} />
                  <div style={{ height: '16px', width: '45%', background: '#E2E8F0', borderRadius: '4px' }} />
                </div>
              ))
            ) : (
              DEFAULT_BESTSELLERS.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 7. Shop by Brand (Peach Cards with White Logo Boxes - Clicking shows Brand Products!) */}
      <BrandShowcase brands={brands} />

      {/* 8. WhatsApp Instant Support Banner (Forest Green Card with 4 Pills and Phone Mockup) */}
      <WhatsAppBanner />
    </div>
  );
};

export default HomePage;
