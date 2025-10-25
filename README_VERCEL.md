# 🚀 Order CRM - Vercel Deployment

Your Order CRM system is now configured for deployment on Vercel with cloud Postgres database!

## 📦 What Changed?

### ✅ New Files Created:
- `vercel.json` - Vercel configuration
- `api/` folder - Serverless functions (converted from Express routes)
- `.vercelignore` - Files to exclude from deployment
- `VERCEL_DEPLOYMENT.md` - Complete deployment guide
- `QUICK_DEPLOY.md` - 5-minute quick start

### ✅ Modified Files:
- `api.js` - Auto-detects production vs local environment
- `package.json` - Added Vercel dependencies

### ✅ Database Migration:
- **Local:** SQLite (`crm_database.db`)
- **Production:** Vercel Postgres (cloud database)
- All data structure remains the same!

## 🎯 Quick Start - 3 Options

### Option 1: One-Click Deploy via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Ready for Vercel deployment"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Visit: https://vercel.com/new
   - Select your GitHub repository
   - Click "Deploy"

3. **Add Database:**
   - In Vercel Dashboard → Your Project
   - Click "Storage" tab → "Create Database"
   - Select "Postgres" → Name it: `order-crm-db`
   - Click "Create"

4. **Initialize Database:**
   - After deployment, visit: `https://your-project.vercel.app/api/init-db`
   - This creates tables and default admin user

5. **Access Your App:**
   - Visit: `https://your-project.vercel.app`
   - Login: `admin` / `admin123`
   - **Important:** Change password immediately!

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Install dependencies
npm install

# Deploy
vercel

# After deployment, add database in Vercel Dashboard
# Then visit: https://your-project.vercel.app/api/init-db
```

### Option 3: Manual GitHub + Vercel Connection

See `QUICK_DEPLOY.md` for step-by-step instructions.

## 📋 Deployment Checklist

- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] Project imported to Vercel
- [ ] Postgres database created in Storage tab
- [ ] Database initialized (visit `/api/init-db`)
- [ ] Can log in with admin credentials
- [ ] Default password changed
- [ ] Tested creating/editing orders
- [ ] Custom domain added (optional)

## 🔧 Project Structure

```
order-crm/
├── api/                      # Serverless Functions (NEW)
│   ├── _db.js               # Database connection utility
│   ├── init-db.js           # Database initialization endpoint
│   ├── auth/
│   │   ├── login.js         # POST /api/auth/login
│   │   ├── verify.js        # POST /api/auth/verify
│   │   └── logout.js        # POST /api/auth/logout
│   ├── users/
│   │   ├── index.js         # GET/POST /api/users
│   │   ├── [id].js          # PUT/DELETE /api/users/:id
│   │   └── [id]/change-password.js
│   └── orders/
│       ├── index.js         # GET/POST/DELETE /api/orders
│       ├── [id].js          # PUT/DELETE /api/orders/:id
│       └── bulk.js          # POST /api/orders/bulk
│
├── index.html               # Main app
├── login.html               # Login page
├── api.js                   # Frontend API (auto-detects environment)
├── auth.js                  # Auth system
├── script.js                # Main app logic
├── styles.css               # Styles
│
├── vercel.json             # Vercel config
├── .vercelignore           # Deployment exclusions
├── package.json            # Dependencies (updated)
│
├── server.js               # Local development server (SQLite)
└── crm_database.db         # Local SQLite DB (not deployed)
```

## 🌐 API Endpoints (Serverless)

All endpoints automatically convert to Vercel serverless functions:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify session
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/change-password` - Change password

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `DELETE /api/orders` - Clear all orders
- `POST /api/orders/bulk` - Bulk import

### Utility
- `GET /api/init-db` - Initialize database (first time setup)

## 🔄 Development Workflow

### Local Development (SQLite)
```bash
npm install
npm start
# Opens http://localhost:3000
```

### Test Vercel Functions Locally
```bash
vercel dev
# Simulates Vercel environment locally
```

### Deploy to Production
```bash
# Automatic: Push to GitHub (if connected)
git push

# Manual: Using Vercel CLI
vercel --prod
```

## 🗄️ Database Migration

### From SQLite to Postgres

Your local database (`crm_database.db`) is NOT automatically migrated. To transfer data:

1. **Export from SQLite:**
   ```bash
   sqlite3 crm_database.db .dump > backup.sql
   ```

2. **Convert and Import to Postgres:**
   - Manually recreate important users
   - Export orders as CSV
   - Import via bulk import feature in the UI

3. **Or Start Fresh:**
   - Just initialize the database
   - Start with default admin user
   - Begin adding orders in production

## 🔐 Environment Variables

Vercel automatically provides these when you create a Postgres database:
- `POSTGRES_URL` - Connection string
- `POSTGRES_PRISMA_URL` - Prisma connection
- `POSTGRES_URL_NON_POOLING` - Direct connection
- `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

No manual configuration needed! 🎉

## 🐛 Troubleshooting

### Can't Log In After Deployment

**Solution:** Initialize the database
- Visit: `https://your-project.vercel.app/api/init-db`
- Check response for success message
- Try logging in again

### "Function Invocation Failed"

**Possible Causes:**
1. Database not connected
2. Database not initialized
3. Cold start timeout

**Solutions:**
1. Check Storage tab in Vercel - is database connected?
2. Visit `/api/init-db` endpoint
3. Check function logs in Vercel dashboard

### CORS Errors

**Solution:** Already handled! All API functions include CORS headers.
If you still see errors, check browser console for specific details.

### Database Connection Errors

**Solution:**
1. Verify database is created in Storage tab
2. Check it's linked to your project
3. Redeploy the project
4. Check function logs for specific error messages

## 📊 Monitoring

### Function Logs
- Vercel Dashboard → Your Project → Deployments
- Click on latest deployment → Functions
- View logs for each function

### Database Queries
- Storage tab → Your Database → "Query" or "Data" tab
- Connect with pgAdmin, DBeaver, or TablePlus

### Performance
- Functions tab shows execution time
- Analytics tab shows traffic
- Monitor database size in Storage tab

## 💰 Pricing

### Vercel (Free Tier)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless functions
- ✅ Preview deployments
- ✅ Perfect for small teams!

### Vercel Postgres (Free Tier)
- ✅ 256 MB storage
- ✅ 60 hours compute/month
- ✅ Shared resources
- ✅ Great for getting started!

**Upgrade when needed:**
- Pro: $20/month (more resources)
- Enterprise: Custom pricing (large teams)

## 🎨 Customization

### Add Custom Domain
1. Vercel Dashboard → Your Project → Settings
2. Domains → Add domain
3. Follow DNS configuration
4. SSL automatically configured!

### Environment-Specific Settings
Edit `api.js` to customize API URLs:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'  // Local
    : '/api';                        // Production
```

## 📚 Documentation

- **Quick Start:** `QUICK_DEPLOY.md` - 5-minute deployment
- **Full Guide:** `VERCEL_DEPLOYMENT.md` - Complete instructions
- **This File:** Overview and reference

## ✅ Post-Deployment

1. **Security:**
   - [ ] Change default admin password
   - [ ] Enable 2FA on Vercel account
   - [ ] Set up database backups
   - [ ] Review user permissions

2. **Optimization:**
   - [ ] Set up custom domain
   - [ ] Configure error monitoring
   - [ ] Review function execution times
   - [ ] Plan database backup schedule

3. **Team:**
   - [ ] Add team members in Vercel (if applicable)
   - [ ] Create user accounts in CRM
   - [ ] Set appropriate roles
   - [ ] Share production URL

## 🆘 Need Help?

1. **Check Documentation:**
   - Read `VERCEL_DEPLOYMENT.md` for detailed guide
   - Check `QUICK_DEPLOY.md` for quick solutions

2. **Check Logs:**
   - Vercel function logs
   - Browser console
   - Network tab in DevTools

3. **Common Solutions:**
   - Redeploy the project
   - Re-initialize database
   - Check environment variables
   - Verify database connection

4. **External Resources:**
   - [Vercel Docs](https://vercel.com/docs)
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Vercel Support](https://vercel.com/support)

## 🎉 Success!

Your Order CRM is now:
- ✅ Deployed on Vercel
- ✅ Using cloud Postgres database
- ✅ Accessible from anywhere
- ✅ Automatically scaled
- ✅ Backed up regularly

**Next Steps:**
1. Log in and explore
2. Change admin password
3. Add your first order
4. Invite team members
5. Start managing orders efficiently!

---

**Made with ❤️ - Now globally accessible!**

Need to go back to local development? Just run `npm start` - your local SQLite database is still there!

