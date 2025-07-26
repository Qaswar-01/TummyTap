# Guest Checkout API Documentation

## Overview
This API allows customers to place orders without creating an account. Orders are automatically confirmed and can be tracked using the order ID and email address.

## New Endpoints

### 1. Create Guest Order
**POST** `/api/orders/guest`

Creates a new order without requiring user authentication. The order is automatically confirmed.

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "number": "1234567890",
  "address": "123 Main St, City, State 12345",
  "paymentMethod": "cash on delivery",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    },
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 1
    }
  ]
}
```

#### Validation Rules
- `name`: Required, 1-50 characters
- `email`: Required, valid email format, max 50 characters
- `number`: Required, exactly 10 digits
- `address`: Required, 1-500 characters
- `paymentMethod`: Required, one of: "cash on delivery", "credit card", "paypal"
- `items`: Required array with at least 1 item
- `items[].productId`: Required, valid MongoDB ObjectId
- `items[].quantity`: Required, integer >= 1

#### Response (Success - 201)
```json
{
  "message": "Order placed successfully and automatically confirmed!",
  "order": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "John Doe",
    "email": "john@example.com",
    "number": "1234567890",
    "address": "123 Main St, City, State 12345",
    "paymentMethod": "cash on delivery",
    "items": [
      {
        "product": "507f1f77bcf86cd799439011",
        "name": "Margherita Pizza",
        "price": 12.99,
        "quantity": 2,
        "image": "/uploads/pizza.jpg"
      }
    ],
    "totalPrice": 25.98,
    "status": "confirmed",
    "paymentStatus": "pending",
    "isGuestOrder": true,
    "createdAt": "2025-01-26T10:30:00.000Z",
    "updatedAt": "2025-01-26T10:30:00.000Z"
  },
  "trackingInfo": {
    "orderId": "507f1f77bcf86cd799439013",
    "email": "john@example.com",
    "message": "Your order has been automatically confirmed. You can track it using your order ID and email."
  }
}
```

#### Response (Error - 400)
```json
{
  "errors": [
    {
      "msg": "Name is required",
      "param": "name",
      "location": "body"
    }
  ]
}
```

### 2. Track Guest Order
**GET** `/api/orders/track/:orderId?email=user@example.com`

Tracks an order using the order ID and email address. Works for both guest and registered user orders.

#### Parameters
- `orderId` (path): The MongoDB ObjectId of the order
- `email` (query): The email address used when placing the order

#### Response (Success - 200)
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "John Doe",
  "email": "john@example.com",
  "number": "1234567890",
  "address": "123 Main St, City, State 12345",
  "paymentMethod": "cash on delivery",
  "items": [
    {
      "product": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Margherita Pizza",
        "price": 12.99,
        "image": "/uploads/pizza.jpg",
        "category": "Pizza"
      },
      "name": "Margherita Pizza",
      "price": 12.99,
      "quantity": 2,
      "image": "/uploads/pizza.jpg"
    }
  ],
  "totalPrice": 25.98,
  "status": "confirmed",
  "paymentStatus": "pending",
  "isGuestOrder": true,
  "createdAt": "2025-01-26T10:30:00.000Z",
  "updatedAt": "2025-01-26T10:30:00.000Z"
}
```

#### Response (Error - 404)
```json
{
  "message": "Order not found or email does not match"
}
```

## Modified Endpoints

### Admin: Get All Orders
**GET** `/api/orders` (Admin only)

The response now includes customer information for both guest and registered users:

#### Response Format
```json
{
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@example.com",
      "isGuestOrder": true,
      "status": "confirmed",
      "totalPrice": 25.98,
      "customerInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "number": "1234567890",
        "type": "guest"
      },
      "createdAt": "2025-01-26T10:30:00.000Z"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 1
}
```

### Admin: Update Order Status
**PUT** `/api/orders/:id/status` (Admin only)

The response now includes customer information for both guest and registered users.

## Database Changes

### Order Model Updates
- `user` field is now optional (not required for guest orders)
- Added `isGuestOrder` boolean field (default: false)
- Guest orders automatically get `status: "confirmed"`
- Payment status is set based on payment method

## Key Features

### 1. No Authentication Required
- Customers can place orders without creating accounts
- Only basic contact information is required

### 2. Automatic Confirmation
- Guest orders are automatically set to "confirmed" status
- No manual approval needed from admin

### 3. Order Tracking
- Customers can track orders using Order ID + Email
- Same tracking system works for both guest and registered users

### 4. Admin Management
- Admins can view and manage both guest and registered user orders
- Clear distinction between order types in admin interface

### 5. Payment Handling
- Cash on delivery: Payment status = "pending"
- Credit card/PayPal: Payment status = "completed"

## Usage Examples

### Frontend Integration
```javascript
// Place guest order
const placeGuestOrder = async (orderData) => {
  try {
    const response = await axios.post('/api/orders/guest', orderData);
    console.log('Order placed:', response.data);
    return response.data;
  } catch (error) {
    console.error('Order failed:', error.response.data);
    throw error;
  }
};

// Track order
const trackOrder = async (orderId, email) => {
  try {
    const response = await axios.get(`/api/orders/track/${orderId}?email=${email}`);
    return response.data;
  } catch (error) {
    console.error('Tracking failed:', error.response.data);
    throw error;
  }
};
```

### Sample Order Data
```javascript
const sampleOrder = {
  name: "Jane Smith",
  email: "jane@example.com",
  number: "9876543210",
  address: "456 Oak Ave, Downtown, State 54321",
  paymentMethod: "cash on delivery",
  items: [
    { productId: "507f1f77bcf86cd799439011", quantity: 1 },
    { productId: "507f1f77bcf86cd799439012", quantity: 3 }
  ]
};
```

## Security Considerations

1. **Rate Limiting**: Consider implementing rate limiting for guest orders
2. **Email Verification**: Optional email verification for order updates
3. **Order Limits**: Consider limiting the number of items per guest order
4. **Fraud Prevention**: Monitor for suspicious ordering patterns

## Testing

Use the provided React components (`GuestCheckout.jsx`, `GuestOrderTracking.jsx`) to test the functionality in your frontend application.