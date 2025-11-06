# Quick Fix for Tailwind CSS Error
Write-Host "Fixing Tailwind CSS..." -ForegroundColor Yellow

# Stop any running processes
Write-Host "Cleaning up..." -ForegroundColor Cyan

# Remove Tailwind CSS 4
npm uninstall tailwindcss

# Clean build cache
if (Test-Path .next) {
    Remove-Item -Path .next -Recurse -Force
    Write-Host "Removed .next folder" -ForegroundColor Green
}

# Install Tailwind CSS 3
Write-Host "Installing Tailwind CSS 3.4.1..." -ForegroundColor Cyan
npm install tailwindcss@3.4.1 --save-dev --legacy-peer-deps

Write-Host "`nDone! Now run: npm run dev" -ForegroundColor Green
Write-Host "The error should be fixed!" -ForegroundColor Green

