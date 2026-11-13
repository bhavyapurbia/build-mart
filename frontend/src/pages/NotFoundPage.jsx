import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Package, FileQuestion, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '680px', padding: '60px 16px', textAlign: 'center', minHeight: '65vh' }}>
      <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--bg-accent-subtle, #EFF6FF)', borderRadius: '50%', color: 'var(--primary, #0284C7)', marginBottom: '16px' }}>
        <FileQuestion size={48} />
      </div>

      <h1 style={{ fontSize: '48px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px' }}>
        404
      </h1>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
        Job Site Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '480px', margin: '0 auto 32px', lineHeight: 1.6 }}>
        The link you followed may be broken or the construction product page may have been moved or updated.
      </p>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', maxWidth: '440px', margin: '0 auto 36px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search cement, steel, pipes, tiles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #D1D5DB)',
              fontSize: '14px'
            }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: '10px 18px', borderRadius: '8px', fontWeight: 600 }}
        >
          Search
        </button>
      </form>

      {/* Popular Links */}
      <div style={{ padding: '24px', background: 'var(--bg-subtle, #F9FAFB)', borderRadius: '12px', border: '1px solid var(--border-light, #E5E7EB)' }}>
        <p style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Popular Destinations
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              background: 'var(--bg-card, #FFFFFF)',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #E5E7EB)',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <Home size={14} /> Home
          </Link>
          <Link
            to="/products"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              background: 'var(--bg-card, #FFFFFF)',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #E5E7EB)',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <Package size={14} /> Products
          </Link>
          <Link
            to="/bulk-enquiry"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              background: 'var(--bg-card, #FFFFFF)',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #E5E7EB)',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Bulk Orders
          </Link>
          <Link
            to="/contact"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px',
              background: 'var(--bg-card, #FFFFFF)',
              borderRadius: '8px',
              border: '1px solid var(--border-light, #E5E7EB)',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}

