#!/bin/bash

# Update all admin pages to use consistent dark background with dark grey cards styling
# Replace slate colors with gray colors to match admin overview

# Crew Management
sed -i 's/bg-slate-800\/50 border-slate-700/bg-gray-900\/50 border-gray-700\/50/g' client/src/pages/crew-management.tsx
sed -i 's/bg-slate-700\/50/bg-gray-800\/50/g' client/src/pages/crew-management.tsx
sed -i 's/border-slate-600/border-gray-700/g' client/src/pages/crew-management.tsx
sed -i 's/text-slate-/text-gray-/g' client/src/pages/crew-management.tsx

# Staff Management
sed -i 's/bg-slate-800\/50 border-slate-700/bg-gray-900\/50 border-gray-700\/50/g' client/src/pages/staff-management.tsx
sed -i 's/bg-slate-700\/50/bg-gray-800\/50/g' client/src/pages/staff-management.tsx
sed -i 's/border-slate-600/border-gray-700/g' client/src/pages/staff-management.tsx
sed -i 's/text-slate-/text-gray-/g' client/src/pages/staff-management.tsx

# Yacht Maintenance
sed -i 's/bg-slate-800\/50 border-slate-700/bg-gray-900\/50 border-gray-700\/50/g' client/src/pages/yacht-maintenance.tsx
sed -i 's/bg-slate-700\/50/bg-gray-800\/50/g' client/src/pages/yacht-maintenance.tsx
sed -i 's/border-slate-600/border-gray-700/g' client/src/pages/yacht-maintenance.tsx
sed -i 's/text-slate-/text-gray-/g' client/src/pages/yacht-maintenance.tsx

# Customer Service Dashboard
sed -i 's/bg-slate-800\/50 border-slate-700/bg-gray-900\/50 border-gray-700\/50/g' client/src/pages/customer-service-dashboard.tsx
sed -i 's/bg-slate-700\/50/bg-gray-800\/50/g' client/src/pages/customer-service-dashboard.tsx
sed -i 's/border-slate-600/border-gray-700/g' client/src/pages/customer-service-dashboard.tsx
sed -i 's/text-slate-/text-gray-/g' client/src/pages/customer-service-dashboard.tsx

echo "Admin styling updated to match overview design"