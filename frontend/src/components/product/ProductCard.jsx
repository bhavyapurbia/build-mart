import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Check, Plus, ClipboardList, ChevronDown, Heart, Star, AlertCircle } from 'lucide-react';
import { useMaterialList } from '../../context/MaterialListContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Img from '../common/Img';

const ProductCard = memo(function ProductCard({ product }) {
  const { toggleMaterialItem, isMaterialSelected } = useMaterialList();
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const prodId = String(product._id || product.id);
  const isSelected = isMaterialSelected(prodId);
  const inWishlist = isInWishlist(prodId);

  const productUrl = product.slug ? `/p/${product.slug}` : `/product/${prodId}`;
  const imageSrc = (product.images && product.images[0]) || product.image || '/placeholder-material.svg';

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

      {/* Product Image Area with Link to Product Page */}
      <Link to={productUrl} className="card-image-wrap" title={`View ${product.name}`}>
        <Img
          src={imageSrc}
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

        {/* Flagship Material List Selection Button (Accessible) */}
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

      {/* Carousel dots indicator */}
      <div className="card-dots-row">
        <span className="card-dot active" />
        <span className="card-dot" />
        <span className="card-dot" />
      </div>

      {/* Card Info */}
      <div className="card-body">
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
            <span className="card-mrp-price">
              ₹{Number(product.mrp).toLocaleString('en-IN')}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="card-discount-text">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Unit caption */}
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Per <strong>{product.unit || 'unit'}</strong>
        </div>

        {/* Bottom Action: Add or Stepper */}
        <div className="card-action-wrap">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                background: '#F3F4F6',
                color: '#9CA3AF',
                border: '1px solid #E5E7EB',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'not-allowed'
              }}
            >
              Out of Stock
            </button>
          ) : inCartQty === 0 ? (
            product.optionsCount && product.optionsCount > 1 ? (
              <div className="split-select-btn" onClick={() => addToCart(product, 1)}>
                <span className="select-text">
                  SELECT <ChevronDown size={14} />
                </span>
                <span className="options-text">
                  {product.optionsCount} Options
                </span>
              </div>
            ) : (
              <button
                type="button"
                className="buildmart-add-btn"
                onClick={() => addToCart(product, 1)}
              >
                + ADD
              </button>
            )
          ) : (
            <div className="buildmart-stepper-btn">
              <button
                type="button"
                className="stepper-action"
                aria-label="Decrease quantity"
                onClick={() => updateQuantity(prodId, inCartQty - 1)}
              >
                -
              </button>
              <span className="stepper-count">{inCartQty}</span>
              <button
                type="button"
                className="stepper-action"
                aria-label="Increase quantity"
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
});

export default ProductCard;
