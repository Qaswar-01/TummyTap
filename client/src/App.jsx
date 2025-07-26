import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import GuestCart from './pages/GuestCart';
import TrackOrder from './pages/TrackOrder';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminMessages from './pages/admin/Messages';
import AdminAnalytics from './pages/admin/Analytics';
import AdminSettings from './pages/admin/Settings';
import AdminActivityLogs from './pages/admin/ActivityLogs';
import AdminEmailTemplates from './pages/admin/EmailTemplates';
import AdminSystem from './pages/admin/System';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-16">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/guest-cart" element={<GuestCart />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/products" element={
                  <AdminRoute>
                    <AdminProducts />
                  </AdminRoute>
                } />
                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                } />
                <Route path="/admin/messages" element={
                  <AdminRoute>
                    <AdminMessages />
                  </AdminRoute>
                } />
                <Route path="/admin/analytics" element={
                  <AdminRoute>
                    <AdminAnalytics />
                  </AdminRoute>
                } />
                <Route path="/admin/settings" element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                } />
                <Route path="/admin/activity-logs" element={
                  <AdminRoute>
                    <AdminActivityLogs />
                  </AdminRoute>
                } />
                <Route path="/admin/email-templates" element={
                  <AdminRoute>
                    <AdminEmailTemplates />
                  </AdminRoute>
                } />
                <Route path="/admin/system" element={
                  <AdminRoute>
                    <AdminSystem />
                  </AdminRoute>
                } />
              </Routes>
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            <PWAInstallPrompt />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;