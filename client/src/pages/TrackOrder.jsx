import { motion } from 'framer-motion';
import GuestOrderTracking from '../components/GuestOrderTracking';

const TrackOrder = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-xl text-gray-600">Enter your order details to check the status</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GuestOrderTracking />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 bg-white rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold mb-4">How to track your order:</h3>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
              <p>Enter your Order ID (received after placing the order)</p>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
              <p>Enter the email address you used when placing the order</p>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
              <p>Click "Track Order" to view your order status and details</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrackOrder;