# GitHub Setup Script for Livestock Management System
# Run this script to connect your project to GitHub

Write-Host "=== GitHub Repository Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Cyan
git init

Write-Host ""
Write-Host "Step 2: Checking Git configuration..." -ForegroundColor Cyan
$gitName = git config user.name
$gitEmail = git config user.email

if (-not $gitName -or -not $gitEmail) {
    Write-Host "Git user name/email not configured." -ForegroundColor Yellow
    $name = Read-Host "Enter your name (for Git commits)"
    $email = Read-Host "Enter your email (for Git commits)"
    git config --global user.name "$name"
    git config --global user.email "$email"
    Write-Host "✓ Git configured" -ForegroundColor Green
} else {
    Write-Host "✓ Git configured: $gitName <$gitEmail>" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Adding files to Git..." -ForegroundColor Cyan
git add .

Write-Host ""
Write-Host "Step 4: Making initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Livestock Management System"

Write-Host ""
Write-Host "Step 5: Setting up GitHub remote..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Your GitHub username: Aman1879" -ForegroundColor Yellow
$repoName = Read-Host "Enter repository name (e.g., livestock-management-system)"

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $update = Read-Host "Update it? (y/n)"
    if ($update -eq "y") {
        git remote remove origin
    } else {
        Write-Host "Skipping remote setup." -ForegroundColor Yellow
        exit
    }
}

git remote add origin "https://github.com/Aman1879/$repoName.git"
Write-Host "✓ Remote added: https://github.com/Aman1879/$repoName.git" -ForegroundColor Green

Write-Host ""
Write-Host "Step 6: Creating main branch..." -ForegroundColor Cyan
git branch -M main

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create the repository '$repoName' on GitHub:" -ForegroundColor Yellow
Write-Host "   Go to: https://github.com/new" -ForegroundColor White
Write-Host "   Repository name: $repoName" -ForegroundColor White
Write-Host "   DO NOT initialize with README, .gitignore, or license" -ForegroundColor White
Write-Host ""
Write-Host "2. After creating the repository, run:" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "3. Use VS Code/Cursor Git integration for future commits:" -ForegroundColor Yellow
Write-Host "   - Click Source Control icon (left sidebar)" -ForegroundColor White
Write-Host "   - Stage changes (click + on files)" -ForegroundColor White
Write-Host "   - Write commit message" -ForegroundColor White
Write-Host "   - Click 'Sync Changes' or 'Push' button" -ForegroundColor White
Write-Host ""

