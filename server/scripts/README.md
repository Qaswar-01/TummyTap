# Product Image Upload Script

This script automatically uploads product images from the `client/public/food_images` directory to the database with appropriate categorization.

## Directory Structure Expected

The script expects the following directory structure:

```
client/public/food_images/
├── fast_food/
│   ├── burger/
│   │   ├── 000001.jpg
│   │   ├── 000002.jpg
│   │   └── ...
│   ├── fries/
│   ├── hot_dog/
│   ├── nuggets/
│   └── pizza/
├── main_dishes/
│   ├── biryani/
│   ├── grilled_chicken/
│   ├── lasagna/
│   ├── pasta/
│   └── steak/
├── drinks/
│   ├── cola/
│   ├── iced_tea/
│   ├── lemonade/
│   ├── milkshake/
│   └── orange_juice/
└── desserts/
    ├── cake/
    ├── cookies/
    ├── cupcake/
    ├── donut/
    └── ice_cream/
```

## How to Run

### Method 1: Using npm script (Recommended)
```bash
cd server
npm run upload-products
```

### Method 2: Direct execution
```bash
cd server
node scripts/uploadProductImages.js
```

## What the Script Does

1. **Reads the food_images directory structure**
2. **Maps folder names to database categories:**
   - `fast_food` → `fast food`
   - `main_dishes` → `main dish`
   - `drinks` → `drinks`
   - `desserts` → `desserts`

3. **Creates products with:**
   - Proper display names (e.g., `burger` → `Classic Burger`)
   - Realistic prices
   - Descriptive text
   - Category assignment

4. **Copies images to server uploads directory**
5. **Saves product data to MongoDB**

## Features

- **Duplicate Prevention**: Skips products that already exist in the database
- **Image Processing**: Copies the first image from each product folder to the server's uploads directory
- **Automatic Naming**: Generates unique filenames for uploaded images
- **Error Handling**: Continues processing even if individual items fail
- **Progress Reporting**: Shows detailed progress and results

## Prerequisites

- MongoDB connection configured in `.env` file
- Node.js and npm installed
- Product model properly set up in the database

## Output

The script will output:
- Progress for each category and product
- Success/failure messages
- Total count of products uploaded
- Any errors encountered

Example output:
```
Processing category: fast_food -> fast food
✓ Created product: Classic Burger (fast food) - $12.99
✓ Created product: French Fries (fast food) - $4.99
...

🎉 Successfully uploaded 20 products!
```

## Troubleshooting

- **MongoDB Connection Error**: Check your `.env` file and MongoDB connection
- **File Not Found**: Ensure the food_images directory exists in the correct location
- **Permission Errors**: Make sure the script has read access to source images and write access to uploads directory
- **Duplicate Products**: The script will skip products that already exist (based on name)
