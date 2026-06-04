# 🚨 CRITICAL: Admin Deletion Bug - Immediate Action Required

## What Happened?

Your admin users (and potentially other users) were being **automatically deleted after 7 days** due to a misconfigured TTL (Time To Live) index in the database.

**Status:** ✅ **CODE FIX COMPLETED** - See changes made below

**Status:** ⚠️ **DATABASE FIX PENDING** - You must run the cleanup script

---

## Immediate Action Items

### Step 1: Run the TTL Index Cleanup Script (REQUIRED)

This script will identify and remove the dangerous TTL index from your database.

```bash
# From project root
cd unified-backend
node scripts/fixTTLIndex.js
```

**Expected Output:**
```
✅ FOUND 1 PROBLEMATIC TTL INDEX(ES):
   ⚠️ Index: refreshTokens.createdAt_1
      Expiration: 604800 seconds (7 days)
      ⚠️ DANGER: This deletes ENTIRE USER DOCUMENTS after expiration!
   ✅ DROPPED successfully
```

### Step 2: Verify the Fix

```bash
# Check if your admin accounts still exist
mongosh  # or mongo

use your_database_name
db.users.find({ role: "ADMIN" })

# You should see your admin accounts listed
```

### Step 3: Restart Your Application

```bash
# Kill current server (Ctrl+C)
# Then restart
npm start
```

### Step 4: Test Admin Login

1. Try logging in as admin
2. Verify admin functionality works
3. Monitor logs for any errors

---

## What Changed in the Code

### File: `unified-backend/models/User.js`

#### ❌ BEFORE (Dangerous):
```javascript
refreshTokens: [
  {
    token: { type: String, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800  // ❌ DELETES ENTIRE USER AFTER 7 DAYS!
    }
  }
]
```

#### ✅ AFTER (Fixed):
```javascript
refreshTokens: [
  {
    token: { type: String, required: true },
    createdAt: {
      type: Date,
      default: Date.now
      // ✅ No TTL - safe!
    }
  }
]

// New method for manual token cleanup (optional):
userSchema.methods.cleanupExpiredTokens = async function () {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  this.refreshTokens = this.refreshTokens.filter(
    (rt) => rt.createdAt > sevenDaysAgo
  );
  await this.save();
};
```

---

## If Admin Accounts Were Already Deleted

If your admin accounts were already deleted, you have options:

### Option A: Restore from Backup (Best)
If your MongoDB has automatic backups enabled:
1. Contact your database provider or restore from backup
2. The fix is already applied to your code

### Option B: Recreate Admin Accounts
```bash
cd unified-backend

# Edit .env to set admin credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123

# Run seed script
node scripts/seedAdminUser.js
```

### Option C: Create via API (if you have user registration)
1. Register a new user account
2. Use MongoDB directly to change role to ADMIN:
```bash
mongosh
use your_database_name
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

---

## Root Cause Analysis

### Why This Happened

The `expires` property in Mongoose is meant for **document-level** TTL indexes, not nested array fields. MongoDB interpreted this as: "Delete this entire User document 7 days after any refresh token is created."

Every time someone logged in or refreshed their token, it would reset the 7-day timer. Eventually, when no login happened for 7 days (a realistic scenario for some admins), the entire User document would be deleted.

### Why It's Fixed Now

1. **Removed the dangerous TTL setting** from the nested field
2. **Added a safe cleanup method** for manual token management if needed
3. **Created automated detection script** to prevent this in other environments

---

## Long-term Prevention

### Update Your Development Standards:

**✅ CORRECT (Document-level TTL):**
```javascript
const schemaSchema = new mongoose.Schema({
  tokenExpiration: {
    type: Date,
    expires: 3600  // ✅ OK: deletes document if expires
  }
});
```

**❌ INCORRECT (Nested field TTL):**
```javascript
const schemaSchema = new mongoose.Schema({
  tokens: [
    {
      createdAt: {
        type: Date,
        expires: 3600  // ❌ DANGEROUS: can delete entire parent doc!
      }
    }
  ]
});
```

---

## Checklist

- [ ] Run the cleanup script: `node scripts/fixTTLIndex.js`
- [ ] Verify no errors in output
- [ ] Check that admin accounts exist in database
- [ ] Restart your backend application
- [ ] Test admin login
- [ ] Check application logs for any issues
- [ ] If deleted: Recreate admin accounts or restore from backup
- [ ] Deploy to production
- [ ] Monitor for 7+ days to ensure no more deletions

---

## Support & Verification

**Need to verify this was the issue?** Check MongoDB connection logs:
- A "document expired" message would indicate TTL deletion
- Look in your database audit logs if available

**Questions?**
- See detailed guide: `README/TTL_INDEX_FIX.md`
- Review the cleanup script: `unified-backend/scripts/fixTTLIndex.js`

---

## Timeline

- **When**: Every ~7 days
- **What**: Entire admin user document deleted
- **Why**: Misconfigured TTL on nested refresh token timestamp
- **Fixed**: ✅ Code changed, script created
- **Next**: ⚠️ Run cleanup script to fix database

---

**This is a critical issue that's now resolved. Please run the cleanup script immediately to prevent further data loss.**

Last Updated: June 4, 2026
