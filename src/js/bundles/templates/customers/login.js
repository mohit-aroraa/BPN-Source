import 'Styles/templates/customers/login.scss';
const loginForm = document.querySelector('#customer_login');
const referrer = document.referrer;

function handleFormSubmit() {
}

function checkForError() {
  const errorDiv = document.querySelector('.js-form-error');
  if (errorDiv || (referrer && referrer.includes('/challenge'))) {
  }
}

function togglePass() {
  const input = document.getElementById('CustomerPassword');
  if (!input) {
    return;
  }

  const inputType = input.getAttribute('type');
  if (inputType === 'password') {
    this.classList.remove('show-icon');
    this.classList.add('hide-icon');
    input.setAttribute('type', 'text');
  } else {
    this.classList.remove('hide-icon');
    this.classList.add('show-icon');
    input.setAttribute('type', 'password');
  }
}

loginForm && loginForm.addEventListener('submit', handleFormSubmit);
const toggleButton = document.querySelector('.js-toggle-pass');

document.addEventListener('DOMContentLoaded', checkForError);

if (toggleButton) {
  toggleButton.addEventListener('click', togglePass);
}
