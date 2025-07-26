import { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      const params = filter ? `?isRead=${filter}` : '';
      const response = await axios.get(`/api/messages${params}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await axios.put(`/api/messages/${messageId}/read`);
      toast.success('Message marked as read!');
      fetchMessages();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark message as read';
      toast.error(message);
    }
  };

  const deleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await axios.delete(`/api/messages/${messageId}`);
        toast.success('Message deleted successfully!');
        fetchMessages();
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete message';
        toast.error(message);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

          {/* Filter */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Messages</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No messages found</h2>
                <p className="text-gray-600">Customer messages will appear here.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-white rounded-xl shadow-lg p-6 ${!message.isRead ? 'border-l-4 border-primary-500' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      {message.isRead ? (
                        <MailOpen className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Mail className="w-5 h-5 text-primary-500" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{message.name}</h3>
                        <p className="text-sm text-gray-500">{message.email}</p>
                        <p className="text-sm text-gray-500">{message.number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                      {!message.isRead && (
                        <span className="inline-block bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium mt-1">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700">{message.message}</p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    {!message.isRead && (
                      <button
                        onClick={() => markAsRead(message._id)}
                        className="btn-outline text-sm"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(message._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Messages;