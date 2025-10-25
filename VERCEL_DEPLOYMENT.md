# 🚀 Vercel Deployment Guide for Order CRM

This guide will walk you through deploying your Order CRM system to Vercel with Vercel Postgres database.

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
2. **Git Repository** - Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Node.js** - Installed locally for testing (optional)

## 🎯 Deployment Steps

### Step 1: Install Dependencies

First, update your project dependencies to include Vercel Postgres:

```bash
npm install
```

This will install:
- `@vercel/postgres` - Vercel's PostgreSQL database
- `@vercel/node` - Vercel serverless functions runtime

### Step 2: Push to Git Repository

If you haven't already, initialize a Git repository and push your code:

```bash
git init
git add .
git commit -m "Prepare for Vercel deployment"
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

**Note:** If you don't have a Git repository yet:
1. Go to GitHub.com
2. Create a new repository
3. Follow the instructions to push your code

### Step 3: Import to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"

2. **Import Repository**
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Find and select your `order-crm` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Other
   - **Root Directory:** ./
   - **Build Command:** Leave default or set to `npm run vercel-build`
   - **Output Directory:** Leave empty
   - Click "Deploy"

### Step 4: Set Up Vercel Postgres Database

1. **In Vercel Dashboard**
   - Go to your project
   - Click on "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a database name (e.g., `order-crm-db`)
   - Select a region close to your users
   - Click "Create"

2. **Connect Database to Project**
   - Vercel will automatically add environment variables:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - And more...
   - These are automatically available to your serverless functions

3. **Redeploy Your Project**
   - Go to "Deployments" tab
   - Click on the latest deployment
   - Click "Redeploy"
   - This ensures the database connection is active

### Step 5: Initialize Database

The database tables will be automatically created when the first user tries to log in. The system will:
- Create `users`, `orders`, and `sessions` tables
- Create a default admin user (username: `admin`, password: `admin123`)

**To manually trigger initialization:**
1. Visit your deployed site URL
2. Try to log in with any credentials (will fail)
3. Check Vercel Functions logs to see database initialization

### Step 6: Access Your Deployed Application

1. **Get Your URL**
   - Vercel will provide a URL like: `https://your-project.vercel.app`
   - You can also add a custom domain in Project Settings

2. **Login**
   - Username: `admin`
   - Password: `admin123`
   - **IMPORTANT:** Change this password immediately after first login!

## 🔧 Configuration

### Environment Variables (Optional)

You can add custom environment variables in Vercel Dashboard:
- Go to Project Settings → Environment Variables
- Common variables you might want:
  - `NODE_ENV`: `production`
  - Custom timeout settings
  - API keys for external services

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (usually 5-10 minutes)

## 📊 Monitoring & Logs

### View Function Logs

1. Go to your Vercel project
2. Click on "Deployments"
3. Click on a deployment
4. Click on "Functions" to see logs for each serverless function

### Database Management

1. **View Database**
   - Go to Storage tab in Vercel
   - Click on your Postgres database
   - Use the "Data" tab to browse tables

2. **Connect with SQL Client**
   - Get connection string from Storage → Database → Connect
   - Use tools like:
     - [pgAdmin](https://www.pgadmin.org/)
     - [DBeaver](https://dbeaver.io/)
     - [TablePlus](https://tableplus.com/)

### Useful SQL Queries

```sql
-- View all users
SELECT id, username, name, email, role FROM users;

-- View all orders
SELECT * FROM orders ORDER BY createdAt DESC LIMIT 10;

-- Count orders by status
SELECT status, COUNT(*) as count FROM orders GROUP BY status;

-- View active sessions
SELECT s.id, u.username, s.createdAt, s.expiresAt 
FROM sessions s 
JOIN users u ON s.userId = u.id 
WHERE s.expiresAt > NOW();
```

## 🔄 Updating Your Deployment

### Automatic Deployments

Every time you push to your Git repository:
1. Vercel automatically detects the changes
2. Builds and deploys your project
3. Provides a preview URL
4. Automatically promotes to production (if configured)

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from command line
vercel

# Deploy to production
vercel --prod
```

## 🛡️ Security Best Practices

1. **Change Default Password**
   - Log in as admin
   - Go to Settings
   - Change password immediately

2. **Database Backups**
   - Go to Storage → Database → Backups
   - Enable automatic backups
   - Download manual backups regularly

3. **Environment Variables**
   - Never commit sensitive data to Git
   - Use Vercel environment variables for secrets
   - Rotate passwords and tokens regularly

4. **Access Control**
   - Use Vercel's team features to manage access
   - Enable 2FA on your Vercel account
   - Regularly audit user accounts in your CRM

## 🐛 Troubleshooting

### "Function Invocation Failed" Error

**Cause:** Database connection issue or cold start timeout

**Solution:**
1. Check if database is connected in Storage tab
2. Check function logs for specific errors
3. Redeploy the project

### "Invalid or Expired Session" on Login

**Cause:** Database tables not initialized

**Solution:**
1. Check function logs for initialization errors
2. Manually run database initialization
3. Verify database connection string is correct

### CORS Errors

**Cause:** Frontend trying to access API from wrong domain

**Solution:**
- The API functions already include CORS headers
- Check browser console for specific error
- Verify the API_BASE_URL in `api.js` is correct

### Slow Performance

**Cause:** Cold starts in serverless functions

**Solutions:**
1. Upgrade to Vercel Pro for faster functions
2. Consider using Vercel's Edge Functions
3. Implement caching strategies

### Database Connection Errors

**Cause:** Connection string issues or database not initialized

**Solution:**
1. Verify environment variables are set
2. Check database status in Storage tab
3. Review function logs for connection errors
4. Try reconnecting the database

## 💡 Tips & Best Practices

### Performance

1. **Enable Caching**
   - Add cache headers to static assets
   - Use Vercel's automatic static optimization

2. **Optimize Database Queries**
   - Add indexes to frequently queried columns
   - Use connection pooling (automatic with Vercel Postgres)

3. **Monitor Function Execution Time**
   - Keep functions under 10 seconds (free tier limit)
   - Split long operations into multiple functions

### Development Workflow

1. **Local Development**
   - Keep using `npm start` for local development with SQLite
   - Test Vercel functions locally with `vercel dev`

2. **Preview Deployments**
   - Each Git branch gets a preview URL
   - Test changes before merging to production

3. **Rollback**
   - Easy to rollback in Vercel dashboard
   - Go to Deployments → Select previous deployment → Promote

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## 🎉 Success!

Your Order CRM is now deployed on Vercel with a cloud database! 

**Next Steps:**
1. ✅ Log in and change the default admin password
2. ✅ Add your team members as users
3. ✅ Set up a custom domain (optional)
4. ✅ Configure backups
5. ✅ Start managing your orders!

---

**Need Help?**
- Check Vercel function logs for errors
- Review database connection in Storage tab
- Ensure all environment variables are set correctly
- Contact Vercel support for platform issues

**Made with ❤️ for efficient order management**

