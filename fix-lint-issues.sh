#!/bin/bash

echo "🔍 Starting automatic lint fixes for the new structure..."

# Check if Node.js version is correct
node check-node-version.js || exit 1

# Run Stylelint with --fix option on the new structure
echo "🛠️ Running Stylelint auto-fix..."
npx stylelint "src/styles/new/**/*.scss" --fix

echo "✅ Automatic fixes applied! Some issues may require manual fixes."
echo "📋 Running lint check again to see remaining issues..."
./lint-new-structure.sh

echo "
🔧 Manual fixes that may be needed:
1. Nested BEM selectors: Convert nested selectors to flat BEM structure
2. Complex property ordering: Some properties might need manual reordering
3. Empty files: Add content to empty files or remove them
" 