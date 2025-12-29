#!/bin/bash

set -e

# Configuration
INSTALL_DIR="$HOME/.enokmethod-src"
# CHANGE THIS URL TO YOUR GITHUB REPO URL
REPO_URL="https://github.com/tky0065/enokMethode.git"

echo "🚀 Installing EnokMethod..."

# 1. Check dependencies
if ! command -v git &> /dev/null; then
    echo "❌ Error: git is not installed."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed (Node.js required)."
    exit 1
fi

# 2. Setup Directory
if [ -d "$INSTALL_DIR" ]; then
    echo "🔄 Updating existing installation..."
    cd "$INSTALL_DIR"
    git pull origin main
else
    echo "mw Cloning repository..."
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# 3. Install & Link
echo "📦 Installing dependencies..."
npm install --production --silent

echo "Bg Linking global command..."
# Unlink first to avoid conflicts
npm unlink -g enokmethod &> /dev/null || true
npm link

echo "✅ EnokMethod installed successfully!"
echo "   Try running: enokmethod --help"
