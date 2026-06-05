/**
 * Product Seeding Script - From JSON File
 * Reads products from Products.json and seeds them into MongoDB
 * 
 * Usage: node scripts/seedProducts.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

dotenv.config();

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📍 Database: ${mongoose.connection.name}\n`);

    // Read Products.json file
    const productsFilePath = path.join(__dirname, '../../Products.json');
    
    if (!fs.existsSync(productsFilePath)) {
      throw new Error(`Products.json not found at ${productsFilePath}`);
    }

    const rawData = fs.readFileSync(productsFilePath, 'utf-8');
    const jsonProducts = JSON.parse(rawData);
    
    console.log(`📄 Loaded ${jsonProducts.length} products from Products.json\n`);

    // Transform JSON data to match Product model schema
    const productsToSeed = jsonProducts.map((product, index) => ({
      name: product.name || `Product ${index + 1}`,
      description: Array.isArray(product.description) 
        ? product.description.join(' | ') 
        : product.description || '',
      price: parseFloat(product.original_price) || 0,
      category: product['product type'] || 'Uncategorized',
      brand: extractBrand(product.name),
      stock: 20, // Default stock
      minStockLevel: 5,
      images: [],
      imageUrl: null,
      metadata: {
        u_id: product.u_id,
        rating: product.rating || 0,
        total_ratings: product.total_ratings || 0,
        total_reviews: product.total_reviews || 0
      }
    }));

    // Clear existing products
    const deleteResult = await Product.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing products\n`);

    // Insert products in batches to avoid memory issues
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < productsToSeed.length; i += batchSize) {
      const batch = productsToSeed.slice(i, i + batchSize);
      const result = await Product.insertMany(batch, { ordered: false }).catch(err => {
        // Log but continue on duplicate or other errors
        console.warn(`⚠️  Some products in batch ${Math.floor(i / batchSize) + 1} failed to insert (likely duplicates)`);
        return batch; // Return batch for count
      });
      insertedCount += batch.length;
      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} processed (${Math.min(i + batchSize, productsToSeed.length)} / ${productsToSeed.length})`);
    }

    // Get final count from database
    const finalCount = await Product.countDocuments();
    console.log(`\n✨ Seeding completed!`);
    console.log(`📊 Total products in database: ${finalCount}\n`);

    // Display summary by category
    const categorySummary = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          maxPrice: { $max: '$price' },
          minPrice: { $min: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('📈 Products by Category:');
    categorySummary.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} products (avg: $${cat.avgPrice.toFixed(2)}, range: $${cat.minPrice.toFixed(2)} - $${cat.maxPrice.toFixed(2)})`);
    });

    // Calculate total inventory value
    const inventoryStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          totalItems: { $sum: '$stock' },
          avgPrice: { $avg: '$price' }
        }
      }
    ]);

    if (inventoryStats.length > 0) {
      const stats = inventoryStats[0];
      console.log(`\n💰 Inventory Statistics:`);
      console.log(`   Total Value: $${stats.totalValue.toFixed(2)}`);
      console.log(`   Total Items in Stock: ${stats.totalItems}`);
      console.log(`   Average Price: $${stats.avgPrice.toFixed(2)}`);
    }

    console.log('\n🎉 Database seeding successful!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

/**
 * Extract brand name from product name
 * Usually the first word or known brand indicators
 */
function extractBrand(productName) {
  const brands = ['APPLE', 'SAMSUNG', 'SONY', 'HP', 'DELL', 'ASUS', 'LG', 'LENOVO', 'ACER', 'VU'];
  const upperName = productName.toUpperCase();
  
  for (const brand of brands) {
    if (upperName.includes(brand)) {
      return brand;
    }
  }
  
  // Default: first word
  return productName.split(' ')[0];
}

// Run the seeding function
seedDatabase();
