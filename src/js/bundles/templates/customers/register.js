import "Styles/templates/customers/register.scss";

const registrationForm = document.querySelector("#RegisterForm");

registrationForm &&
  registrationForm.addEventListener("submit", function (event) {
  });

document.addEventListener("DOMContentLoaded", checkForError);

function checkForError() {
  const errorDiv = document.querySelector(".js-form-error");
  if (errorDiv) {
  }
}
