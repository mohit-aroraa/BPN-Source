# Bare Performance Nutrition Storefront

This Shopify theme is built on top of [Shopify-Shell](https://anatta.io/) by Anatta.io to create a modular, scalable, and maintainable codebase. It uses Webpack 4 to build and optimize the theme while implementing advanced performance, development, and CSS architecture standards.

## Supported Features

- **Module Bundling & Code Splitting:** Bundles and splits JS and SCSS into optimized, smaller chunks.
- **Asset Optimization & Sourcemaps:** Optimizes assets for production with support for JS and Sass sourcemaps in development.
- **Linting & Safe Deploy:** Integrated ESLint and Stylelint with safety checks to prevent accidental live deployments.
- **Code Formatting:** Stylelint integration for consistent SCSS formatting in the new structure.
- **Design Token System:** Uses an advanced SCSS token system to standardize styling rules.
- **Modular Architecture:** A fully modular theme with reusable CSS/JS components and lazy-loaded modules.
- **Performance Enhancements:** Implements tree shaking, vendor chunking, and common chunks for improved performance.
- **Hot Module Replacement (HMR):** Enables automatic browser reloads during development.
- **Modern CSS Architecture:** Uses ITCSS for file organization and BEM for naming conventions.

## System Requirements

- [Node.js](https://nodejs.org/en/) (v23.6.0) - **REQUIRED**
- [Yarn](https://yarnpkg.com/) (installed globally)
- [Shopify CLI 3.0](https://shopify.dev/docs/themes/tools/cli)

## Getting Started

### 1. Clone the Repository

```sh
git clone git@github.com:Bare-Performance-Nutrition/bareperformancenutrition.com.git
cd bareperformancenutrition.com
```

### 2. Quick Setup (Recommended)

If you already have Node.js v23.6.0 installed via asdf or nvm:

```sh
bin/setup
```

This will install dependencies, set up the Shopify CLI, and create your `.env` file.

---

### Manual Setup

If you prefer to set things up manually, or if the setup script fails, follow these steps:

#### 2a. Install Node.js v23.6.0

Choose one of the following methods:

**Using asdf (recommended):**

```sh
# Install the Node.js plugin if you haven't already
asdf plugin add nodejs

# Install and activate the required version (reads from .tool-versions)
asdf install
```

**Using nvm:**

```sh
# Install and activate the required version (reads from .nvmrc)
nvm install
nvm use
```

#### 2b. Install Yarn and Shopify CLI

```sh
npm install -g yarn @shopify/cli@latest
```

**If using asdf**, reshim to make the new commands available:

```sh
asdf reshim nodejs
```

#### 2c. Install Dependencies

```sh
yarn install
```

#### 2d. Configure Environment

Copy the sample environment file and update it with your Shopify store details:

```sh
cp env.sample .env
```

Then edit `.env` and fill in:

- **STORE_URL** — Your Shopify store URL (e.g., `my-store.myshopify.com`)
- **THEME_ID** — Your local development theme ID (see below)

**Which theme ID to use for local dev?**

| Option                               | When to Use                                                |
| ------------------------------------ | ---------------------------------------------------------- |
| **Personal dev theme** (recommended) | Create your own unpublished theme for isolated development |
| **Staging theme**                    | When you need to test alongside team changes               |

To create a personal dev theme: duplicate an existing theme in Shopify Admin and name it `Dev - [Your Name]`.

To find a theme ID: Go to _Online Store → Themes → ... → Edit code_ — the ID is in the URL.

See [Deployment Documentation](./docs/DEPLOYMENT.md#local-development-theme) for more details.

### 3. Start Development

```sh
yarn dev
```

## Branching & Deployment

This project uses a three-stage deployment pipeline:

| Branch        | Purpose                                         | Auto-Deploys To        |
| ------------- | ----------------------------------------------- | ---------------------- |
| `development` | Default branch for feature integration          | Staging Theme          |
| `master`      | Production releases                             | Preview Theme (for QA) |
| `feature/*`   | Individual features (branch from `development`) | None                   |

**Workflow:**

1. Create feature branches from `development`
2. Open PR → automated lint/build checks
3. Merge to `development` → auto-deploys to staging
4. Create release PR (`development` → `master`) → auto-deploys to preview
5. QA the preview → manually trigger production deployment

For complete details, see the [Deployment Documentation](./docs/DEPLOYMENT.md).

## Project Documentation

We maintain several documentation files to help you understand and work with this project:

| Document                                               | Purpose                                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [**Deployment Pipeline**](./docs/DEPLOYMENT.md)        | CI/CD pipeline, environments, and deployment process                                        |
| [**Modernization Plan**](./docs/MODERNIZATION_PLAN.md) | Details our parallel architecture approach, directory structure, and implementation details |
| [**Code Guidelines**](./docs/CODE_GUIDELINES.md)       | Coding standards and best practices for the project                                         |
| [**BEM Structure Guide**](./docs/fix-bem-nesting.md)   | Guide for converting nested BEM selectors to flat structure                                 |
| [**JS Features Documentation**](./docs/README.md)      | Detailed documentation for JavaScript features and modular architecture                     |

**New developers should start by reading the [Deployment Documentation](./docs/DEPLOYMENT.md)** and the [Modernization Plan](./docs/MODERNIZATION_PLAN.md) to understand our workflow and architecture.

### JavaScript Feature Documentation

The [JS Features Documentation](./docs/README.md) covers our modular JavaScript architecture and includes detailed guides for:

- [Collection Filters](./docs/features/collection-filters.md) - Instant filtering using Shopify's GraphQL API
- [Hamburger Menu](./docs/features/hamburger-menu.md) - Mobile navigation with submenus
- [Data Safety Utilities](./docs/features/data-safety.md) - Utilities for handling undefined or null data
- [Vue.js Safety Utilities](./docs/features/vue-safety.md) - Utilities for handling Vue.js safety

Direct links to JavaScript feature documentation:

- [Collection Filters Documentation](./docs/features/collection-filters.md)
- [Hamburger Menu Documentation](./docs/features/hamburger-menu.md)
- [Data Safety Utilities Documentation](./docs/features/data-safety.md)
- [Vue.js Safety Utilities Documentation](./docs/features/vue-safety.md)

## Quick Reference

### Common Commands

| Command                | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `bin/setup`            | Run initial project setup                       |
| `yarn dev`             | Start the development server with hot reloading |
| `yarn build`           | Build the theme for production                  |
| `yarn deploy`          | Build and deploy the theme to Shopify           |
| `yarn lint:new`        | Run linting only on the new structure           |
| `./fix-lint-issues.sh` | Automatically fix common linting issues         |

For a complete list of available scripts, see the [Modernization Plan](./docs/MODERNIZATION_PLAN.md#tools-and-scripts).

## Resources

- [Deployment Pipeline](./docs/DEPLOYMENT.md)
- [CSS Code Guidelines](./docs/CODE_GUIDELINES.md)
- [Shopify CLI Documentation](https://shopify.dev/docs/themes/tools/cli)
- [Shopify Liquid Reference](https://shopify.dev/docs/api/liquid)
