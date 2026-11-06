import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, X, SlidersHorizontal, ChevronDown, Sparkles, ClipboardList, Check } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import api from '../utils/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
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
  const sortBy = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Local state for price inputs & mobile bottom-sheet filter
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch filter metadata
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands')
        ]);
        const rawCats = Array.isArray(catRes.data) ? catRes.data : (Array.isArray(catRes.data?.data) ? catRes.data.data : []);
        const rawBrands = Array.isArray(brandRes.data) ? brandRes.data : (Array.isArray(brandRes.data?.data) ? brandRes.data.data : []);
        setCategories(rawCats);
        setBrands(rawBrands);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMeta();
  }, []);

  // Fetch products whenever params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.products || []);
        setTotalCount(res.data.total || 0);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]);

  // Update query params helper
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

  const handlePriceApply = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (localMin) params.set('minPrice', localMin);
    else params.delete('minPrice');

    if (localMax) params.set('maxPrice', localMax);
    else params.delete('maxPrice');

    navigate(`/products?${params.toString()}`);
    setMobileFilterOpen(false);
  };

  // Find subcategories for active category
  const activeCatObj = categories.find(c => c.name === selectedCategory);

  const activeFiltersCount = [
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    minPrice,
    maxPrice
  ].filter(Boolean).length;

  return (
    <div className="products-page-container">
      <div className="container">
        {/* Header Breadcrumb & Notice */}
        <div className="products-page-header">
          <div className="breadcrumb-row">
            <span>Home</span> / <span>Products</span>
            {selectedCategory && <span> / <strong>{selectedCategory}</strong></span>}
            {selectedSubcategory && <span> / {selectedSubcategory}</span>}
            {selectedBrand && <span> / <strong>Brand: {selectedBrand}</strong></span>}
          </div>

          <div className="products-title-row">
            <div>
              <h1 className="products-main-heading">
                {searchQuery ? `Results for "${searchQuery}"` : selectedBrand ? `Products by ${selectedBrand}` : selectedCategory || 'All Construction Materials'}
              </h1>
              <p className="products-count-sub">
                ⚡ {totalCount} authentic {selectedBrand ? `${selectedBrand} ` : ''}materials available for 30-45 min site dispatch
              </p>
            </div>

            {/* Sort & Mobile Filter Toggle */}
            <div className="products-controls-row">
              <button
                className="mobile-filter-trigger-btn"
                onClick={() => setMobileFilterOpen(true)}
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="filter-count-badge">{activeFiltersCount}</span>
                )}
              </button>

              <div className="sort-select-wrapper">
                <span className="sort-label">Sort:</span>
                <select
                  value={sortBy}
                  onChange={e => updateQuery('sort', e.target.value)}
                  className="sort-dropdown"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Category Chips for Mobile/Desktop Horizontal Scroll */}
        <div className="category-chips-scroller">
          <button
            className={`category-chip ${!selectedCategory ? 'active' : ''}`}
            onClick={() => {
              updateQuery('category', '');
              updateQuery('subcategory', '');
            }}
          >
            All Materials
          </button>
          {categories.map(c => (
            <button
              key={c._id || c.slug}
              className={`category-chip ${selectedCategory === c.name ? 'active' : ''}`}
              onClick={() => {
                updateQuery('category', selectedCategory === c.name ? '' : c.name);
                updateQuery('subcategory', '');
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Contractor Tip Banner: Material List Prompt */}
        <div className="material-list-tip-banner">
          <div className="tip-content">
            <ClipboardList size={18} color="#D97706" />
            <span>
              <strong>Contractor Tip:</strong> Tap any product image or <strong>+ List</strong> to build an instant material checklist for formal factory quotation!
            </span>
          </div>
        </div>

        {/* Layout with Sidebar & Products Grid */}
        <div className="products-layout-grid">
          {/* Desktop Filter Sidebar */}
          <aside className="products-desktop-sidebar">
            <div className="sidebar-header">
              <div className="sidebar-title">
                <Filter size={16} color="#D97706" />
                <span>Refine Materials</span>
              </div>
              {activeFiltersCount > 0 && (
                <button onClick={clearAllFilters} className="sidebar-reset-btn">
                  Reset All
                </button>
              )}
            </div>

            {/* Categories Filter (All 8, No Electrical) */}
            <div className="sidebar-section">
              <span className="sidebar-section-title">Categories</span>
              <div className="sidebar-filter-list">
                <button
                  type="button"
                  onClick={() => updateQuery('category', '')}
                  className={`sidebar-filter-item ${!selectedCategory ? 'active' : ''}`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map(cat => {
                  const isCatSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat._id || cat.slug}
                      type="button"
                      onClick={() => {
                        updateQuery('category', isCatSelected ? '' : cat.name);
                        updateQuery('subcategory', '');
                      }}
                      className={`sidebar-filter-item ${isCatSelected ? 'active' : ''}`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcategories */}
            {activeCatObj && activeCatObj.subcategories && activeCatObj.subcategories.length > 0 && (
              <div className="sidebar-section">
                <span className="sidebar-section-title">Subcategory</span>
                <div className="sidebar-filter-list">
                  {activeCatObj.subcategories.map((sub, idx) => {
                    const isSubSelected = selectedSubcategory === sub.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateQuery('subcategory', isSubSelected ? '' : sub.name)}
                        className={`sidebar-filter-subitem ${isSubSelected ? 'active' : ''}`}
                      >
                        {isSubSelected ? '✓ ' : ''}{sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Brands Filter */}
            <div className="sidebar-section">
              <span className="sidebar-section-title">Top Certified Brands</span>
              <div className="sidebar-filter-scroll">
                {brands.map(b => {
                  const isBrandSelected = selectedBrand === b.name;
                  return (
                    <button
                      key={b._id || b.name}
                      type="button"
                      onClick={() => updateQuery('brand', isBrandSelected ? '' : b.name)}
                      className={`sidebar-filter-item ${isBrandSelected ? 'active' : ''}`}
                    >
                      <span>{b.name}</span>
                      {isBrandSelected && <Check size={13} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="sidebar-section price-section">
              <span className="sidebar-section-title">Price Range (₹)</span>
              <form onSubmit={handlePriceApply} className="price-filter-form">
                <input
                  type="number"
                  placeholder="Min"
                  value={localMin}
                  onChange={e => setLocalMin(e.target.value)}
                  className="price-input"
                />
                <span className="price-sep">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localMax}
                  onChange={e => setLocalMax(e.target.value)}
                  className="price-input"
                />
                <button type="submit" className="price-apply-btn">
                  Go
                </button>
              </form>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="products-main-content">
            {loading ? (
              <div className="products-loading-state">
                <div className="loading-spinner" />
                <p>Loading construction supplies...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="product-grid">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="products-empty-state">
                <ClipboardList size={48} color="#94A3B8" />
                <h3>No materials match your filter</h3>
                <p>Try removing filter criteria or search for materials like Cement, Rebar, or Tiles.</p>
                <button onClick={clearAllFilters} className="btn-primary">
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Slide-Up Filter Modal (Bottom Sheet) */}
      {mobileFilterOpen && (
        <div className="mobile-filter-modal-overlay" onClick={() => setMobileFilterOpen(false)}>
          <div className="mobile-filter-sheet" onClick={e => e.stopPropagation()}>
            <div className="filter-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={18} color="#D97706" />
                <h3>Filter Materials</h3>
              </div>
              <button className="sheet-close-btn" onClick={() => setMobileFilterOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="filter-sheet-body">
              {/* Categories */}
              <div className="sheet-group">
                <h4>Category</h4>
                <div className="sheet-chips-wrap">
                  <button
                    className={`sheet-chip ${!selectedCategory ? 'active' : ''}`}
                    onClick={() => updateQuery('category', '')}
                  >
                    All
                  </button>
                  {categories.map(c => (
                    <button
                      key={c._id}
                      className={`sheet-chip ${selectedCategory === c.name ? 'active' : ''}`}
                      onClick={() => {
                        updateQuery('category', selectedCategory === c.name ? '' : c.name);
                        updateQuery('subcategory', '');
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="sheet-group">
                <h4>Brand</h4>
                <div className="sheet-chips-wrap">
                  {brands.map(b => (
                    <button
                      key={b._id}
                      className={`sheet-chip ${selectedBrand === b.name ? 'active' : ''}`}
                      onClick={() => updateQuery('brand', selectedBrand === b.name ? '' : b.name)}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="sheet-group">
                <h4>Price Range (₹)</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={localMin}
                    onChange={e => setLocalMin(e.target.value)}
                    className="price-input"
                    style={{ flex: 1 }}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={localMax}
                    onChange={e => setLocalMax(e.target.value)}
                    className="price-input"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            <div className="filter-sheet-footer">
              <button className="sheet-reset-btn" onClick={clearAllFilters}>
                Reset
              </button>
              <button
                className="sheet-apply-btn"
                onClick={handlePriceApply}
              >
                Apply Filters ({totalCount} items)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
