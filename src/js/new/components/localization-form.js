/**
 * Localization Form Handler
 * Remove once new localization system is implemented
 *
 * Handles country selection in the localization form by:
 * 1. Finding the localization form and country selection items
 * 2. Adding click handlers to update hidden country input
 * 3. Submitting form to update locale
 */
export function setupLocalizationForm() {
  const localizationForm = document.querySelector('#localization_form');

  if (localizationForm) {
    const localizationItems = localizationForm.querySelectorAll('.js-localization-item');
    const countrySelector = localizationForm.querySelector('.bpn-country-selector');

    // Store selected country in session storage
    const storeCountrySelection = (countryCode) => {
      sessionStorage.setItem('selectedCountry', countryCode);
    };

    // Restore country selection from session storage
    const restoreCountrySelection = () => {
      const storedCountry = sessionStorage.getItem('selectedCountry');
      if (storedCountry) {
        const hiddenCountryInput = document.getElementById('hidden-country');
        if (hiddenCountryInput && hiddenCountryInput.value !== storedCountry) {
          hiddenCountryInput.value = storedCountry;
          localizationForm.submit();
        }
      }
    };

    // Add click outside handler for country selector
    document.addEventListener('click', function(event) {
      if (countrySelector && !countrySelector.contains(event.target)) {
        countrySelector.removeAttribute('open');
      }
    });

    localizationItems.forEach(item => {
      item.addEventListener('click', function() {
        const countryIsoCode = this.getAttribute('data-country-code');
        const hiddenCountryInput = document.getElementById('hidden-country');
        if (hiddenCountryInput) {
          hiddenCountryInput.value = countryIsoCode;
          storeCountrySelection(countryIsoCode);
        }
        localizationForm.submit();
      });
    });

    // Restore country selection when returning from checkout
    if (document.referrer.includes('/checkout')) {
      restoreCountrySelection();
    }
  }
}
setupLocalizationForm();