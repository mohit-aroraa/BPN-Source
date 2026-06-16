/**
 * Anatta Theme Entry Point
 *
 * This file initializes core theme functionality including:
 * - Navigation components (hamburger menu, category list)
 * - Product features (quick add, drawer, grid sliders)
 * - Collection filtering and sorting
 * - Localization and country selection
 * - Athletic landing page swipers
 * - Back in stock notifications
 */

import 'Styles/new/layout/anatta_theme.scss';
import { initHamburgerMenu, openHamburgerMenu, closeHamburgerMenu } from '../components/hamburger-menu';
import { tabbedStackSwiper, multipleColumnSwiper } from '../components/athletic-landing-swipers';

import { initCollectionFilters } from '../components/collection-filters';
// @ts-ignore - Using deprecated function until new localization system is implemented
import { setupLocalizationForm } from '../components/localization-form';
import { initProductDrawer } from '../components/product-drawer';
import { initQuickAdd } from '../components/product-grid/quick-add';
import initCategoryList from '../components/category-list';
import { initProductGridItemSlider } from '../components/product-grid-item';
import { openBackInStackModal } from '../../bundles/utils/bis';
import { initAnnouncementBar } from '../../bundles/components/global/announcement';

// Initialize collection and product features
initAnnouncementBar();
initCollectionFilters();
initProductDrawer();
initQuickAdd();
initProductGridItemSlider();

// Initialize navigation components
initHamburgerMenu();
initCategoryList();

// Initialize localization
setupLocalizationForm();

// Initialize athletic landing page swipers
tabbedStackSwiper();
multipleColumnSwiper();

// Expose global functions
window.openHamburgerMenu = openHamburgerMenu;
window.closeHamburgerMenu = closeHamburgerMenu;
window.openBackInStackModal = openBackInStackModal;
