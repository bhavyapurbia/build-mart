import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Camera, ClipboardList, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useMaterialList } from '../../context/MaterialListContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const MobileBottomNav = ({ onOpenPaperList }) => {
  const { cartCount } = useCart();
  const { materialCount } = useMaterialList();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // Don't render on admin dashboard
  if (location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
    return null;
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {/* 1. Home */}
      <NavLink
        to="/"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <div className="mobile-nav-icon-wrap">
          <Home size={19} />
        </div>
        <span className="mobile-nav-label">{t('home') || 'Home'}</span>
      </NavLink>

      {/* 2. Categories */}
      <NavLink
        to="/products"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon-wrap">
          <LayoutGrid size={19} />
        </div>
        <span className="mobile-nav-label">{t('categories') || 'Categories'}</span>
      </NavLink>

      {/* 3. Center Action: Camera Icon to Snap Paper List & Send Directly to Admin */}
      <button
        type="button"
        className="mobile-nav-camera-btn"
        onClick={onOpenPaperList}
        title="Snap Paper Material List with Camera"
      >
        <div className="camera-circle-badge">
          <Camera size={22} color="#FFFFFF" strokeWidth={2.4} />
        </div>
        <span className="camera-btn-label">{t('snapList') || 'Snap List'}</span>
      </button>

      {/* 4. Material List */}
      <NavLink
        to="/material-list"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon-wrap">
          <ClipboardList size={19} />
          {materialCount > 0 && (
            <span className="mobile-nav-badge badge-amber">{materialCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">{t('materialList') || 'List'}</span>
      </NavLink>

      {/* 5. Cart */}
      <NavLink
        to="/cart"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon-wrap">
          <ShoppingBag size={19} />
          {cartCount > 0 && (
            <span className="mobile-nav-badge badge-green">{cartCount}</span>
          )}
        </div>
        <span className="mobile-nav-label">{t('cart') || 'Cart'}</span>
      </NavLink>

      {/* 6. Account */}
      <NavLink
        to={isAuthenticated ? "/account" : "/login"}
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <div className="mobile-nav-icon-wrap">
          <User size={19} />
        </div>
        <span className="mobile-nav-label">{isAuthenticated ? (t('account') || 'Account') : (t('signIn') || 'Login')}</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;
