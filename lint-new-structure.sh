#!/bin/bash

# Script to lint only the new folder structure
echo "Linting new folder structure..."

# Run stylelint from the root directory
echo "Running Stylelint..."
npx stylelint "src/styles/new/**/*.scss"

# Note: Not running ESLint as there are no JavaScript files in the styles directory

echo "Linting complete!"
