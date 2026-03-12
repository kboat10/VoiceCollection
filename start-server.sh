#!/bin/bash

echo "VoiceGuard Static App Startup"
echo "============================="

if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is required. Install from https://nodejs.org/"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Starting static server at http://localhost:3000"
npm run start
