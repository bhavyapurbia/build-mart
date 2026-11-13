import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal, Check, RefreshCw } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import SEO from '../components/common/SEO';
import api from '../utils/api';

const ITEMS_PER_PAGE = 24;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [facets, setFacets] = useState({ categories: {}, brands: {}, inStockCount: 0 });
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  // URL query params
  const searchParams = new URLSearchParams(location.search);
  const selectedCategory = searchParams.get('category') || '';
  const selectedSubcategory = searchParams.get('subcategory') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const searchQuery = searchParams.get('search') || '';
  const isDeal = searchParams.get('deal') === 'true';
  const isFeatured = searchParams.get('featured') === 'true';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const sortBy = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const currentPage = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);

  // Local state for price inputs & mobile bottom-sheet filter
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch filter metadata & facets
  useEffect(() => {
    let isMounted = true;
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes, facetRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands'),
          api.get('/products/facets').catch(() => ({ data: {} }))
        ]);

        if (!isMounted) return;
        const rawCats = Array.isArray(catRes.data) ? catRes.data : (Array.isArray(catRes.data?.data) ? catRes.data.data : []);
        const rawBrands = Array.isArray(brandRes.data) ? brandRes.data : (Array.isArray(brandRes.data?.data) ? brandRes.data.data : []);
        setCategories(rawCats);
        setBrands(rawBrands);

        const facetData = facetRes.data?.data || facetRes.data || {};
        if (facetData) {
          setFacets({
            categories: facetData.categories || {},
            brands: facetData.brands || {},
            inStockCount: facetData.inStockCount || 0
          });
        }
      } catch (e) {
        console.error('Error loading metadata:', e);
      }
    };
    fetchMeta();

    return () => { isMounted = false; };
  }, []);

  // Fetch products with AbortController for race-free fetching
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams(location.search);
        if (!params.get('limit')) params.set('limit', String(ITEMS_PER_PAGE));
        if (!params.get('page')) params.set('page', String(currentPage));

        const res = await api.get(`/products?${params.toString()}`, { signal: controller.signal });
        const data = res.data?.data || res.data;
        const list = Array.isArray(data) ? data : (data?.products || []);
        const total = data?.total != null ? data.total : (data?.totalCount || list.length);

        setProducts(list);
        setTotalCount(total);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          console.error('Error fetching products:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, [location.search, currentPage]);

  const updateQuery = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    navigate(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    navigate('/products');
    setLocalMin('');
    setLocalMax('');
    setMobileFilterOpen(false);
  };

  const handlePriceFilterSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (localMin) params.set('minPrice', localMin);
    else params.delete('minPrice');

    if (localMax) params.set('maxPrice', localMax);
    else params.delete('maxPrice');

    params.delete('page');
    navigate(`/products?${params.toString()}`);
    setMobileFilterOpen(false);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  // Active filters list for chips
  const activeFilters = [];
  if (selectedCategory) activeFilters.push({ key: 'category', label: `${selectedCategory}` });
  if (selectedBrand) activeFilters.push({ key: 'brand', label: `Brand: ${selectedBrand}` });
  if (searchQuery) activeFilters.push({ key: 'search', label: `"${searchQuery}"` });
  if (inStockOnly) activeFilters.push({ key: 'inStock', label: 'In Stock' });
  if (minPrice || maxPrice) activeFilters.push({ key: 'price', label: `₹${minPrice || 0} - ₹${maxPrice || '∞'}` });

  return (
    <div className="products-page-container">
      <SEO
        title={selectedCategory ? `${selectedCategory} Supplies | BuildMart` : 'Materials Catalog | BuildMart'}
        description={`Procure genuine ${selectedCategory || 'construction'} materials directly from authorized manufacturers with 30-60 min job-site delivery.`}
      />

      <div className="container">
        {/* Top Header / Breadcrumb Bar */}
        <div className="products-top-bar">
          <div className="catalog-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Materials Catalog</strong>
            {selectedCategory && (
              <>
                <span>/</span>
                <span className="current-cat">{selectedCategory}</span>
              </>
            )}
          </div>

          <div className="catalog-actions-bar">
            {/* Mobile Filter Toggle Pill */}
            <button
              type="button"
              className="mobile-filter-trigger-btn"
              onClick={() => setMobileFilterOpen(true)}
              aria-label="Open Filter Drawer"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <span className="filter-badge-count">{activeFilters.length}</span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="catalog-sort-box">
              <span className="sort-label">Sort:</span>
              <select
                value={sortBy}
                onChange={e => updateQuery('sort', e.target.value)}
                className="sort-select-input"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Bestsellers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile-First Swipeable Horizontal Category Strip (Sticky & Touch Friendly) */}
        <div className="mobile-category-pill-strip">
          <button
            type="button"
            className={`mobile-cat-pill ${!selectedCategory ? 'active' : ''}`}
            onClick={() => updateQuery('category', '')}
          >
            All Materials ({totalCount})
          </button>
          {categories.map(c => {
            const isAct = selectedCategory === c.name;
            return (
              <button
                key={c._id || c.name}
                type="button"
                className={`mobile-cat-pill ${isAct ? 'active' : ''}`}
                onClick={() => updateQuery('category', isAct ? '' : c.name)}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Active Filter Chips Row */}
        {activeFilters.length > 0 && (
          <div className="active-filters-row">
            <span className="active-filter-title">Filtered by:</span>
            {activeFilters.map(f => (
              <span key={f.key} className="active-filter-chip">
                <span>{f.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (f.key === 'price') {
                      const params = new URLSearchParams(location.search);
                      params.delete('minPrice');
                      params.delete('maxPrice');
                      setLocalMin('');
                      setLocalMax('');
                      navigate(`/products?${params.toString()}`);
                    } else {
                      updateQuery(f.key, '');
                    }
                  }}
                  className="chip-remove-btn"
                  aria-label="Remove filter"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="clear-all-link"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Main Grid: Desktop Sidebar on left (hidden on mobile) + Full Products on right */}
        <div className="products-layout-grid">
          {/* Desktop-Only Sidebar */}
          <aside className="products-desktop-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Filter By</h3>
              <button onClick={clearAllFilters} style={{ background: 'none', border: 'none', fontSize: '12px', color: '#FF7800', cursor: 'pointer', fontWeight: 700 }}>
                Reset
              </button>
            </div>

            {/* In-Stock Toggle */}
            <div style={{ paddingBottom: '14px', borderBottom: '1px solid #F1F5F9', marginBottom: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => updateQuery('inStock', e.target.checked ? 'true' : '')}
                  style={{ width: '16px', height: '16px', accentColor: '#FF7800' }}
                />
                <span>In Stock Only {facets.inStockCount > 0 && `(${facets.inStockCount})`}</span>
              </label>
            </div>

            {/* Categories List */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 10px', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.04em' }}>
                Categories
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => updateQuery('category', '')}
                  style={{
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: !selectedCategory ? 800 : 500,
                    color: !selectedCategory ? '#FF7800' : '#1E293B',
                    padding: '4px 0'
                  }}
                >
                  All Categories ({totalCount})
                </button>
                {categories.map(c => {
                  const isAct = selectedCategory === c.name;
                  const count = facets.categories[c.name] || 0;
                  return (
                    <button
                      key={c._id || c.name}
                      type="button"
                      onClick={() => updateQuery('category', isAct ? '' : c.name)}
                      style={{
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: isAct ? 800 : 500,
                        color: isAct ? '#FF7800' : '#475569',
                        padding: '4px 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{c.name}</span>
                      {count > 0 && <span style={{ fontSize: '11px', color: '#94A3B8' }}>({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands List */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 10px', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.04em' }}>
                Authorized Brands
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                {brands.map(b => {
                  const isAct = selectedBrand === b.name;
                  const count = facets.brands[b.name] || 0;
                  return (
                    <button
                      key={b._id || b.name}
                      type="button"
                      onClick={() => updateQuery('brand', isAct ? '' : b.name)}
                      style={{
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: isAct ? 800 : 500,
                        color: isAct ? '#FF7800' : '#475569',
                        padding: '4px 0',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{b.name}</span>
                      {count > 0 && <span style={{ fontSize: '11px', color: '#94A3B8' }}>({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 10px', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.04em' }}>
                Price Range (₹)
              </h4>
              <form onSubmit={handlePriceFilterSubmit} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={localMin}
                  onChange={e => setLocalMin(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localMax}
                  onChange={e => setLocalMax(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
                />
                <button
                  type="submit"
                  style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#0F172A', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Go
                </button>
              </form>
            </div>
          </aside>

          {/* Product Grid Area (Takes 100% width on Mobile, 2-column layout!) */}
          <main className="products-main-content">
            {loading ? (
              <div className="product-grid">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} style={{ height: '260px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ aspectRatio: '1', background: '#E2E8F0', borderRadius: '10px' }} />
                    <div style={{ height: '14px', width: '75%', background: '#E2E8F0', borderRadius: '4px' }} />
                    <div style={{ height: '16px', width: '45%', background: '#E2E8F0', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="product-grid">
                  {products.map(product => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="catalog-pagination-row">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => updateQuery('page', String(currentPage - 1))}
                      className="pagination-btn"
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>

                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => updateQuery('page', String(currentPage + 1))}
                      className="pagination-btn"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-catalog-state">
                <RefreshCw size={44} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <h3>No materials match your filters</h3>
                <p>Try clearing your category or brand filters to see available supplies.</p>
                <button type="button" onClick={clearAllFilters} className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE BOTTOM-SHEET FILTER DRAWER */}
      {mobileFilterOpen && (
        <div className="mobile-filter-overlay" onClick={() => setMobileFilterOpen(false)}>
          <div className="mobile-filter-sheet" onClick={e => e.stopPropagation()}>
            {/* Sheet Header */}
            <div className="mobile-filter-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={18} color="#FF7800" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Filters</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sheet Body (Scrollable) */}
            <div className="mobile-filter-body">
              {/* In-Stock Toggle */}
              <div style={{ paddingBottom: '14px', borderBottom: '1px solid #E2E8F0', marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '13.5px', fontWeight: 700 }}>
                  <span>In-Stock Supplies Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={e => updateQuery('inStock', e.target.checked ? 'true' : '')}
                    style={{ width: '18px', height: '18px', accentColor: '#FF7800' }}
                  />
                </label>
              </div>

              {/* Categories */}
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 10px', textTransform: 'uppercase', color: '#64748B' }}>
                  Select Category
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { updateQuery('category', ''); setMobileFilterOpen(false); }}
                    className={`mobile-sheet-item ${!selectedCategory ? 'active' : ''}`}
                  >
                    <span>All Categories</span>
                    {!selectedCategory && <Check size={16} color="#FF7800" />}
                  </button>
                  {categories.map(c => {
                    const isAct = selectedCategory === c.name;
                    return (
                      <button
                        key={c._id || c.name}
                        type="button"
                        onClick={() => { updateQuery('category', isAct ? '' : c.name); setMobileFilterOpen(false); }}
                        className={`mobile-sheet-item ${isAct ? 'active' : ''}`}
                      >
                        <span>{c.name}</span>
                        {isAct && <Check size={16} color="#FF7800" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brands */}
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 10px', textTransform: 'uppercase', color: '#64748B' }}>
                  Select Brand
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {brands.map(b => {
                    const isAct = selectedBrand === b.name;
                    return (
                      <button
                        key={b._id || b.name}
                        type="button"
                        onClick={() => { updateQuery('brand', isAct ? '' : b.name); setMobileFilterOpen(false); }}
                        className={`mobile-sheet-item ${isAct ? 'active' : ''}`}
                      >
                        <span>{b.name}</span>
                        {isAct && <Check size={16} color="#FF7800" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 10px', textTransform: 'uppercase', color: '#64748B' }}>
                  Price Range (₹)
                </h4>
                <form onSubmit={handlePriceFilterSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={localMin}
                    onChange={e => setLocalMin(e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={localMax}
                    onChange={e => setLocalMax(e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 700 }}
                  >
                    Apply
                  </button>
                </form>
              </div>
            </div>

            {/* Sheet Footer */}
            <div className="mobile-filter-footer">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 800 }}
              >
                Show {totalCount} Materials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
