# Third-Party Integrations Documentation

This document provides a comprehensive overview of all third-party services and integrations used in the Bare Performance Nutrition e-commerce platform.

## Analytics & Tracking

### Google Analytics & Tag Manager
- **GTM Container ID**: GTM-WKLLP6R
- **Implementation**:
  - Located in `snippets/pixel_checkout_ga4.liquid`
  - Custom event tracking for checkout steps
  - Enhanced e-commerce tracking
  - User interaction tracking

### Elevar
- **Purpose**: Enhanced e-commerce analytics and GTM management
- **Key Files**:
  - `snippets/elevar-head.liquid`
  - `snippets/elevar-head-listener.liquid`
  - `snippets/elevar-body-end.liquid`
- **Features**:
  - Cart attribute tracking
  - Product selection analytics
  - Collection view tracking
  - Search results analytics

### TVSquared
- **Purpose**: TV advertisement performance tracking
- **Location**: `snippets/tv-squared.liquid`
- **Features**: Conversion tracking and attribution

## Accessibility

### AudioEye
- **Site Hash**: 224d4b860254b9cbec979c44a196561c
- **CDN**: https://wsmcdn.audioeye.com/aem.js
- **Implementation Files**:
  - `snippets/audioeye-script.liquid`
  - `styles/vendor/_audioeye.scss`
- **Features**:
  - Accessibility toolbar
  - Automated remediation
  - Compliance monitoring

## Reviews & Social Proof

### Yotpo
- **Implementation**:
  - Product reviews and ratings
  - Custom styling in `assets/main.min.css`
- **Features**:
  - Star ratings
  - Customer reviews
  - Review management

### Okendo
- **Integration**: Product star ratings
- **Location**: Product metafields
- **Usage**: `product.metafields.okendo.StarRatingSnippet`

## Marketing & Communication

### Klaviyo
- **Company ID**: WXXxWk
- **Script**: https://static.klaviyo.com/onsite/js/klaviyo.js
- **Features**:
  - Email marketing
  - Customer segmentation
  - Marketing automation

### Attentive
- **Purpose**: SMS marketing and subscriptions
- **Implementation**: `snippets/sms-subscription.liquid`
- **Features**:
  - SMS opt-in
  - Customer messaging
  - Campaign management

## Subscription Management

### ReCharge Payments
- **Integration Files**:
  - `subscription-manager/views/`
  - `snippets/subscription-product.liquid`
- **Features**:
  - Subscription widget (rcWidget.js)
  - Customer portal
  - Subscription management
  - Recurring billing

## Mobile & App Integration

### Tapcart
- **SDK**: https://cdn.tapcart.com/webbridge-sdk/webbridge.umd.js
- **Purpose**: Mobile app integration
- **Features**:
  - Web-to-app communication
  - Mobile commerce features

## AI & Personalization

### Octane AI
- **ID**: bsg3u3ljo4kplzuf
- **Script**: https://app.octaneai.com/bsg3u3ljo4kplzuf/shopify.js
- **Features**:
  - Personalization
  - Customer journey optimization
  - Shop quiz functionality

## Product Enhancement

### Rebuy
- **Purpose**: Dynamic product bundling
- **Implementation**: Product page templates
- **Features**:
  - Dynamic bundle creation
  - Upsell recommendations

### ELS Product Warnings
- **Script**: S3-hosted configuration
- **Purpose**: Product safety and warning displays

### SCA Free Gifts
- **Location**: `snippets/sca.freegifts.liquid`
- **Features**:
  - Gift with purchase
  - Promotional offerings

## Content Management

### Replo
- **Purpose**: Page building and content management
- **Implementation**: Multiple page templates
- **IDs**: Various page-specific IDs

### Shogun
- **Purpose**: Landing page builder
- **Template**: `layout/theme.shogun.landing.liquid`
- **Features**:
  - Custom page building
  - Content management

## Media Integration

### Vimeo
- **SDK**: https://player.vimeo.com/api/player.js
- **Usage**: Hero sections and media banners
- **Features**: Video playback and control

## Cart & Checkout Enhancement

### Back in Stock Helper
- **Location**: `snippets/back-in-stock-helper.liquid`
- **Purpose**: Inventory notification management

### Cart Warnings
- **Implementation**: ELS warning system
- **Purpose**: Product safety notifications

## Performance & Development

### InstantPage.js
- **Purpose**: Navigation performance improvement
- **Implementation**: Preloading for faster page transitions

### Lazysizes.js
- **Purpose**: Image loading optimization
- **Features**: Lazy loading of images

## Maintenance & Updates

### Version Control
- All third-party integrations should be reviewed quarterly
- Script versions should be kept up to date
- API keys and tokens should be rotated according to security policies

### Security Considerations
- All external scripts are loaded with appropriate security headers
- Third-party access is limited to necessary scopes
- Regular security audits of integrations

### Performance Impact
- Monitor impact on page load times
- Optimize loading sequence
- Use async/defer where appropriate

## Support Contacts

For issues with specific integrations, contact:

- AudioEye: support@audioeye.com
- ReCharge: support@rechargeapps.com
- Klaviyo: support@klaviyo.com
- Yotpo: support@yotpo.com

## Adding New Integrations

When adding new third-party services:

1. Document the integration in this file
2. Update security policies
3. Test performance impact
4. Ensure GDPR/CCPA compliance
5. Add to monitoring systems
