import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Check,
  Plus,
  Minus,
  ShoppingCart,
  ClipboardList,
  ShieldCheck,
  Clock,
  Truck,
  MessageSquare,
  Share2,
  Star,
  Heart,
  MapPin,
  Send,
  AlertCircle,
  ThumbsUp
} from 'lucide-react';
import { useMaterialList } from '../context/MaterialListContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getAccurateProductImage } from '../components/product/ProductCard';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/product/ProductCard';
import SEO from '../components/common/SEO';
import Img from '../components/common/Img';
import api from '../utils/api';

const ProductDetailPage = () => {
  const { id, slug } = useParams();
  const productIdentifier = slug || id;
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    histogram: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Serviceability state
  const [pincode, setPincode] = useState('');
  const [serviceInfo, setServiceInfo] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  const { toggleMaterialItem, isMaterialSelected } = useMaterialList();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useNotification();
  const { settings } = useSettings();

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${productIdentifier}`);
      const prod = res.data?.data || res.data;
      setProduct(prod);
      setQty(prod.minOrderQty || 1);

      // Fetch related products in same category
      if (prod.category) {
        const relRes = await api.get(`/products?category=${encodeURIComponent(prod.category)}&limit=4`);
        const relList = Array.isArray(relRes.data) ? relRes.data : (relRes.data?.products || relRes.data?.data || []);
        setRelated(relList.filter(p => (p._id || p.id) !== (prod._id || prod.id)));
      }
    } catch (err) {
      console.error('Error loading product details:', err);
    } finally {
      setLoading(false);
    }
  }, [productIdentifier]);

  const fetchReviews = useCallback(async (prodId) => {
    setReviewsLoading(true);
    try {
      const res = await api.get(`/reviews/product/${prodId}`);
      const payload = res.data?.data || res.data;
      if (payload) {
        setReviews(payload.reviews || []);
        setReviewSummary(payload.summary || {
          averageRating: 0,
          totalReviews: 0,
          histogram: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        });
      }
    } catch (err) {
      // Quiet fail
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [fetchProduct]);

  useEffect(() => {
    if (product?._id) {
      fetchReviews(product._id);
    }
  }, [product?._id, fetchReviews]);

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length !== 6) {
      showToast('Please enter a valid 6-digit Indian PIN code', 'error');
      return;
    }

    setCheckingPincode(true);
    try {
      const res = await api.get(`/serviceability?pincode=${pincode.trim()}`);
      const info = res.data?.data || res.data;
      setServiceInfo(info);
    } catch (err) {
      setServiceInfo({ serviceable: false });
    } finally {
      setCheckingPincode(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on BuildMart - express direct site procurement.`,
          url
        });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast('Product link copied to clipboard!', 'success');
      } catch (e) {
        showToast('Unable to copy link', 'error');
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to write a review.', 'error');
      return;
    }
    if (!newReview.title || !newReview.comment) {
      showToast('Please provide both a title and comment.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        productId: product._id,
        rating: newReview.rating,
        title: newReview.title.trim(),
        comment: newReview.comment.trim()
      });
      showToast('Thank you! Your verified review has been submitted.', 'success');
      setShowReviewForm(false);
      setNewReview({ rating: 5, title: '', comment: '' });
      fetchReviews(product._id);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review. Only customers with a delivered order for this product can write a review.';
      showToast(msg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center', color: 'var(--color-muted)' }}>
        <p>Loading construction material specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>
          Back to Materials Catalog
        </Link>
      </div>
    );
  }

  const prodId = String(product._id || product.id);
  const isSelectedInList = isMaterialSelected(prodId);
  const inWishlist = isInWishlist(prodId);
  const rawImages = (product.images && product.images.length > 0)
    ? product.images
    : [product.image || '/placeholder-material.svg'];
  const images = rawImages.map(img => getAccurateProductImage(product, img));

  const whatsappText = encodeURIComponent(`Hello BuildMart, I would like to enquire about ${product.name} (SKU: ${product.sku}) listed at ₹${product.price} / ${product.unit}.`);

  const productJsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: images,
    description: product.description || 'Quality certified construction material with batch test certificates.',
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition'
    },
    ...(reviewSummary.totalReviews > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: reviewSummary.averageRating,
        reviewCount: reviewSummary.totalReviews
      }
    } : {})
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://buildmart.in/' },
      { '@type': 'ListItem', position: 2, name: product.category, item: `https://buildmart.in/products?category=${encodeURIComponent(product.category)}` },
      { '@type': 'ListItem', position: 3, name: product.name, item: window.location.href }
    ]
  };

  return (
    <div style={{ padding: '28px 0 60px' }}>
      <SEO
        title={`${product.name} - Buy Online`}
        description={product.description?.slice(0, 160) || `Buy genuine ${product.name} (${product.brand}) online at BuildMart. 30-60 min express site delivery.`}
        image={images[0]}
        type="product"
        jsonLd={[productJsonLd, breadcrumbJsonLd]}
      />
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '20px' }}>
          <Link to="/">Home</Link> / <Link to="/products">Materials</Link> /{' '}
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> /{' '}
          <strong style={{ color: 'var(--color-ink)' }}>{product.name}</strong>
        </div>

        {/* Product Hero Grid */}
        <div className="product-detail-hero-grid" style={{
          display: 'grid',
          gap: 'var(--space-xl)',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: 'var(--space-lg)',
          marginBottom: '40px'
        }}>
          {/* Images Section */}
          <div>
            <div
              style={{
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'var(--bg-page)',
                border: isSelectedInList ? '3px solid var(--color-accent)' : '1px solid var(--border)',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => toggleMaterialItem(product)}
              title="Click image to toggle in Material List"
            >
              <Img
                src={images[activeImageIdx]}
                alt={product.name}
                priority={true}
                aspectRatio="1"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Click to add prompt overlay */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: isSelectedInList ? 'var(--color-accent)' : 'var(--bg-card)',
                color: 'var(--color-ink)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {isSelectedInList ? <Check size={16} strokeWidth={3} /> : <Plus size={16} />}
                <span>{isSelectedInList ? 'Selected in Material List' : 'Click to Add to List'}</span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: activeImageIdx === idx ? '2px solid var(--primary-dark)' : '1px solid var(--border)',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {product.brand}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-light, #E5E7EB)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Heart size={16} color={inWishlist ? '#EF4444' : '#6B7280'} fill={inWishlist ? '#EF4444' : 'none'} />
                </button>
                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  title="Share Product"
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-light, #E5E7EB)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Share2 size={16} color="#6B7280" />
                </button>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  SKU: {product.sku}
                </span>
              </div>
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-ink)', margin: '8px 0 12px', lineHeight: 1.3 }}>
              {product.name}
            </h1>

            {/* Rating & In-stock badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {reviewSummary.totalReviews > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', padding: '3px 8px', borderRadius: '4px' }}>
                  <Star size={14} fill='#B45309' color='#B45309' />
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#B45309' }}>
                    {reviewSummary.averageRating}
                  </span>
                  <span style={{ fontSize: '12px', color: '#78350F' }}>
                    ({reviewSummary.totalReviews} verified {reviewSummary.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>No reviews yet</span>
              )}

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: product.stock > 0 ? 'var(--color-success)' : 'var(--color-error)'
              }}>
                <ShieldCheck size={16} />
                <span>{product.stock > 0 ? `In Stock (${product.stock} ${product.unit}s available)` : 'Out of Stock'}</span>
              </span>
            </div>

            {/* Price Box */}
            <div style={{
              background: 'var(--bg-page)',
              borderRadius: '12px',
              padding: '16px 20px',
              border: '1px solid var(--border)',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-ink)' }}>
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                {product.mrp > product.price && (
                  <span style={{ fontSize: '16px', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                    ₹{Number(product.mrp).toLocaleString('en-IN')}
                  </span>
                )}
                {product.discount > 0 && (
                  <span style={{
                    background: 'var(--color-success)',
                    color: 'var(--bg-card)',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {product.discount}% SAVINGS
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px' }}>
                Per <strong>{product.unit}</strong> | Inclusive of 18% GST with factory input tax credit invoice
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>Quantity ({product.unit}):</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-rule)', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  style={{ padding: '8px 12px', background: 'var(--bg-page)', cursor: 'pointer', border: 'none' }}
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={e => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={{ width: '50px', textAlign: 'center', border: 'none', fontWeight: 700, fontSize: '14px' }}
                />
                <button
                  type="button"
                  onClick={() => setQty(prev => prev + 1)}
                  style={{ padding: '8px 12px', background: 'var(--bg-page)', cursor: 'pointer', border: 'none' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTA Dual Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              {/* Add to Material List Toggle */}
              <button
                type="button"
                className={`btn-material-toggle ${isSelectedInList ? 'active' : ''}`}
                onClick={() => toggleMaterialItem(product)}
                style={{ padding: '14px', fontSize: '14px', borderRadius: '10px' }}
              >
                {isSelectedInList ? (
                  <>
                    <Check size={18} strokeWidth={3} />
                    <span>In Your Material List</span>
                  </>
                ) : (
                  <>
                    <ClipboardList size={18} />
                    <span>Add to Material List</span>
                  </>
                )}
              </button>

              {/* Add to Cart */}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => addToCart(product, qty)}
                style={{ justifyContent: 'center', padding: '14px', borderRadius: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Delivery Serviceability Pincode Checker */}
            <div style={{ padding: '14px', background: 'var(--bg-subtle, #F9FAFB)', borderRadius: '10px', border: '1px solid var(--border-light, #E5E7EB)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                <MapPin size={15} color="var(--primary, #0284C7)" />
                <span>Check Job-Site Delivery ETA & Rates</span>
              </div>
              <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light, #D1D5DB)',
                    fontSize: '13px'
                  }}
                />
                <button
                  type="submit"
                  disabled={checkingPincode}
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
                >
                  {checkingPincode ? 'Checking...' : 'Check'}
                </button>
              </form>

              {serviceInfo && (
                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                  {serviceInfo.serviceable ? (
                    <div style={{ color: 'var(--color-success, #16A34A)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={14} />
                      <span>
                        Express delivery serviceable in <strong>{serviceInfo.city}</strong> ({serviceInfo.etaLabel || '30-60 mins'}). Free delivery above ₹{serviceInfo.freeDeliveryThreshold || settings?.freeDeliveryThreshold || 5000}.
                      </span>
                    </div>
                  ) : (
                    <div style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={14} />
                      <span>
                        Not regularly serviceable for 30-min express. WhatsApp us for heavy truck load dispatch directly from the stockyard.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Delivery Notice & WhatsApp */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-sub)', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} color='var(--primary-dark)' />
                <span>Express Delivery available across all serviceable zones. Free freight above ₹{settings?.freeDeliveryThreshold || 5000}.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color='var(--color-success)' />
                <span>Original manufacturer test report certificate provided upon dispatch.</span>
              </div>
              <div style={{ marginTop: '8px' }}>
                <a
                  href={`https://wa.me/${(settings?.whatsappNumber || '919876543210').replace(/\+/g, '')}?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-success)',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                >
                  <MessageSquare size={15} />
                  <span>Ask a Materials Engineer on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications & Description */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '32px',
          marginBottom: '40px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '14px' }}>
            Product Overview & Application
          </h3>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-sub)', marginBottom: '24px' }}>
            {product.description || 'Quality certified construction material suitable for residential, commercial and infrastructure building projects.'}
          </p>

          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '12px' }}>
                Technical Specifications & Compliance
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {product.specifications.map((spec, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-page)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '13px'
                    }}
                  >
                    <span style={{ color: 'var(--color-muted)', fontWeight: 500 }}>{spec.key}</span>
                    <strong style={{ color: 'var(--color-ink)' }}>{spec.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Customer Reviews & Ratings Section */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '32px',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
                Customer Ratings & Verified Site Reviews
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Only verified purchasers who received deliveries of this SKU can post reviews.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn btn-secondary"
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
            >
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </button>
          </div>

          {/* Write Review Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} style={{ padding: '20px', background: 'var(--bg-subtle, #F9FAFB)', borderRadius: '12px', border: '1px solid var(--border-light, #E5E7EB)', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Share Your Experience with {product.name}</h4>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Rating *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    >
                      <Star size={24} fill={star <= newReview.rating ? '#F59E0B' : 'none'} color={star <= newReview.rating ? '#F59E0B' : '#D1D5DB'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Review Headline *</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent compressive strength, original batch"
                  value={newReview.title}
                  onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Detailed Feedback *</label>
                <textarea
                  rows={3}
                  placeholder="Describe material performance at your job site, packaging condition, setting time, etc..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          )}

          {/* Histogram & Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'center', marginBottom: '28px' }}>
            {/* Overall Score */}
            <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-subtle, #F9FAFB)', borderRadius: '12px' }}>
              <div style={{ fontSize: '42px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                {reviewSummary.averageRating}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '8px 0' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={18} fill={s <= Math.round(reviewSummary.averageRating) ? '#F59E0B' : '#E5E7EB'} color={s <= Math.round(reviewSummary.averageRating) ? '#F59E0B' : '#D1D5DB'} />
                ))}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Based on {reviewSummary.totalReviews} verified reviews
              </div>
            </div>

            {/* Histogram Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = reviewSummary.histogram?.[stars] || 0;
                const pct = reviewSummary.totalReviews > 0 ? Math.round((count / reviewSummary.totalReviews) * 100) : 0;
                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{ width: '40px', color: 'var(--text-secondary)' }}>{stars} ★</span>
                    <div style={{ flex: 1, height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#F59E0B', borderRadius: '4px' }} />
                    </div>
                    <span style={{ width: '32px', textAlign: 'right', color: 'var(--text-muted)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          {reviewsLoading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading verified reviews...</p>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>
              No reviews for this material yet. Be the first verified contractor to share feedback!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map(rev => (
                <div key={rev._id} style={{ padding: '16px', background: 'var(--bg-subtle, #F9FAFB)', borderRadius: '10px', border: '1px solid var(--border-light, #E5E7EB)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                        {rev.userName || rev.user?.name || 'Verified Purchaser'}
                      </span>
                      {rev.isVerifiedPurchase && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--color-success, #16A34A)', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          <Check size={11} strokeWidth={3} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} fill={s <= rev.rating ? '#F59E0B' : '#E5E7EB'} color={s <= rev.rating ? '#F59E0B' : '#D1D5DB'} />
                    ))}
                  </div>
                  <h5 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {rev.title}
                  </h5>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-ink)', marginBottom: '18px' }}>
              Related {product.category} Materials
            </h3>
            <div className="product-grid">
              {related.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
