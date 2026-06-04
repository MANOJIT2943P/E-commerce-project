/**
 * Script to identify and remove problematic TTL indexes
 * 
 * ISSUE: TTL indexes on nested array fields cause entire documents to be deleted
 * SOLUTION: This script finds and removes such indexes
 * 
 * Usage: node scripts/fixTTLIndex.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const fixTTLIndex = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('📋 Current indexes on users collection:\n');
    const indexes = await usersCollection.getIndexes();
    
    Object.entries(indexes).forEach(([name, spec]) => {
      console.log(`  Index: ${name}`);
      console.log(`    Keys: ${JSON.stringify(spec.key)}`);
      if (spec.expireAfterSeconds) {
        console.log(`    ⚠️  TTL: ${spec.expireAfterSeconds} seconds (${Math.round(spec.expireAfterSeconds / 86400)} days)`);
      }
      console.log();
    });
    
    // Find problematic TTL indexes (TTL on nested array fields)
    const problematicIndexes = Object.entries(indexes).filter(
      ([name, spec]) => {
        const hasRefreshTokensCreabledAt = 
          spec.key && 
          (spec.key['refreshTokens.createdAt'] || 
           Object.keys(spec.key).some(k => k.includes('refreshTokens')));
        const hasTTL = spec.expireAfterSeconds > 0;
        return hasRefreshTokensCreabledAt && hasTTL;
      }
    );
    
    if (problematicIndexes.length === 0) {
      console.log('✅ No problematic TTL indexes found! Your data is safe.\n');
      process.exit(0);
    }
    
    console.log(`\n❌ FOUND ${problematicIndexes.length} PROBLEMATIC TTL INDEX(ES):\n`);
    
    for (const [indexName, spec] of problematicIndexes) {
      console.log(`  ⚠️  Index: ${indexName}`);
      console.log(`      Keys: ${JSON.stringify(spec.key)}`);
      console.log(`      Expiration: ${spec.expireAfterSeconds} seconds`);
      console.log(`      ⚠️  DANGER: This deletes ENTIRE USER DOCUMENTS after expiration!\n`);
      
      // Drop the index
      try {
        await usersCollection.dropIndex(indexName);
        console.log(`      ✅ DROPPED successfully\n`);
      } catch (error) {
        console.error(`      ❌ Failed to drop: ${error.message}\n`);
      }
    }
    
    console.log('📋 Indexes after cleanup:\n');
    const newIndexes = await usersCollection.getIndexes();
    Object.entries(newIndexes).forEach(([name, spec]) => {
      console.log(`  Index: ${name}`);
      console.log(`    Keys: ${JSON.stringify(spec.key)}`);
      if (spec.expireAfterSeconds) {
        console.log(`    TTL: ${spec.expireAfterSeconds} seconds`);
      }
      console.log();
    });
    
    console.log('✅ TTL index cleanup complete!\n');
    console.log('📝 Summary:');
    console.log(`   - Problematic indexes removed: ${problematicIndexes.length}`);
    console.log('   - Admin accounts are now safe from automatic deletion');
    console.log('   - Restart your application to complete the fix\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during TTL index cleanup:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

fixTTLIndex();
