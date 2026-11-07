import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Check, Plus, ClipboardList, ChevronDown } from 'lucide-react';
import { useMaterialList } from '../../context/MaterialListContext';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { toggleMaterialItem, isMaterialSelected } = useMaterialList();
  const { addToCart, cartItems, updateQuantity } = useCart();

  const isSelected = isMaterialSelected(product._id || product.id);
  const imageSrc = (product.images && product.images[0]) || product.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=400&q=80';

  // Check if item is already in cart
  const prodId = product._id || product.id;
  const cartItem = cartItems.find(item => (item.productId || item._id || item.product?._id || item.product?.id) === prodId);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMaterialItem(product);
  };

  const discountPercent = product.discount || (product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0);

  return (
    <div className={`buildmart-product-card ${isSelected ? 'in-material-list' : ''}`}>
      {/* Top Badges Row */}
      <div className="card-top-badges">
        {discountPercent > 0 ? (
          <span className="buildmart-discount-badge">
            {discountPercent}% OFF
          </span>
        ) : <span />}

        <span className="buildmart-mins-badge">
          <Zap size={11} fill='var(--bg-card)' />
          <span>30 MINS</span>
        </span>
      </div>

      {/* Product Image Area with Click to Material List */}
      <div
        className="card-image-wrap"
        onClick={handleImageClick}
        title="Tap image to add/remove from Material List"
      >
        <img
          src={imageSrc}
          alt={product.name}
          className="card-main-img"
          loading="lazy"
        />

        {/* Flagship Material List Selection Badge */}
        <div
          className={`material-list-bubble ${isSelected ? 'active' : ''}`}
          title={isSelected ? 'Selected in Material List' : 'Add to Material List'}
        >
          {isSelected ? (
            <Check size={14} strokeWidth={3} />
          ) : (
            <ClipboardList size={13} strokeWidth={2} />
          )}
        </div>

        {/* Interactive mini hint on image */}
        {isSelected && (
          <div className="in-list-ribbon">
            ✓ IN MATERIAL LIST
          </div>
        )}
      </div>

      {/* Carousel dots indicator (BuildMart signature) */}
      <div className="card-dots-row">
        <span className="card-dot active" />
        <span className="card-dot" />
        <span className="card-dot" />
      </div>

      {/* Card Info */}
      <div className="card-body">
        <Link
          to={`/product/${product._id || product.id}`}
          className="card-product-title"
          title={product.name}
        >
          {product.name}
        </Link>

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

        {/* Bottom Action: BuildMart Orange Outlined + ADD Button / Split SELECT */}
        <div className="card-action-wrap">
          {inCartQty === 0 ? (
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
                onClick={() => updateQuantity(product._id || product.id, inCartQty - 1)}
              >
                -
              </button>
              <span className="stepper-count">{inCartQty}</span>
              <button
                type="button"
                className="stepper-action"
                onClick={() => updateQuantity(product._id || product.id, inCartQty + 1)}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
