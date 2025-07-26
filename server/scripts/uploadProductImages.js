const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food_website');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Category mapping from folder names to database categories
const categoryMapping = {
  'fast_food': 'fast food',
  'main_dishes': 'main dish',
  'drinks': 'drinks',
  'desserts': 'desserts'
};

// Product name mapping for better display names
const productNameMapping = {
  'burger': 'Classic Burger',
  'fries': 'French Fries',
  'hot_dog': 'Hot Dog',
  'nuggets': 'Chicken Nuggets',
  'pizza': 'Margherita Pizza',
  'biryani': 'Chicken Biryani',
  'grilled_chicken': 'Grilled Chicken',
  'lasagna': 'Beef Lasagna',
  'pasta': 'Spaghetti Pasta',
  'steak': 'Grilled Steak',
  'cake': 'Chocolate Cake',
  'cookies': 'Chocolate Chip Cookies',
  'cupcake': 'Vanilla Cupcake',
  'donut': 'Glazed Donut',
  'ice_cream': 'Vanilla Ice Cream',
  'cola': 'Cola Drink',
  'iced_tea': 'Iced Tea',
  'lemonade': 'Fresh Lemonade',
  'milkshake': 'Chocolate Milkshake',
  'orange_juice': 'Fresh Orange Juice'
};

// Price mapping for different products
const priceMapping = {
  'burger': 12.99,
  'fries': 4.99,
  'hot_dog': 8.99,
  'nuggets': 9.99,
  'pizza': 15.99,
  'biryani': 18.99,
  'grilled_chicken': 16.99,
  'lasagna': 14.99,
  'pasta': 13.99,
  'steak': 24.99,
  'cake': 6.99,
  'cookies': 3.99,
  'cupcake': 2.99,
  'donut': 1.99,
  'ice_cream': 4.99,
  'cola': 2.99,
  'iced_tea': 3.49,
  'lemonade': 3.99,
  'milkshake': 5.99,
  'orange_juice': 4.49
};

// Description mapping for products
const descriptionMapping = {
  'burger': 'Juicy beef patty with fresh lettuce, tomato, and our special sauce',
  'fries': 'Crispy golden french fries seasoned to perfection',
  'hot_dog': 'All-beef hot dog with your choice of toppings',
  'nuggets': 'Tender chicken nuggets with crispy coating',
  'pizza': 'Classic margherita pizza with fresh mozzarella and basil',
  'biryani': 'Aromatic basmati rice with tender chicken and exotic spices',
  'grilled_chicken': 'Perfectly grilled chicken breast with herbs and spices',
  'lasagna': 'Layers of pasta with rich meat sauce and melted cheese',
  'pasta': 'Al dente spaghetti with our signature tomato sauce',
  'steak': 'Premium cut steak grilled to your preference',
  'cake': 'Rich and moist chocolate cake with chocolate frosting',
  'cookies': 'Freshly baked chocolate chip cookies',
  'cupcake': 'Fluffy vanilla cupcake with buttercream frosting',
  'donut': 'Classic glazed donut, fresh and sweet',
  'ice_cream': 'Creamy vanilla ice cream made with real vanilla beans',
  'cola': 'Refreshing cola drink served ice cold',
  'iced_tea': 'Refreshing iced tea with a hint of lemon',
  'lemonade': 'Fresh squeezed lemonade, perfectly sweet and tart',
  'milkshake': 'Thick and creamy chocolate milkshake',
  'orange_juice': 'Fresh squeezed orange juice, no pulp'
};

const copyImageToUploads = (sourcePath, filename) => {
  const uploadsDir = path.join(__dirname, '../uploads');
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const destinationPath = path.join(uploadsDir, filename);
  
  try {
    fs.copyFileSync(sourcePath, destinationPath);
    return filename;
  } catch (error) {
    console.error(`Error copying file ${sourcePath}:`, error);
    return null;
  }
};

const uploadProductImages = async () => {
  try {
    await connectDB();
    
    const foodImagesPath = path.join(__dirname, '../../client/public/food_images');
    
    if (!fs.existsSync(foodImagesPath)) {
      console.error('Food images directory not found:', foodImagesPath);
      return;
    }
    
    const categories = fs.readdirSync(foodImagesPath);
    let totalProducts = 0;
    
    for (const categoryFolder of categories) {
      const categoryPath = path.join(foodImagesPath, categoryFolder);
      
      if (!fs.statSync(categoryPath).isDirectory()) continue;
      
      const dbCategory = categoryMapping[categoryFolder];
      if (!dbCategory) {
        console.log(`Skipping unknown category: ${categoryFolder}`);
        continue;
      }
      
      console.log(`\nProcessing category: ${categoryFolder} -> ${dbCategory}`);
      
      const productFolders = fs.readdirSync(categoryPath);
      
      for (const productFolder of productFolders) {
        const productPath = path.join(categoryPath, productFolder);
        
        if (!fs.statSync(productPath).isDirectory()) continue;
        
        const productName = productNameMapping[productFolder] || productFolder;
        const price = priceMapping[productFolder] || 9.99;
        const description = descriptionMapping[productFolder] || `Delicious ${productName}`;
        
        // Check if product already exists
        const existingProduct = await Product.findOne({ name: productName });
        if (existingProduct) {
          console.log(`Product already exists: ${productName}`);
          continue;
        }
        
        // Get the first image from the product folder
        const imageFiles = fs.readdirSync(productPath).filter(file => 
          file.toLowerCase().endsWith('.jpg') || 
          file.toLowerCase().endsWith('.jpeg') || 
          file.toLowerCase().endsWith('.png')
        );
        
        if (imageFiles.length === 0) {
          console.log(`No images found for ${productName}`);
          continue;
        }
        
        // Use the first image
        const imageFile = imageFiles[0];
        const imagePath = path.join(productPath, imageFile);
        
        // Generate unique filename
        const timestamp = Date.now();
        const extension = path.extname(imageFile);
        const newFilename = `product-${timestamp}-${Math.round(Math.random() * 1E9)}${extension}`;
        
        // Copy image to uploads directory
        const copiedFilename = copyImageToUploads(imagePath, newFilename);
        
        if (!copiedFilename) {
          console.log(`Failed to copy image for ${productName}`);
          continue;
        }
        
        // Create product in database
        const product = new Product({
          name: productName,
          category: dbCategory,
          price: price,
          image: copiedFilename,
          description: description
        });
        
        await product.save();
        totalProducts++;
        
        console.log(`✓ Created product: ${productName} (${dbCategory}) - $${price}`);
      }
    }
    
    console.log(`\n🎉 Successfully uploaded ${totalProducts} products!`);
    
  } catch (error) {
    console.error('Error uploading product images:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
if (require.main === module) {
  uploadProductImages();
}

module.exports = uploadProductImages;
