# Git Setup and GitHub Integration Guide

## 🔧 Quick Fix for Git Errors

If you're experiencing "Unknown Git Error" in Replit, follow these steps:

### 1. Open Shell Terminal
Click the Shell tab in Replit and run these commands:

```bash
# Navigate to project directory
cd /home/runner/workspace

# Remove lock file if it exists
rm -f .git/index.lock

# Reset Git index
git rm -r --cached .
git add .

# Commit all changes
git commit -m "Fix: Repository cleanup and GitHub integration"

# Add GitHub remote (if not already added)
git remote add origin https://github.com/MBYCBrad/MiamiBeachYachtClub.git

# Push to GitHub
git push -u origin main
```

## 📝 GitHub Repository Setup

### 1. Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `MiamiBeachYachtClub`
3. Description: "Luxury yacht membership platform with comprehensive booking and management system"
4. Keep it Public or Private as preferred
5. DO NOT initialize with README (we already have one)

### 2. Connect Replit to GitHub
1. In Replit, click the Git icon in the left sidebar
2. Click "Connect to GitHub"
3. Authorize Replit to access your GitHub
4. Select your repository

### 3. Push Existing Code
```bash
# If you haven't committed yet
git add .
git commit -m "Initial commit: Complete MBYC platform"

# Push to GitHub
git push origin main
```

## 🔄 Ongoing Git Workflow

### Daily Commits
```bash
# Check status
git status

# Add changes
git add .

# Commit with meaningful message
git commit -m "feat: Add new feature description"

# Push to GitHub
git push
```

### Commit Message Format
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Test additions/changes

## ⚠️ Troubleshooting

### Permission Denied
```bash
# Set up SSH key or use personal access token
git remote set-url origin https://<token>@github.com/MBYCBrad/MiamiBeachYachtClub.git
```

### Large Files Error
```bash
# Use Git LFS for large media files
git lfs track "*.mp4"
git lfs track "*.webp"
git add .gitattributes
```

### Merge Conflicts
```bash
# Pull latest changes
git pull origin main

# Resolve conflicts in files
# Then commit
git add .
git commit -m "fix: Resolve merge conflicts"
git push
```

## 🚀 GitHub Actions & Deployment

The CI/CD pipeline is configured in `.github/workflows/ci.yml`:
- ✅ Runs tests on every push
- ✅ Builds the application  
- ✅ Checks TypeScript types
- ✅ Automated deployment preparation
- ✅ Replit deployment integration

### Replit Deployment (Recommended)
Your project is optimized for Replit deployment:
```bash
# Build command: npm run build
# Run command: npm start
# Port: 5000 (auto-forwarded to 80/443)
```

### Deployment Status
- ✅ Database: PostgreSQL connected
- ✅ Environment: Production-ready
- ✅ Build: Optimized bundles
- ✅ Security: Session-based auth
- ✅ Performance: Ultra-fast caching
- ✅ CI/CD: GitHub Actions active

## 📦 Files Included

✅ Complete source code
✅ README.md with documentation
✅ LICENSE (MIT)
✅ .gitignore configured
✅ GitHub Actions CI/CD
✅ Package configuration

## 🎯 Next Steps

1. Run the Git commands above to fix any current issues
2. Set up GitHub repository
3. Connect Replit to GitHub
4. Enable GitHub Actions for CI/CD
5. Configure deployment (Replit Deployments recommended)

---

Need help? The MBYC platform is production-ready with:
- ✅ Complete authentication system
- ✅ Real-time database integration
- ✅ Payment processing
- ✅ Performance optimization
- ✅ Role-based dashboards
- ✅ Ultra-fast caching