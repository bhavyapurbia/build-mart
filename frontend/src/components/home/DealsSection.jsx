import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useMaterialList } from '../../context/MaterialListContext';

const DEFAULT_REAL_DEALS = [
  {
    _id: 'deal_araldite_klear5',
    name: 'Araldite Klear5 Epoxy Adhesive',
    unit: '450 grams',
    price: 898,
    mrp: 1200,
    discount: 25,
    deliverySpeed: '30 MINS',
    image: '/deals/araldite-klear5.svg',
    images: ['/deals/araldite-klear5.svg']
  },
  {
    _id: 'deal_kohinoor_extension_nipple',
    name: 'Kohinoor 1-1/2 inch Extension Nipple',
    unit: '1½ Inch',
    price: 118,
    mrp: 380,
    discount: 69,
    deliverySpeed: '30 MINS',
    image: '/deals/kohinoor-extension-nipple.svg',
    images: ['/deals/kohinoor-extension-nipple.svg']
  },
  {
    _id: 'deal_hindware_western_commode',
    name: 'Hindware Modern Western Commode',
    unit: 'Standard Box',
    price: 3490,
    mrp: 5370,
    discount: 35,
    deliverySpeed: '30 MINS',
    image: '/deals/western-commode-deal.svg',
    images: ['/deals/western-commode-deal.svg']
  },
  {
    _id: 'deal_fevikwik_463_thick_gel',
    name: 'Fevikwik 463 Extra Thick Gel Adhesive',
    unit: '50g Tube',
    price: 115,
    mrp: 170,
    discount: 32,
    deliverySpeed: '30 MINS',
    image: '/deals/fevikwik-463.svg',
    images: ['/deals/fevikwik-463.svg']
  },
  {
    _id: 'deal_ultratech_ppc',
    name: 'UltraTech Super Portland Pozzolana Cement',
    unit: '50kg Bag',
    price: 395,
    mrp: 440,
    discount: 10,
    deliverySpeed: '30 MINS',
    image: '/categories/cement-bags-ultratech.png',
    images: ['/categories/cement-bags-ultratech.png']
  },
  {
    _id: 'deal_tata_tiscon_16mm',
    name: 'Tata Tiscon 550D TMT Rebar (16mm)',
    unit: '12m Piece',
    price: 1480,
    mrp: 1650,
    discount: 10,
    deliverySpeed: '30 MINS',
    image: '/categories/tmt-bars.svg',
    images: ['/categories/tmt-bars.svg']
  }
];

const DealsSection = ({ deals = [] }) => {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { toggleMaterialItem } = useMaterialList();
  const sliderRef = useRef(null);

  const displayDeals = deals && deals.length > 0 ? deals : DEFAULT_REAL_DEALS;

  // Live countdown timer matching screenshot (Ends in 22 : 41 : 59)
  const [timeLeft, setTimeLeft] = useState({
    hours: 22,
    minutes: 41,
    seconds: 59
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

  const pad = (n) => String(n).padStart(2, '0');

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="buildmart-orange-deals-section" id="todays-deals-carousel">
      <div className="container">
        {/* Section Header */}
        <div className="deals-header-row">
          <div className="deals-title-group">
            <h2 className="deals-title">
              Today's Deals
            </h2>
            <span className="deals-subtitle">
              Limited-time factory price drops on high-demand site essentials
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Desktop Navigation Chevrons */}
            <div className="deals-nav-arrows">
              <button
                type="button"
                className="deals-arrow-btn"
                onClick={() => handleScroll('left')}
                aria-label="Slide Left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="deals-arrow-btn"
                onClick={() => handleScroll('right')}
                aria-label="Slide Right"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <Link to="/products?deal=true" className="deals-view-all-link">
              <span>View All</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Sliding Carousel Track (Slides smoothly from right to left) */}
        <div className="deals-slider-track" ref={sliderRef}>
          {displayDeals.map(product => {
            const prodId = product._id || product.id;
            const cartItem = cartItems.find(item => (item.productId || item._id || item.product?._id || item.product?.id) === prodId);
            const inCartQty = cartItem ? cartItem.quantity : 0;
            const discountPercent = product.discount || (product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 10);
            const prodImage = (product.images && product.images[0]) || product.image || '/deals/araldite-klear5.svg';

            return (
              <div key={prodId} className="deal-split-card deal-slide-item">
                {/* LEFT COLUMN: Dual Badges + Light Gray Image Box + Carousel Dots */}
                <div className="deal-col-left">
                  {/* Dual Badges: Green Discount + Orange Speed */}
                  <div className="deal-dual-badges">
                    <span className="deal-green-off-badge">
                      {discountPercent > 0 ? `${discountPercent}% OFF` : 'DEAL'}
                    </span>
                    <span className="deal-orange-speed-badge">
                      <Zap size={10} fill="#FFFFFF" strokeWidth={0} />
                      {product.deliverySpeed || '30 MINS'}
                    </span>
                  </div>

                  {/* Gray rounded image container */}
                  <div
                    className="deal-img-gray-box"
                    onClick={() => toggleMaterialItem(product)}
                    title="Tap to add to Material List"
                  >
                    <img
                      src={prodImage}
                      alt={product.name}
                      className="deal-box-img"
                      loading="lazy"
                    />
                  </div>

                  {/* Carousel Dots Indicator: Active Navy Pill + Gray dots */}
                  <div className="deal-dots-pill-row">
                    <span className="deal-pill-active" />
                    <span className="deal-pill-dot" />
                    <span className="deal-pill-dot" />
                  </div>
                </div>

                {/* RIGHT COLUMN: Navy Countdown Timer + Product Details + Price + + ADD Button */}
                <div className="deal-col-right">
                  {/* Countdown Timer with White Digit Boxes */}
                  <div className="deal-navy-timer-badge">
                    <span className="timer-text-label">Ends in</span>
                    <span className="timer-white-digit-box">{pad(timeLeft.hours)}</span>
                    <span className="timer-colon-sep">:</span>
                    <span className="timer-white-digit-box">{pad(timeLeft.minutes)}</span>
                    <span className="timer-colon-sep">:</span>
                    <span className="timer-white-digit-box">{pad(timeLeft.seconds)}</span>
                  </div>

                  {/* Title */}
                  <Link to={`/product/${prodId}`} className="deal-title-link" title={product.name}>
                    {product.name}
                  </Link>

                  {/* Spec / Unit */}
                  {product.unit && (
                    <div className="deal-unit-spec">
                      {product.unit}
                    </div>
                  )}

                  {/* Pricing: Selling Price + Strikethrough MRP */}
                  <div className="deal-price-wrapper">
                    <span className="deal-selling-price">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>
                    {product.mrp > product.price && (
                      <span className="deal-strikethrough-mrp">
                        ₹{Number(product.mrp).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  {/* Bottom Action: Outlined Orange + ADD or Stepper */}
                  <div className="deal-btn-container">
                    {inCartQty === 0 ? (
                      <button
                        type="button"
                        className="deal-orange-outline-btn"
                        onClick={() => addToCart(product, 1)}
                      >
                        + ADD
                      </button>
                    ) : (
                      <div className="deal-stepper-btn">
                        <button
                          type="button"
                          className="deal-step-action"
                          onClick={() => updateQuantity(prodId, inCartQty - 1)}
                        >
                          -
                        </button>
                        <span className="deal-step-count">{inCartQty}</span>
                        <button
                          type="button"
                          className="deal-step-action"
                          onClick={() => updateQuantity(prodId, inCartQty + 1)}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
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
