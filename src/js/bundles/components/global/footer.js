import { formatPhoneNumber } from '../../utils/directives/validation';

function handleAeToolbar(event) {
  if (!window.AudioEye) {
    return;
  }

  if (event.type === 'mousedown' || event.key === 'Enter') {
    event.preventDefault();
    event.stopPropagation();

    window.AudioEye?.activate('toolbar');

    return false;
  }
}

export default function footerInit() {
  const subscriptionNumberField = document.querySelector(
    '.js-subscription-field',
  );
  const subscriptionButton = document.querySelector('.js-subscription-button');
  const subscriptionMessage = document.querySelector(
    '.js-subscription-message',
  );
  const tcpatext = document.querySelector('.js-footer-tcpa-text');
  const aeToolbarTrigger = document.querySelector('.js-ae-toolbar-trigger');

  //AudioEye toolbar manual open integration
  if (aeToolbarTrigger) {
    aeToolbarTrigger.addEventListener('mousedown', handleAeToolbar,{capture: true});
    aeToolbarTrigger.addEventListener('keydown', handleAeToolbar, {capture: true});
  }

  //Footer newsletter sms subscription
  if (subscriptionNumberField && subscriptionButton && subscriptionMessage) {
    subscriptionNumberField.addEventListener('input', function () {
      this.value = formatPhoneNumber(this.value);
    });

    subscriptionButton.addEventListener('click', function () {
      const phoneNumber = subscriptionNumberField?.value.replace(/\D/g, '');

      if (!phoneNumber) {
        subscriptionMessage.innerHTML = 'Please add your phone number';
        subscriptionNumberField.classList.add('error');
        return;
      } else if (phoneNumber.length < 10) {
        subscriptionMessage.innerHTML = 'Invalid phone number.';
        subscriptionNumberField.classList.add('error');
        return;
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
        }),
      };
      fetch('https://api.postscript.io/api/v2/subscribers', options)
        .then((response) => response.json())
        .then((response) => {
          if (response.errors) {
            if (response.errors[0].type === 'v2.entity_conflict') {
              subscriptionMessage.innerHTML = `Pending subscriber already exists with phone number: ${phoneNumber}`;
              subscriptionNumberField.classList.add('error');
            } else {
              subscriptionMessage.innerHTML = response.errors[0].msg;
              subscriptionNumberField.classList.add('error');
            }
          } else {
            subscriptionNumberField.value = 'Thank you for subscribing!';
            subscriptionNumberField.classList.add('success');
            subscriptionNumberField.setAttribute('readOnly', true);
            subscriptionMessage.innerHTML = '';
            subscriptionNumberField.classList.remove('error');
            if (tcpatext) {
              tcpatext.style.display = 'none';
            }
          }
        })
        .catch((err) => console.error(err));
    });
  }
}
