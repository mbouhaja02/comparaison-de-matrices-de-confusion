# Check Node.js installation and install if not present
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Installing Node.js..."
    choco install nodejs -y
}

# Check npm installation
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "npm is not installed."
} else {
    Write-Host "npm is installed."
}

# Check if live-server is installed
if (!(Get-Command live-server -ErrorAction SilentlyContinue)) {
    Write-Host "live-server is not installed. Installing live-server..."
    npm install live-server
}

# Check if express is installed
if (!(Get-Command express -ErrorAction SilentlyContinue)) {
    Write-Host "express is not installed. Installing express..."
    npm install express
}

# Check if fs is installed
if (!(Get-Command fs -ErrorAction SilentlyContinue)) {
    Write-Host "fs is not installed. Installing fs..."
    npm install fs
}

# Check if path is installed
if (!(Get-Command path -ErrorAction SilentlyContinue)) {
    Write-Host "path is not installed. Installing path..."
    npm install path
}

# Check if ml-matrix is installed
if (!(Get-Command ml-matrix -ErrorAction SilentlyContinue)) {
    Write-Host "ml-matrix is not installed. Installing ml-matrix..."
    npm install ml-matrix
}

# Check if munkres-js is installed
if (!(Get-Command munkres-js -ErrorAction SilentlyContinue)) {
    Write-Host "munkres-js is not installed. Installing munkres-js..."
    npm install munkres-js
}

# Check Python installation and install if not present
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not installed. Installing Python..."
    choco install python -y
}

# Install necessary Python libraries
pip install subprocess os re json sklearn pandas