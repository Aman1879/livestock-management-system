# Quick Git Commands Reference

## First Time Setup

```bash
# 1. Install Git (if not installed)
# Download from: https://git-scm.com/download/win

# 2. Configure Git (one time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 3. Navigate to project directory
cd C:\xampp\htdocs\Final_proj

# 4. Initialize Git
git init

# 5. Add all files
git add .

# 6. Make first commit
git commit -m "Initial commit: Livestock Management System"

# 7. Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 8. Push to GitHub
git branch -M main
git push -u origin main
```

## Daily Workflow

```bash
# Check what files changed
git status

# Add specific files
git add filename.php

# Add all changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push

# Pull latest changes
git pull
```

## Common Commands

```bash
# View commit history
git log

# View changes in a file
git diff filename.php

# Undo changes (before commit)
git checkout -- filename.php

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Merge branch
git merge feature-name
```

## Important Notes

- **Never commit** `config/database.php` (it's in .gitignore)
- **Always commit** `config/database.php.example` (template file)
- **Check status** before committing: `git status`
- **Write clear commit messages**: "Fixed login bug" not "changes"

