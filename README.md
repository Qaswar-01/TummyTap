# Yum-Yum Food Ordering App 🍕

A modern, full-stack food ordering application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring a beautiful UI/UX design with Tailwind CSS.

## ✨ Features

### User Features
- 🔐 User authentication (register/login)
- 🍽️ Browse food menu with categories
- 🛒 Shopping cart functionality
- 📦 Order placement and tracking
- 👤 User profile management
- 📞 Contact form
- 🔍 Search and filter products
- 📱 Responsive design

### Admin Features
- 📊 Admin dashboard with analytics
- 🍕 Product management (CRUD operations)
- 📋 Order management and status updates
- 👥 User management
- 💬 Message management
- 📈 Sales analytics

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Swiper** - Carousel/slider
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **CORS** - Cross-origin requests

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd food-ordering-app
   ```

2. **Install dependencies for all packages**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   **Server (.env in /server folder):**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/food_ordering_db
   JWT_SECRET=your_jwt_secret_key_here_make_it_strong
   NODE_ENV=development
   ```

   **Client (.env in /client folder):**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Run both frontend and backend concurrently
   npm run dev
   
   # Or run them separately:
   # Backend only
   npm run server
   
   # Frontend only
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
food-ordering-app/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   │   └── admin/     # Admin pages
│   │   ├── utils/         # Utility functions
│   │   └── ...
│   └── ...
├── server/                # Node.js backend
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── uploads/          # File uploads directory
│   └── server.js         # Entry point
├── images/               # Static images
└── ...
```

## 🔑 Default Admin Account

To create an admin account, you can either:

1. **Register normally and manually update the database:**
   - Register a new account
   - In MongoDB, update the user document: `{ isAdmin: true }`

2. **Use the demo credentials (if seeded):**
   - Email: admin@demo.com
   - Password: admin123

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders` - Get all orders (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages` - Get all messages (Admin)
- `PUT /api/messages/:id/read` - Mark as read (Admin)
- `DELETE /api/messages/:id` - Delete message (Admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/analytics` - Sales analytics

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme**: Beautiful color schemes with Tailwind CSS
- **Interactive Elements**: Hover effects, loading states, and micro-interactions
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Optimized images and lazy loading

## 🔧 Development

### Available Scripts

```bash
# Install all dependencies
npm run install-all

# Run development servers
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client

# Build for production
cd client && npm run build
```

### Adding New Features

1. **Backend**: Add routes in `/server/routes/`, models in `/server/models/`
2. **Frontend**: Add components in `/client/src/components/`, pages in `/client/src/pages/`
3. **Styling**: Use Tailwind CSS classes, custom styles in `/client/src/index.css`

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use your preferred MongoDB hosting
2. Deploy to Heroku, Railway, or your preferred platform
3. Set environment variables in production

### Frontend Deployment
1. Build the React app: `cd client && npm run build`
2. Deploy to Netlify, Vercel, or your preferred platform
3. Update API URL in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Images from various sources (replace with your own)
- Inspiration from modern food delivery apps

---

**Happy Coding! 🚀**

For any questions or issues, please open an issue in the repository.