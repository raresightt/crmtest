# 🛒 Order CRM - Professional Order Management System

A modern, full-stack CRM system for managing orders from multiple marketplaces with a beautiful dark-themed interface and server-side database storage.

## ✨ Features

- 🎨 **Beautiful Dark Theme** - Modern, professional UI
- 🔐 **Secure Authentication** - User management with role-based access
- 📊 **Dashboard** - Real-time statistics and recent orders
- 📦 **Order Management** - Create, edit, delete, and track orders
- 📥 **CSV Import/Export** - Bulk operations support
- 🗄️ **SQLite Database** - Server-side data storage
- 👥 **User Management** - Admin can manage users
- 🔒 **Password Security** - Bcrypt encryption
- 📱 **Responsive Design** - Works on all devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

   Or on Windows, just double-click: **`START_SERVER.bat`**

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

4. **Login:**
   - Username: `admin`
   - Password: `admin123`

## 📁 Project Structure

```
order-crm/
├── server.js              # Backend server (Express + SQLite)
├── api.js                 # Frontend API service
├── auth.js                # Authentication system
├── script.js              # Main application logic
├── styles.css             # Dark theme styles
├── index.html             # Main application page
├── login.html             # Login page
├── package.json           # Dependencies
├── crm_database.db        # SQLite database (auto-created)
└── START_SERVER.bat       # Windows quick start
```

## 🗄️ Database

Your data is stored in **`crm_database.db`** - a SQLite database file.

### View/Edit Database:

1. **DB Browser for SQLite** (Recommended)
   - Download: https://sqlitebrowser.org/
   - Open `crm_database.db`

2. **VS Code Extension**
   - Install "SQLite Viewer"
   - Right-click database file → Open with SQLite Viewer

3. **Command Line:**
   ```bash
   sqlite3 crm_database.db
   ```

### Database Tables:

- **users** - User accounts and authentication
- **orders** - Order data
- **sessions** - Active user sessions

## 🔧 Configuration

### Change Port

Edit `server.js`, line 7:
```javascript
const PORT = 3000; // Change to your desired port
```

### Change Database Location

Edit `server.js`, line 11:
```javascript
const db = new Database('crm_database.db'); // Change path/filename
```

## 📊 API Endpoints

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
- `POST /api/orders/bulk` - Bulk import orders

## 🔒 Security

- ✅ Passwords encrypted with bcrypt
- ✅ Session-based authentication
- ✅ Role-based access control
- ✅ SQL injection protection
- ✅ CORS enabled

**Important:** Change the default admin password after first login!

## 📝 Usage

### Managing Orders

1. **Create Order** - Click "New Order" button
2. **Edit Order** - Click edit button on any order card
3. **Delete Order** - Click delete button (with confirmation)
4. **Filter Orders** - Use search and filter dropdowns
5. **Import Orders** - Upload CSV file (download template first)
6. **Export Orders** - Download all orders as CSV

### Managing Users (Admin Only)

1. Go to **Settings** tab
2. Click **"Manage Users"**
3. Add, edit, or delete users
4. Assign roles (Admin/User)

### Supported Marketplaces

- Prom.ua
- Epicenter
- Horoshop
- Custom Website

## 🛠️ Development

### Run with auto-restart:
```bash
npm run dev
```

### Database Queries:

```sql
-- View all orders
SELECT * FROM orders;

-- Count by status
SELECT status, COUNT(*) FROM orders GROUP BY status;

-- Recent orders
SELECT * FROM orders ORDER BY createdAt DESC LIMIT 10;
```

## 🚨 Troubleshooting

### Port Already in Use
```
Error: EADDRINUSE
```
**Solution:** Change PORT in `server.js` or kill process on port 3000

### Database Locked
```
Error: database is locked
```
**Solution:** Close other programs accessing the database

### Module Not Found
```
Error: Cannot find module
```
**Solution:** Run `npm install`

## 📦 Dependencies

- **express** - Web server framework
- **better-sqlite3** - SQLite database
- **bcrypt** - Password hashing
- **cors** - Cross-origin requests
- **body-parser** - Request parsing

## 🔄 Backup & Restore

### Backup:
Simply copy `crm_database.db` file to a safe location

### Restore:
Replace `crm_database.db` with your backup file

## 📈 Future Enhancements

- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Customer management
- [ ] Invoice generation
- [ ] Multi-language support
- [ ] PostgreSQL/MySQL support

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Support

For issues or questions:
1. Check the console for error messages
2. Review `SETUP_INSTRUCTIONS.md`
3. Check database file permissions

## ⭐ Credits

Built with modern web technologies and best practices.

---

**Made with ❤️ for efficient order management**
