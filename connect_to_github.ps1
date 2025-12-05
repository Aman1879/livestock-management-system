# Quick script to connect to GitHub repository
# Run this after creating the repository on GitHub

Write-Host "=== Connect to GitHub Repository ===" -ForegroundColor Cyan
Write-Host ""

$repoName = Read-Host "Enter your GitHub repository name (e.g., livestock-management-system)"

# Remove existing remote if any
git remote remove origin 2>$null

# Add new remote
git remote add origin "https://github.com/Aman1879/$repoName.git"

Write-Host ""
Write-Host "✓ Connected to: https://github.com/Aman1879/$repoName.git" -ForegroundColor Green
Write-Host ""

# Check if there are uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "You have uncommitted changes. Adding and committing..." -ForegroundColor Yellow
    git add .
    $commitMsg = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    git commit -m $commitMsg
}

# Check current branch
$branch = git branch --show-current
if (-not $branch) {
    Write-Host "Creating main branch..." -ForegroundColor Yellow
    git branch -M main
    $branch = "main"
}

Write-Host ""
Write-Host "Ready to push! Run this command:" -ForegroundColor Cyan
Write-Host "  git push -u origin $branch" -ForegroundColor White
Write-Host ""
Write-Host "Or use VS Code/Cursor Source Control panel and click 'Sync Changes'" -ForegroundColor Yellow
Write-Host ""

