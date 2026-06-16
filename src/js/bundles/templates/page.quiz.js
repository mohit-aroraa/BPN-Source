import 'Styles/new/templates/page.quiz.scss';
import { onOctaneQuizCompleted, onOctaneQuizQuestionLoaded } from '../../new/utils/octane';
import { initQuizProductDrawer, initQuizResultPage } from '../../new/vue/quiz';
import { getCustomerName, getQuizPageConfig, getQuizProducts, getQuizTags } from '../../new/helpers/quiz';
import { getCustomerIsSMSSubscribed} from '../../new/helpers/customer';
import { setGuestPhone } from '../../new/storage/customer';
import { syncSMSSubscription } from '../../new/components/sms';

const hideQuizDefaultPage = () => {
  const quizRendered = document.querySelector('.octane-ai-quiz-rendered');

  if (quizRendered) {
    document.body.style.cssText = 'overflow:auto!important';
    document.body.style.overflow = 'auto!important';

    scrollTo(0, 0);

    quizRendered.classList.add('hidden');
  }
};

const observeAndHideHeading = () => {
  const observer = new MutationObserver(() => {
    const headings = document.querySelectorAll('[role="heading"]');
    headings.forEach((el) => {
      if (el.textContent.includes('[hidden]')) {
        el.style.display = 'none';
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

const skipPhoneIfSubscribed = () => {
    onOctaneQuizQuestionLoaded((data) => {
        let hasSmsSubscription = getCustomerIsSMSSubscribed();
        if(data.detail.question_type ==='phone' && hasSmsSubscription) {
            const skipButton = document.querySelector('button[title="Skip"]')
            if (skipButton) {
              skipButton.click();
            }
        }
      });
};

const initQuiz = () => {
  const config = getQuizPageConfig();

  if (config.enabled) {
    onOctaneQuizCompleted((data) => {
      hideQuizDefaultPage();

      const detail = data.detail;

      // if the customore provided in quiz , store the phone number and sync sms subscription
      if(!!detail.phone) {
        setGuestPhone(detail.phone);
        syncSMSSubscription();
      }

      initQuizResultPage({
        tags: getQuizTags(detail),
        name: getCustomerName(detail),
        products: getQuizProducts(detail),
      });
    });

    initQuizProductDrawer();
    observeAndHideHeading();
    skipPhoneIfSubscribed();
  }
};

initQuiz();
// setTimeout(skipPhoneIfSubscribed, 2000);

