import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Providers
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { MaterialListProvider } from './context/MaterialListContext';

// Common Components (Eager loaded for shell layout)
import TopAnnouncementBar from './components/common/TopAnnouncementBar';
import Navbar from './components/common/Navbar';
import CategoryNav from './components/common/CategoryNav';
import Footer from './components/common/Footer';
import LocationModal from './components/common/LocationModal';
import PaperListModal from './components/common/PaperListModal';
import WhatsAppFloatingButton from './components/common/WhatsAppFloatingButton';
import MobileBottomNav from './components/common/MobileBottomNav';
import MaterialListFloatingBar from './components/product/MaterialListFloatingBar';
import ErrorBoundary from './components/common/ErrorBoundary';
import RouteLoadingSkeleton from './components/common/RouteLoadingSkeleton';

// Customer Pages (Lazy loaded for optimal code-splitting)
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const MaterialListPage = lazy(() => import('./pages/MaterialListPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const BulkEnquiryPage = lazy(() => import('./pages/BulkEnquiryPage'));
const LabourBookingPage = lazy(() => import('./pages/LabourBookingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ContentPage = lazy(() => import('./pages/ContentPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Auth Pages (Lazy)
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));

// Admin Pages (Lazy - isolates heavy admin bundle completely)
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminMaterialRequests = lazy(() => import('./pages/admin/AdminMaterialRequests'));
const AdminQuotationsPage = lazy(() => import('./pages/admin/AdminQuotationsPage'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminBrands = lazy(() => import('./pages/admin/AdminBrands'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminLabourRequests = lazy(() => import('./pages/admin/AdminLabourRequests'));
const AdminBulkEnquiries = lazy(() => import('./pages/admin/AdminBulkEnquiries'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

function App() {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPaperListOpen, setIsPaperListOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState('Bengaluru');
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <SettingsProvider>
      <NotificationProvider>
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <WishlistProvider>
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

                    {/* Main Routing wrapped in Resilience Boundaries */}
                    <div className="main-content-wrapper">
                      <ErrorBoundary fallbackTitle="Page loading error">
                        <Suspense fallback={<RouteLoadingSkeleton />}>
                          <Routes>
                            {/* Customer Core Routes */}
                            <Route path="/" element={<HomePage onOpenPaperList={() => setIsPaperListOpen(true)} />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/product/:id" element={<ProductDetailPage />} />
                            <Route path="/p/:slug" element={<ProductDetailPage />} />
                            <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                            <Route path="/material-list" element={<MaterialListPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route
                              path="/checkout"
                              element={
                                <ErrorBoundary fallbackTitle="Checkout encountered an error">
                                  <CheckoutPage />
                                </ErrorBoundary>
                              }
                            />
                            <Route path="/bulk-enquiry" element={<BulkEnquiryPage />} />
                            <Route path="/labour-booking" element={<LabourBookingPage />} />
                            <Route path="/track-order" element={<TrackOrderPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />
                            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                            <Route path="/verify-email" element={<VerifyEmailPage />} />
                            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                            <Route path="/account" element={<AccountPage />} />

                            {/* Content & Policy Pages */}
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/privacy-policy" element={<ContentPage />} />
                            <Route path="/terms-and-conditions" element={<ContentPage />} />
                            <Route path="/refund-and-return-policy" element={<ContentPage />} />
                            <Route path="/shipping-and-delivery-policy" element={<ContentPage />} />
                            <Route path="/about" element={<ContentPage />} />
                            <Route path="/careers" element={<ContentPage />} />
                            <Route path="/faq" element={<ContentPage />} />

                            {/* Admin Auth Route */}
                            <Route path="/admin/login" element={<AdminLoginPage />} />

                            {/* Secure Admin Dashboard Routes */}
                            <Route path="/admin" element={<AdminLayout />}>
                              <Route index element={<Navigate to="/admin/overview" replace />} />
                              <Route path="overview" element={<AdminOverview />} />
                              <Route path="material-requests" element={<AdminMaterialRequests />} />
                              <Route path="quotations" element={<AdminQuotationsPage />} />
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

                            {/* 404 Fallback */}
                            <Route path="*" element={<NotFoundPage />} />
                          </Routes>
                        </Suspense>
                      </ErrorBoundary>
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
              </WishlistProvider>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </NotificationProvider>
    </SettingsProvider>
  );
}

export default App;
