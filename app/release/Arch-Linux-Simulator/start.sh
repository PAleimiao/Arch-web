#!/bin/bash

echo "=========================================="
echo "   Arch Linux Web Simulator"
echo "=========================================="
echo ""

# Check if electron is installed
if [ ! -d "node_modules/electron" ]; then
    echo "Installing Electron..."
    npm install electron --save-dev
    if [ $? -ne 0 ]; then
        echo "Failed to install Electron. Please install Node.js first."
        echo "Download from: https://nodejs.org/"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

echo "Starting Arch Linux Web Simulator..."
echo ""
npx electron electron/main.js
