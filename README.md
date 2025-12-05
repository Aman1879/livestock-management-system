## Live Website

Check out the live version of the Livestock Management System here:  
[Apna Livestock Management System](https://apnalivestock.42web.io)


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


## License

© 2025 Apna Livestock Management System. All Rights Reserved.

## Contact

- Email: amanara13579@gmail.com
- Phone: +91-6299211631


