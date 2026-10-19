import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import Layout from './components/layout/Layout'

// Customer Pages (Eagerly bundled for immediate responsive customer experience)
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AccountPage from './pages/AccountPage'
import NotFoundPage from './pages/NotFoundPage'

// AUREVA VAULT Suite (Lazy-loaded to keep customer storefront lightweight)
const VaultAccessPage = lazy(() => import('./pages/vault/VaultAccessPage'))
const VaultLoginPage = lazy(() => import('./pages/vault/VaultLoginPage'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminProtectedRoute = lazy(() => import('./components/admin/AdminProtectedRoute'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'))
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'))
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage'))
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'))
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'))
const AdminLoginActivityPage = lazy(() => import('./pages/admin/AdminLoginActivityPage'))
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'))
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'))
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'))

function VaultLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col items-center justify-center p-6 font-mono text-xs">
      <div className="w-8 h-8 border-2 border-[#B8FF00] border-t-transparent rounded-full animate-spin mb-4" />
      <span className="tracking-[0.2em] uppercase text-[#A6A6A6]">
        INITIALIZING AUREVA VAULT...
      </span>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* 1. Vault Access Gate (Unlinked entry screen) */}
              <Route
                path="/vault"
                element={
                  <Suspense fallback={<VaultLoadingFallback />}>
                    <VaultAccessPage />
                  </Suspense>
                }
              />

              {/* 2. Vault Administrator Login */}
              <Route
                path="/vault/login"
                element={
                  <Suspense fallback={<VaultLoadingFallback />}>
                    <VaultLoginPage />
                  </Suspense>
                }
              />

              {/* 3. Protected AUREVA VAULT Management Suite */}
              <Route
                path="/vault"
                element={
                  <Suspense fallback={<VaultLoadingFallback />}>
                    <AdminProtectedRoute>
                      <AdminLayout />
                    </AdminProtectedRoute>
                  </Suspense>
                }
              >
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="login-activity" element={<AdminLoginActivityPage />} />
                <Route path="coupons" element={<AdminCouponsPage />} />
                <Route path="messages" element={<AdminMessagesPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Backwards-compatible /admin aliases */}
              <Route path="/admin/login" element={<Navigate to="/vault/login" replace />} />
              <Route path="/admin/*" element={<Navigate to="/vault/dashboard" replace />} />

              {/* Customer-Facing Storefront (100% Preserved) */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="product/:id" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
