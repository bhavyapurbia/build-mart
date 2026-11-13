import React, { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Check, ClipboardList, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMaterialList } from '../../context/MaterialListContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Img from '../common/Img';

export const getAccurateProductImage = (product, rawSrc) => {
  if (
    !rawSrc ||
    rawSrc === '/placeholder-material.svg' ||
    rawSrc === '/placeholder-material.jpg' ||
    rawSrc.includes('1590381105924-c72589b9ef3f') ||
    rawSrc.includes('1600585154340-be6161a56a0c') ||
    rawSrc.includes('1584622781564-1d987f7333c1')
  ) {
    const name = (product?.name || '').toLowerCase();
    const cat = (product?.category || '').toLowerCase();
    if (name.includes('brick')) return '/categories/red-bricks-podium.svg';
    if (name.includes('sand') || name.includes('m-sand')) return '/categories/m-sand-podium.svg';
    if (name.includes('aggregate') || name.includes('blue metal') || name.includes('granite')) return '/categories/granite-aggregate-podium.svg';
    if (name.includes('aac') || name.includes('block')) return '/categories/aac-blocks-podium.svg';
    if (name.includes('cement')) return '/categories/cement-bags-trio.svg';
    if (name.includes('rebar') || name.includes('tmt') || name.includes('tiscon')) return '/categories/tmt-rebar-podium.svg';
    if (name.includes('binding wire') || name.includes('wire')) return '/categories/binding-wire-podium.svg';
    if (name.includes('tile adhesive') || name.includes('roff')) return '/categories/tile-adhesive-podium.svg';
    if (name.includes('tile') || name.includes('vitrified') || name.includes('kajaria')) return '/categories/floor-tiles-podium.svg';
    if (name.includes('cpvc') || name.includes('pipe') || name.includes('astral')) return '/categories/cpvc-pipes-podium.svg';
    if (name.includes('pvc') || name.includes('drainage') || name.includes('swr') || name.includes('supreme')) return '/categories/pvc-drainage-podium.svg';
    if (name.includes('valve') || name.includes('zoloto')) return '/categories/brass-valves-podium.svg';
    if (name.includes('grinder') || name.includes('bosch')) return '/categories/angle-grinder-podium.svg';
    if (name.includes('blade') || name.includes('cutting')) return '/categories/cutting-blades-podium.svg';
    if (name.includes('tape') || name.includes('measuring') || name.includes('stanley')) return '/categories/measuring-tape-podium.svg';
    if (name.includes('faucet') || name.includes('mixer') || name.includes('tap') || name.includes('jaquar')) return '/categories/bath-faucets-mixers.svg';
    if (name.includes('shower')) return '/categories/overhead-showers.svg';
    if (name.includes('basin') || name.includes('sink') || name.includes('cera')) return '/categories/wash-basins-sinks.svg';
    if (name.includes('commode') || name.includes('sanitary') || name.includes('toilet')) return '/categories/sanitaryware-commodes.svg';
    if (name.includes('hinge') || name.includes('channel')) return '/categories/hinges-and-channels.png';
    if (name.includes('lock') || name.includes('handle') || name.includes('godrej')) return '/categories/door-hardware-locks-handles.png';
    if (name.includes('fevicol') || name.includes('adhesive')) return '/categories/fevicol-sealants.svg';
    if (name.includes('paint') || name.includes('damp proof') || name.includes('asian')) return '/categories/paints-putty-sundries.svg';
    if (cat.includes('cement')) return '/categories/cement-bags-trio.svg';
  }
  return rawSrc;
};

const ProductCard = memo(function ProductCard({ product }) {
  const { toggleMaterialItem, isMaterialSelected } = useMaterialList();
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const prodId = String(product._id || product.id);
  const isSelected = isMaterialSelected(prodId);
  const inWishlist = isInWishlist(prodId);

  const productUrl = product.slug ? `/p/${product.slug}` : `/product/${prodId}`;

  // Multi-image list
  const imageList = (product.images && Array.isArray(product.images) && product.images.length > 0)
    ? product.images.filter(Boolean)
    : [product.image || '/placeholder-material.svg'];

  const [activeIdx, setActiveIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  // Auto-slide every 3.8s if multiple images exist
  useEffect(() => {
    if (imageList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % imageList.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [imageList.length]);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx(prev => (prev - 1 + imageList.length) % imageList.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx(prev => (prev + 1) % imageList.length);
  };

  const handleDotClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx(index);
  };

  // Mobile Touch Swipe
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || imageList.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 35) {
      // Swiped Left -> Next
      setActiveIdx(prev => (prev + 1) % imageList.length);
    } else if (diff < -35) {
      // Swiped Right -> Prev
      setActiveIdx(prev => (prev - 1 + imageList.length) % imageList.length);
    }
    setTouchStartX(null);
  };

  const cartItem = cartItems.find(item => String(item.productId || item._id || item.product?._id || item.product?.id) === prodId);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const stock = Number(product.stock != null ? product.stock : 100);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 10;

  const handleToggleMaterial = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMaterialItem(product);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const discountPercent = product.discount || (product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0);

  const safeActiveIdx = imageList.length > 0 ? (activeIdx % imageList.length) : 0;
  const rawImageSrc = imageList[safeActiveIdx] || imageList[0] || '/placeholder-material.svg';
  const currentImageSrc = getAccurateProductImage(product, rawImageSrc);

  return (
    <div className={`buildmart-product-card ${isSelected ? 'in-material-list' : ''} ${isOutOfStock ? 'out-of-stock-card' : ''}`}>
      {/* Top Badges Row */}
      <div className="card-top-badges">
        {discountPercent > 0 ? (
          <span className="buildmart-discount-badge">
            {discountPercent}% OFF
          </span>
        ) : <span />}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              padding: 0
            }}
          >
            <Heart
              size={15}
              color={inWishlist ? '#EF4444' : '#6B7280'}
              fill={inWishlist ? '#EF4444' : 'none'}
            />
          </button>

          <span className="buildmart-mins-badge">
            <Zap size={11} fill='var(--bg-card)' />
            <span>30 MINS</span>
          </span>
        </div>
      </div>

      {/* Product Image Area with Link to Product Page & Multi-Image Slider */}
      <div
        className="card-slider-wrapper"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Link to={productUrl} className="card-image-wrap" title={`View ${product.name}`}>
          <Img
            src={currentImageSrc}
            alt={product.name}
            className="card-main-img"
            aspectRatio="1"
          />

          {/* Out of Stock Ribbon */}
          {isOutOfStock ? (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#B91C1C',
              fontWeight: 800,
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Out of Stock
            </div>
          ) : isLowStock ? (
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              background: '#FEF3C7',
              color: '#92400E',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              Only {stock} left
            </div>
          ) : null}

          {/* Flagship Material List Selection Button */}
          <button
            type="button"
            onClick={handleToggleMaterial}
            aria-pressed={isSelected}
            aria-label={isSelected ? 'Remove from Material List' : 'Add to Material List'}
            className={`material-list-bubble ${isSelected ? 'active' : ''}`}
            title={isSelected ? 'Selected in Material List' : 'Add to Material List'}
          >
            {isSelected ? (
              <Check size={14} strokeWidth={3} />
            ) : (
              <ClipboardList size={13} strokeWidth={2} />
            )}
          </button>

          {isSelected && (
            <div className="in-list-ribbon">
              ✓ IN MATERIAL LIST
            </div>
          )}
        </Link>

        {/* Previous & Next Manual Nav Arrows (shown when product has multiple images) */}
        {imageList.length > 1 && (
          <>
            <button
              type="button"
              className="card-slide-nav-btn prev-btn"
              onClick={handlePrev}
              aria-label="Previous product image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="card-slide-nav-btn next-btn"
              onClick={handleNext}
              aria-label="Next product image"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Dynamic Multi-Image Carousel Dots matching Reference Screenshot */}
      {imageList.length > 1 ? (
        <div className="card-dots-row">
          {imageList.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`card-dot-pill ${safeActiveIdx === idx ? 'active' : ''}`}
              onClick={(e) => handleDotClick(e, idx)}
              aria-label={`Jump to image ${idx + 1}`}
            />
          ))}
        </div>
      ) : (
        <div className="card-dots-row single-dot-placeholder">
          <span className="card-dot-pill active" />
        </div>
      )}

      {/* Card Info */}
      <div className="card-body">
        {product.brand && (
          <span className="card-brand-subtitle">
            {product.brand.toUpperCase()}
          </span>
        )}

        <Link
          to={productUrl}
          className="card-product-title"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Rating Row */}
        {product.rating && product.reviewsCount > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0', fontSize: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#FEF3C7', color: '#B45309', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
              <Star size={11} fill="#B45309" color="#B45309" /> {product.rating}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({product.reviewsCount})</span>
          </div>
        ) : null}

        {/* Price Row: Bold Price, Strikethrough MRP, Discount % */}
        <div className="card-price-row">
          <span className="card-current-price">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </span>

          {product.mrp > product.price && (
            <span className="card-original-mrp">
              ₹{Number(product.mrp).toLocaleString('en-IN')}
            </span>
          )}

          {discountPercent > 0 && (
            <span className="card-inline-discount">
              ({discountPercent}% OFF)
            </span>
          )}
        </div>

        {product.unit && (
          <span className="card-unit-label">
            Per {product.unit}
          </span>
        )}

        {/* Bottom Action: Outlined Orange + ADD or Stepper */}
        <div className="card-action-bottom">
          {inCartQty === 0 ? (
            <button
              type="button"
              className="card-add-to-cart-btn"
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
            >
              + ADD
            </button>
          ) : (
            <div className="card-cart-stepper">
              <button
                type="button"
                className="card-stepper-btn"
                onClick={() => updateQuantity(prodId, inCartQty - 1)}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="card-stepper-qty">{inCartQty}</span>
              <button
                type="button"
                className="card-stepper-btn"
                onClick={() => updateQuantity(prodId, inCartQty + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
