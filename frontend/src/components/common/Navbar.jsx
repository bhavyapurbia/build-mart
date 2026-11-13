import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  User,
  ClipboardList,
  MapPin,
  ChevronDown,
  Menu,
  X,
  FileText,
  LogOut,
  ShieldCheck,
  Package,
  HardHat,
  Zap,
  ArrowRight,
  Camera,
  Mic,
  Globe,
  Check,
  Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useMaterialList } from '../../context/MaterialListContext';
import { useLanguage } from '../../context/LanguageContext';
import { useWishlist } from '../../context/WishlistContext';
import NotificationBell from './NotificationBell';
import MobileDrawer from './MobileDrawer';
import api from '../../utils/api';

const LANGUAGES = [
  { code: 'EN', name: 'English', native: 'English' },
  { code: 'HI', name: 'Hindi', native: 'हिन्दी' },
  { code: 'KN', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'TE', name: 'Telugu', native: 'తెలుగు' },
  { code: 'TA', name: 'Tamil', native: 'தமிழ்' },
  { code: 'GU', name: 'Gujarati', native: 'ગુજરાતી' }
];

const Navbar = ({ onOpenLocation, currentCity, onOpenPaperList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bm_recent_searches') || '[]');
    } catch {
      return [];
    }
  });

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { currentLang, changeLanguage, t } = useLanguage();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { materialCount } = useMaterialList();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  // Live search autocomplete via /products/suggest
  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const fetchSuggestions = async () => {
        try {
          const res = await api.get(`/products/suggest?q=${encodeURIComponent(searchTerm.trim())}`);
          const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          setSuggestions(list);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        } catch {
          setSuggestions([]);
        }
      };
      const debounce = setTimeout(fetchSuggestions, 200);
      return () => clearTimeout(debounce);
    } else {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [searchTerm]);

  const saveRecentSearch = (term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('bm_recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions && suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      const target = suggestions[selectedIndex];
      setShowSuggestions(false);
      setSearchTerm('');
      saveRecentSearch(target.name);
      navigate(target.slug ? `/p/${target.slug}` : `/product/${target._id}`);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm);
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Voice Search Handler
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser. Please use Google Chrome.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    const langMap = {
      EN: 'en-IN',
      HI: 'hi-IN',
      KN: 'kn-IN',
      TE: 'te-IN',
      TA: 'ta-IN',
      GU: 'gu-IN'
    };
    recognition.lang = langMap[currentLang] || 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      navigate(`/products?search=${encodeURIComponent(transcript)}`);
    };
    recognition.start();
  };

  return (
    <>
      <header className="premium-classic-header">
        <div className="container">
          {/* Top Row: Menu + Brand Logo (BuildMart) + Language Selector + Profile + Cart */}
          <div className="header-top-row">
            {/* Hamburger Button */}
            <button
              type="button"
              className="header-hamburger-btn"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu size={22} color='var(--bg-card)' />
            </button>

            {/* Brand Logo: BUILDMART (Clean, Classic, Premium) */}
            <Link to="/" className="buildmart-brand-logo">
              <div className="brand-symbol-box">
                <HardHat size={20} color="#0A0F1D" strokeWidth={2.5} />
              </div>
              <div className="brand-text-stack">
                <span className="brand-name-gold">
                  BUILD<span className="brand-name-light">MART</span>
                </span>
                <span className="brand-tagline-micro">
                  DIRECT SITE PROCUREMENT
                </span>
              </div>
            </Link>

            {/* Right Action Group */}
            <div className="header-right-group">
              {/* Active Multi-Language Selector Dropdown */}
              <div className="lang-selector-wrap" ref={langMenuRef}>
                <button
                  type="button"
                  className="lang-pill-btn"
                  onClick={() => setLangDropdownOpen(prev => !prev)}
                  title="Switch Language"
                >
                  <Globe size={14} color='var(--color-accent)' />
                  <span className="lang-code-text">{currentLang}</span>
                  <ChevronDown size={11} color='var(--text-light)' />
                </button>

                {langDropdownOpen && (
                  <div className="lang-dropdown-panel">
                    <div className="lang-panel-header">
                      Select Regional Language
                    </div>
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        className={`lang-option-item ${currentLang === lang.code ? 'active' : ''}`}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                      >
                        <div style={{ textAlign: 'left' }}>
                          <span className="lang-native">{lang.native}</span>
                          <span className="lang-eng">({lang.name})</span>
                        </div>
                        {currentLang === lang.code && <Check size={14} color='var(--color-accent)' />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Shortcut */}
              <div className="header-profile-wrap" ref={userMenuRef}>
                <button
                  type="button"
                  className="profile-icon-btn"
                  onClick={() => {
                    if (isAuthenticated) {
                      setUserDropdownOpen(prev => !prev);
                    } else {
                      navigate('/login');
                    }
                  }}
                >
                  <User size={19} color='var(--bg-card)' />
                  <span className="profile-btn-caption">
                    {isAuthenticated ? (user?.name ? user.name.split(' ')[0] : 'Account') : (t('profile') || 'Profile')}
                  </span>
                </button>

                {/* Dropdown for authenticated users */}
                {userDropdownOpen && isAuthenticated && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-header">
                      <div className="dropdown-user-name">{user?.name || 'Customer'}</div>
                      <div className="dropdown-user-email">{user?.email || ''}</div>
                      {isAdmin && (
                        <span className="dropdown-admin-badge">Admin Access</span>
                      )}
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin/overview"
                        onClick={() => setUserDropdownOpen(false)}
                        className="dropdown-link admin-link"
                      >
                        <ShieldCheck size={16} color='var(--color-accent)' />
                        <span style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/account?tab=orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="dropdown-link"
                    >
                      <Package size={16} />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      to="/account?tab=wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      className="dropdown-link"
                    >
                      <Heart size={16} />
                      <span>My Wishlist ({wishlistCount})</span>
                    </Link>
                    <Link
                      to="/account?tab=quotations"
                      onClick={() => setUserDropdownOpen(false)}
                      className="dropdown-link"
                    >
                      <FileText size={16} />
                      <span>My Quotations</span>
                    </Link>
                    <Link
                      to="/account?tab=material-requests"
                      onClick={() => setUserDropdownOpen(false)}
                      className="dropdown-link"
                    >
                      <ClipboardList size={16} />
                      <span>Material Lists</span>
                    </Link>
                    <Link
                      to="/track-order"
                      onClick={() => setUserDropdownOpen(false)}
                      className="dropdown-link"
                    >
                      <Package size={16} />
                      <span>Track Order</span>
                    </Link>
                    <div className="dropdown-divider" />
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="dropdown-logout-btn"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Customer Notifications */}
              {isAuthenticated && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <NotificationBell />
                </div>
              )}

              {/* Wishlist Shortcut */}
              <Link to="/account?tab=wishlist" className="header-cart-wrap" title="View Wishlist">
                <div className="cart-badge-container">
                  <Heart size={20} color='var(--bg-card)' />
                  {wishlistCount > 0 && <span className="cart-live-count">{wishlistCount}</span>}
                </div>
                <span className="cart-btn-caption">Wishlist</span>
              </Link>

              {/* Shopping Cart Pill */}
              <Link to="/cart" className="header-cart-wrap" title="View Cart">
                <div className="cart-badge-container">
                  <ShoppingCart size={20} color='var(--bg-card)' />
                  {cartCount > 0 && <span className="cart-live-count">{cartCount}</span>}
                </div>
                <span className="cart-btn-caption">{t('cart') || 'Cart'}</span>
              </Link>

              {/* Direct Admin Console Access Button (Restricted to Authorized Admins) */}
              {isAdmin && (
                <Link
                  to="/admin/overview"
                  className="header-admin-direct-btn"
                  title="Open Admin Management Panel"
                >
                  <ShieldCheck size={18} color='var(--color-accent)' />
                  <span className="admin-btn-caption">Admin</span>
                </Link>
              )}
            </div>
          </div>

          {/* Delivery Address Row */}
          <div className="header-address-row">
            <div className="address-meta-box">
              <MapPin size={16} color="#FF9900" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className="address-text-column">
                <span className="address-location-title">
                  {currentCity ? `${t('deliverTo') || 'Deliver to'} ${currentCity}` : (t('selectLocation') || 'Deliver to Bengaluru')}
                </span>
                <button
                  type="button"
                  className="address-edit-link"
                  onClick={onOpenLocation}
                >
                  <span>{currentCity ? (t('changeAddress') || 'Change Address') : (t('addAddress') || 'Change Address')}</span>
                  <ChevronDown size={12} color="#FF9900" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar Pill with Camera & Mic */}
          <div className="header-search-row" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="classic-search-pill-form" role="search">
              <Search size={18} color='var(--text-light)' className="search-pill-glass-icon" />
              <input
                type="text"
                role="combobox"
                aria-expanded={showSuggestions}
                aria-autocomplete="list"
                placeholder={t('searchPlaceholder') || 'Search cement, steel rebars, CPVC pipes, tiles, sand...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchTerm.trim().length > 1) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                className="classic-search-input"
              />

              {/* Snap Paper Material List Camera Button (Direct to Admin) */}
              <button
                type="button"
                className="search-camera-action-btn"
                onClick={onOpenPaperList}
                title="Click photo of handwritten paper material list to send directly to Admin"
              >
                <Camera size={19} color='var(--primary-dark)' />
              </button>

              {/* Orange Mic Voice Search Button */}
              <button
                type="button"
                className={`search-voice-mic-btn ${isListening ? 'listening' : ''}`}
                onClick={handleVoiceSearch}
                title="Tap to voice search"
              >
                <Mic size={16} color='var(--bg-card)' />
              </button>
            </form>

            {/* Suggestions Popup */}
            {showSuggestions && (
              <div className="search-suggestions-dropdown" role="listbox">
                {suggestions.length > 0 ? (
                  <>
                    <div className="search-suggestions-header">
                      <span>Quick Dispatch Supplies</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Use ↑↓ and Enter</span>
                    </div>
                    {suggestions.map((p, idx) => (
                      <div
                        key={p._id}
                        role="option"
                        aria-selected={selectedIndex === idx}
                        className="search-suggestion-item"
                        style={{
                          backgroundColor: selectedIndex === idx ? 'var(--bg-accent-subtle, #EFF6FF)' : 'transparent',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setShowSuggestions(false);
                          setSearchTerm('');
                          saveRecentSearch(p.name);
                          navigate(p.slug ? `/p/${p.slug}` : `/product/${p._id}`);
                        }}
                      >
                        <img
                          src={p.image || (p.images && p.images[0]) || '/placeholder-material.svg'}
                          alt={p.name}
                          className="search-suggestion-img"
                        />
                        <div className="search-suggestion-info">
                          <div className="search-suggestion-name">{p.name}</div>
                          <div className="search-suggestion-meta">
                            <span>{p.brand}</span>
                            <span className="search-suggestion-price">₹{p.price}</span>
                            {p.unit && <span className="search-suggestion-unit">/ {p.unit}</span>}
                          </div>
                        </div>
                        <ArrowRight size={14} color='var(--text-light)' />
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      No direct matches found for "{searchTerm}"
                    </p>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {['Cement', 'Steel', 'Tiles', 'Pipes'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setShowSuggestions(false);
                            setSearchTerm('');
                            navigate(`/products?search=${encodeURIComponent(cat)}`);
                          }}
                          style={{
                            background: 'var(--bg-subtle, #F3F4F6)',
                            border: '1px solid #E5E7EB',
                            borderRadius: '16px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Menu Drawer */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        currentCity={currentCity}
        onOpenLocation={onOpenLocation}
      />
    </>
  );
};

export default Navbar;
