import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { ArrowRight, Star, Clock, Truck, Zap, Shield, Smartphone } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get('/api/products?limit=6');
        setFeaturedProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const heroSlides = [
    {
      title: "Delicious Pizza",
      subtitle: "Order Online",
      description: "Fresh ingredients, authentic flavors, delivered hot to your door",
      image: "/images/home-img-1.png",
      bgColor: "from-orange-600 via-red-600 to-red-700",
      accentColor: "from-yellow-400 to-orange-500"
    },
    {
      title: "Cheesy Hamburger",
      subtitle: "Order Online",
      description: "Juicy beef patties with premium cheese and fresh vegetables",
      image: "/images/home-img-2.png",
      bgColor: "from-amber-600 via-orange-600 to-red-600",
      accentColor: "from-yellow-400 to-amber-500"
    },
    {
      title: "Roasted Chicken",
      subtitle: "Order Online",
      description: "Perfectly seasoned and roasted to golden perfection",
      image: "/images/home-img-3.png",
      bgColor: "from-emerald-600 via-green-600 to-teal-700",
      accentColor: "from-lime-400 to-emerald-500"
    }
  ];

  const categories = [
    {
      name: "Fast Food",
      image: "/images/cat-1.png",
      link: "/menu?category=fast food",
      color: "bg-red-100 hover:bg-red-200"
    },
    {
      name: "Main Dishes",
      image: "/images/cat-2.png",
      link: "/menu?category=main dish",
      color: "bg-green-100 hover:bg-green-200"
    },
    {
      name: "Drinks",
      image: "/images/cat-3.png",
      link: "/menu?category=drinks",
      color: "bg-blue-100 hover:bg-blue-200"
    },
    {
      name: "Desserts",
      image: "/images/cat-4.png",
      link: "/menu?category=desserts",
      color: "bg-purple-100 hover:bg-purple-200"
    }
  ];

  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Fast Delivery",
      description: "30 minutes or less delivery guarantee"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Quality Food",
      description: "Fresh ingredients and premium quality"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Free Delivery",
      description: "Free delivery on orders over $25"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          effect="fade"
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet !bg-white/50 !w-3 !h-3',
            bulletActiveClass: 'swiper-pagination-bullet-active !bg-white !scale-125'
          }}
          autoplay={{ delay: 5000 }}
          loop={true}
          className="h-full"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className={`h-full bg-gradient-to-br ${slide.bgColor} flex items-center relative overflow-hidden`}>
                {/* Animated background elements */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/5 to-white/10 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-white/5 to-white/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
                </div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: '50px 50px'
                }}></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-white space-y-6"
                  >
                    <div className={`inline-block bg-gradient-to-r ${slide.accentColor} px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg`}>
                      {slide.subtitle}
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
                      <span className="block">{slide.title.split(' ')[0]}</span>
                      <span className={`block bg-gradient-to-r ${slide.accentColor} bg-clip-text text-transparent`}>
                        {slide.title.split(' ').slice(1).join(' ')}
                      </span>
                    </h1>

                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 leading-relaxed max-w-lg">
                      {slide.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Link
                        to="/menu"
                        className={`group inline-flex items-center bg-gradient-to-r ${slide.accentColor} text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
                      >
                        <span>See Menu</span>
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 sm:flex sm:items-center sm:space-x-8 pt-6">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold">1000+</div>
                        <div className="text-xs sm:text-sm text-gray-300">Happy Customers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold">50+</div>
                        <div className="text-xs sm:text-sm text-gray-300">Menu Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold">4.9★</div>
                        <div className="text-xs sm:text-sm text-gray-300">Rating</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex justify-center relative"
                  >
                    {/* Floating elements around the image */}
                    <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-80 animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-80 animate-bounce" style={{animationDelay: '1s'}}></div>
                    <div className="absolute top-1/2 -right-8 w-12 h-12 bg-gradient-to-r from-red-400 to-pink-400 rounded-full opacity-80 animate-bounce" style={{animationDelay: '2s'}}></div>

                    {/* Main image with enhanced styling */}
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${slide.accentColor} rounded-3xl blur-2xl opacity-30 scale-110`}></div>
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="relative w-full max-w-lg h-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-sm font-medium">Scroll Down</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-primary-200/30 to-secondary-300/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-tr from-secondary-200/30 to-primary-300/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-800 to-primary-900 bg-clip-text text-transparent mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the perfect blend of quality, convenience, and exceptional service
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 relative overflow-hidden"
              >
                {/* Hover gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Floating icon background */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-slate-400/10 to-gray-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-600 to-gray-700 text-white rounded-2xl mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Food Categories</h2>
            <p className="text-xl text-gray-600">Explore our delicious food categories</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={category.link}
                  className={`block ${category.color} rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-20 h-20 mx-auto mb-4 object-contain"
                  />
                  <h3 className="text-xl font-semibold text-gray-800">{category.name}</h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Dishes</h2>
            <p className="text-xl text-gray-600">Try our newest and most popular dishes</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/menu"
              className="btn-primary inline-flex items-center"
            >
              View All Menu
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Guest Checkout Promotion Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-orange-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Professional icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center">
              <Zap className="w-10 h-10 text-primary-600" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Quick & Easy Ordering
            </h2>

            <p className="text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-600 leading-relaxed px-4">
              No account needed! Order your favorite food in seconds with our guest checkout.
              Your order is automatically confirmed and ready for preparation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 px-4">
              <Link
                to="/menu"
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white px-6 sm:px-8 py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 inline-flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                Start Ordering Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/track-order"
                className="w-full sm:w-auto border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white px-6 sm:px-8 py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 text-center"
              >
                Track Your Order
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Instant Confirmation</h3>
                <p className="text-gray-600 text-sm sm:text-base">Orders are automatically confirmed</p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">No Registration</h3>
                <p className="text-gray-600 text-sm sm:text-base">Order without creating an account</p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">Easy Tracking</h3>
                <p className="text-gray-600 text-sm sm:text-base">Track with just Order ID + Email</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;