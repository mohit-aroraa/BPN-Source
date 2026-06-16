/**
 * Hamburger Menu Module
 *
 * Handles the mobile navigation drawer functionality, including:
 * - Toggle open/close of the drawer
 * - Sliding panel submenus
 * - Accordion sections within submenus
 */

// Singleton instance for accessing methods from outside
let hamburgerMenuInstance = null;

class HamburgerMenu {
  constructor() {
    // DOM elements
    this.toggleButton = document.querySelector('.js-hamburger-toggle');
    this.closeButtons = document.querySelectorAll('.js-hamburger-close');
    this.overlay = document.querySelector('.bpn-hamburger-overlay');
    this.drawer = document.querySelector('.bpn-hamburger-drawer');
    this.hamburgerMenu = document.querySelector('.bpn-hamburger-menu');
    this.drawerContent = this.drawer?.querySelector('.bpn-hamburger-drawer__content');

    // State tracking
    this.activeSubmenu = null;
    this.activeTriggerItem = null;
    this.activeAccordionSection = null; // Track active accordion section

    // Check if required elements exist before initializing
    if (!this.toggleButton || !this.drawer || !this.overlay) {
      console.warn('Hamburger menu: required elements not found');
      return;
    }

    // Initialize the menu
    this.init();

    // Save instance for external access
    hamburgerMenuInstance = this;
  }

  /**
   * Initialize the hamburger menu
   */
  init() {
    // Menu toggle events
    this.toggleButton.addEventListener('click', this.toggleMenu.bind(this));

    // Use event delegation for close buttons to catch dynamically added ones
    document.addEventListener('click', (e) => {
      if (e.target.closest('.js-hamburger-close')) {
        e.preventDefault();
        this.closeMenu();
      }
    });

    // Setup submenu and accordion functionality
    this.setupSubmenuToggles();
    this.setupAccordions();

    // Global event handlers
    this.setupGlobalEvents();
  }

  /**
   * Set up global event handlers
   */
  setupGlobalEvents() {
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.activeSubmenu) {
          this.closeSubmenu();
        } else {
          this.closeMenu();
        }
      }
    });

    // Prevent body scrolling when menu is open
    this.drawer.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  /**
   * Set up accordion functionality for submenu sections
   */
  setupAccordions() {
    // Find all submenus
    const submenus = this.drawer.querySelectorAll('.bpn-hamburger-menu__item-submenu');

    submenus.forEach(submenu => {
      // Process all section titles in this submenu
      const sectionTitles = submenu.querySelectorAll('.bpn-hamburger-menu__item-submenu-title');

      sectionTitles.forEach((title, index) => {
        // Find the corresponding section
        const section = title.closest('.bpn-hamburger-menu__item-submenu-section');
        if (!section) {
          return;
        }

        // Create a wrapper for the links to be toggled
        const linksContainer = document.createElement('div');
        linksContainer.className = 'bpn-hamburger-menu__item-submenu-links';

        // Move all links into the container
        const links = Array.from(section.querySelectorAll('.bpn-hamburger-menu__submenu-link'));
        links.forEach(link => {
          section.removeChild(link);
          linksContainer.appendChild(link);
        });

        // Add the container after the title
        title.parentNode.insertBefore(linksContainer, title.nextSibling);

        // Add toggle button/indicator to the title
        title.classList.add('is-accordion-toggle');
        title.setAttribute('role', 'button');
        title.setAttribute('aria-expanded', 'false');
        title.setAttribute('tabindex', '0');

        // Default state: closed
        linksContainer.style.height = '0';
        linksContainer.style.overflow = 'hidden';

        // Add click event listener
        title.addEventListener('click', () => {
          const isExpanded = title.getAttribute('aria-expanded') === 'true';

          // Close any other open accordion sections in any submenu
          if (this.activeAccordionSection && this.activeAccordionSection !== section) {
            const activeTitle = this.activeAccordionSection.querySelector('.bpn-hamburger-menu__item-submenu-title');
            const activeContent = this.activeAccordionSection.querySelector('.bpn-hamburger-menu__item-submenu-links');
            this.collapseAccordion(activeTitle, activeContent);
          }

          if (isExpanded) {
            this.collapseAccordion(title, linksContainer);
            this.activeAccordionSection = null;
          } else {
            this.expandAccordion(title, linksContainer);
            this.activeAccordionSection = section;
          }
        });

        // Add keyboard support
        title.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            title.click();
          }
        });

        // Store the title and container in the section for easy access
        section.accordionTitle = title;
        section.accordionContent = linksContainer;
      });

      // Store sections data in submenu for later use
      submenu.sections = Array.from(submenu.querySelectorAll('.bpn-hamburger-menu__item-submenu-section'));
    });
  }

  /**
   * Expand an accordion section
   *
   * @param {HTMLElement} title - The accordion title element
   * @param {HTMLElement} content - The accordion content container
   */
  expandAccordion(title, content) {
    const contentHeight = content.scrollHeight;
    content.style.height = `${contentHeight}px`;
    title.setAttribute('aria-expanded', 'true');
    title.classList.add('is-expanded');

    // Add active class to the section containing this accordion
    const section = title.closest('.bpn-hamburger-menu__item-submenu-section');
    if (section) {
      section.classList.add('is-active');
    }
  }

  /**
   * Collapse an accordion section
   *
   * @param {HTMLElement} title - The accordion title element
   * @param {HTMLElement} content - The accordion content container
   */
  collapseAccordion(title, content) {
    content.style.height = '0';
    title.setAttribute('aria-expanded', 'false');
    title.classList.remove('is-expanded');

    // Remove active class from the section
    const section = title.closest('.bpn-hamburger-menu__item-submenu-section');
    if (section) {
      section.classList.remove('is-active');
    }
  }

  /**
   * Reset all accordions in a submenu except the first one
   * @param {HTMLElement} submenu - The submenu element
   */
  resetAccordions(submenu) {
    if (!submenu || !submenu.sections) {return;}

    submenu.sections.forEach((section, index) => {
      if (index === 0) {
        // Expand first section
        this.expandAccordion(section.accordionTitle, section.accordionContent);
        this.activeAccordionSection = section;
      } else {
        // Collapse all other sections
        this.collapseAccordion(section.accordionTitle, section.accordionContent);
      }
    });
  }

  /**
   * Set up event listeners for submenu items
   */
  setupSubmenuToggles() {
    // Find menu items with submenus
    const menuItemsWithSubmenu = this.drawer.querySelectorAll('.bpn-hamburger-menu__item.has-submenu');

    // Process each menu item
    menuItemsWithSubmenu.forEach(item => {
      const submenu = item.querySelector('.bpn-hamburger-menu__item-submenu');
      if (!submenu) {
        return;
      }

      // Get the parent link
      const link = item.querySelector('.bpn-hamburger-menu__link');

      // Make the entire item clickable to toggle submenu
      item.addEventListener('click', (e) => {
        // Only trigger if clicking on the item itself or its link
        if (e.target === item || e.target === link) {
          e.preventDefault();
          this.openSubmenu(submenu, item);
        }
      });

      // Make sure the link preserves its behavior for keyboard users
      if (link) {
        link.addEventListener('click', (e) => {
          if (window.innerWidth < 992) { // Only for mobile
            e.preventDefault();
            this.openSubmenu(submenu, item);
          }
        });

        // Add keyboard support
        link.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.openSubmenu(submenu, item);
          }
        });
      }

      // Add submenu header with back button if it doesn't exist
      this.addSubmenuHeader(submenu, link);
    });
  }

  /**
   * Add a header with back button to a submenu
   *
   * @param {HTMLElement} submenu - The submenu element
   * @param {HTMLElement} link - The parent link element
   */
  addSubmenuHeader(submenu, link) {
    if (submenu.querySelector('.submenu-header')) {
      return;
    }

    // Create header container
    const submenuHeader = document.createElement('div');
    submenuHeader.className = 'bpn-hamburger-menu__item-submenu-header submenu-header';

    // Create title from parent link that acts as back button
    const title = document.createElement('div');
    title.className = 'bpn-hamburger-menu__submenu-title js-submenu-back';
    title.textContent = link ? link.textContent.trim() : 'Submenu';
    title.setAttribute('aria-label', 'Back to main menu');
    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');

    // Create close button (same as main drawer)
    const closeButton = document.createElement('button');
    closeButton.className = 'bpn-hamburger-drawer__close js-hamburger-close';
    closeButton.setAttribute('aria-label', 'Close menu');

    // Use the provided SVG icon
    closeButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" role="presentation">
      <path d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z" fill="white"></path>
    </svg>`;

    // Assemble and add to submenu
    submenuHeader.appendChild(title);
    submenuHeader.appendChild(closeButton);
    submenu.insertBefore(submenuHeader, submenu.firstChild);

    // Add title click listener for going back
    title.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeSubmenu();
    });

    // Add keyboard support
    title.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        this.closeSubmenu();
      }
    });

    // Add explicit close event for the close button
    closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeMenu();
    });
  }

  /**
   * Open a specific submenu
   *
   * @param {HTMLElement} submenu - The submenu to open
   * @param {HTMLElement} item - The parent menu item
   */
  openSubmenu(submenu, item) {
    // If already open, do nothing
    if (this.activeSubmenu === submenu) {
      return;
    }

    // Close any open submenu
    if (this.activeSubmenu) {
      this.closeSubmenu();
    }

    // Add active class to submenu
    submenu.classList.add('is-active');

    // Add active class to trigger item
    if (item) {
      item.classList.add('is-active');
      this.activeTriggerItem = item;
    }

    // Add submenu-active class to drawer content
    this.drawerContent.classList.add('has-active-submenu');

    // Set active submenu
    this.activeSubmenu = submenu;

    // Reset accordions - expand first, collapse others
    this.resetAccordions(submenu);

    // Set focus on first focusable element
    setTimeout(() => {
      const firstFocusable = submenu.querySelector('a, button');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 300);
  }

  /**
   * Close the active submenu
   */
  closeSubmenu() {
    if (!this.activeSubmenu) {
      return;
    }

    // Remove active class from submenu
    this.activeSubmenu.classList.remove('is-active');

    // Remove active class from trigger item
    if (this.activeTriggerItem) {
      this.activeTriggerItem.classList.remove('is-active');
    }

    // Remove active class from drawer content
    this.drawerContent.classList.remove('has-active-submenu');

    // Set focus back to active trigger
    if (this.activeTriggerItem) {
      const link = this.activeTriggerItem.querySelector('.bpn-hamburger-menu__link');
      if (link) {
        setTimeout(() => link.focus(), 300);
      }
    }

    // Clear active submenu and trigger
    this.activeSubmenu = null;
    this.activeTriggerItem = null;
    this.activeAccordionSection = null;
  }

  /**
   * Toggle the hamburger menu open/closed
   */
  toggleMenu() {
    const isOpen = this.drawer.classList.contains('is-open');

    if (isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  /**
   * Open the hamburger menu
   */
  openMenu() {
    // Close any open submenu first
    if (this.activeSubmenu) {
      this.closeSubmenu();
    }

    // Add active class to overlay
    this.overlay.classList.add('is-active');

    // Add open class to drawer
    this.drawer.classList.add('is-open');

    // Add open class to hamburger icon
    if (this.hamburgerMenu) {
      this.hamburgerMenu.classList.add('is-open');
    }

    // Set aria-expanded attribute
    this.toggleButton.setAttribute('aria-expanded', 'true');

    // Disable body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close the hamburger menu
   */
  closeMenu() {
    // Close any open submenu first
    if (this.activeSubmenu) {
      this.closeSubmenu();
    }

    // Remove active class from overlay
    this.overlay.classList.remove('is-active');

    // Remove open class from drawer
    this.drawer.classList.remove('is-open');

    // Remove open class from hamburger icon
    if (this.hamburgerMenu) {
      this.hamburgerMenu.classList.remove('is-open');
    }

    // Set aria-expanded attribute
    this.toggleButton.setAttribute('aria-expanded', 'false');

    // Enable body scroll
    document.body.style.overflow = '';

    // Focus back on toggle button
    this.toggleButton.focus();
  }
}

/**
 * Initialize the hamburger menu
 * This should be called once when the page loads
 */
export const initHamburgerMenu = () => {
  new HamburgerMenu();
};

/**
 * Open the hamburger menu
 * Can be called from anywhere in the application
 */
export function openHamburgerMenu() {
  if (hamburgerMenuInstance) {
    hamburgerMenuInstance.openMenu();
  }
};

/**
 * Close the hamburger menu
 * Can be called from anywhere in the application
 */
export function closeHamburgerMenu() {
  if (hamburgerMenuInstance) {
    hamburgerMenuInstance.closeMenu();
  }
};
