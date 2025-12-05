# Apna Livestock Management System

A comprehensive PHP web application for managing livestock, including animal inventory, health records, feeding costs, and reporting.

## Project Structure

```
Final_proj/
├── api/                    # API endpoints (RESTful)
│   ├── animals.php        # Animal CRUD operations
│   ├── feeding.php        # Feeding records management
│   ├── health.php         # Health records management
│   └── profile.php        # User profile management
├── assets/                 # Static assets
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   ├── js/
│   │   ├── script.js      # Main JavaScript
│   │   └── datetime.js    # Date/time utilities
│   ├── images/            # Image files
│   └── videos/            # Video files
├── auth/                   # Authentication
│   ├── login.php          # Login page
│   ├── register.php       # Registration page
│   └── logout.php         # Logout handler
├── config/                 # Configuration files
│   ├── config.php         # General configuration
│   ├── database.php       # Database connection (PDO)
│   └── session.php        # Session management
├── includes/               # Reusable PHP includes
├── pages/                  # Main pages
│   └── index.php          # Dashboard (main page)
├── tests/                  # Test files
├── index.php              # Root entry point (redirects to login/dashboard)
├── .htaccess              # Apache configuration
└── README.md              # This file
```

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache web server with mod_rewrite enabled
- XAMPP/WAMP/LAMP (recommended: XAMPP)

## Installation & Setup

### 1. Database Setup

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Create a new database named `livestock_management`
4. Import the database schema (if you have a SQL file) or create tables manually:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(50),
    phone VARCHAR(20),
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE animals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    animal_type VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    age INT,
    status VARCHAR(50),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE health_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    animal_id INT NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50),
    details TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

CREATE TABLE feeding_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    feed_type VARCHAR(100),
    animals TEXT,
    quantity DECIMAL(10,2),
    cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2. Configuration

1. Update database credentials in `config/database.php`:
   - Default XAMPP settings:
     - Host: `localhost` or `127.0.0.1`
     - Username: `root`
     - Password: `` (empty)
     - Database: `livestock_management`

2. Ensure `config/config.php` has correct database settings if used.

### 3. File Permissions

- Ensure PHP has read/write permissions for the project directory
- If using file uploads, ensure `assets/images/` is writable

### 4. Access the Application

1. Start Apache and MySQL in XAMPP
2. Open your browser and navigate to:
   ```
   http://localhost/Final_proj/
   ```
   or
   ```
   http://localhost/Final_proj/index.php
   ```

3. The application will redirect to the login page
4. Register a new account or login with existing credentials

## Features

- **User Authentication**: Secure login and registration system
- **Animal Inventory**: Add, edit, and manage livestock records
- **Health Records**: Track vaccinations, checkups, and treatments
- **Feeding Costs**: Log feeding expenses and track monthly costs
- **Dashboard**: Overview with statistics and charts
- **Reports**: Visual reports and summaries
- **Profile Management**: Update user profile and settings

## Technology Stack

- **Backend**: PHP 7.4+
- **Database**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Libraries**: 
  - Tailwind CSS (via CDN)
  - Chart.js (for charts)
  - Font Awesome (for icons)
  - jQuery (for DOM manipulation)

## Security Features

- Password hashing using PHP's `password_hash()`
- Session-based authentication
- SQL injection prevention using prepared statements
- XSS protection with `htmlspecialchars()`
- CSRF protection (session-based)
- Secure headers via `.htaccess`

## Troubleshooting

### Database Connection Error
- Verify MySQL is running in XAMPP
- Check database credentials in `config/database.php`
- Ensure database `livestock_management` exists

### 404 Errors
- Ensure Apache mod_rewrite is enabled
- Check `.htaccess` file exists and is readable
- Verify file paths are correct

### Session Issues
- Ensure PHP sessions are enabled
- Check `php.ini` for session configuration
- Clear browser cookies if needed

### Images Not Loading
- Verify image files exist in `assets/images/`
- Check file permissions
- Verify image paths in code

## Development Notes

- All API endpoints return JSON responses
- Frontend uses fetch API for AJAX requests
- Responsive design for mobile and desktop
- Modern UI with glassmorphism effects

## License

© 2025 Apna Livestock Management System. All Rights Reserved.

## Contact

- Email: info@apnalivestock.com
- Phone: +91-6299211631
- Office: Apna Livestock, 9th Floor, BH6 LPU, Punjab, Phagwara, India

