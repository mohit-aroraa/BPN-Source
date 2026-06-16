import { safeGet } from '../utils/data-safety';


export const getQuizPageConfig = () => {
  return window.BPN.quizPageConfig || {};
};

export const getCustomerName = (detail) => {
  return detail.answers[getQuizPageConfig().nameAnswerKey];
};

export const getQuizTags = (detail) => {
  const categories = Object.keys(window.BPN.quizPageConfig.icons).map(item => item.toLowerCase());

  const quizTags = [];

  safeGet(detail, 'product_blocks', []).forEach(blockGroup => {
    blockGroup.forEach(product => {
      if (Array.isArray(product.tags)) {
        product.tags.forEach(tag => {
          if (categories.includes(tag.toLowerCase())) {
            quizTags.push(tag);
          }
        });
      }
    });
  });

  return [ ...new Set(quizTags) ];
};

export const getQuizProducts = (detail) => {
  return detail.product_blocks.flatMap(block => block);
};
