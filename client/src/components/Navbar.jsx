import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, LogOut, Settings, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [guestCartCount, setGuestCartCount] = useState(0);
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  // Get guest cart count from localStorage
  useEffect(() => {
    const updateGuestCartCount = () => {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        const count = cartItems.reduce((total, item) => total + item.quantity, 0);
        setGuestCartCount(count);
      } else {
        setGuestCartCount(0);
      }
    };

    updateGuestCartCount();
    
    // Listen for storage changes
    window.addEventListener('storage', updateGuestCartCount);
    
    // Custom event for same-tab updates
    window.addEventListener('guestCartUpdated', updateGuestCartCount);
    
    return () => {
      window.removeEventListener('storage', updateGuestCartCount);
      window.removeEventListener('guestCartUpdated', updateGuestCartCount);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🍕</span>
            <span className="text-xl font-bold text-gradient">Yum-Yum</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-700 hover:text-primary-500 font-medium transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-gray-600 hover:text-primary-500 transition-colors">
              <Search size={20} />
            </button>

            {/* Cart */}
            <Link
              to={isAuthenticated ? "/cart" : "/guest-cart"}
              className="relative p-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <ShoppingCart size={20} />
              {((isAuthenticated && getCartCount() > 0) || (!isAuthenticated && guestCartCount > 0)) && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {isAuthenticated ? getCartCount() : guestCartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-500 transition-colors"
                >
                  <User size={20} />
                  <span className="hidden md:block font-medium">{user?.name}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Package size={16} />
                      <span>My Orders</span>
                    </Link>
                    {user?.isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={16} />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/track-order"
                  className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
                >
                  Track Order
                </Link>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-primary-400 to-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:from-primary-500 hover:to-primary-600 transition-all duration-200 text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Admin Login
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-500"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="py-4 border-t bg-white/95 backdrop-blur-sm">
            <div className="space-y-1">
              {navLinks.map((link, index) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block py-3 px-4 text-gray-700 hover:text-primary-500 hover:bg-primary-50 font-medium transition-all duration-200 rounded-lg mx-2"
                  onClick={() => setIsOpen(false)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.name}
                </Link>
              ))}

              {/* Cart for mobile */}
              <Link
                to={isAuthenticated ? "/cart" : "/guest-cart"}
                className="flex items-center py-3 px-4 text-gray-700 hover:text-primary-500 hover:bg-primary-50 font-medium transition-all duration-200 rounded-lg mx-2"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCart size={20} className="mr-3" />
                Cart {((isAuthenticated && getCartCount() > 0) || (!isAuthenticated && guestCartCount > 0)) && (
                  <span className="ml-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {isAuthenticated ? getCartCount() : guestCartCount}
                  </span>
                )}
              </Link>

              {!isAuthenticated && (
                <div className="pt-2 space-y-2 border-t border-gray-100 mt-2">
                  <Link
                    to="/track-order"
                    className="block py-3 px-4 text-gray-700 hover:text-primary-500 hover:bg-primary-50 font-medium transition-all duration-200 rounded-lg mx-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Track Order
                  </Link>
                  <Link
                    to="/login"
                    className="block py-3 px-4 mx-2 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-lg font-medium hover:from-primary-500 hover:to-primary-600 transition-all duration-200 text-center shadow-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Login
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center py-3 px-4 text-red-600 hover:bg-red-50 font-medium transition-all duration-200 rounded-lg mx-2 w-full text-left"
                  >
                    <LogOut size={16} className="mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;