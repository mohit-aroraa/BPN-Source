import 'Styles/layout/anatta_theme.scss';

import 'lazysizes';
import 'lazysizes/plugins/object-fit/ls.object-fit';
import 'lazysizes/plugins/parent-fit/ls.parent-fit';
import 'lazysizes/plugins/rias/ls.rias';
import 'lazysizes/plugins/bgset/ls.bgset';
import 'lazysizes/plugins/respimg/ls.respimg';

import siteHeader from '../components/global/header';
import siteAccordion from '../components/shared/site-accordion';
import footerInit from '../components/global/footer';

import { syncAccountNavigation } from '../../new/components/account';

import { initCartDrawer } from '../../new/vue/cart';
import { initSMSSubscription } from '../../new/components/sms';
import { overrideRebuy } from '../../new/overrides';
import { initInterstitial } from '../../new/vue/interstitial';
import  BFCMHelper from '../../bundles/components/global/bfcm-helper';
import initGrowthbook from "../../bundles/components/global/growthbook";
 
initGrowthbook();
initSMSSubscription();
siteHeader();
siteAccordion();
footerInit();
syncAccountNavigation();
initInterstitial();
initCartDrawer();
BFCMHelper();
overrideRebuy();
