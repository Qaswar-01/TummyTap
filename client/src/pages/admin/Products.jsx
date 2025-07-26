import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: null
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('description', formData.description);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      await axios.post('/api/products', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product added successfully!');
      setShowAddModal(false);
      setFormData({ name: '', category: '', price: '', description: '', image: null });
      fetchProducts();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add product';
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/api/products/${id}`);
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete product';
        toast.error(message);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description || '',
      image: null
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('description', formData.description);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      await axios.put(`/api/products/${editingProduct._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Product updated successfully!');
      setShowEditModal(false);
      setEditingProduct(null);
      setFormData({ name: '', category: '', price: '', description: '', image: null });
      fetchProducts();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update product';
      toast.error(message);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setFormData({ name: '', category: '', price: '', description: '', image: null });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-6 lg:space-y-0">
            <div className="relative">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Products Management
              </h1>
              <p className="text-gray-600 mt-3 text-lg">Manage your restaurant's menu items and inventory</p>
              <div className="absolute -top-3 -left-3 w-24 h-24 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-xl"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white/20">
                <span className="text-sm text-gray-500">Total Products</span>
                <p className="font-bold text-green-600">{products.length}</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Product
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-white/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400"
                  />
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg">
                  <span className="font-semibold">{filteredProducts.length} Found</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
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
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <span className="text-2xl font-bold text-primary-500">${product.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 btn-outline text-sm py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </motion.div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold mb-4">Add New Product</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    maxLength="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    <option value="fast food">Fast Food</option>
                    <option value="main dish">Main Dish</option>
                    <option value="drinks">Drinks</option>
                    <option value="desserts">Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input-field resize-none"
                    rows="3"
                    maxLength="500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                    className="input-field"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Add Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold mb-4">Edit Product</h2>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="main dish">Main Dish</option>
                    <option value="fast food">Fast Food</option>
                    <option value="drinks">Drinks</option>
                    <option value="desserts">Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    className="input-field"
                  />
                  {editingProduct?.image && (
                    <p className="text-sm text-gray-500 mt-1">
                      Current image: {editingProduct.image}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Update Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Products;