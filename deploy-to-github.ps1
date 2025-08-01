# WebGlo GitHub Pages Deployment Script
# Run this PowerShell script to deploy your site to GitHub Pages

Write-Host "🚀 WebGlo GitHub Pages Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/windows" -ForegroundColor Yellow
    exit 1
}

# Get current directory
$projectPath = Get-Location
Write-Host "📁 Project directory: $projectPath" -ForegroundColor Green

# Check if this is already a git repository
if (Test-Path ".git") {
    Write-Host "📝 Git repository already exists" -ForegroundColor Yellow
} else {
    Write-Host "📝 Initializing Git repository..." -ForegroundColor Blue
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Get GitHub repository URL from user
Write-Host ""
Write-Host "🔗 GitHub Repository Setup" -ForegroundColor Cyan
Write-Host "Please provide your GitHub repository information:" -ForegroundColor White

$username = Read-Host "GitHub Username"
$repoName = Read-Host "Repository Name (e.g., webglo-site)"

$githubUrl = "https://github.com/$username/$repoName.git"

Write-Host ""
Write-Host "📋 Repository URL: $githubUrl" -ForegroundColor Yellow
$confirm = Read-Host "Is this correct? (y/n)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit 1
}

# Add all files
Write-Host ""
Write-Host "📦 Adding files to Git..." -ForegroundColor Blue
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "⚠️  No changes to commit" -ForegroundColor Yellow
} else {
    # Commit changes
    Write-Host "💾 Committing changes..." -ForegroundColor Blue
    git commit -m "Deploy WebGlo website with custom form system"
    Write-Host "✅ Changes committed" -ForegroundColor Green
}

# Set main branch
Write-Host "🌿 Setting main branch..." -ForegroundColor Blue
git branch -M main

# Check if remote origin exists
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "🔗 Remote origin already exists" -ForegroundColor Yellow
} else {
    Write-Host "🔗 Adding remote origin..." -ForegroundColor Blue
    git remote add origin $githubUrl
    Write-Host "✅ Remote origin added" -ForegroundColor Green
}

# Push to GitHub
Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Blue
try {
    git push -u origin main
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "Please make sure:" -ForegroundColor Yellow
    Write-Host "1. The repository exists on GitHub" -ForegroundColor Yellow
    Write-Host "2. You have write access to the repository" -ForegroundColor Yellow
    Write-Host "3. Your Git credentials are configured" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Go to https://github.com/$username/$repoName" -ForegroundColor Yellow
Write-Host "2. Click 'Settings' tab" -ForegroundColor Yellow
Write-Host "3. Scroll to 'Pages' section" -ForegroundColor Yellow
Write-Host "4. Under 'Source', select 'Deploy from a branch'" -ForegroundColor Yellow
Write-Host "5. Choose 'main' branch and '/ (root)' folder" -ForegroundColor Yellow
Write-Host "6. Click 'Save'" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your site will be available at:" -ForegroundColor White
Write-Host "https://$username.github.io/$repoName/" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚡ Your custom form system is ready to go!" -ForegroundColor Green
Write-Host "📧 Emails will be sent from your configured Gmail account" -ForegroundColor Green
Write-Host "📊 Form data will be stored in your Google Sheets" -ForegroundColor Green

Read-Host "Press Enter to continue..."
