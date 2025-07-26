import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { items, total, updateQuantity, removeFromCart, clearCart, loading } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (items.length === 0) {
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
              {items.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0"
                >
                  <img
                    src={item.product.image?.startsWith('http')
                      ? item.product.image
                      : item.product.image?.startsWith('/')
                        ? item.product.image
                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/uploads/${item.product.image}`
                    }
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-food.jpg';
                    }}
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">{item.product.category}</p>
                    <p className="text-lg font-bold text-primary-500">${item.product.price}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, Math.min(99, item.quantity + 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
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
                <span className="text-xl font-bold">Total: ${total.toFixed(2)}</span>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Clear Cart
                </button>
              </div>
              
              <div className="flex space-x-4">
                <Link to="/menu" className="btn-outline flex-1 text-center">
                  Continue Shopping
                </Link>
                <Link to="/checkout" className="btn-primary flex-1 text-center">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;