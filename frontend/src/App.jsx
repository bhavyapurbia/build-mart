import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Providers
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { MaterialListProvider } from './context/MaterialListContext';

// Common Components
import TopAnnouncementBar from './components/common/TopAnnouncementBar';
import Navbar from './components/common/Navbar';
import CategoryNav from './components/common/CategoryNav';
import Footer from './components/common/Footer';
import LocationModal from './components/common/LocationModal';
import PaperListModal from './components/common/PaperListModal';
import WhatsAppFloatingButton from './components/common/WhatsAppFloatingButton';
import MobileBottomNav from './components/common/MobileBottomNav';
import MaterialListFloatingBar from './components/product/MaterialListFloatingBar';

// Customer Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import MaterialListPage from './pages/MaterialListPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import BulkEnquiryPage from './pages/BulkEnquiryPage';
import LabourBookingPage from './pages/LabourBookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';

// Admin Pages
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBrands from './pages/admin/AdminBrands';
import AdminBanners from './pages/admin/AdminBanners';
import AdminMaterialRequests from './pages/admin/AdminMaterialRequests';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminLabourRequests from './pages/admin/AdminLabourRequests';
import AdminBulkEnquiries from './pages/admin/AdminBulkEnquiries';
import AdminInventory from './pages/admin/AdminInventory';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPaperListOpen, setIsPaperListOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState('Bengaluru');
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <NotificationProvider>
      <AuthProvider>
        <LanguageProvider>
          <CartProvider>
            <MaterialListProvider>
            <div className="app-container">
              {/* Only show customer headers when not in admin dashboard */}
              {!isAdminRoute && (
                <>
                  <TopAnnouncementBar
                    currentCity={currentCity}
                    onOpenLocation={() => setIsLocationOpen(true)}
                  />
                  <Navbar
                    currentCity={currentCity}
                    onOpenLocation={() => setIsLocationOpen(true)}
                    onOpenPaperList={() => setIsPaperListOpen(true)}
                  />
                  <CategoryNav />
                </>
              )}

              {/* Main Routing */}
              <div className="main-content-wrapper">
                <Routes>
                  {/* Customer Routes */}
                  <Route path="/" element={<HomePage onOpenPaperList={() => setIsPaperListOpen(true)} />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/material-list" element={<MaterialListPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/bulk-enquiry" element={<BulkEnquiryPage />} />
                  <Route path="/labour-booking" element={<LabourBookingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/account" element={<AccountPage />} />

                  {/* Admin Auth Route */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  {/* Secure Admin Dashboard Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/overview" replace />} />
                    <Route path="overview" element={<AdminOverview />} />
                    <Route path="material-requests" element={<AdminMaterialRequests />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="brands" element={<AdminBrands />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="labour" element={<AdminLabourRequests />} />
                    <Route path="bulk" element={<AdminBulkEnquiries />} />
                    <Route path="inventory" element={<AdminInventory />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>

              {/* Customer Utilities */}
              {!isAdminRoute && (
                <>
                  <MaterialListFloatingBar />
                  <WhatsAppFloatingButton />
                  <Footer />
                  <MobileBottomNav onOpenPaperList={() => setIsPaperListOpen(true)} />
                  <LocationModal
                    isOpen={isLocationOpen}
                    currentCity={currentCity}
                    onClose={() => setIsLocationOpen(false)}
                    onSelectCity={city => setCurrentCity(city)}
                  />
                  <PaperListModal
                    isOpen={isPaperListOpen}
                    currentCity={currentCity}
                    onClose={() => setIsPaperListOpen(false)}
                  />
                </>
              )}
            </div>
          </MaterialListProvider>
        </CartProvider>
      </LanguageProvider>
    </AuthProvider>
  </NotificationProvider>
  );
}

export default App;
