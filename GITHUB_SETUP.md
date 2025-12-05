# GitHub Repository Setup Guide

Follow these steps to push your project to GitHub.

## Prerequisites

1. **Install Git** (if not already installed):
   - Download from: https://git-scm.com/download/win
   - Install with default settings
   - Restart your terminal/command prompt after installation

2. **Create a GitHub Account** (if you don't have one):
   - Go to: https://github.com
   - Sign up for a free account

## Step 1: Create a New Repository on GitHub

1. Log in to GitHub
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in:
   - **Repository name**: `livestock-management-system` (or your preferred name)
   - **Description**: "Apna Livestock Management System - PHP Web Application"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 2: Initialize Git in Your Project

Open PowerShell or Command Prompt in your project directory and run:

```bash
# Navigate to your project directory (if not already there)
cd C:\xampp\htdocs\Final_proj

# Initialize git repository
git init

# Configure git (if not already configured)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Update .gitignore (Important!)

**IMPORTANT:** Before committing, you need to update the `.gitignore` file to protect sensitive information:

1. **Edit `config/database.php`** - Remove or comment out your actual database credentials
2. Create a template file: `config/database.php.example` with placeholder values
3. The `.gitignore` file is already set to exclude `config/database.php`

## Step 4: Add Files to Git

```bash
# Add all files to staging
git add .

# Check what will be committed
git status

# Commit the files
git commit -m "Initial commit: Livestock Management System"
```

## Step 5: Connect to GitHub Repository

```bash
# Add the remote repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Verify the remote was added
git remote -v
```

## Step 6: Push to GitHub

```bash
# Push to GitHub (first time)
git branch -M main
git push -u origin main
```

If you get authentication errors, you may need to:
- Use a Personal Access Token instead of password
- Or set up SSH keys

## Step 7: Create config/database.php.example

Create a template file for database configuration:

```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'livestock_management');
define('DB_USER', 'root');      // Replace with your DB user
define('DB_PASS', '');          // Replace with your DB password

function getDBConnection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}
?>
```

## Security Checklist Before Pushing

- [ ] Database credentials are NOT in the repository (use .gitignore)
- [ ] API keys are NOT in the repository
- [ ] Passwords are NOT in the repository
- [ ] Sensitive configuration files are excluded
- [ ] Uploaded user files are excluded (or in separate directory)

## Common Git Commands

```bash
# Check status
git status

# Add specific files
git add filename.php

# Commit changes
git commit -m "Your commit message"

# Push changes
git push

# Pull latest changes
git pull

# View commit history
git log

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main
```

## Troubleshooting

### Git not recognized
- Make sure Git is installed
- Restart your terminal after installation
- Check if Git is in your PATH

### Authentication failed
- Use Personal Access Token instead of password
- Generate token: GitHub → Settings → Developer settings → Personal access tokens

### Large files
- If videos are too large, add them to .gitignore
- Use Git LFS for large files if needed

### Merge conflicts
- Pull latest changes: `git pull`
- Resolve conflicts manually
- Commit and push again

## Next Steps After Pushing

1. Add a README.md with project description
2. Add screenshots to README
3. Set up GitHub Pages (if needed)
4. Add collaborators (if working in a team)
5. Set up GitHub Actions for CI/CD (optional)

## Important Notes

- **Never commit sensitive data** (passwords, API keys, database credentials)
- **Always use .gitignore** to exclude sensitive files
- **Create example/template files** for configuration
- **Keep commits meaningful** with clear messages
- **Regularly push your changes** to backup your work

