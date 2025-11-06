Write-Host "Fixing Tailwind CSS Error..." -ForegroundColor Yellow

# Stop server
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Clean
Remove-Item -Path node_modules,.next,package-lock.json -Recurse -Force -ErrorAction SilentlyContinue
npm cache clean --force

# Install
npm install

# Verify Tailwind
$ver = npm list tailwindcss 2>&1
if ($ver -notmatch "3\.4") {
    Write-Host "Installing Tailwind CSS 3..." -ForegroundColor Cyan
    npm install tailwindcss@3.4.1 --save-dev
}

Write-Host "Done! Run: npm run dev" -ForegroundColor Green

