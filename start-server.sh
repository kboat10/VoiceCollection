#!/bin/bash

# VoiceGuard Data Collection Server Startup Script

echo "🎙️  VoiceGuard Data Collection Server"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg is not installed (required for audio conversion)"
    echo "   Install with: brew install ffmpeg"
    echo ""
    read -p "Continue without FFmpeg? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ FFmpeg found: $(ffmpeg -version | head -n 1)"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting server..."
echo ""
echo "Access the app at:"
echo "  • Local:    http://localhost:3000"
echo "  • Network:  http://$(ipconfig getifaddr en0 2>/dev/null || hostname):3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "======================================"
echo ""

# Start the server
node server.js
