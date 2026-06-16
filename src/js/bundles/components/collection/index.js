import { createApp } from 'vue';
import store from '../../utils/store/collectionStore';
import CollectionPage from './collection-page.vue';
import clickOutside from '../../utils/directives/click-outside';

export const collectionInstance = createApp(CollectionPage);

collectionInstance.directive('click-outside', clickOutside);
collectionInstance.use(store);

collectionInstance.mount('#js_collection_page');
