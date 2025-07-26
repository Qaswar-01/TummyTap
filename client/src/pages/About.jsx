import { motion } from 'framer-motion';
import { Users, Award, Clock, Heart } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Expert Chefs",
      description: "Our experienced chefs create delicious meals with passion and expertise."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Quality Ingredients",
      description: "We use only the freshest and highest quality ingredients in all our dishes."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Fast Delivery",
      description: "Quick and reliable delivery service to bring food fresh to your door."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Made with Love",
      description: "Every dish is prepared with care and attention to detail."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Yum-Yum</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're passionate about delivering delicious food and exceptional service to our customers. 
            Our journey started with a simple mission: to bring the best flavors to your doorstep.
          </p>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <img
            src="/images/about-img.svg"
            alt="About Us"
            className="w-full max-w-2xl mx-auto h-auto"
          />
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center p-6 bg-white rounded-xl shadow-lg"
            >
              <div className="text-primary-500 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8 lg:p-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2020, Yum-Yum started as a small family restaurant with a big dream: 
                  to share our love for authentic, delicious food with everyone in our community.
                </p>
                <p>
                  What began as a local favorite has grown into a trusted food delivery service, 
                  but we've never forgotten our roots. We still prepare every meal with the same 
                  care and attention to detail that made us who we are today.
                </p>
                <p>
                  Today, we're proud to serve thousands of happy customers, delivering not just food, 
                  but moments of joy and satisfaction to families and individuals across the city.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-500">1000+</div>
                  <div className="text-sm text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center p-4 bg-secondary-50 rounded-lg">
                  <div className="text-2xl font-bold text-secondary-500">50+</div>
                  <div className="text-sm text-gray-600">Menu Items</div>
                </div>
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-500">4.8★</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center p-4 bg-secondary-50 rounded-lg">
                  <div className="text-2xl font-bold text-secondary-500">24/7</div>
                  <div className="text-sm text-gray-600">Service</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;