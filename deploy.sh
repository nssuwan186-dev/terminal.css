#!/bin/bash
# ===== terminal-room-dashboard auto deploy script =====

echo "🧱 Building project..."
npm run build || { echo "❌ Build failed!"; exit 1; }

echo "📦 Adding build files to git..."
git add . && git commit -m "Auto deploy update $(date '+%Y-%m-%d %H:%M:%S')"

echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Done! Your latest build is live on GitHub Pages 🎉"
