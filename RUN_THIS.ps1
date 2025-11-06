# Stop any running Node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "Cleaning..." -ForegroundColor Yellow
Remove-Item -Path node_modules,.next,package-lock.json -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Clearing cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "Installing Tailwind CSS 3.4.1..." -ForegroundColor Yellow
npm install tailwindcss@3.4.1 --save-dev

Write-Host "Installing all dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`n✅ Done! Now run: npm run dev" -ForegroundColor Green

