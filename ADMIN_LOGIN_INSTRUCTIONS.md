# Admin Login Instructions

## How to Login as Admin

Currently, **all users (including admins) use the same login page**. There is no separate admin login page.

### Method 1: Create Admin User via Script (Recommended)

1. **Create Admin User:**
   - Open your browser and go to: `http://localhost/Final_proj/create_admin.php`
   - Fill in the form:
     - Username: (choose a username)
     - Email: (admin email)
     - Full Name: (admin's full name)
     - Password: (choose a strong password)
     - Confirm Password: (re-enter password)
   - Click "Create Admin User"
   - **IMPORTANT:** Delete `create_admin.php` file after creating the admin account for security!

2. **Login as Admin:**
   - Go to: `http://localhost/Final_proj/auth/login.php`
   - Enter the admin email and password you just created
   - Click "Login"
   - You will be logged in with the "Admin" role

### Method 2: Create Admin User via Database (Manual)

1. **Open phpMyAdmin:**
   - Go to: `http://localhost/phpmyadmin`
   - Select the `livestock_management` database

2. **Insert Admin User:**
   - Click on the `users` table
   - Click "Insert" tab
   - Fill in the form:
     - `username`: (e.g., "admin")
     - `email`: (e.g., "admin@apnalivestock.com")
     - `password`: (use this SQL to hash password: `SELECT PASSWORD('your_password')` or use PHP's `password_hash()`)
     - `full_name`: (e.g., "Admin User")
     - `role`: **"Admin"** (this is important!)
     - Leave other fields empty or fill as needed
   - Click "Go"

   **OR** run this SQL (replace values):
   ```sql
   INSERT INTO users (username, email, password, full_name, role) 
   VALUES ('admin', 'admin@apnalivestock.com', '$2y$10$YourHashedPasswordHere', 'Admin User', 'Admin');
   ```

3. **Hash Password:**
   - To hash a password, you can use PHP:
     ```php
     <?php echo password_hash('your_password', PASSWORD_DEFAULT); ?>
     ```
   - Or use an online bcrypt hasher

4. **Login:**
   - Go to: `http://localhost/Final_proj/auth/login.php`
   - Use the admin email and password you created

### Method 3: Update Existing User to Admin

1. **Open phpMyAdmin:**
   - Go to: `http://localhost/phpmyadmin`
   - Select the `livestock_management` database
   - Click on the `users` table

2. **Update User Role:**
   - Find the user you want to make admin
   - Click "Edit"
   - Change the `role` field to: **"Admin"**
   - Click "Go"

3. **Login:**
   - Use that user's existing email and password to login

## Current Login Process

1. **Go to Login Page:**
   ```
   http://localhost/Final_proj/auth/login.php
   ```

2. **Enter Credentials:**
   - Email: (your registered email)
   - Password: (your password)

3. **Click Login:**
   - You will be redirected to the dashboard
   - Your role (Admin/User/etc.) is stored in the session

## Admin Features (Future Development)

Currently, the system stores the user's role in the session (`$_SESSION['role']`), but there are no admin-specific features implemented yet. You can:

- Check if user is admin: `if ($_SESSION['role'] === 'Admin') { ... }`
- Add admin-only pages or features
- Restrict certain actions to admins only

## Security Notes

1. **Delete `create_admin.php`** after creating the admin account
2. Use strong passwords for admin accounts
3. Keep admin credentials secure
4. Consider implementing role-based access control (RBAC) for admin features

## Troubleshooting

- **Can't login?** Check that the email and password are correct
- **Role not showing?** Make sure the `role` field in database is set to "Admin"
- **Session issues?** Clear browser cookies and try again

