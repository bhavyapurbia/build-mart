import React, { useState, useEffect } from 'react';
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
  Star
} from 'lucide-react';
import { useMaterialList } from '../context/MaterialListContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/product/ProductCard';
import api from '../utils/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const { toggleMaterialItem, isMaterialSelected } = useMaterialList();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        setQty(res.data.minOrderQty || 1);

        // Fetch related products in same category
        if (res.data.category) {
          const relRes = await api.get(`/products?category=${encodeURIComponent(res.data.category)}&limit=4`);
          setRelated((relRes.data.products || []).filter(p => p._id !== id));
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '100px 0', textAlign: 'center', color: '#64748B' }}>
        <p>Loading construction material specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <Link to="/products" className="btn-primary" style={{ marginTop: '16px' }}>
          Back to Materials Catalog
        </Link>
      </div>
    );
  }

  const isSelectedInList = isMaterialSelected(product._id);
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80'];

  const whatsappText = encodeURIComponent(`Hello BuildMart, I would like to enquire about ${product.name} (SKU: ${product.sku}) listed at ₹${product.price} / ${product.unit}.`);

  return (
    <div style={{ padding: '28px 0 60px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
          <Link to="/">Home</Link> / <Link to="/products">Materials</Link> /{' '}
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> /{' '}
          <strong style={{ color: '#0F172A' }}>{product.name}</strong>
        </div>

        {/* Product Hero Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 480px) 1fr',
          gap: '40px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '32px',
          marginBottom: '40px'
        }}>
          {/* Images Section */}
          <div>
            <div
              style={{
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#F8FAFC',
                border: isSelectedInList ? '3px solid #F59E0B' : '1px solid #E2E8F0',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => toggleMaterialItem(product)}
              title="Click image to toggle in Material List"
            >
              <img
                src={images[activeImageIdx]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Click to add prompt overlay */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: isSelectedInList ? '#F59E0B' : '#FFFFFF',
                color: isSelectedInList ? '#000000' : '#0F172A',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: activeImageIdx === idx ? '2px solid #D97706' : '1px solid #E2E8F0',
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
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {product.brand}
              </span>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                SKU: {product.sku}
              </span>
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '8px 0 12px', lineHeight: 1.3 }}>
              {product.name}
            </h1>

            {/* Rating & In-stock badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', padding: '3px 8px', borderRadius: '4px' }}>
                <Star size={14} fill="#D97706" color="#D97706" />
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#B45309' }}>
                  {product.rating || 4.5}
                </span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  ({product.reviewsCount || 15} verified reviews)
                </span>
              </div>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: product.stock > 0 ? '#10B981' : '#EF4444'
              }}>
                <ShieldCheck size={16} />
                <span>{product.stock > 0 ? `In Stock (${product.stock} ${product.unit}s available)` : 'Out of Stock'}</span>
              </span>
            </div>

            {/* Price Box */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '16px 20px',
              border: '1px solid #E2E8F0',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A' }}>
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                {product.mrp > product.price && (
                  <span style={{ fontSize: '16px', color: '#94A3B8', textDecoration: 'line-through' }}>
                    ₹{Number(product.mrp).toLocaleString('en-IN')}
                  </span>
                )}
                {product.discount > 0 && (
                  <span style={{
                    background: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {product.discount}% SAVINGS
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                Per <strong>{product.unit}</strong> | Inclusive of 18% GST with factory input tax credit invoice
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Quantity ({product.unit}):</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  style={{ padding: '8px 12px', background: '#F8FAFC', cursor: 'pointer' }}
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  value={qty}
                  min={1}
                  onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '50px', textAlign: 'center', border: 'none', fontWeight: 700, fontSize: '14px' }}
                />
                <button
                  onClick={() => setQty(prev => prev + 1)}
                  style={{ padding: '8px 12px', background: '#F8FAFC', cursor: 'pointer' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTA Dual Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
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
                className="btn-primary"
                onClick={() => addToCart(product, qty)}
                style={{ justifyContent: 'center', padding: '14px', borderRadius: '10px', fontSize: '14px' }}
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Quick Delivery Notice & WhatsApp */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={16} color="#D97706" />
                <span>30-60 Min Express Delivery to Bengaluru job sites. Free freight above ₹5,000.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#10B981" />
                <span>Original manufacturer test report certificate provided upon dispatch.</span>
              </div>
              <div style={{ marginTop: '8px' }}>
                <a
                  href={`https://wa.me/919876543210?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#16A34A',
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
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '32px',
          marginBottom: '40px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
            Product Overview & Application
          </h3>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#475569', marginBottom: '24px' }}>
            {product.description || 'Quality certified construction material suitable for residential, commercial and infrastructure building projects.'}
          </p>

          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
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
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px'
                    }}
                  >
                    <span style={{ color: '#64748B', fontWeight: 500 }}>{spec.key}</span>
                    <strong style={{ color: '#0F172A' }}>{spec.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '18px' }}>
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

