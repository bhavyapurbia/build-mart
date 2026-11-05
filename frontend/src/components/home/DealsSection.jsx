import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useMaterialList } from '../../context/MaterialListContext';

const DealsSection = ({ deals = [] }) => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { toggleMaterialItem } = useMaterialList();

  // Simulated live countdown timer: hours, mins, secs
  const [timeLeft, setTimeLeft] = useState({
    hours: 26,
    minutes: 5,
    seconds: 32
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!deals.length) return null;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <section className="buildmart-orange-deals-section">
      <div className="container">
        {/* Section Header */}
        <div className="deals-header-row">
          <div className="deals-title-group">
            <h2 className="deals-title">
              Today's Deals
            </h2>
            <span className="deals-subtitle">
              ⚡ Limited-time factory price drops on high-demand site essentials
            </span>
          </div>

          <Link to="/products?deal=true" className="deals-view-all-link">
            <span>View All</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Deals Cards Grid (on vibrant orange background) */}
        <div className="deals-cards-grid">
          {deals.slice(0, 6).map(product => {
            const cartItem = cartItems.find(item => (item.product._id || item.product.id) === (product._id || product.id));
            const inCartQty = cartItem ? cartItem.quantity : 0;
            const discountPercent = product.discount || (product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0);

            return (
              <div key={product._id} className="deal-card-buildmart">
                {/* Top Row: Green Discount Badge + Navy Countdown Badge */}
                <div className="deal-card-top">
                  <span className="deal-green-badge">
                    {discountPercent > 0 ? `${discountPercent}% OFF` : 'DEAL'}
                  </span>

                  <div className="deal-countdown-badge">
                    <span className="countdown-label">Ends in</span>
                    <span className="countdown-box">{pad(timeLeft.hours)}</span>
                    <span className="countdown-sep">:</span>
                    <span className="countdown-box">{pad(timeLeft.minutes)}</span>
                    <span className="countdown-sep">:</span>
                    <span className="countdown-box">{pad(timeLeft.seconds)}</span>
                  </div>
                </div>

                {/* Center Content: Product Image + Details */}
                <div className="deal-card-content">
                  <div
                    className="deal-image-container"
                    onClick={() => toggleMaterialItem(product)}
                    title="Tap to add to Material List"
                  >
                    <img
                      src={(product.images && product.images[0]) || product.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=300&q=80'}
                      alt={product.name}
                      className="deal-product-img"
                    />
                  </div>

                  <div className="deal-info-container">
                    <Link to={`/product/${product._id}`} className="deal-product-name">
                      {product.name}
                    </Link>

                    {product.unit && (
                      <div className="deal-product-spec">
                        {product.unit}
                      </div>
                    )}

                    <div className="deal-pricing-row">
                      <span className="deal-price">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </span>
                      {product.mrp > product.price && (
                        <span className="deal-mrp">
                          ₹{Number(product.mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Carousel Dots */}
                <div className="deal-dots-row">
                  <span className="deal-dot active" />
                  <span className="deal-dot" />
                  <span className="deal-dot" />
                </div>

                {/* Bottom Outlined Orange + ADD Button */}
                <div className="deal-action-row">
                  {inCartQty === 0 ? (
                    <button
                      type="button"
                      className="deal-add-btn"
                      onClick={() => addToCart(product, 1)}
                    >
                      + ADD
                    </button>
                  ) : (
                    <div className="deal-stepper-btn">
                      <button
                        type="button"
                        className="deal-step-action"
                        onClick={() => updateQuantity(product._id || product.id, inCartQty - 1)}
                      >
                        -
                      </button>
                      <span className="deal-step-count">{inCartQty}</span>
                      <button
                        type="button"
                        className="deal-step-action"
                        onClick={() => updateQuantity(product._id || product.id, inCartQty + 1)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DealsSection;
