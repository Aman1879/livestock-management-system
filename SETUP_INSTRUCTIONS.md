# Quick Setup Instructions

## Step 1: Start XAMPP
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** services

## Step 2: Setup Database
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click on "New" to create a database
3. Name it: `livestock_management`
4. Click "Import" tab
5. Select the file: `database_setup.sql`
6. Click "Go" to import

**OR** manually run the SQL commands from `database_setup.sql` file

## Step 3: Verify Configuration
1. Open `config/database.php`
2. Verify these settings match your XAMPP setup:
   - Host: `localhost` (or `127.0.0.1`)
   - Username: `root`
   - Password: `` (empty for default XAMPP)
   - Database: `livestock_management`

## Step 4: Access Your Website
1. Open your browser
2. Navigate to: **http://localhost/Final_proj/**
3. You should see the login page
4. Register a new account or use test credentials:
   - Username: `testuser`
   - Password: `test123`

## Step 5: Start Using
- Login with your credentials
- You'll be redirected to the dashboard
- Start adding animals, health records, and feeding logs!

## Troubleshooting

### Can't connect to database?
- Make sure MySQL is running in XAMPP
- Check database name is exactly: `livestock_management`
- Verify credentials in `config/database.php`

### 404 Error?
- Make sure Apache is running
- Check that mod_rewrite is enabled in Apache
- Verify `.htaccess` file exists in root directory

### Images not showing?
- Some placeholder images (rudra.jpg, unnat.jpg, surya.jpg) are referenced but not included
- This is fine - the code has fallback handlers
- You can add your own images to `assets/images/` folder

## File Structure Summary
```
Final_proj/
├── index.php              ← Entry point (NEW)
├── .htaccess             ← Apache config (NEW)
├── database_setup.sql    ← Database schema (NEW)
├── README.md             ← Full documentation (NEW)
├── api/                  ← API endpoints
├── assets/               ← CSS, JS, images, videos
├── auth/                 ← Login, register, logout
├── config/               ← Database & config files
├── pages/                ← Main dashboard
└── tests/                ← Test files
```

## Next Steps
1. Customize the database credentials if needed
2. Add your own images to `assets/images/`
3. Modify the design in `assets/css/style.css`
4. Add more features as needed!

---

**Need Help?** Check the full README.md for detailed information.

