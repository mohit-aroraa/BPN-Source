/*
 * Basic file with global javascripts.
 * Files imported here will be available on every page.
 */
import "Styles/layout/athletic_landing_page.scss";

import "lazysizes";
import "lazysizes/plugins/object-fit/ls.object-fit";
import "lazysizes/plugins/parent-fit/ls.parent-fit";
import "lazysizes/plugins/rias/ls.rias";
import "lazysizes/plugins/bgset/ls.bgset";
import "lazysizes/plugins/respimg/ls.respimg";

import siteHeader from "../components/global/header";
import siteAccordion from "../components/shared/site-accordion";
import footerInit from "../components/global/footer";

siteHeader();
siteAccordion();
footerInit();
