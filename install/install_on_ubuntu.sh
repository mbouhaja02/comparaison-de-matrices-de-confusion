#!/bin/bash

# Check Node.js installation and install if not present
command -v node >/dev/null 2>&1 || {
    echo >&2 "Node.js is not installed. Installing Node.js...";
    curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    sudo apt-get install -y nodejs
}

# Check npm installation and install if not present
command -v npm >/dev/null 2>&1 || {
    echo >&2 "npm is not installed. Installing npm...";
    sudo apt-get install -y npm
}

# Check if live-server is installed
command -v live-server >/dev/null 2>&1 || {
    echo >&2 "live-server is not installed. Installing live-server...";
    npm install live-server
}

# Check if express is installed
command -v express >/dev/null 2>&1 || {
    echo >&2 "express is not installed. Installing express...";
    npm install express
}

# Check if fs is installed
command -v fs >/dev/null 2>&1 || {
    echo >&2 "fs is not installed. Installing fs...";
    npm install fs
}

# Check if path is installed
command -v path >/dev/null 2>&1 || {
    echo >&2 "path is not installed. Installing path...";
    npm install path
}

# Check if ml-matrix is installed
command -v ml-matrix >/dev/null 2>&1 || {
    echo >&2 "ml-matrix is not installed. Installing ml-matrix...";
    npm install ml-matrix
}

# Check if munkres-js is installed
command -v munkres-js >/dev/null 2>&1 || {
    echo >&2 "munkres-js is not installed. Installing munkres-js...";
    npm install munkres-js
}

# Check Python installation and install if not present
command -v python >/dev/null 2>&1 || {
    echo >&2 "Python is not installed. Installing Python...";
    sudo apt-get install -y python3.8
}

# Install necessary Python libraries
pip install subprocess os re json sklearn pandas