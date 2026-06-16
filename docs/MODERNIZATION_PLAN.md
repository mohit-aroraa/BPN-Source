# BPN Storefront Modernization Plan

## Overview

This document outlines our strategy for modernizing the Bare Performance Nutrition Shopify storefront while maintaining the stability of the existing codebase. We're taking a parallel development approach that allows us to implement modern best practices without disrupting the current production environment.

## The Challenge

Like many established e-commerce sites, our codebase has evolved over time, resulting in:

- Legacy code that works but may not follow modern best practices
- Inconsistent styling approaches across different parts of the application
- Technical debt that makes changes increasingly difficult
- Lack of standardized patterns for new development

Rather than attempting a risky complete rewrite, we're implementing a **progressive modernization strategy**.

## Our Approach: Parallel Architecture

We're creating a new, modern architecture alongside the existing codebase. This approach:

1. **Preserves Stability**: The existing codebase continues to function without disruption
2. **Enables Incremental Migration**: Components can be migrated one at a time
3. **Establishes Best Practices**: New code follows modern standards from day one
4. **Reduces Risk**: Changes can be tested thoroughly before affecting production

## Implementation Details

### Directory Structure

The new architecture follows a Shopify-like folder structure to maintain consistency with the platform's conventions:

```
src/
├── styles/
│   ├── [legacy code remains here]
│   └── new/  <- All new CSS/SCSS development happens here
│       ├── tokens/          # Design variables (colors, typography, spacing)
│       │   ├── _colors.scss
│       │   ├── _typography.scss
│       │   ├── _spacing.scss
│       │   └── index.scss   # Exports all tokens
│       │
│       ├── tools/           # Mixins and functions
│       │   ├── _mixins.scss
│       │   ├── _functions.scss
│       │   └── index.scss
│       │
│       ├── generic/         # Reset and normalization styles
│       │   ├── _reset.scss
│       │   ├── _normalize.scss
│       │   └── index.scss
│       │
│       ├── elements/        # Base HTML elements
│       │   ├── _typography.scss
│       │   ├── _forms.scss
│       │   └── index.scss
│       │
│       ├── objects/         # Structural patterns
│       │   ├── _layout.scss
│       │   ├── _grid.scss
│       │   └── index.scss
│       │
│       ├── components/      # UI components
│       │   ├── _button.scss
│       │   ├── _product-card.scss
│       │   └── index.scss
│       │
│       ├── sections/        # Shopify sections
│       │   ├── _header.scss
│       │   ├── _footer.scss
│       │   ├── _featured-collection.scss
│       │   └── index.scss
│       │
│       ├── templates/       # Template-specific styles
│       │   ├── _product.scss
│       │   ├── _collection.scss
│       │   ├── _cart.scss
│       │   └── index.scss
│       │
│       ├── utilities/       # Helper classes
│       │   ├── _spacing.scss
│       │   ├── _visibility.scss
│       │   └── index.scss
│       │
│       └── main.scss        # Main entry point that imports all layers
│
├── js/
│   ├── [legacy code remains here]
│   └── new/  <- All new JavaScript development happens here
│       ├── components/      # Feature-based UI components
│       │   ├── product/     # Product-related components
│       │   │   ├── product-gallery.js
│       │   │   ├── product-options.js
│       │   │   └── add-to-cart.js
│       │   │
│       │   ├── cart/        # Cart-related components
│       │   │   ├── cart-drawer.js
│       │   │   ├── cart-item.js
│       │   │   └── cart-totals.js
│       │   │
│       │   └── global/      # Global components
│       │       ├── header.js
│       │       ├── footer.js
│       │       └── navigation.js
│       │
│       ├── utils/           # Helper functions
│       │   ├── dom.js
│       │   ├── events.js
│       │   └── formatting.js
│       │
│       ├── services/        # API and data handling
│       │   ├── cart-api.js
│       │   ├── product-api.js
│       │   └── analytics.js
│       │
│       ├── sections/        # Shopify section handlers
│       │   ├── featured-collection.js
│       │   ├── product-recommendations.js
│       │   └── index.js
│       │
│       ├── templates/       # Template-specific logic
│       │   ├── product.js
│       │   ├── collection.js
│       │   └── cart.js
│       │
│       └── main.js          # Main entry point
```

#### JavaScript Component Organization

In the JavaScript architecture, we organize components by feature rather than by technical type. This approach:

1. **Improves Discoverability**: Developers can easily find all code related to a specific feature
2. **Enhances Cohesion**: Related functionality stays together
3. **Reduces Coupling**: Features can be developed and tested independently
4. **Facilitates Reuse**: Components are designed to be reusable across the application

For example, all product-related components are grouped in the `components/product/` directory, making it easy to locate and work with product functionality.

Each component follows a consistent structure:

- Clear, feature-based naming (e.g., `product-gallery.js`, not just `gallery.js`)
- Self-contained functionality with minimal dependencies
- Explicit public API for interaction with other components
- Event-based communication for loose coupling

### Asset Loading in Liquid Templates

We've implemented a sophisticated bundle-based approach to loading CSS and JavaScript in Liquid templates, which supports both the legacy and new architecture:

#### CSS Loading

CSS is loaded using a dedicated `style-bundle.liquid` snippet that intelligently loads the appropriate stylesheets based on the current layout and template:

```liquid
{% comment %} In theme.liquid {% endcomment %}
{% render 'style-bundle', layout: 'theme' %}
```

The `style-bundle.liquid` snippet handles:

1. **Layout-specific CSS**: Loads bundles based on the current layout

   ```liquid
   {% capture layout_bundle_styles %}bundle.{{- layout -}}.css{% endcapture %}
   {{ layout_bundle_styles | asset_url | stylesheet_tag }}
   ```

2. **New Architecture CSS**: Loads bundles with the "new-" prefix for the modernized code

   ```liquid
   {% capture new_layout_bundle_styles %}bundle.new-{{- layout -}}.css{% endcapture %}
   {{ new_layout_bundle_styles | asset_url | stylesheet_tag }}
   ```

3. **Template-specific CSS**: Loads additional CSS based on the current template
   ```liquid
   {% capture style_bundle %}bundle.{{- template | remove: 'customers/' -}}.css{% endcapture %}
   {{ style_bundle | asset_url | stylesheet_tag }}
   ```

This approach ensures that:

- Both legacy and new CSS can coexist
- Only the CSS needed for the current page is loaded
- The bundle system automatically handles dependencies

#### JavaScript Loading

JavaScript is loaded using a similar `script-bundle.liquid` snippet that follows a layered approach:

```liquid
{% comment %} In theme.liquid {% endcomment %}
{% render 'script-bundle', layout: 'theme' %}
```

The `script-bundle.liquid` snippet handles:

1. **Vendor Scripts**: Third-party libraries and frameworks

   ```liquid
   {% capture vendor_bundle %}bundle.vendors.min.js{% endcapture %}
   <script src="{{ vendor_bundle | asset_url }}" async defer></script>
   ```

2. **Common Scripts**: Shared functionality used across the site

   ```liquid
   {% capture common_bundle %}bundle.common.min.js{% endcapture %}
   <script src="{{ common_bundle | asset_url }}" async defer></script>
   ```

3. **Layout Scripts**: Scripts specific to the current layout

   ```liquid
   {% capture layout_bundle_js %}bundle.{{- layout -}}.min.js{% endcapture %}
   <script src="{{ layout_bundle_js | asset_url }}" async defer></script>
   ```

4. **New Architecture Scripts**: Scripts from the modernized codebase

   ```liquid
   {% capture new_layout_bundle_js %}bundle.new-{{- layout -}}.min.js{% endcapture %}
   <script src="{{ new_layout_bundle_js | asset_url }}" async defer></script>
   ```

5. **Template Scripts**: Scripts specific to the current template
   ```liquid
   {% capture script_bundle %}bundle.{{- template | remove: 'customers/' -}}.min.js{% endcapture %}
   <script src="{{ script_bundle | asset_url }}" async defer></script>
   ```

All scripts are loaded with the `async defer` attributes to optimize page loading performance.

### Webpack Configuration

Our Webpack configuration has been updated to support this dual architecture with automatic bundle generation:

1. **Dynamic Entry Points**: Automatically discovers and bundles JavaScript files

   ```javascript
   // Legacy template entry points
   const templateEntryPoints = glob
     .sync('./src/js/bundles/templates/**/**.js')
     .reduce((acc, path) => {
       const entry = path.replace(/^.*[\\\/]/, '').replace('.js', '');
       acc[entry] = path;
       return acc;
     }, {});

   // New architecture entry points with "new-" prefix
   const newEntryPoints = glob.sync('./src/js/new/**/**.js').reduce((acc, path) => {
     const entry = path.replace(/^.*[\\\/]/, '').replace('.js', '');
     acc[`new-${entry}`] = path;
     return acc;
   }, {});
   ```

2. **Bundle Naming Convention**: Creates bundles with consistent naming patterns

   ```javascript
   output: {
     filename: "./assets/bundle.[name].min.js",
     path: path.resolve(__dirname, "dist"),
     chunkFilename: "./assets/bundle.[name].min.js?[chunkhash]"
   }
   ```

3. **CSS Extraction**: Extracts CSS from JavaScript imports into separate files
   ```javascript
   new MiniCssExtractPlugin({
     filename: './assets/bundle.[name].css',
   });
   ```

This configuration ensures that:

- Both legacy and new code can be developed in parallel
- Assets are properly optimized and bundled
- The naming convention supports the liquid snippet loading system
- Code splitting and lazy loading are supported for optimal performance

### Documentation Organization

To maintain clear and accessible documentation, we follow a structured approach:

1. **Root-Level Documentation**:

   - `README.md`: Project overview, setup instructions, and high-level architecture
   - `MODERNIZATION_PLAN.md`: Strategy for modernizing the codebase (this document)
   - `CODE_GUIDELINES.md`: Coding standards and best practices
   - `CONTRIBUTING.md`: Guidelines for contributing to the project

2. **Component-Level Documentation**:

   - Each major component or feature should include a brief comment header explaining its purpose and usage
   - Complex components may include code examples in comments

3. **Directory-Level Documentation**:

   - Key directories contain a `README.md` that explains the purpose of that directory and its contents
   - Example: `src/styles/new/tokens/README.md` documents the design token system

4. **Documentation Links**:
   - Cross-reference documentation using relative links
   - Link from general documentation to more specific documentation
   - Example: Root README links to MODERNIZATION_PLAN, which links to tokens README

This hierarchical approach ensures that:

- Developers can find information at the appropriate level of detail
- Documentation is located close to the code it describes
- The overall documentation structure remains manageable
- New team members can progressively discover more detailed information

## Tools and Scripts

We've created several tools to assist with development. For a complete list of available scripts and their usage, see the `package.json` file. Key scripts include:

- `npm run build`: Build the theme for production
- `npm run deploy`: Build and deploy the theme to Shopify
- `npm run start`: Start the development server with hot reloading
- `npm run lint:new`: Lint only files in the new structure (also formats SCSS files)
- `./fix-lint-issues.sh`: Automatically fix common linting issues
- `./lint-new-structure.sh`: Run Stylelint on the new structure

For detailed information about our coding standards, linting rules, and best practices, please refer to the [Code Guidelines](./CODE_GUIDELINES.md) document.

## Migration Strategy

Our long-term plan is to gradually migrate the entire codebase to the new architecture:

1. **Phase 1**: Set up the new architecture and tools (✅ Complete)
2. **Phase 2**: Implement new features using the new architecture (🔄 Ongoing)
3. **Phase 3**: Migrate existing components incrementally, prioritizing by:
   - Frequency of changes
   - Strategic importance
   - Technical debt
4. **Phase 4**: Complete transition to the new architecture

## Conclusion

This parallel architecture approach allows us to modernize our codebase incrementally while maintaining stability. By clearly separating new development from legacy code, we can implement best practices immediately for new work while planning thoughtful migration of existing code.

For detailed coding standards, refer to our [Code Guidelines](./CODE_GUIDELINES.md) document.
