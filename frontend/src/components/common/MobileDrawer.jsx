import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  User,
  Zap,
  ClipboardList,
  HardHat,
  Building2,
  Package,
  FileText,
  Phone,
  MessageCircle,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMaterialList } from '../../context/MaterialListContext';
import api from '../../utils/api';

const MobileDrawer = ({ isOpen, onClose, currentCity, onOpenLocation }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { materialCount } = useMaterialList();
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const fetchCats = async () => {
        try {
          const res = await api.get('/categories');
          const safeCats = (res.data || []).filter(c =>
            !c.name.toLowerCase().includes('electrical') &&
            !c.slug.toLowerCase().includes('electrical')
          );
          setCategories(safeCats);
        } catch {
          // ignore
        }
      };
      fetchCats();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNav = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <aside className="mobile-drawer-panel" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <div className="drawer-brand">
            <div className="drawer-logo-badge">
              <Zap size={18} color='var(--color-ink)' />
            </div>
            <div>
              <div className="drawer-brand-name">
                BUILD<span>MART</span>
              </div>
              <div className="drawer-tagline">
                Material In Minutes
              </div>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* User Status Bar */}
        <div className="drawer-user-section">
          {isAuthenticated ? (
            <div className="drawer-user-info">
              <div className="drawer-avatar">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="drawer-username">{user.name}</div>
                <div className="drawer-useremail">{user.email}</div>
                {isAdmin && <span className="drawer-admin-badge">Admin Access</span>}
              </div>
            </div>
          ) : (
            <div className="drawer-auth-prompt">
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-ink)' }}>
                  Welcome to BuildMart
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                  Sign in to track orders & quotations
                </div>
              </div>
              <button
                className="drawer-signin-btn"
                onClick={() => handleNav('/login')}
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Express Delivery Banner */}
        <div className="drawer-delivery-card" onClick={() => { onClose(); onOpenLocation(); }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="drawer-pulse-dot" />
            <strong style={{ fontSize: '12.5px', color: 'var(--color-ink)' }}>
              Delivering to: <span style={{ color: 'var(--primary-dark)' }}>{currentCity}</span>
            </strong>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
            Change ▾
          </span>
        </div>

        {/* Quick Highlights / BuildMart Special Features */}
        <div className="drawer-quick-links">
          {/* Material List Flagship */}
          <div
            className="drawer-nav-card highlight"
            onClick={() => handleNav('/material-list')}
          >
            <div className="drawer-card-left">
              <div className="drawer-card-icon icon-amber">
                <ClipboardList size={18} />
              </div>
              <div>
                <div className="drawer-card-title">Material List Builder</div>
                <div className="drawer-card-subtitle">One-click image selection checklist</div>
              </div>
            </div>
            <div className="drawer-card-badge">
              {materialCount} items
            </div>
          </div>

          {/* Labour Booking */}
          <div
            className="drawer-nav-card"
            onClick={() => handleNav('/labour-booking')}
          >
            <div className="drawer-card-left">
              <div className="drawer-card-icon icon-blue">
                <HardHat size={18} />
              </div>
              <div>
                <div className="drawer-card-title">Book Skilled Labour</div>
                <div className="drawer-card-subtitle">Masons, Plumbers, Tile Specialists</div>
              </div>
            </div>
            <ChevronRight size={16} color='var(--text-light)' />
          </div>

          {/* Bulk Orders */}
          <div
            className="drawer-nav-card"
            onClick={() => handleNav('/bulk-enquiry')}
          >
            <div className="drawer-card-left">
              <div className="drawer-card-icon icon-green">
                <Building2 size={18} />
              </div>
              <div>
                <div className="drawer-card-title">Bulk / Wholesale Inquiry</div>
                <div className="drawer-card-subtitle">Factory rates for builders & contractors</div>
              </div>
            </div>
            <ChevronRight size={16} color='var(--text-light)' />
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="drawer-section-title">CATEGORIES</div>
        <div className="drawer-categories-list">
          {categories.map(c => (
            <div
              key={c._id || c.slug}
              className="drawer-category-item"
              onClick={() => handleNav(`/products?category=${encodeURIComponent(c.name)}`)}
            >
              <span>{c.name}</span>
              <ChevronRight size={14} color='var(--color-rule)' />
            </div>
          ))}
        </div>

        {/* Customer Account Links */}
        {isAuthenticated && (
          <>
            <div className="drawer-section-title">MANAGEMENT &amp; ACCOUNT</div>
            <div className="drawer-account-links">
              {isAdmin && (
                <div className="drawer-account-item admin" onClick={() => handleNav('/admin/overview')}>
                  <ShieldCheck size={18} color='var(--primary-dark)' />
                  <span style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>Admin Management Panel</span>
                </div>
              )}
              <div className="drawer-account-item" onClick={() => handleNav('/account?tab=orders')}>
                <Package size={16} />
                <span>My Orders</span>
              </div>
              <div className="drawer-account-item" onClick={() => handleNav('/account?tab=quotations')}>
                <FileText size={16} />
                <span>My Quotations</span>
              </div>
              <div className="drawer-account-item" onClick={() => handleNav('/account?tab=material-requests')}>
                <ClipboardList size={16} />
                <span>My Material Requests</span>
              </div>
              <div className="drawer-account-item logout" onClick={() => { logout(); onClose(); }}>
                <LogOut size={16} />
                <span>Log Out</span>
              </div>
            </div>
          </>
        )}

        {/* Support & Helpline */}
        <div className="drawer-section-title">HELP & SUPPORT</div>
        <div className="drawer-support-box">
          <a
            href="https://wa.me/919876543210?text=Hi%20BuildMart,%20I%20need%20assistance%20with%20construction%20materials"
            target="_blank"
            rel="noreferrer"
            className="drawer-support-btn whatsapp"
          >
            <MessageCircle size={16} />
            <span>WhatsApp Support (+91 98765 43210)</span>
          </a>
          <a
            href="tel:18008905000"
            className="drawer-support-btn phone"
          >
            <Phone size={16} />
            <span>Call Toll-Free (1800-890-5000)</span>
          </a>
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
            BuildMart Technologies • Enterprise Direct Procurement
          </div>
          {isAdmin && (
            <div style={{ marginTop: '6px' }}>
              <Link to="/admin/login" onClick={onClose} style={{ fontSize: '11px', color: 'var(--color-muted)', textDecoration: 'underline' }}>
                Staff &amp; Admin Portal
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default MobileDrawer;

