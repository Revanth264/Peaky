# Complete Fix Script for Tailwind CSS Error
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing Tailwind CSS & Internal Server Error" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop any running processes
Write-Host "[1/6] Stopping any running processes..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Clean everything
Write-Host "[2/6] Cleaning node_modules, .next, and package-lock.json..." -ForegroundColor Cyan
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json -Force -ErrorAction SilentlyContinue
Write-Host "   ✓ Cleaned" -ForegroundColor Green

# Step 3: Clear npm cache
Write-Host "[3/6] Clearing npm cache..." -ForegroundColor Cyan
npm cache clean --force
Write-Host "   ✓ Cache cleared" -ForegroundColor Green

# Step 4: Verify package.json has Tailwind 3
Write-Host "[4/6] Verifying package.json..." -ForegroundColor Cyan
$packageJson = Get-Content package.json -Raw | ConvertFrom-Json
if ($packageJson.devDependencies.tailwindcss -ne "^3.4.1") {
    Write-Host "   ⚠ Fixing package.json..." -ForegroundColor Yellow
    $packageJson.devDependencies.tailwindcss = "^3.4.1"
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content package.json
}
Write-Host "   ✓ package.json verified" -ForegroundColor Green

# Step 5: Install dependencies
Write-Host "[5/6] Installing dependencies (this may take a few minutes)..." -ForegroundColor Cyan
npm install
Write-Host "   ✓ Dependencies installed" -ForegroundColor Green

# Step 6: Verify Tailwind installation
Write-Host "[6/6] Verifying Tailwind CSS installation..." -ForegroundColor Cyan
$tailwindVersion = npm list tailwindcss 2>&1 | Select-String "tailwindcss@" | Select-Object -First 1
if ($tailwindVersion -match "3\.4") {
    Write-Host "   ✓ Tailwind CSS 3.4.1 installed" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Warning: Tailwind version check failed" -ForegroundColor Yellow
    Write-Host "   Installing Tailwind CSS 3.4.1 explicitly..." -ForegroundColor Yellow
    npm install tailwindcss@3.4.1 --save-dev
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Now run: npm run dev" -ForegroundColor Yellow
Write-Host ""

