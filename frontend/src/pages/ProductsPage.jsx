import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Filter, X, SlidersHorizontal, ChevronDown, Sparkles, ClipboardList, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      controller.abort();
    };
  }, [location.search, currentPage]);

  // Update query params helper
  const updateQuery = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to page 1 on filter change
    navigate(`/products?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(location.search);
    params.set('page', String(newPage));
    navigate(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    navigate('/products');
    setLocalMin('');
    setLocalMax('');
    setMobileFilterOpen(false);
  };

  const handlePriceApply = (e) => {
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
  if (selectedCategory) activeFilters.push({ key: 'category', label: `Category: ${selectedCategory}` });
  if (selectedBrand) activeFilters.push({ key: 'brand', label: `Brand: ${selectedBrand}` });
  if (searchQuery) activeFilters.push({ key: 'search', label: `Search: "${searchQuery}"` });
  if (inStockOnly) activeFilters.push({ key: 'inStock', label: 'In Stock Only' });
  if (minPrice || maxPrice) activeFilters.push({ key: 'price', label: `Price: ₹${minPrice || 0} - ₹${maxPrice || '∞'}` });

  return (
    <div style={{ padding: '24px 0 60px' }}>
      <SEO
        title={selectedCategory ? `${selectedCategory} Supplies` : 'Construction & Building Materials'}
        description={`Procure genuine ${selectedCategory || 'construction'} materials directly from authorized manufacturers with 30-60 min job-site delivery.`}
      />

      <div className="container">
        {/* Breadcrumb & Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
            <Link to="/">Home</Link> / <strong style={{ color: 'var(--color-ink)' }}>Materials Catalog</strong>
            {selectedCategory && <> / <span>{selectedCategory}</span></>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              className="btn btn-secondary mobile-filter-btn"
              onClick={() => setMobileFilterOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontSize: '13px' }}
            >
              <Filter size={15} /> Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
            </button>

            {/* Sort Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={e => updateQuery('sort', e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-light, #D1D5DB)', fontSize: '13px', background: 'var(--bg-card)' }}
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

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Active Filters:</span>
            {activeFilters.map(f => (
              <span
                key={f.key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 10px',
                  background: 'var(--bg-accent-subtle, #EFF6FF)',
                  border: '1px solid var(--border-accent, #BFDBFE)',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--primary, #0284C7)'
                }}
              >
                {f.label}
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
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  <X size={12} color="var(--primary, #0284C7)" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main Layout: Sidebar Filters + Products Grid */}
        <div className="products-layout-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px', alignItems: 'start' }}>
          {/* Desktop Sidebar Filters */}
          <aside className="products-sidebar" style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Filter By</h3>
              <button onClick={clearAllFilters} style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--primary, #0284C7)', cursor: 'pointer', fontWeight: 600 }}>
                Reset
              </button>
            </div>

            {/* In-Stock Toggle */}
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-light, #F3F4F6)', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => updateQuery('inStock', e.target.checked ? 'true' : '')}
                />
                <span>In Stock Only {facets.inStockCount > 0 && `(${facets.inStockCount})`}</span>
              </label>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Categories
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => updateQuery('category', '')}
                  style={{
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: !selectedCategory ? 700 : 500,
                    color: !selectedCategory ? 'var(--primary, #0284C7)' : 'var(--text-primary)',
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
                      key={c._id}
                      type="button"
                      onClick={() => updateQuery('category', isAct ? '' : c.name)}
                      style={{
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: isAct ? 700 : 500,
                        color: isAct ? 'var(--primary, #0284C7)' : 'var(--text-secondary)',
                        padding: '4px 0',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{c.name}</span>
                      {count > 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Authorized Brands
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {brands.map(b => {
                  const isAct = selectedBrand === b.name;
                  const count = facets.brands[b.name] || 0;
                  return (
                    <button
                      key={b._id}
                      type="button"
                      onClick={() => updateQuery('brand', isAct ? '' : b.name)}
                      style={{
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: isAct ? 700 : 500,
                        color: isAct ? 'var(--primary, #0284C7)' : 'var(--text-secondary)',
                        padding: '4px 0',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{b.name}</span>
                      {count > 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Price Range (₹)
              </h4>
              <form onSubmit={handlePriceApply} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={localMin}
                  onChange={e => setLocalMin(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localMax}
                  onChange={e => setLocalMax(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                />
                <button
                  type="submit"
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}
                >
                  Go
                </button>
              </form>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="products-main-content">
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} style={{ height: '320px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ aspectRatio: '1', background: '#E5E7EB', borderRadius: '8px' }} />
                    <div style={{ height: '14px', width: '70%', background: '#E5E7EB', borderRadius: '4px' }} />
                    <div style={{ height: '18px', width: '40%', background: '#E5E7EB', borderRadius: '4px' }} />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px' }}>
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        background: currentPage <= 1 ? '#F3F4F6' : '#FFFFFF',
                        color: currentPage <= 1 ? '#9CA3AF' : '#1F2937',
                        cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px'
                      }}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>

                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 12px' }}>
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        background: currentPage >= totalPages ? '#F3F4F6' : '#FFFFFF',
                        color: currentPage >= totalPages ? '#9CA3AF' : '#1F2937',
                        cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px'
                      }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: 'var(--bg-card)', padding: '60px 20px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <ClipboardList size={48} color="var(--text-light)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>No materials match your filter</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 20px' }}>
                  Try removing filter criteria or search for materials like Cement, Rebar, or Tiles.
                </p>
                <button type="button" onClick={clearAllFilters} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }}>
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
