# PostgreSQL Column Name Case Sensitivity Fix

## Problem Identified

When you deployed to Vercel, customer names and emails were showing as "undefined" because of **PostgreSQL's case sensitivity with column names**.

### Root Cause

PostgreSQL automatically converts unquoted column names to lowercase:
- `customerName` → `customername`
- `customerEmail` → `customeremail`
- `createdAt` → `createdat`
- `lastLogin` → `lastlogin`
- `userId` → `userid`
- `expiresAt` → `expiresat`
- `rememberMe` → `rememberme`

Your API code was trying to use camelCase column names, but PostgreSQL stored them as lowercase, causing mismatches.

## What Was Fixed

I've updated all the serverless API functions to use lowercase column names consistently:

### Files Updated:
1. ✅ `api/_db.js` - Database schema now uses lowercase column names
2. ✅ `api/orders/index.js` - GET/POST endpoints fixed
3. ✅ `api/orders/[id].js` - PUT/DELETE endpoints fixed
4. ✅ `api/orders/bulk.js` - Bulk import fixed
5. ✅ `api/users/index.js` - User GET/POST endpoints fixed
6. ✅ `api/auth/login.js` - Login session creation fixed
7. ✅ `api/auth/verify.js` - Session verification fixed

## What You Need to Do

### Option 1: Rebuild Database (Recommended for Clean Start)

If your Vercel Postgres database has existing data you want to keep, **back it up first**!

To rebuild with the correct schema:

1. Go to your Vercel Dashboard → Storage → Postgres
2. Connect to your database using the Vercel CLI or SQL editor
3. **Drop the existing tables** (⚠️ This will delete all data):
   ```sql
   DROP TABLE IF EXISTS sessions;
   DROP TABLE IF EXISTS orders;
   DROP TABLE IF EXISTS users;
   ```

4. Redeploy your project - the database will auto-initialize with correct schema

### Option 2: Migrate Existing Database

If you have important data, run these SQL commands on your Vercel Postgres database:

```sql
-- Rename columns in orders table
ALTER TABLE orders RENAME COLUMN customerName TO customername;
ALTER TABLE orders RENAME COLUMN customerEmail TO customeremail;
ALTER TABLE orders RENAME COLUMN createdAt TO createdat;

-- Rename columns in users table
ALTER TABLE users RENAME COLUMN lastLogin TO lastlogin;
ALTER TABLE users RENAME COLUMN createdAt TO createdat;

-- Rename columns in sessions table
ALTER TABLE sessions RENAME COLUMN userId TO userid;
ALTER TABLE sessions RENAME COLUMN expiresAt TO expiresat;
ALTER TABLE sessions RENAME COLUMN rememberMe TO rememberme;
ALTER TABLE sessions RENAME COLUMN createdAt TO createdat;
```

**Note**: If the columns are already lowercase (PostgreSQL auto-converted them), you may get errors. That's OK - the important thing is that your new API code now matches the actual column names.

## Deploy the Changes

1. Commit the changes:
   ```bash
   git add .
   git commit -m "Fix PostgreSQL column name case sensitivity for Vercel deployment"
   git push
   ```

2. Vercel will automatically redeploy

3. Test adding/editing a customer order - the names and emails should now save correctly!

## Why This Happened

- **Localhost**: You used SQLite (via `better-sqlite3`), which is case-insensitive with column names
- **Vercel**: Uses PostgreSQL, which is case-sensitive and converts unquoted identifiers to lowercase
- The mismatch only appeared in production because of the different database systems

## Testing

After deployment, verify:
1. ✅ Can create new orders with customer name/email
2. ✅ Can edit existing orders
3. ✅ Customer information displays correctly
4. ✅ User management works
5. ✅ Login/logout functions properly

---

**Last Updated**: October 25, 2025

