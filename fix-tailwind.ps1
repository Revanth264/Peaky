# Fix Tailwind CSS Installation
Write-Host "Fixing Tailwind CSS installation..." -ForegroundColor Yellow

# Remove old installations
Write-Host "Removing old Tailwind CSS..." -ForegroundColor Cyan
npm uninstall tailwindcss @tailwindcss/postcss

# Remove node_modules to ensure clean install
Write-Host "Cleaning node_modules..." -ForegroundColor Cyan
if (Test-Path node_modules) {
    Remove-Item -Path node_modules -Recurse -Force
}
if (Test-Path package-lock.json) {
    Remove-Item -Path package-lock.json -Force
}

# Install Tailwind CSS 3
Write-Host "Installing Tailwind CSS 3.4.1..." -ForegroundColor Cyan
npm install tailwindcss@3.4.1 --save-dev

# Install all dependencies
Write-Host "Installing all dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Done! Now run: npm run dev" -ForegroundColor Green

