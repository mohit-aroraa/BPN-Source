# Code Guidelines for Bare Performance Nutrition Storefront

This guide covers the coding standards for our Shopify theme. Following these guidelines helps us maintain a consistent, high-quality codebase that's easy to work with.

## Table of Contents

1. [Development Environment](#development-environment)
2. [CSS/SCSS Guidelines](#cssscss-guidelines)
3. [JavaScript Guidelines](#javascript-guidelines)
4. [Linting and Code Quality](#linting-and-code-quality)
5. [Git Workflow](#git-workflow)

## Development Environment

### Node.js Version

- **Required**: Node.js v18.20.0 or higher
- Run `nvm use` in the project root to automatically switch to the correct version
- All scripts will check your Node.js version and fail if it's not compatible

### Editor Setup

- We recommend VS Code with our workspace settings
- Install these extensions:
  - ESLint
  - Stylelint
  - Shopify Liquid
- Turn on "Format on Save" for automatic formatting
- Use 2 spaces for indentation (set in .editorconfig)

## CSS/SCSS Guidelines

### ITCSS Architecture

We organize our CSS using the ITCSS (Inverted Triangle CSS) approach:

1. **tokens/** - Variables and design tokens (no CSS output)
2. **layout/** - Major layout components (header, footer, grid)
3. **components/** - Reusable UI components (buttons, cards, etc.)
4. **sections/** - Shopify section styles
5. **templates/** - Page-specific styles
6. **utilities/** - Helper classes with high specificity

Always add new styles to the right layer to keep our code organized.

### BEM Naming Convention

We use BEM for class names:

```scss
.block {}                  // The main component
.block__element {}         // A part of the component
.block--modifier {}        // A variation of the component
.block__element--modifier {} // A variation of an element
```

#### Flat BEM Structure (Required)

Always write BEM classes in a flat structure:

✅ **DO THIS**:
```scss
.block {}
.block__elem1 {}
.block__elem2 {}
.block__elem3 {}
```

❌ **AVOID THIS**:
```scss
.block {
  &__elem1 {}
  &__elem2 {}
  &__elem3 {}
}
```

### SCSS Best Practices

1. **Keep nesting shallow**: Max 2 levels deep
2. **Use variables for common values**: Colors, spacing, etc.
3. **Alphabetize properties**: Makes them easier to find
4. **Use single quotes** for strings and URLs
5. **Use short hex codes** when possible (`#fff` instead of `#ffffff`)
6. **No named colors**: Use hex or RGB/RGBA values
7. **No vendor prefixes**: Autoprefixer handles these
8. **Add empty lines** between rule blocks
9. **Use lowercase** for everything

### CSS Specificity Tips

1. **Keep specificity low**: Avoid deep nesting and complex selectors
2. **No IDs for styling**: They're too specific
3. **Avoid `!important`**: Only use in utility classes
4. **Use classes** instead of element selectors when possible

## JavaScript Guidelines

### General Principles

1. **Use modern JS**: ES6+ features make code cleaner
2. **Write small functions**: Each function should do one thing well
3. **Use clear names**: Variables and functions should be self-explanatory
4. **Comment when needed**: Explain complex logic, not obvious code
5. **Use camelCase** for variables and functions
6. **Use PascalCase** for classes
7. **Prefer const and let** over var

### Vue.js Guidelines

1. **Use .vue files**: Keep template, script, and style together
2. **Follow Vue's style guide**: Especially Priority A and B rules
3. **Use props for data flow**: Pass data from parent to child
4. **Use Vuex for shared state**: When components need to share data
5. **Keep components focused**: Each component should have a single purpose

## Linting and Code Quality

### Automatic Linting and Formatting

We use pre-commit hooks to check and format your code before each commit:

- JavaScript/Vue files → ESLint for linting and formatting
- SCSS files → Stylelint for linting and formatting
- New structure files → Specialized config

### Manual Linting

You can also run linting yourself:

```sh
# Check all files
npm run lint

# Check only files in the new structure
npm run lint:new
```

### Linting and Formatting Rules

- **ESLint**: Based on Shopify's config for JavaScript
- **Stylelint**: Uses standard SCSS rules for both linting and formatting
- **Custom rules**: Check our config files for project-specific rules

### Common Linting Issues

1. **BEM naming**: Make sure classes follow our BEM pattern
2. **Nesting depth**: Keep nesting to max 2 levels
3. **Property order**: Keep properties in alphabetical order
4. **Trailing whitespace**: Remove extra spaces at line ends
5. **Color format**: Use rgba() format for colors with transparency

## Git Workflow

### Branching Strategy

Here's how we organize our branches:

1. **Master Branch**
   - This is our production code
   - Feature and hotfix branches merge into Master
   - Staging never merges into Master

2. **Staging Branch**
   - For testing in the staging environment
   - All feature branches merge here first
   - Used for stakeholder reviews

3. **Feature Branches**
   - For new features
   - Name format: `feature/ticket-id/name-of-the-ticket`
   - Branch from Master
   - Merge to Staging for testing, then to Master via PR

4. **Hotfix Branches**
   - For urgent production fixes
   - Name format: `hotfix/ticket-id/name-of-the-ticket`
   - Branch from Master
   - Merge to both Master and Staging

### Commit Guidelines

1. **Write clear messages**: Explain what changed and why
2. **Keep commits focused**: One logical change per commit
3. **Commit regularly**: Small, frequent commits are better than big ones
4. **Run linting first**: Our pre-commit hooks help with this

### Deployment Process

#### Staging Deployment

1. **Merge to Staging**
   - Merge your feature branch to staging and push

2. **Automatic Deployment**
   - GitHub Action builds and deploys to the staging theme

3. **Theme ID**
   - Set in GitHub environment settings

4. **Slack Notification**
   - You'll get a Slack message when deployment finishes

#### Production Deployment

1. **Create a PR**
   - Open a pull request from your feature branch to master

2. **Code Review**
   - Get your code reviewed by the team
   - Once approved, merge to master

3. **Duplicate the Live Theme**
   - In Shopify admin, duplicate the live theme
   - Copy the new Theme ID

4. **Update GitHub Settings**
   - Update the Theme ID in GitHub environment settings

5. **Trigger Deployment**
   - Manually trigger the production action in GitHub

6. **QA Testing**
   - QA team tests the duplicated theme
   - They check for bugs and regressions

7. **Publish**
   - Once QA approves, publish the theme to make it live

## Conclusion

These guidelines help us work together effectively. If you have questions or suggestions, talk to the team.

Remember: These rules exist to make our lives easier, not harder. The goal is code that everyone can understand and maintain. 