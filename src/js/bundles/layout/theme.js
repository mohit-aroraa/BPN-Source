import 'Styles/layout/theme.scss';

import siteAccordion from '../components/shared/site-accordion';
import footerInit from '../components/global/footer';

import { syncAccountNavigation } from '../../new/components/account';

import { initSMSSubscription } from '../../new/components/sms';
import { initCartDrawer } from '../../new/vue/cart';
import { overrideRebuy } from '../../new/overrides';
import { openBackInStackModal } from '../utils/bis';
import { initInterstitial } from '../../new/vue/interstitial';
import  BFCMHelper from '../../bundles/components/global/bfcm-helper';

siteAccordion();
footerInit();
syncAccountNavigation();
initSMSSubscription();
initInterstitial();
initCartDrawer();
BFCMHelper();
overrideRebuy();
window.openBackInStackModal = openBackInStackModal;
