# Quick Start: Connect to GitHub (Aman1879)

## 🚀 Fast Setup (5 Minutes)

### Step 1: Install Git (if not installed)
1. Download: https://git-scm.com/download/win
2. Install with default settings
3. **Restart your editor** after installation

### Step 2: Create GitHub Repository
1. Go to: https://github.com/new
2. Repository name: `livestock-management-system`
3. **DO NOT** check any boxes (README, .gitignore, license)
4. Click "Create repository"

### Step 3: Run Setup Script
Open PowerShell in your project folder and run:
```powershell
.\setup_github.ps1
```

Or manually run these commands:

```bash
# Initialize Git
git init

# Configure Git (one time)
git config --global user.name "Aman Kumar Singh"
git config --global user.email "your.email@example.com"

# Add all files
git add .

# Commit
git commit -m "Initial commit: Livestock Management System"

# Connect to GitHub (replace REPO_NAME with your repository name)
git remote add origin https://github.com/Aman1879/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Use VS Code/Cursor Git Integration

**After initial setup, use the editor's built-in Git:**

1. **Make changes** to your code
2. **Click Source Control icon** (left sidebar, looks like branch)
3. **Stage files** (click `+` next to files)
4. **Write commit message** (e.g., "Fixed login bug")
5. **Click checkmark** ✓ to commit
6. **Click "Sync Changes"** button to push to GitHub

That's it! Your changes will be pushed to GitHub.

## 🔄 Daily Workflow

Every time you make changes:

1. Edit code → Save (Ctrl+S)
2. Open Source Control (Ctrl+Shift+G)
3. Stage changes (click +)
4. Commit (Ctrl+Enter)
5. Push (click "Sync Changes")

## 🔐 GitHub Authentication

When pushing for the first time, you'll need:

- **Username:** Aman1879
- **Password:** Use a **Personal Access Token**
  - Generate: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Select scope: `repo`
  - Copy token and use as password

## 📝 Need Help?

See `VS_CODE_GIT_SETUP.md` for detailed instructions.

