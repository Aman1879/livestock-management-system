# VS Code / Cursor Git Integration Setup

This guide will help you set up automatic Git syncing in VS Code or Cursor.

## Prerequisites

1. **Git must be installed** on your system
   - Download: https://git-scm.com/download/win
   - Verify: Open terminal and type `git --version`

2. **GitHub Account**
   - Your account: https://github.com/Aman1879
   - Make sure you're logged in

## Step 1: Run the Setup Script

1. Open PowerShell in your project directory
2. Run the setup script:
   ```powershell
   .\setup_github.ps1
   ```
3. Follow the prompts to configure Git and create the repository

## Step 2: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `livestock-management-system` (or your choice)
3. Description: "Apna Livestock Management System - PHP Web Application"
4. **Important:** DO NOT check:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
5. Click "Create repository"

## Step 3: Push to GitHub

After creating the repository, run:
```bash
git push -u origin main
```

You'll be prompted for GitHub credentials:
- **Username:** Aman1879
- **Password:** Use a Personal Access Token (not your GitHub password)
  - Generate token: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Select scopes: `repo` (full control of private repositories)
  - Copy the token and use it as password

## Step 4: Using VS Code/Cursor Git Integration

### Enable Git in Editor

1. **Open Source Control Panel:**
   - Click the Source Control icon in the left sidebar (looks like a branch)
   - Or press `Ctrl+Shift+G`

2. **Make Changes:**
   - Edit any file in your project
   - The file will appear in "Changes" section

3. **Stage Changes:**
   - Click the `+` icon next to files you want to commit
   - Or click `+` next to "Changes" to stage all files

4. **Commit:**
   - Type a commit message in the text box (e.g., "Fixed login bug")
   - Press `Ctrl+Enter` or click the checkmark ✓

5. **Push to GitHub:**
   - Click the "Sync Changes" button (circular arrows) or "Push" button
   - Or use the three dots menu → "Push"

### Automatic Sync (Recommended Settings)

1. **Open Settings:**
   - Press `Ctrl+,` (comma)
   - Or File → Preferences → Settings

2. **Enable Auto Sync:**
   - Search for: `git.autofetch`
   - Enable: "Git: Auto Fetch"
   - This will automatically fetch changes from GitHub

3. **Enable Auto Push:**
   - Search for: `git.enableSmartCommit`
   - Enable: "Git: Enable Smart Commit"
   - This allows committing all changes at once

## Step 5: Set Up Auto-Sync on Save (Optional)

### Option 1: Using Git Hooks (Automatic Commit)

Create a file: `.git/hooks/post-commit` (Windows):

```bash
#!/bin/sh
git push origin main
```

### Option 2: Using VS Code Tasks

Create `.vscode/tasks.json`:

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Git: Commit and Push",
            "type": "shell",
            "command": "git add . && git commit -m 'Auto-commit' && git push",
            "problemMatcher": []
        }
    ]
}
```

### Option 3: Manual Sync (Recommended)

For better control, manually commit and push:
1. Make changes
2. Stage files (click +)
3. Commit with message
4. Push to GitHub

## VS Code Git Shortcuts

- `Ctrl+Shift+G` - Open Source Control
- `Ctrl+Enter` - Commit staged changes
- `Ctrl+Shift+P` → "Git: Push" - Push to remote
- `Ctrl+Shift+P` → "Git: Pull" - Pull from remote
- `Ctrl+Shift+P` → "Git: Sync" - Pull and push

## Troubleshooting

### "Git not found"
- Install Git: https://git-scm.com/download/win
- Restart VS Code/Cursor after installation

### "Authentication failed"
- Use Personal Access Token instead of password
- Generate: https://github.com/settings/tokens
- Use token as password when prompted

### "Repository not found"
- Make sure repository exists on GitHub
- Check repository name matches
- Verify you have access to the repository

### "Nothing to commit"
- Make sure files are saved
- Check if files are in .gitignore
- Verify changes are actually made

## Daily Workflow

1. **Make changes** to your code
2. **Save files** (Ctrl+S)
3. **Open Source Control** (Ctrl+Shift+G)
4. **Stage changes** (click +)
5. **Commit** with message (Ctrl+Enter)
6. **Push** to GitHub (click Sync Changes)

## Automatic Updates

For truly automatic updates, you can:
1. Use GitHub Desktop (GUI tool)
2. Set up Git hooks (advanced)
3. Use VS Code's built-in sync (recommended)

The easiest way is to use VS Code's Source Control panel and click "Sync Changes" after each commit.

