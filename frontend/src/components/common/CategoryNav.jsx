import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  LayoutGrid,
  ShieldCheck,
  Wrench,
  Lock,
  Bath,
  Hammer,
  HardHat,
  ChevronDown
} from 'lucide-react';
import api from '../../utils/api';

const ICON_MAP = {
  Building2: Building2,
  LayoutGrid: LayoutGrid,
  ShieldCheck: ShieldCheck,
  Wrench: Wrench,
  Lock: Lock,
  Bath: Bath,
  Hammer: Hammer,
  HardHat: HardHat
};

const CategoryNav = () => {
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        const rawList = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        // Ensure NO electrical category is displayed
        const filtered = rawList.filter(c =>
          c && c.name &&
          !c.name.toLowerCase().includes('electrical') &&
          !(c.slug && c.slug.toLowerCase().includes('electrical'))
        );
        setCategories(filtered);
      } catch (err) {
        console.error('Error loading category nav:', err);
      }
    };
    fetchCats();
  }, []);

  return (
    <nav className="category-nav-bar">
      <div className="container">
        <ul className="category-nav-list">
          {categories.map(cat => {
            const IconComponent = ICON_MAP[cat.icon] || HardHat;
            const queryCategory = new URLSearchParams(location.search).get('category');
            const isActive = queryCategory === cat.name;

            return (
              <li key={cat._id || cat.slug} className="category-nav-item">
                <Link
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className={`category-nav-link ${isActive ? 'active' : ''}`}
                >
                  <IconComponent size={16} />
                  <span>{cat.name}</span>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <ChevronDown size={12} style={{ opacity: 0.6 }} />
                  )}
                </Link>

                {/* Dropdown Menu for Subcategories */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="category-dropdown">
                    <div style={{ padding: '6px 18px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                      {cat.name} Subcategories
                    </div>
                    {cat.subcategories.map(sub => (
                      <Link
                        key={sub.slug || sub.name}
                        to={`/products?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub.name)}`}
                        className="category-dropdown-link"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryNav;

