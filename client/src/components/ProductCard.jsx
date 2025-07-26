import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addToGuestCart } from '../pages/GuestCart';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        // Add to authenticated user's cart
        await addToCart(product._id, quantity);
      } else {
        // Add to guest cart (localStorage)
        addToGuestCart(product, quantity);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickView = () => {
    // Quick view functionality can be added here
    console.log('Quick view for:', product.name);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-gray-200">
      {/* Quick View Button */}
      <div className="relative">
        <button
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-red-500"
          onClick={handleQuickView}
          title="Quick view"
        >
          <i className="fas fa-eye text-sm"></i>
        </button>

        {/* Product Image */}
        <img
          src={product.image?.startsWith('http')
            ? product.image
            : product.image?.startsWith('/')
              ? product.image
              : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/uploads/${product.image}`
          }
          alt={product.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = '/images/placeholder-food.jpg';
          }}
        />

        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded uppercase">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-red-500">
            ₹{product.price}
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Qty:</label>
            <input
              type="number"
              name="qty"
              className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-red-500"
              min="1"
              max="99"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              onKeyPress={(e) => e.preventDefault()}
            />
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          className={`w-full py-2 px-4 rounded font-medium text-white transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600'
          }`}
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Adding...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <i className="fas fa-shopping-cart mr-2"></i>
              Add to Cart
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;