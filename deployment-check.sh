
#!/bin/bash

echo "🔍 MBYC Deployment Readiness Check"
echo "=================================="

# Check Git status
echo "📁 Git Repository Status:"
git status --porcelain
if [ $? -eq 0 ]; then
    echo "✅ Git repository is clean"
else
    echo "❌ Git repository has issues"
fi

# Check if on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" = "main" ]; then
    echo "✅ On main branch"
else
    echo "⚠️  Currently on branch: $BRANCH"
fi

# Check remote connection
git ls-remote origin > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ GitHub remote connected"
else
    echo "❌ GitHub remote connection failed"
fi

# Check build readiness
echo ""
echo "🏗️  Build System Check:"
if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json missing"
fi

if [ -f "vite.config.ts" ]; then
    echo "✅ Vite config found"
else
    echo "❌ Vite config missing"
fi

# Check deployment config
if [ -f ".replit" ]; then
    echo "✅ Replit config found"
else
    echo "❌ Replit config missing"
fi

echo ""
echo "🚀 Ready for deployment!"
echo "Use: npm run build && npm start"
