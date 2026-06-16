# Hamburger Menu

## Overview

The Hamburger Menu provides a mobile-friendly navigation drawer with submenu support and accordion functionality. It's designed for responsive layouts and offers a smooth user experience with transitions and accessibility features.

## Key Features

- **Sliding Drawer**: Full-height navigation drawer that slides in from the right
- **Nested Submenus**: Support for multi-level navigation with back button
- **Accordion Sections**: Collapsible sections within submenus
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Transition Effects**: Smooth animations for opening/closing
- **Event Delegation**: Efficient event handling even with dynamic content

## Architecture

The hamburger menu uses a modular architecture with the following components:

### Directory Structure

```
src/js/new/components/hamburger-menu/
├── index.js               # Main entry point and exports
├── menu-controller.js     # Core controller class
├── submenu-handler.js     # Submenu toggle functionality
├── accordion-handler.js   # Accordion functionality
```

### Module Descriptions

1. **Index Module** (`index.js`)
   - Exports public API functions
   - Manages singleton instance
   - Provides methods for external control

2. **Menu Controller** (`menu-controller.js`)
   - Main controller class for menu functionality
   - Manages DOM elements and state
   - Handles main open/close methods

3. **Submenu Handler** (`submenu-handler.js`)
   - Manages submenu toggling and navigation
   - Handles submenu open/close
   - Sets up event listeners for submenu triggers

4. **Accordion Handler** (`accordion-handler.js`)
   - Handles accordion functionality within the menu
   - Manages expand/collapse states
   - Controls animation for smooth transitions

## HTML Structure

The hamburger menu requires the following HTML structure:

```html
<!-- Overlay background -->
<div class="bpn-hamburger-overlay js-hamburger-close"></div>

<!-- Drawer container -->
<div class="bpn-hamburger-drawer">
  <div class="bpn-hamburger-drawer__inner">
    <!-- Header with close button -->
    <div class="bpn-hamburger-drawer__header">
      <button class="bpn-hamburger-drawer__close js-hamburger-close" aria-label="Close menu">
        <!-- Close icon -->
      </button>
    </div>
    
    <!-- Content area -->
    <div class="bpn-hamburger-drawer__content">
      <nav class="bpn-hamburger-menu">
        <ul class="bpn-hamburger-menu__list">
          <!-- Menu items -->
          <li class="bpn-hamburger-menu__item has-submenu">
            <a href="#submenu-1" 
               class="bpn-hamburger-menu__link js-hamburger-submenu-trigger"
               aria-controls="submenu-1" 
               aria-expanded="false">
              Menu Item
            </a>
            
            <!-- Submenu panel -->
            <div id="submenu-1" class="bpn-hamburger-menu__item-submenu">
              <div class="bpn-hamburger-menu__item-submenu-header">
                <div class="bpn-hamburger-menu__item-submenu-title js-hamburger-submenu-back">
                  Back
                </div>
              </div>
              <!-- Submenu content -->
            </div>
          </li>
        </ul>
      </nav>
    </div>
    
    <!-- Footer area (optional) -->
    <div class="bpn-hamburger-drawer__footer">
      <!-- Utility links, etc. -->
    </div>
  </div>
</div>

<!-- Toggle button (somewhere in the header) -->
<button class="js-hamburger-toggle" aria-expanded="false" aria-controls="bpn-hamburger-drawer">
  <!-- Menu icon -->
</button>
```

## CSS Classes

The hamburger menu uses these key CSS classes:

- `.bpn-hamburger-drawer`: Main container for the drawer
- `.is-open`: Applied to the drawer when open
- `.bpn-hamburger-overlay`: Full-screen overlay behind the menu
- `.is-active`: Applied to submenu items, overlays when active
- `.js-hamburger-submenu-trigger`: Triggers for submenu opening
- `.js-hamburger-submenu-back`: Back buttons in submenus

## JavaScript Selectors

Key elements are selected using these classes:

- `.js-hamburger-toggle`: Button to open the menu
- `.js-hamburger-close`: Elements that close the menu
- `.js-hamburger-submenu-trigger`: Elements that open submenus
- `.js-hamburger-submenu-back`: Elements that close submenus
- `.js-hamburger-accordion-trigger`: Accordion toggle elements

## Usage

### Basic Initialization

```js
import { initHamburgerMenu } from './components/hamburger-menu/index.js';

// Initialize the menu
initHamburgerMenu();
```

### Global Control Methods

```js
import { 
  initHamburgerMenu, 
  openHamburgerMenu, 
  closeHamburgerMenu 
} from './components/hamburger-menu/index.js';

// Make methods globally available
window.openHamburgerMenu = openHamburgerMenu;
window.closeHamburgerMenu = closeHamburgerMenu;

// Example: Close menu on specific event
document.querySelector('#some-button').addEventListener('click', () => {
  closeHamburgerMenu();
});
```

### Debugging

```js
// In browser console
window.debugHamburgerMenu();
```

## Accessibility Features

1. **ARIA Attributes**:
   - `aria-expanded`: Indicates open/closed state
   - `aria-controls`: Associates triggers with their targets
   - `aria-label`: Provides text for screen readers

2. **Keyboard Support**:
   - `Escape` key: Closes submenu or main menu
   - Focus management: Focus returns to trigger after closing
   - Proper tab order for navigation

3. **Other A11y Features**:
   - Proper semantic HTML (nav, button elements)
   - Focus trapping within open menu
   - Screen reader announcements

## Best Practices

1. **Event Delegation**: Use it for dynamically added elements
2. **State Management**: Keep track of open/active elements
3. **Transitions**: Apply transitions to transforms for better performance
4. **Error Handling**: Always check if elements exist before operating on them 