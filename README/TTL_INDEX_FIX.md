# TTL Index Bug Fix & Recovery Guide

## Problem Summary

**Root Cause:** A TTL (Time To Live) index was incorrectly set on the `refreshTokens.createdAt` nested field with a 7-day expiration (604800 seconds). This caused MongoDB to **delete entire User documents after 7 days**, including admin accounts!

**Impact:** Admin users (and any users) were mysteriously disappearing after 7 days.

## Fix Applied

✅ Removed the problematic `expires: 604800` from `refreshTokens.createdAt` in `models/User.js`

✅ Added manual token cleanup method `cleanupExpiredTokens()` for safe management

## Critical Next Steps: Remove Existing TTL Indexes

If the application has been running with this bug, MongoDB may have created a TTL index that's still active. **You must remove it** to prevent further data loss.

### Option 1: MongoDB Atlas UI (Recommended if available)

1. Go to MongoDB Atlas Dashboard
2. Select your cluster → Collections
3. Find the `users` collection
4. Go to Indexes tab
5. Look for any index with `refreshTokens.createdAt` field
6. Click the trash icon to delete it

### Option 2: MongoDB Shell / mongosh

Connect to your database and run:

```javascript
// Connect to your database
use your_database_name

// List all indexes on users collection
db.users.getIndexes()

// Look for index with refreshTokens.createdAt
// It will look something like:
// {
//   "v" : 2,
//   "key" : { "refreshTokens.createdAt" : 1 },
//   "expireAfterSeconds" : 604800
// }

// Delete the problematic TTL index by name
// (replace "refreshTokens.createdAt_1" with the actual index name from above)
db.users.dropIndex("refreshTokens.createdAt_1")

// Verify it's gone
db.users.getIndexes()
```

### Option 3: Mongoose/Node.js Script

Create a script `scripts/fixTTLIndex.js`:

```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixTTLIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('📋 Current indexes:');
    const indexes = await usersCollection.getIndexes();
    console.log(indexes);
    
    // Find and drop the problematic TTL index
    const problematicIndex = Object.entries(indexes).find(
      ([name, spec]) => spec.key && spec.key['refreshTokens.createdAt'] && spec.expireAfterSeconds
    );
    
    if (problematicIndex) {
      console.log(`\n❌ Found problematic TTL index: ${problematicIndex[0]}`);
      console.log(`   Expiration: ${problematicIndex[1].expireAfterSeconds} seconds`);
      
      await usersCollection.dropIndex(problematicIndex[0]);
      console.log(`✅ Dropped TTL index successfully!`);
    } else {
      console.log('✅ No problematic TTL index found - all good!');
    }
    
    console.log('\n📋 Indexes after cleanup:');
    const newIndexes = await usersCollection.getIndexes();
    console.log(newIndexes);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixTTLIndex();
```

Run it: `node scripts/fixTTLIndex.js`

## Verification Steps

After removing the TTL index, verify the fix:

### 1. Check MongoDB Indexes
```javascript
// In mongosh
db.users.getIndexes()
// Should NOT show any index with refreshTokens.createdAt and expireAfterSeconds
```

### 2. Test Admin Account Persistence
1. Create a test admin account (or recheck existing one)
2. Wait a few hours/days
3. Query the database to confirm admin still exists
4. Try logging in as admin

### 3. Check Application Logs
Monitor server logs for any errors related to indexes or TTL

## Prevention for Future Deploys

1. **Never use `expires` on nested array fields** - only use it on document-level Date fields
2. **Use the new `cleanupExpiredTokens()` method** when you need to manage old tokens manually
3. **Add to your deployment checklist**: "Verify no invalid TTL indexes on users collection"

## Data Recovery

If admin accounts were already deleted:

1. Check your database backups (if available)
2. Restore from backup
3. Or recreate admin accounts: `node scripts/seedAdminUser.js`

## Code Changes Made

**File:** `unified-backend/models/User.js`

❌ **Removed:**
```javascript
createdAt: {
  type: Date,
  default: Date.now,
  expires: 604800 // DANGEROUS: Deletes entire user after 7 days!
}
```

✅ **Replaced with:**
```javascript
createdAt: {
  type: Date,
  default: Date.now
}
```

✅ **Added new method:**
```javascript
userSchema.methods.cleanupExpiredTokens = async function () {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  this.refreshTokens = this.refreshTokens.filter(
    (rt) => rt.createdAt > sevenDaysAgo
  );
  await this.save();
};
```

## Questions?

- Check if other User-like documents have similar issues
- Search your codebase for other `expires:` fields to ensure they're only on document-level fields
- Test thoroughly in development before deploying to production

---

**Status:** ✅ Fixed and Ready for Deployment
**Created:** June 4, 2026
