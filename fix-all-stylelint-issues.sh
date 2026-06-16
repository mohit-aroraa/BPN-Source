#!/bin/bash

# =====================================================
# Script to automatically fix stylelint errors in the project
# =====================================================

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${BOLD}${BLUE}🚀 Starting comprehensive stylelint auto-fix process...${RESET}"

# Check if Node.js version is correct
echo -e "${YELLOW}Checking Node.js version...${RESET}"
node check-node-version.js
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Node.js version check failed. Please use the correct version.${RESET}"
  exit 1
fi

# Create a backup directory for original files
BACKUP_DIR="stylelint_backup_$(date +%Y%m%d_%H%M%S)"
echo -e "${YELLOW}Creating backup directory: ${BACKUP_DIR}${RESET}"
mkdir -p "$BACKUP_DIR"

# First, copy all SCSS files in the new structure to the backup directory
echo -e "${YELLOW}Backing up SCSS files...${RESET}"
find src/styles/new -name "*.scss" -type f -exec bash -c 'mkdir -p '"$BACKUP_DIR"'/$(dirname {}) && cp {} '"$BACKUP_DIR"'/{}' \;
echo -e "${GREEN}✅ Backup completed${RESET}"

# Function to run stylelint fix with specific options
run_stylelint_fix() {
  local target=$1
  local desc=$2
  echo -e "\n${BOLD}${BLUE}🔧 Running auto-fix on ${desc}...${RESET}"
  npx stylelint "$target" --fix --cache --cache-location ./.stylelintcache/
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Successfully fixed stylelint issues in ${desc}${RESET}"
  else
    echo -e "${YELLOW}⚠️ Some issues couldn't be fixed automatically in ${desc}${RESET}"
  fi
}

# Step 1: Fix property order issues first (these are typically easier to auto-fix)
run_stylelint_fix "src/styles/new/**/*.scss" "property order issues"

# Step 2: Try to fix nesting issues (this is more complex and may require manual fixes)
run_stylelint_fix "src/styles/new/**/*.scss" "nesting issues"

# Step 3: Check if there are any other fixable issues
run_stylelint_fix "src/styles/new/**/*.scss" "remaining issues"

# Check for remaining issues
echo -e "\n${BOLD}${BLUE}📋 Checking for remaining stylelint issues...${RESET}"
npx stylelint "src/styles/new/**/*.scss" --cache --cache-location ./.stylelintcache/ > remaining_issues.txt
if [ $? -eq 0 ]; then
  echo -e "${GREEN}🎉 All stylelint issues have been fixed!${RESET}"
  rm remaining_issues.txt
else
  error_count=$(grep -c "error" remaining_issues.txt)
  echo -e "${YELLOW}⚠️ There are still approximately ${error_count} stylelint issues that require manual fixes.${RESET}"
  echo -e "${YELLOW}📝 Issues have been saved to remaining_issues.txt${RESET}"
fi

# Provide helpful information for manual fixes
echo -e "\n${BOLD}${BLUE}🔍 Manual fix guide for common remaining issues:${RESET}"
echo -e "
${BOLD}1. Nested selectors:${RESET}
   Change from: 
     .parent { &__child { ... } }
   To:
     .parent__child { ... }

${BOLD}2. Property ordering:${RESET}
   Follow this order:
   - Positioning: position, top, right, bottom, left, z-index
   - Box Model: display, width, height, margin, padding, border, etc.
   - Visual: background, color, opacity, etc.
   - Typography: font, text-align, etc.
   - Misc: cursor, transition, transform, etc.

${BOLD}3. Value keyword casing:${RESET}
   Use lowercase for keywords like 'currentcolor' (not 'currentColor')

${BOLD}4. Shorthand properties:${RESET}
   Use shorthand where appropriate:
   - 'padding: 5px 0 15px 0' should be 'padding: 5px 0 15px'
   - Use 'overflow: auto hidden' instead of setting each separately
"

echo -e "\n${BOLD}${GREEN}✅ Auto-fix process completed!${RESET}"
echo -e "${YELLOW}Original files have been backed up to ${BACKUP_DIR}/${RESET}"
echo -e "${BLUE}To compare changes: diff -r ${BACKUP_DIR}/src/styles/new/ src/styles/new/${RESET}" 