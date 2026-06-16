# Deployment Pipeline

This document outlines the CI/CD deployment pipeline for the BPN Storefront theme.

## Overview

We use a three-stage deployment pipeline that ensures code quality and provides multiple opportunities for testing before changes reach production.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DEPLOYMENT PIPELINE                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  feature/xyz ────┐                                                              │
│                  │  PR + Lint/Build Check                                       │
│  feature/abc ────┼──────────────────► development (default branch)              │
│                  │                           │                                  │
│  feature/123 ────┘                           │ Auto-deploy on merge             │
│                                              ▼                                  │
│                                    ┌─────────────────┐                          │
│                                    │  STAGING THEME  │  ← Ongoing testing       │
│                                    └─────────────────┘                          │
│                                              │                                  │
│                                              │ Manual: "Cut Release" workflow   │
│                                              │ (fast-forward merge, no PR)      │
│                                              ▼                                  │
│                                           master                                │
│                                              │                                  │
│                                              │ Auto-deploy on merge             │
│                                              ▼                                  │
│                                    ┌──────────────────┐                         │
│                                    │ PROD PREVIEW     │  ← QA before go-live    │
│                                    │ (unpublished)    │                         │
│                                    └──────────────────┘                         │
│                                              │                                  │
│                                              │ Manual: "Production" workflow    │
│                                              ▼                                  │
│                                    ┌──────────────────┐                         │
│                                    │   PRODUCTION     │  ← Published theme      │
│                                    └──────────────────┘                         │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Branches

| Branch        | Purpose                                                | Deploys To            |
| ------------- | ------------------------------------------------------ | --------------------- |
| `development` | Default branch. All feature development merges here.   | Staging Theme         |
| `master`      | Production-ready code. Release commits only.           | Prod Preview Theme    |
| `feature/*`   | Individual feature branches created from `development` | None (PR checks only) |

## Environments

### 1. Staging (Development Branch)

- **Trigger:** Push/merge to `development` branch
- **Theme:** Unpublished staging theme for team testing
- **Purpose:** Continuous integration testing of merged features
- **Workflow:** `.github/workflows/deploy.yml` (Staging environment)

### 2. Preview (Master Branch)

- **Trigger:** Push/merge to `master` branch (via Cut Release workflow)
- **Theme:** Fresh copy of the live theme with new code applied
- **Purpose:** Final QA before production deployment — see exactly what production will look like
- **Workflow:** `.github/workflows/deploy.yml` (Preview environment)

**How it works:** Each preview deployment:

1. Pulls the current live theme (including all settings and content)
2. Overlays the built code files (keeping JSON settings from live)
3. Pushes as a new unpublished theme named `Preview - {timestamp} ({commit})`

This ensures the preview is an exact representation of what production will look like after deployment.

### 3. Production (Manual Trigger)

- **Trigger:** Manual workflow dispatch after QA approval
- **Theme:** Published live theme
- **Purpose:** Customer-facing storefront
- **Workflow:** `.github/workflows/production.yml`

## Workflow Details

### Pull Request Checks

All pull requests automatically run:

1. **Linting** - ESLint and Stylelint checks
2. **Build Verification** - Ensures the theme builds successfully

PRs cannot be merged until these checks pass.

### Cut Release (development → master)

The "CUT RELEASE" workflow (`.github/workflows/release.yml`) handles promoting code from `development` to `master` using a fast-forward merge. This keeps both branch histories identical with no merge commits.

> **Note:** This workflow uses the `RELEASE_TOKEN` secret to bypass branch protection. See [Credentials & Secrets](./CREDENTIALS.md) for details.

Manually triggered from GitHub Actions:

1. Validates the confirmation input
2. Checks out `development` and pulls latest
3. Creates an empty release marker commit
4. Pushes to `development`
5. Fast-forward merges into `master`
6. Pushes to `master` (triggers Preview deployment automatically)

### Theme Deployment (Staging & Preview)

A single workflow (`.github/workflows/deploy.yml`) handles both staging and preview deployments. The behavior differs by branch:

| Branch        | Environment | Deployment Strategy                         |
| ------------- | ----------- | ------------------------------------------- |
| `development` | Staging     | Push to static staging theme                |
| `master`      | Preview     | Duplicate live theme, push code to the copy |

#### Staging Deployment (development branch)

1. Checkout repository and build theme
2. Push to the staging theme ID (preserves theme settings with `--ignore "**/*.json"`)

#### Preview Deployment (master branch)

1. Checkout repository and build theme
2. Pull the current live theme (including all settings/content)
3. Merge: overlay built code files, keep JSON settings from live
4. Push as a new unpublished theme named `Preview - {timestamp} ({commit})`
5. Output summary with preview links

This means each preview is a true representation of what production will look like after deployment — same settings, same content, new code.

### Production Deployment

Manually triggered after QA approval:

1. Requires typing "deploy" to confirm
2. Uses Production environment (can have additional approval rules)
3. Deploys to the live published theme
4. Outputs deployment summary

## GitHub Setup

### Required Environments

Create these environments in GitHub Settings → Environments:

#### Staging Environment

| Type     | Name                      | Value                                             |
| -------- | ------------------------- | ------------------------------------------------- |
| Variable | `SHOPIFY_FLAG_STORE`      | Your store URL (e.g., `your-store.myshopify.com`) |
| Variable | `THEME_ID`                | Staging theme ID                                  |
| Secret   | `SHOPIFY_CLI_THEME_TOKEN` | Theme Access password                             |

#### Preview Environment

| Type     | Name                      | Value                                        |
| -------- | ------------------------- | -------------------------------------------- |
| Variable | `SHOPIFY_FLAG_STORE`      | Your store URL                               |
| Secret   | `SHOPIFY_CLI_THEME_TOKEN` | Theme Access password (needs `write_themes`) |

> **Note:** Preview no longer needs a `THEME_ID` — it dynamically creates a new theme by duplicating the live theme each time. This ensures previews always reflect the current production settings.

#### Production Environment

| Type     | Name                      | Value                           |
| -------- | ------------------------- | ------------------------------- |
| Variable | `SHOPIFY_FLAG_STORE`      | Your store URL                  |
| Variable | `THEME_ID`                | Production theme ID (published) |
| Secret   | `SHOPIFY_CLI_THEME_TOKEN` | Theme Access password           |

**Optional:** Add environment protection rules to Production requiring approval before deployment.

### Getting a Theme Access Password

1. Install the [Theme Access](https://apps.shopify.com/theme-access) app in your Shopify store
2. Generate a new password with appropriate permissions
3. Add the password as the `SHOPIFY_CLI_THEME_TOKEN` secret in each environment

For detailed instructions, see [Shopify's CI/CD documentation](https://shopify.dev/docs/storefronts/themes/tools/cli/ci-cd).

### Finding Theme IDs

1. Go to Shopify Admin → Online Store → Themes
2. Click the three dots (...) on a theme → Edit code
3. The Theme ID is in the URL: `https://admin.shopify.com/store/YOUR-STORE/themes/THEME_ID/editor`

## Developer Workflow

### Local Development Theme

For local development, you have two options:

#### Option A: Personal Development Theme (Recommended)

Each developer creates their own unpublished theme for local work. This prevents conflicts with CI deployments to staging.

**Automated (recommended):**

```bash
yarn create-dev-theme           # Uses your git name
yarn create-dev-theme "Pierce"  # Custom name
```

This creates an unpublished theme on the staging store and updates your `.env` automatically.

**Manual:**

1. In Shopify Admin → Themes, duplicate an existing theme or create a new one
2. Name it something like `Dev - [Your Name]`
3. Copy the theme ID and add it to your local `.env` file

This keeps your local changes isolated until you push to a feature branch.

#### Option B: Use the Staging Theme

For smaller teams or when you need to see your changes alongside others' work, you can use the staging theme directly. Just coordinate with your team to avoid stepping on each other's changes.

**When to use each:**

| Scenario                                     | Theme                           |
| -------------------------------------------- | ------------------------------- |
| Building a new feature in isolation          | Personal dev theme              |
| Testing integration with recent team changes | Staging theme                   |
| Debugging a staging issue                    | Staging theme                   |
| QA before production release                 | Preview theme (via GitHub)      |
| Emergency production hotfix                  | Production theme (with caution) |

### Starting a New Feature

```bash
# Make sure you're on the latest development branch
git checkout development
git pull origin development

# Create a feature branch
git checkout -b feature/my-new-feature
```

### Developing & Testing Locally

```bash
# Start development server (uses THEME_ID from your .env)
yarn dev

# Run linting
yarn lint

# Build for production
yarn build

# Deploy to your personal dev theme
yarn deploy
```

The `yarn deploy` command builds the theme and pushes it to the theme specified by `THEME_ID` in your `.env` file. This is safe to use with your personal dev theme since you own it and don't need to preserve theme editor settings.

> **Note:** Only use `yarn deploy` for your personal dev theme. Staging, preview, and production deployments should always go through the CI/CD pipeline to ensure proper handling of theme settings.

### Submitting Changes

```bash
# Push your feature branch
git push origin feature/my-new-feature

# Create a Pull Request to development branch on GitHub
```

## Theme Settings & JSON Files

### Understanding the Split Source of Truth

Shopify themes have two types of files:

| Type                 | Examples                                 | Source of Truth      | Updated By             |
| -------------------- | ---------------------------------------- | -------------------- | ---------------------- |
| **Code files**       | `.liquid`, `.js`, `.css`                 | Git repository       | Developers via PRs     |
| **Settings/Content** | `settings_data.json`, `*.json` templates | Shopify theme editor | Marketing/content team |

Our deployment workflow uses `--ignore "**/*.json"` to preserve theme editor customizations. This means:

- ✅ Code changes deploy normally
- ✅ Theme editor settings are never overwritten
- ⚠️ The repo doesn't automatically reflect production settings

### Why This Matters

Without syncing, the git repository only represents ~70% of what's actually in production. The JSON files (theme settings, section configurations, template layouts) live only in Shopify.

### Pre-Release Settings Sync

Before creating a release, sync production settings to capture the current state:

```bash
# Sync production settings to the repo
yarn sync:production

# Or with auto-commit
yarn sync:production --commit
```

This pulls:

- `config/settings_data.json` — Theme settings and section configurations
- `templates/*.json` — Template JSON files
- `sections/*.json` — Section JSON files

**Benefits:**

- Version history of theme editor changes
- Disaster recovery capability
- Audit trail of what changed between releases
- Complete snapshot of production at each release

### Setting Up the Sync Script

Add `PROD_THEME_ID` to your `.env` file:

```bash
# Production theme ID for syncing settings
PROD_THEME_ID=123456789
```

To find your production theme ID: Go to Shopify Admin → Online Store → Themes → ... → Edit code. The ID is in the URL.

### Creating a Release

When the staging theme has been tested and is ready for production:

1. **Sync production settings** (captures theme editor changes):
   ```bash
   yarn sync:production --commit
   ```
2. Push the sync commit to `development`
3. **Cut the release** using one of these methods:

#### Option A: GitHub Action (Recommended)

Use the "Cut Release" workflow to fast-forward merge `development` into `master`:

1. Go to GitHub Actions
2. Select "CUT RELEASE" workflow
3. Click "Run workflow"
4. Type "release" in the confirmation field
5. Click "Run workflow"

This automatically:

- Creates a release marker commit on `development`
- Fast-forward merges `development` into `master`
- Triggers the Preview deployment

#### Option B: Local Git Command

For those who prefer the command line, add this alias to your shell config (`.zshrc` or `.bashrc`):

```bash
alias gcr="git checkout development && git pull origin development && git commit --allow-empty -m 'Release' && git push origin development && git checkout master && git merge development --ff-only && git push origin master"
```

Then simply run:

```bash
gcr
```

**Why Fast-Forward Merge?**

We use `--ff-only` (fast-forward only) to keep `development` and `master` histories identical. This:

- Avoids merge commits that clutter history
- Makes it easy to see exactly what's in production
- Simplifies rollbacks if needed
- Keeps `git log` clean and linear

> **Note:** If the fast-forward fails, it means `master` has commits not in `development`. This shouldn't happen in normal workflow—investigate before forcing.

4. QA the preview theme in Shopify Admin
5. Manually trigger production deployment when ready

### Deploying to Production

1. Go to GitHub Actions
2. Select "PRODUCTION DEPLOYMENT" workflow
3. Click "Run workflow"
4. Type "deploy" in the confirmation field
5. Click "Run workflow"

### Cleaning Up Preview Themes

Since each preview deployment creates a new theme, you should periodically clean up old preview themes:

1. Go to Shopify Admin → Online Store → Themes
2. Find themes named `Preview - ...`
3. Delete any preview themes you no longer need

Keep the most recent preview theme until after successful production deployment, then it's safe to delete.

## Deployment Flags

All deployments use these Shopify CLI flags:

| Flag                   | Purpose                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `--nodelete`           | Prevents deletion of files not in the local theme (protects manual customizations) |
| `--ignore "**/*.json"` | Ignores JSON files to preserve theme settings and customizations                   |

## Troubleshooting

### Deployment Fails with Authentication Error

- Verify `SHOPIFY_CLI_THEME_TOKEN` is correctly set in the environment
- Ensure the Theme Access password hasn't expired
- Check that the password has permissions for the target theme

### Theme Not Updating

- Check the Theme ID is correct for the environment
- Verify the workflow completed successfully in GitHub Actions
- Clear Shopify's CDN cache if changes aren't appearing

### Build Fails

- Run `yarn build` locally to reproduce the error
- Check for linting errors with `yarn lint`
- Ensure all dependencies are up to date

### Release Fast-Forward Fails

If the "CUT RELEASE" workflow fails with a fast-forward error:

```
fatal: Not possible to fast-forward, aborting.
```

This means `master` has commits that aren't in `development`. This shouldn't happen in normal workflow. To fix:

1. **Investigate first** - Check what commits are on `master` but not `development`
2. If the commits should be preserved, cherry-pick them to `development` first
3. If they were accidental, you may need to reset `master` (coordinate with the team)

To prevent this: Never commit directly to `master` or merge PRs to `master`. All changes should flow through `development`.

## Related Documentation

- [Credentials & Secrets](./CREDENTIALS.md) - Where CI/CD tokens are provisioned and stored
- [Shopify CLI CI/CD Guide](https://shopify.dev/docs/storefronts/themes/tools/cli/ci-cd)
- [Theme Access App](https://apps.shopify.com/theme-access)
- [Code Guidelines](./CODE_GUIDELINES.md)
- [Modernization Plan](./MODERNIZATION_PLAN.md)
