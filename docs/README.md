# BarePerformanceNutrition.com Documentation

## Overview

This documentation covers the JavaScript features and utilities implemented in the BarePerformanceNutrition.com Shopify theme. Each feature is documented in detail with examples, architecture overview, and best practices.

## Features

- [Collection Filters](features/collection-filters.md) - Instant filtering for collection pages using Shopify's GraphQL API
- [Hamburger Menu](features/hamburger-menu.md) - Mobile-friendly navigation drawer with submenu support
- [Data Safety Utilities](features/data-safety.md) - Utilities for safely handling undefined or null data
- [Vue.js Safety Utilities](features/vue-safety.md) - Specialized utilities for handling data safely in Vue components

## Architecture

The JavaScript codebase follows a modular architecture with the following principles:

1. **Feature-Based Organization**: Code is organized by feature rather than technology
2. **Modular Design**: Each feature is split into focused modules with clear responsibilities
3. **Defensive Programming**: Robust error handling and data validation
4. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with JS
5. **Minimal Dependencies**: Limited use of external libraries to keep bundle size small

## Directory Structure

```
src/js/new/
├── components/              # Feature components
│   ├── collection-filters/  # Collection filtering functionality
│   ├── hamburger-menu/      # Mobile navigation menu
│   └── [other components]   # Other site components
├── layout/                  # Layout-specific JS (entry points)
│   └── anatta_theme.js      # Main theme entry point
├── utils/                   # Shared utilities
│   ├── data-safety.js       # Data safety utilities
│   ├── graphql-client.js    # GraphQL client for Shopify API
│   └── [other utilities]    # Other utility modules
└── templates/               # Template-specific JS
```

## Best Practices

### Code Style

- Use ES6+ features (importing, arrow functions, etc.)
- Follow consistent naming conventions
- Keep functions focused and small
- Use JSDoc comments for all exported functions

### Data Safety

- Always check if DOM elements exist before operating on them
- Use data-safety utilities when accessing external data
- Add try/catch blocks around code that might throw errors
- Provide fallbacks for missing data

### Performance

- Minimize DOM updates
- Use event delegation for dynamic content
- Defer non-critical operations
- Avoid layout thrashing by batching DOM reads/writes

## Contributing

When adding new features or modifying existing ones:

1. **Documentation**: Update or create documentation in the `docs/` directory
2. **Modular Design**: Keep components focused on a single responsibility
3. **Testing**: Test on multiple browsers and devices
4. **Accessibility**: Ensure features are keyboard accessible and screen-reader friendly 

## Additional Resources

- [Shopify Liquid Documentation](https://shopify.dev/docs/themes/liquid/reference)
- [Vue.js Documentation](https://vuejs.org/guide/introduction.html)
- [BEM Methodology](https://getbem.com/introduction/) 
