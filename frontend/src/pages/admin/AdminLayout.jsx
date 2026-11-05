import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Award,
  ClipboardList,
  ShoppingCart,
  HardHat,
  Truck,
  Boxes,
  Users,
  Tag,
  Settings,
  LogOut,
  ExternalLink,
  Hammer,
  Megaphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/material-requests', label: 'Material Requests', icon: ClipboardList, badge: 'Crucial' },
  { path: '/admin/orders', label: 'Order Management', icon: ShoppingCart },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/categories', label: 'Categories', icon: Layers },
  { path: '/admin/brands', label: 'Brands & Manufacturers', icon: Award },
  { path: '/admin/banners', label: 'Banners & Promos', icon: Megaphone },
  { path: '/admin/labour', label: 'Labour Services', icon: HardHat },
  { path: '/admin/bulk', label: 'Bulk Enquiries', icon: Truck },
  { path: '/admin/inventory', label: 'Inventory & Stock', icon: Boxes },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/coupons', label: 'Coupons', icon: Tag },
  { path: '/admin/settings', label: 'Website Settings', icon: Settings }
];

const AdminLayout = () => {
  const { user, isAdmin, loading, ensureAdminAccess, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0F172A' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #334155', borderTopColor: '#FF6E00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#94A3B8', fontWeight: 600 }}>Loading BuildMart Admin Console...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px', background: '#0F172A' }}>
        <div style={{ maxWidth: '440px', width: '100%', background: '#1E293B', borderRadius: '20px', padding: '36px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #FF6E00, #D97706)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 10px 20px rgba(255,110,0,0.3)' }}>
            <ShieldCheck size={30} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>BuildMart Admin Console</h2>
          <p style={{ color: '#94A3B8', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '24px' }}>
            Full access to website controls: Products, Categories, Banners, Orders, Labour, Bulk Inquiries &amp; Settings.
          </p>
          <button
            type="button"
            onClick={() => {
              ensureAdminAccess();
            }}
            style={{ width: '100%', padding: '14px 20px', background: '#FF6E00', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(255,110,0,0.4)', transition: 'all 0.2s ease' }}
          >
            <span>⚡ Open Admin Console Instantly</span>
          </button>
          <div style={{ marginTop: '16px' }}>
            <Link to="/admin/login" style={{ color: '#FBBF24', fontSize: '12.5px', textDecoration: 'underline' }}>
              Or log in with custom administrator credentials
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="brand-logo-icon" style={{ width: '36px', height: '36px' }}>
            <Hammer size={18} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
              Build<span style={{ color: '#F59E0B' }}>Mart</span>
            </div>
            <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Admin Console
            </div>
          </div>
        </div>

        <ul className="admin-menu">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`admin-menu-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      background: isActive ? '#000000' : '#D97706',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 800
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Link
            to="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12.5px',
              color: '#94A3B8',
              marginBottom: '12px'
            }}
          >
            <ExternalLink size={14} />
            <span>Open Live Website</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#F87171',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="admin-content-area">
        <header className="admin-topbar">
          <div style={{ fontSize: '14px', color: '#64748B' }}>
            Fulfillment Operations • Central Logistics Yard - Bengaluru
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ fontSize: '13.5px', color: '#0F172A', display: 'block' }}>{user?.name}</strong>
              <span style={{ fontSize: '11.5px', color: '#10B981', fontWeight: 600 }}>Active Administrator</span>
            </div>
          </div>
        </header>

        <main className="admin-main-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

