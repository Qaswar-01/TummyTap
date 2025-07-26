import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialState = {
  items: [],
  loading: false,
  total: 0
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return { 
        ...state, 
        items: action.payload,
        total: action.payload.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      };
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.product._id === action.payload.product._id);
      let newItems;
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product._id === action.payload.product._id
            ? { ...item, quantity: Math.min(item.quantity + action.payload.quantity, 99) }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      };
    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item._id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      };
    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(item => item._id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      };
    case 'CLEAR_CART':
      return { ...state, items: [], total: 0 };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load cart
  const loadCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await axios.get('/api/cart');
      dispatch({ type: 'SET_CART', payload: res.data });
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Add to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const res = await axios.post('/api/cart/add', { productId, quantity });
      dispatch({ type: 'ADD_TO_CART', payload: res.data });
      toast.success('Item added to cart!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
    }
  };

  // Update quantity
  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await axios.put(`/api/cart/${itemId}`, { quantity });
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
      toast.success('Quantity updated!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update quantity';
      toast.error(message);
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`/api/cart/${itemId}`);
      dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
      toast.success('Item removed from cart!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await axios.delete('/api/cart');
      dispatch({ type: 'CLEAR_CART' });
      toast.success('Cart cleared!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
    }
  };

  // Get cart count
  const getCartCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]);

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartCount,
      loadCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};