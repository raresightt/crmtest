# 🚀 Order CRM - Server Setup Instructions

## Prerequisites

You need **Node.js** installed on your computer.
- Download from: https://nodejs.org/ (LTS version recommended)
- Verify installation: Open terminal and run `node --version`

## Installation Steps

### 1. Install Dependencies

Open terminal in the project folder and run:

```bash
npm install
```

This will install:
- `express` - Web server framework
- `better-sqlite3` - SQLite database
- `bcrypt` - Password encryption
- `cors` - Cross-origin requests
- `body-parser` - Request parsing

### 2. Start the Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║     🚀 Order CRM Server Running       ║
╠════════════════════════════════════════╣
║  Server:    http://localhost:3000     ║
║  Database:  crm_database.db            ║
║  Status:    ✅ Ready                    ║
╠════════════════════════════════════════╣
║  Default Login:                        ║
║  Username:  admin                      ║
║  Password:  admin123                   ║
╚════════════════════════════════════════╝
```

### 3. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

Login with:
- **Username**: `admin`
- **Password**: `admin123`

## 📁 Database File

Your data is stored in: **`crm_database.db`**

This is a SQLite database file that contains:
- ✅ Users
- ✅ Orders
- ✅ Sessions

### View/Edit Database

You can view and edit the database using:

1. **DB Browser for SQLite** (Recommended)
   - Download: https://sqlitebrowser.org/
   - Open `crm_database.db` file
   - View/edit tables directly

2. **VS Code Extension**
   - Install "SQLite Viewer" extension
   - Right-click `crm_database.db` → Open with SQLite Viewer

3. **Command Line**
   ```bash
   sqlite3 crm_database.db
   ```

### Example SQL Queries

```sql
-- View all orders
SELECT * FROM orders;

-- View all users
SELECT id, username, name, email, role FROM users;

-- Count orders by status
SELECT status, COUNT(*) as count FROM orders GROUP BY status;

-- Delete specific order
DELETE FROM orders WHERE id = 'ORD-12345';

-- Update order status
UPDATE orders SET status = 'delivered' WHERE id = 'ORD-12345';
```

## 🔄 Data Migration

### Export Data (Backup)

The database file `crm_database.db` IS your backup. Just copy this file.

### Import Old Data

If you have data in browser localStorage, it will automatically migrate on first load.

## 🛠️ Configuration

### Change Port

Edit `server.js`, line 7:
```javascript
const PORT = 3000; // Change to your desired port
```

### Change Database File

Edit `server.js`, line 11:
```javascript
const db = new Database('crm_database.db'); // Change filename
```

## 🔒 Security Notes

1. **Change default admin password** after first login
2. Database file contains sensitive data - keep it secure
3. For production, use environment variables for sensitive config
4. Consider using PostgreSQL/MySQL for production

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- Encrypted with bcrypt
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,      -- 'admin' or 'user'
    lastLogin TEXT,
    createdAt TEXT NOT NULL
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    marketplace TEXT NOT NULL,
    customerName TEXT NOT NULL,
    customerEmail TEXT NOT NULL,
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    createdAt TEXT NOT NULL
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    rememberMe INTEGER NOT NULL,
    createdAt TEXT NOT NULL
);
```

## 🚨 Troubleshooting

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution**: Change the PORT in `server.js` or kill the process using port 3000

### Database Locked
```
Error: database is locked
```
**Solution**: Close any other programs accessing the database file

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution**: Run `npm install` again

## 📝 API Endpoints

All endpoints are available at `http://localhost:3000/api`

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verify session
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Add user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/change-password` - Change password

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Add order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `DELETE /api/orders` - Clear all orders
- `POST /api/orders/bulk` - Bulk import orders

## ✅ You're All Set!

Your CRM now uses a proper database backend. All data is stored server-side in `crm_database.db`.

For questions or issues, check the console output for error messages.

