import React from 'react';
import { Truck, Tag, IndianRupee, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const FeaturePillStrip = () => {
  const { t } = useLanguage();

  return (
    <section className="buildmart-feature-strip-section">
      <div className="container">
        <div className="feature-strip-peach-card">
          <div className="feature-pill-item">
            <div className="feature-pill-icon">
              <Truck size={22} color="#FF6E00" strokeWidth={2.2} />
            </div>
            <div className="feature-pill-text">
              <span className="pill-title">{t('freeDelivery') || 'FREE DELIVERY'}</span>
              <span className="pill-sub">{t('deliverySub') || 'IN 30 MINS*'}</span>
            </div>
          </div>

          <div className="feature-pill-divider" />

          <div className="feature-pill-item">
            <div className="feature-pill-icon">
              <Tag size={20} color="#FF6E00" strokeWidth={2.2} />
            </div>
            <div className="feature-pill-text">
              <span className="pill-title">{t('cashback') || '5% CASHBACK*'}</span>
              <span className="pill-sub">{t('cashbackSub') || 'ON ORDERS'}</span>
            </div>
          </div>

          <div className="feature-pill-divider" />

          <div className="feature-pill-item">
            <div className="feature-pill-icon">
              <IndianRupee size={20} color="#FF6E00" strokeWidth={2.2} />
            </div>
            <div className="feature-pill-text">
              <span className="pill-title">{t('spendPromo') || '₹2,500'}</span>
              <span className="pill-sub">{t('spendPromoSub') || 'ON ₹50K SPENT'}</span>
            </div>
          </div>

          <div className="feature-pill-divider" />

          <div className="feature-pill-item">
            <div className="feature-pill-icon">
              <ShieldCheck size={22} color="#FF6E00" strokeWidth={2.2} />
            </div>
            <div className="feature-pill-text">
              <span className="pill-title">{t('genuineProducts') || 'GENUINE'}</span>
              <span className="pill-sub">{t('genuineSub') || 'PRODUCTS'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturePillStrip;
