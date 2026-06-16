# Credentials & Secrets

This document describes where credentials and secrets used by the CI/CD pipeline are provisioned and stored.

## GitHub Repository Secrets

### `RELEASE_TOKEN`

A GitHub **Classic Personal Access Token (PAT)** used by the "CUT RELEASE" workflow to push to protected branches (`development` and `master`).

| Property       | Value                                                                 |
| -------------- | --------------------------------------------------------------------- |
| **Type**       | Classic Personal Access Token                                         |
| **Token name** | `bpn-release-workflow`                                                |
| **Scope**      | `repo` (full control of private repositories)                         |
| **Owner**      | `bpnsupps-engineering` GitHub user                                    |
| **Location**   | https://github.com/settings/tokens (when logged in as owner)          |
| **Stored in**  | GitHub repo secret: `RELEASE_TOKEN`                                   |
| **Expiration** | None                                                                  |

**Why a Classic PAT?**

The default `GITHUB_TOKEN` provided by GitHub Actions cannot bypass branch protection rules. We use a Classic PAT owned by a service account (`bpnsupps-engineering`) that has permission to push to protected branches.

**Rotating the Token**

If the token needs to be rotated (e.g., after a suspected compromise):

1. Log in to GitHub as `bpnsupps-engineering` (credentials in 1Password)
2. Go to **Settings → Developer settings → Personal access tokens → Tokens (classic)**
3. Generate a new token with the `repo` scope
4. Update the `RELEASE_TOKEN` secret in the repository settings

### `SHOPIFY_CLI_THEME_TOKEN`

Theme Access password for deploying to Shopify themes. Stored per-environment (Staging, Preview, Production).

See [Deployment Documentation](./DEPLOYMENT.md#getting-a-theme-access-password) for setup instructions.

## 1Password

All credentials for the `bpnsupps-engineering` GitHub service account are stored in the **BPN 1Password** vault:

- **URL:** https://bpnsupps.1password.com/
- **Vault:** Engineering

This includes:
- GitHub login credentials for `bpnsupps-engineering`
- Current PAT values and expiration dates
- Any other service account credentials

## Security Notes

- Never commit tokens or passwords to the repository
- Use GitHub's environment secrets for sensitive values
- Rotate tokens after any suspected compromise
- The `bpnsupps-engineering` account should only be used for CI/CD automation

