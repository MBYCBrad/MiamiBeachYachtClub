#!/bin/bash

# Fix JSX syntax errors in admin-dashboard.tsx
# Correct indentation issues in renderPayments function

echo "Fixing JSX syntax errors in admin-dashboard.tsx..."

# Use sed to fix indentation in renderPayments function
sed -i '3063,3120s/^      /          /' client/src/pages/admin-dashboard.tsx
sed -i '3121,3200s/^        /            /' client/src/pages/admin-dashboard.tsx
sed -i '3201,3280s/^          /              /' client/src/pages/admin-dashboard.tsx
sed -i '3281,3355s/^            /                /' client/src/pages/admin-dashboard.tsx

echo "JSX syntax fixes applied successfully"