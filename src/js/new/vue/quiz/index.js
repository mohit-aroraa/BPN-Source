// Components
import QuizResultPage from './QuizResultPage.vue';
import QuizProductDrawer from './QuizProductDrawer.vue';

import { initVueApp } from '../helpers';

const quizResultPageSelector = '.quizPageWrapper';
const quizProductDrawerSelector = '#bpn-quiz-product-drawer-container';

export const initQuizResultPage = (props = {}) => {
  return initVueApp({
    props,
    name: 'QuizResultPage',
    selector: quizResultPageSelector,
    component: QuizResultPage,
  });
};

export const initQuizProductDrawer = (props = {}) => {
  return initVueApp({
    props,
    name: 'QuizProductDrawer',
    selector: quizProductDrawerSelector,
    component: QuizProductDrawer,
  });
};
