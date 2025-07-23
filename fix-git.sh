#!/bin/bash

echo "🔧 Miami Beach Yacht Club - Git Repository Repair Script"
echo "======================================================="
echo ""

# Function to check if we're in a git repository
check_git_repo() {
    if [ ! -d .git ]; then
        echo "❌ Error: Not in a git repository"
        exit 1
    fi
}

# Function to backup current state
backup_current_state() {
    echo "📦 Creating backup of current work..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    git stash push -m "backup_$timestamp" --include-untracked || true
}

# Function to clean lock files
clean_lock_files() {
    echo "🔓 Removing Git lock files..."
    rm -f .git/index.lock
    rm -f .git/HEAD.lock
    rm -f .git/refs/heads/*.lock
}

# Function to fix Git configuration
fix_git_config() {
    echo "⚙️  Fixing Git configuration..."
    git config --local core.autocrlf false
    git config --local core.filemode false
    git config --local core.ignorecase true
    git config --local merge.renameLimit 10000
    git config --local diff.renameLimit 10000
}

# Function to clean Git cache
clean_git_cache() {
    echo "🧹 Cleaning Git cache..."
    git rm -r --cached . >/dev/null 2>&1 || true
    git add .
}

# Function to repair index
repair_git_index() {
    echo "🔨 Repairing Git index..."
    rm -f .git/index
    git reset --mixed HEAD || git reset --mixed
}

# Function to verify remote
verify_remote() {
    echo "🌐 Verifying GitHub remote..."
    remote_url=$(git config --get remote.origin.url)
    if [ -z "$remote_url" ]; then
        echo "❌ No remote origin found"
        echo "Please add your GitHub repository URL:"
        echo "git remote add origin https://github.com/MBYCBrad/MiamiBeachYachtClub"
    else
        echo "✅ Remote origin: $remote_url"
    fi
}

# Main execution
main() {
    cd /home/runner/workspace || exit 1
    
    check_git_repo
    
    echo "🚀 Starting Git repository repair..."
    echo ""
    
    # Step 1: Clean lock files
    clean_lock_files
    
    # Step 2: Backup current state
    backup_current_state
    
    # Step 3: Fix configuration
    fix_git_config
    
    # Step 4: Repair index
    repair_git_index
    
    # Step 5: Clean cache
    clean_git_cache
    
    # Step 6: Verify remote
    verify_remote
    
    # Step 7: Check final status
    echo ""
    echo "📊 Final Git status:"
    git status --short
    
    echo ""
    echo "✅ Git repository repair completed!"
    echo ""
    echo "Next steps:"
    echo "1. Review the status above"
    echo "2. If you have changes to commit: git commit -m 'Your message'"
    echo "3. Push to GitHub: git push origin main"
    echo ""
    echo "If you had stashed changes, restore them with: git stash pop"
}

# Run main function
main