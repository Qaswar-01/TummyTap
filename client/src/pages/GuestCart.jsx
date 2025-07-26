import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import GuestCheckout from '../components/GuestCheckout';

const GuestCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('guestCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (items) => {
    localStorage.setItem('guestCart', JSON.stringify(items));
    setCartItems(items);
    // Trigger custom event for navbar update
    window.dispatchEvent(new CustomEvent('guestCartUpdated'));
  };

  // Add item to guest cart
  const addToGuestCart = (product, quantity = 1) => {
    const existingItemIndex = cartItems.findIndex(item => item._id === product._id);
    let newItems;

    if (existingItemIndex >= 0) {
      newItems = cartItems.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
          : item
      );
    } else {
      newItems = [...cartItems, { ...product, quantity }];
    }

    saveCart(newItems);
    toast.success('Item added to cart!');
  };

  // Update quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const newItems = cartItems.map(item =>
      item._id === productId
        ? { ...item, quantity: Math.min(newQuantity, 99) }
        : item
    );
    
    saveCart(newItems);
    toast.success('Quantity updated!');
  };

  // Remove item
  const removeFromCart = (productId) => {
    const newItems = cartItems.filter(item => item._id !== productId);
    saveCart(newItems);
    toast.success('Item removed from cart!');
  };

  // Clear cart
  const clearCart = () => {
    saveCart([]);
    toast.success('Cart cleared!');
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Handle successful order
  const handleOrderSuccess = (orderData) => {
    setOrderSuccess(orderData);
    clearCart(); // Clear cart after successful order
    setShowCheckout(false);
  };

  // Show order success message
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your order has been automatically confirmed and is being prepared.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="font-semibold text-green-800">Order ID: {orderSuccess.order._id}</p>
              <p className="text-green-700">Email: {orderSuccess.order.email}</p>
              <p className="text-green-700">Total: ${orderSuccess.order.totalPrice.toFixed(2)}</p>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Save your Order ID to track your order status.
            </p>

            <div className="flex space-x-4">
              <Link to="/menu" className="btn-primary flex-1 text-center">
                Order More
              </Link>
              <Link to="/track-order" className="btn-outline flex-1 text-center">
                Track Order
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show checkout form
  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              onClick={() => setShowCheckout(false)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Cart
            </button>
          </div>
          <GuestCheckout 
            cartItems={cartItems.map(item => ({
              productId: item._id,
              quantity: item.quantity,
              name: item.name,
              price: item.price
            }))}
            onOrderSuccess={handleOrderSuccess}
          />
        </div>
      </div>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some delicious items to get started!</p>
            <Link to="/menu" className="btn-primary">
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0"
                >
                  <img
                    src={item.image?.startsWith('http')
                      ? item.image
                      : item.image?.startsWith('/')
                        ? item.image
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/uploads/${item.image}`
                    }
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-food.jpg';
                    }}
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="text-lg font-bold text-primary-500">${item.price}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700 mt-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-gray-50 p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total: ${calculateTotal().toFixed(2)}</span>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Clear Cart
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-700">
                  🚀 <strong>Quick Checkout:</strong> No account required! Your order will be automatically confirmed.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <Link to="/menu" className="btn-outline flex-1 text-center">
                  Continue Shopping
                </Link>
                <button 
                  onClick={() => setShowCheckout(true)}
                  className="btn-primary flex-1"
                >
                  Quick Checkout (No Login)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Export the addToGuestCart function for use in other components
export const addToGuestCart = (product, quantity = 1) => {
  const savedCart = localStorage.getItem('guestCart');
  const cartItems = savedCart ? JSON.parse(savedCart) : [];
  
  const existingItemIndex = cartItems.findIndex(item => item._id === product._id);
  let newItems;

  if (existingItemIndex >= 0) {
    newItems = cartItems.map((item, index) =>
      index === existingItemIndex
        ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
        : item
    );
  } else {
    newItems = [...cartItems, { ...product, quantity }];
  }

  localStorage.setItem('guestCart', JSON.stringify(newItems));
  // Trigger custom event for navbar update
  window.dispatchEvent(new CustomEvent('guestCartUpdated'));
  toast.success('Item added to cart!');
};

export default GuestCart;