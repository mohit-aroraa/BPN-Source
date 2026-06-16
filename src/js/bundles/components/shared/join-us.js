import { formatPhoneNumber } from '../../utils/directives/validation';
import { getCustomerEmail } from '../../../new/helpers/customer';
import { setGuestPhone } from '../../../new/storage/customer';
import { syncSMSSubscription } from '../../../new/components/sms';

const initJoinUs = () => {
  const forms = document.querySelectorAll('.bpn-newsletter .bpn-newsletter__form');

  forms.forEach((form) => {
    const button = form.querySelector('.bpn-join-us__button');
    const input = form.querySelector('.bpn-newsletter__input');
    const errorMessage = form.querySelector('.bpn-newsletter__error');
    const successMessage = form.querySelector('.bpn-newsletter__message');

    const showSuccessMessage = () => {
      successMessage.classList.remove('hidden');

      input.classList.remove('has-error');
      errorMessage.classList.add('hidden');
      input.classList.add('hidden');
      button.classList.add('hidden');

      input.value = '';
    };

    const hideSuccessMessage = () => {
      successMessage.classList.add('hidden');
      errorMessage.classList.add('hidden');

      input.classList.remove('hidden');
      button.classList.remove('hidden');
      input.value = '';
    };

    const hideErrorMessage = () => {
      input.classList.remove('has-error');
      errorMessage.classList.add('hidden');
    };

    const showErrorMessage = (message) => {
      successMessage.classList.add('hidden');

      input.classList.add('has-error');
      errorMessage.innerHTML = message;
      errorMessage.classList.remove('hidden');
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopPropagation();

      input.classList.add('focused');

      hideErrorMessage();

      const phoneNumber = input.value;

      if (!phoneNumber) {
        showErrorMessage('Please add your phone number');
        return false;
      } else if (phoneNumber.length < 12) {
        showErrorMessage('Invalid phone number.');
        return false;
      }

      const options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer sk_56a09935e252179d21d78ba26409cd8d',
        },
        body: JSON.stringify({
          origin: 'website',
          keyword: 'BRICKBYBRICK',
          phone_number: phoneNumber,
          email: getCustomerEmail(),
        }),
      };

      fetch('https://api.postscript.io/api/v2/subscribers', options)
        .then((response) => response.json())
        .then((response) => {
          if (response.errors) {
            if (response.errors[0].type === 'v2.entity_conflict') {
              showErrorMessage('This number already exists.');
            } else {
              showErrorMessage('Something went wrong.');
            }
          } else {
            setGuestPhone(response.phone_number);

            syncSMSSubscription();

            showSuccessMessage();

            setTimeout(() => {
              hideSuccessMessage();
            }, 10000);
          }
        })
        .catch((err) => console.error(err));

      return false;
    });

    input.addEventListener('input', (event) => {
      hideErrorMessage();
      event.target.classList.add('focused');
      input.value = formatPhoneNumber(event.target.value);
    });

    input.addEventListener('focusout', (event) => {
      if (!event.target.value) {
        event.target.classList.remove('focused');
      }
    });

  });
};

export default initJoinUs;
