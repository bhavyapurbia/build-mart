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
import WhyChooseUs from '../components/home/WhyChooseUs';
import ProductCard from '../components/product/ProductCard';
import api from '../utils/api';

const HomePage = ({ onOpenPaperList }) => {
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, dealsRes, bestRes, brandsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products/deals'),
          api.get('/products/bestsellers'),
          api.get('/brands')
        ]);

        const rawCats = Array.isArray(catRes.data) ? catRes.data : (Array.isArray(catRes.data?.data) ? catRes.data.data : []);
        const rawDeals = Array.isArray(dealsRes.data) ? dealsRes.data : (Array.isArray(dealsRes.data?.data) ? dealsRes.data.data : []);
        const rawBest = Array.isArray(bestRes.data) ? bestRes.data : (Array.isArray(bestRes.data?.data) ? bestRes.data.data : []);
        const rawBrands = Array.isArray(brandsRes.data) ? brandsRes.data : (Array.isArray(brandsRes.data?.data) ? brandsRes.data.data : []);

        setCategories(rawCats);
        setDeals(rawDeals);
        setBestsellers(rawBest);
        setBrands(rawBrands);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="homepage-buildmart-wrapper">
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

      {/* 6. Bestselling Construction Materials (Product Cards: Green Discount + Orange 30 Mins + Orange Outlined + ADD) */}
      {bestsellers.length > 0 && (
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
              {bestsellers.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Shop by Brand (Peach Cards with White Logo Boxes - Clicking shows Brand Products!) */}
      <BrandShowcase brands={brands} />

      {/* 8. WhatsApp Instant Support Banner (Forest Green Card with 4 Pills and Phone Mockup) */}
      <WhatsAppBanner />

      {/* 9. Why Choose Us */}
      <WhyChooseUs />
    </div>
  );
};

export default HomePage;
