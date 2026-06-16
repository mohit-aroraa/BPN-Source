let smiElement;
let dayjs;
let debounce;

const externalScripts = ['https://unpkg.com/cally'];

const bootstrap = el => {
  smiElement = el;
  dayjs = window.og.smi.dayjs;
  debounce = window.og.smi.debounce;
  defineCustomElements();
};

const handleSmiReady = () => {
  const targetElement = document.querySelector('#og-msi, og-smi');
  if (targetElement) {
    bootstrap(targetElement);
  } else {
    document.addEventListener('og:smi:ready', ev => {
      bootstrap(ev.target);
    });
  }
};

const createScript = src => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = src;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

const bootstrapSmiWithScripts = async scripts => {
  try {
    await Promise.all(scripts.map(src => createScript(src)));
  } catch (error) {
    console.error(`Error loading external script for Ordergroove SM: ${error}`);
  } finally {
    handleSmiReady();
  }
};

bootstrapSmiWithScripts(externalScripts);

/* notification animation code */
// display notifications for 7 seconds by default
// the recommendation for accessibility is 5 seconds + 1 for every 120 words, and we do not expect more than 120 words to be in a notification
const NOTIFICATION_HIDE_DELAY = 7000;
class SMNotifications extends HTMLElement {
  static hideClosestNotification(event) {
    const notification = event.target.closest('.og-notification');
    if (notification) {
      SMNotifications._hideNotification(notification);
    }
  }

  static _hideNotification(notification) {
    if (notification.dataset.visibility) return; // notification already animated out
    notification.dataset.visibility = 'hidden';
    notification.dataset.animatingOut = true;
    waitForAnimationToEnd(notification, 500).then(() => {
      delete notification.dataset.animatingOut;
    });
  }

  connectedCallback() {
    this.observeNotifications();
  }

  observeNotifications() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(({ addedNodes }) => this.handleAddedNodes(addedNodes));
    });

    observer.observe(this, { childList: true, subtree: true });
  }

  handleAddedNodes(addedNodes) {
    addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('og-notification')) {
        this.hideNotificationAfterDelay(node);
      }
    });
  }

  async hideNotificationAfterDelay(notification) {
    await waitForDelay(NOTIFICATION_HIDE_DELAY);
    SMNotifications._hideNotification(notification);
  }
}

/* dialog interactivity code */
class SMDialog extends HTMLElement {
  static open(idOrEvent) {
    let dialogId;
    if (idOrEvent instanceof Event) {
      dialogId = idOrEvent.currentTarget.dataset.clickTarget;
    } else {
      dialogId = idOrEvent;
    }
    let dialog = smiElement.querySelector(`#${dialogId}`);
    dialog.showModal(idOrEvent?.currentTarget);
  }

  static close(e, dialogId) {
    let dialog;
    if (dialogId) {
      dialog = smiElement.querySelector(`#${dialogId}`);
    } else {
      dialog = e.target.closest('sm-dialog');
    }

    dialog.close();
  }

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
    this.manageFocus = this.manageFocus.bind(this);
  }

  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    this.addEventListener('click', this.handleClick);
    this.dialog.addEventListener('close', this.manageFocus);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
    this.dialog.removeEventListener('close', this.manageFocus);
  }

  handleClick({ target }) {
    // close the dialog when the backdrop is clicked
    if (target.nodeName === 'DIALOG') {
      this.close();
    }
  }

  showModal(opener = null) {
    this.opener = opener;
    this.dialog.showModal();
  }

  close() {
    let dialog = this.dialog;
    let animationDuration = getComputedStyle(dialog).animationDuration;
    if (animationDuration && animationDuration !== '0s') {
      // dialogs go to display: none when closed, so we have to wait for the animation to finish
      dialog.dataset.animatingOut = true;
      waitForAnimationToEnd(dialog, 300).then(() => {
        delete dialog.dataset.animatingOut;
        dialog.close();
      });
    } else {
      dialog.close();
    }
  }

  manageFocus() {
    if (!this.opener) return;
    // normally the native <dialog> returns focus to the trigger element for us
    // however, if the element that opened the dialog was inside a dropdown, the dropdown is now closed and the element inside cannot be focused
    // detect this case and manually focus the trigger instead
    let dropdown = this.opener.closest('sm-dropdown');
    if (dropdown && dropdown.trigger) {
      dropdown.trigger.focus();
    }
  }
}

const DROPDOWN_EVENTS = {
  TRIGGER_CLICK: 'TRIGGER_CLICK',
  NEXT_MENU_ITEM: 'NEXT_MENU_ITEM',
  PREV_MENU_ITEM: 'PREV_MENU_ITEM',
  ITEM_CLICK: 'ITEM_CLICK',
  ESC_PRESS: 'ESC_PRESS',
  OUTSIDE_CLICK: 'OUTSIDE_CLICK',
  FOCUS_LEAVES_MENU: 'FOCUS_LEAVES_MENU'
};

class SMDropdown extends HTMLElement {
  connectedCallback() {
    this.state = {
      open: false,
      activeIndex: 0
    };

    this.trigger = this.querySelector('[aria-haspopup]');
    this.content = this.querySelector('[role="menu"]');
    this.actions = Array.from(this.content.querySelectorAll('[data-action]'));

    this.trigger.setAttribute('aria-expanded', false);
    this.actions.forEach(action => {
      action.tabIndex = -1;
    });

    this.setUpEventListeners();
  }

  setUpEventListeners() {
    this.triggerListener = e => this.handleEvent(DROPDOWN_EVENTS.TRIGGER_CLICK);
    this.actionListener = e => this.handleEvent(DROPDOWN_EVENTS.ITEM_CLICK);

    this.trigger.addEventListener('click', this.triggerListener);
    this.actions.forEach(el => el.addEventListener('click', this.actionListener));
    this.addEventListener('keydown', e => this.handleKeydown(e));
    this.addEventListener('focusout', e => this.handleFocusOut(e));

    // keep reference to remove later
    this.documentListener = e => this.handleOutsideClick(e);
    document.addEventListener('click', this.documentListener);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.documentListener);
    this.trigger.removeEventListener('click', this.triggerListener);
    this.actions.forEach(el => el.removeEventListener('click', this.actionListener));
  }

  handleEvent(type) {
    switch (type) {
      case DROPDOWN_EVENTS.TRIGGER_CLICK:
        this.state.open = !this.state.open;
        this.state.activeIndex = 0;
        break;
      case DROPDOWN_EVENTS.ITEM_CLICK:
      case DROPDOWN_EVENTS.ESC_PRESS:
      case DROPDOWN_EVENTS.OUTSIDE_CLICK:
      case DROPDOWN_EVENTS.FOCUS_LEAVES_MENU:
        this.state.open = false;
        this.state.activeIndex = 0;
        break;
      case DROPDOWN_EVENTS.NEXT_MENU_ITEM:
        this.state.activeIndex = (this.state.activeIndex + 1) % this.actions.length;
        break;
      case DROPDOWN_EVENTS.PREV_MENU_ITEM:
        this.state.activeIndex = (this.state.activeIndex + this.actions.length - 1) % this.actions.length;
        break;
    }

    // wait before performing side effects
    // this prevents an issue in iOS 16 where the dropdown closed too early, so clicks on the actions didn't register
    setTimeout(() => this.performSideEffects(type), 0);
  }

  performSideEffects(type) {
    this.trigger.setAttribute('aria-expanded', this.state.open);

    switch (type) {
      case DROPDOWN_EVENTS.TRIGGER_CLICK:
        if (this.state.open) {
          this.actions[this.state.activeIndex].focus();
        }
        break;
      case DROPDOWN_EVENTS.ESC_PRESS:
        this.trigger.focus();
        break;
      case DROPDOWN_EVENTS.NEXT_MENU_ITEM:
      case DROPDOWN_EVENTS.PREV_MENU_ITEM:
        this.actions[this.state.activeIndex].focus();
        break;
    }
  }

  handleOutsideClick(e) {
    if (this.state.open && !e.composedPath().includes(this)) {
      this.handleEvent(DROPDOWN_EVENTS.OUTSIDE_CLICK);
    }
  }

  handleFocusOut(e) {
    if (!this.contains(e.relatedTarget)) {
      this.handleEvent(DROPDOWN_EVENTS.FOCUS_LEAVES_MENU);
    }
  }

  handleKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        this.handleEvent(this.state.open ? DROPDOWN_EVENTS.NEXT_MENU_ITEM : DROPDOWN_EVENTS.TRIGGER_CLICK);
        e.preventDefault();
        break;
      case 'ArrowUp':
        this.handleEvent(DROPDOWN_EVENTS.PREV_MENU_ITEM);
        e.preventDefault();
        break;
      case 'Escape':
        this.handleEvent(DROPDOWN_EVENTS.ESC_PRESS);
        break;
    }
  }
}

class SMToggle extends HTMLElement {
  connectedCallback() {
    const triggers = Array.from(this.querySelectorAll('[data-toggle-trigger]'));

    this.content = this.querySelector('[data-toggle-content]');
    // the trigger can't be inside the content; otherwise there is no way to reveal the content
    this.trigger = triggers.find(t => !this.content.contains(t));
    if (!this.trigger) return;

    this.isOpen = 'open' in this.dataset;

    this.syncState();

    this.triggerListener = () => this.handleClick();
    this.trigger.addEventListener('click', this.triggerListener);
  }

  disconnectedCallback() {
    this.trigger.removeEventListener('click', this.triggerListener);
  }

  handleClick() {
    this.isOpen = !this.isOpen;
    this.animateContent();
    this.syncState();
  }

  syncState() {
    this.trigger.setAttribute('aria-expanded', this.isOpen);
    if (this.isOpen) {
      this.dataset.open = '';
    } else {
      delete this.dataset.open;
    }
  }

  animateContent() {
    this.dataset.animating = true;
    if (this.isOpen) {
      const newHeight = this.content.offsetHeight;
      this.content.style.height = 0;
      // we need to wait for the previous height to be applied to the DOM before updating it
      // otherwise the animation won't work
      runAfterPaint(() => {
        this.content.style.height = `${newHeight}px`;
      });
    } else {
      this.content.style.height = `${this.content.offsetHeight}px`;
      runAfterPaint(() => {
        this.content.style.height = 0;
      });
    }

    waitForAnimationToEnd(this.content, 400, 'transitionend').then(() => {
      delete this.dataset.animating;
      this.content.style.height = null;
    });
  }
}

class SMDatepicker extends HTMLElement {
  constructor() {
    super();
    this.bindMethods();
  }

  bindMethods() {
    this.togglePopover = this.togglePopover.bind(this);
    this.hidePopover = this.hidePopover.bind(this);
    this.save = this.save.bind(this);
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this.stopPropagation = this.stopPropagation.bind(this);
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.updateLocale = this.updateLocale.bind(this);
    this.reflectDate = this.reflectDate.bind(this);
  }

  initializeElements() {
    this.datepickerPopover = this.querySelector('[data-datepicker-popover]');
    this.trigger = this.querySelector('[data-datepicker-trigger]');
    this.calendar = this.querySelector('calendar-date');
    this.dateInput = this.querySelector('[data-datepicker-input]');
    this.cancelButton = this.querySelector('[data-datepicker-cancel]');
    this.saveButton = this.querySelector('[data-datepicker-save]');
    this.reflectDateContainers = this.querySelectorAll('[data-reflect-date]');
  }

  initializeProperties() {
    this.submitOnSave = this.getAttribute('data-submit-on-save') === 'true';
    this.minDateOffset = parseInt(this.getAttribute('data-min-date-offset-days')) || 1;
    this.minDate = this.getMinDate();
    this.selectedDate = this.dateInput && this.dateInput.value ? dayjs(this.dateInput.value) : this.minDate;
  }

  connectedCallback() {
    this.initializeElements();
    this.initializeProperties();
    this.addListeners();
    this.initializeCalendar();
    this.updateLocale();
    this.observeLangAttribute();
  }

  disconnectedCallback() {
    this.removeListeners();
    if (this.langObserver) {
      this.langObserver.disconnect();
    }
  }

  addListeners() {
    this.modifyListeners('addEventListener');
  }

  removeListeners() {
    this.modifyListeners('removeEventListener');
  }

  modifyListeners(action) {
    document[action]('click', this.handleOutsideClick);
    document[action]('keydown', this.handleKeydown);

    if (this.datepickerPopover) {
      this.datepickerPopover[action]('click', this.stopPropagation);
    }

    if (this.trigger) {
      this.trigger[action]('click', this.handleTriggerClick);
    }

    if (this.cancelButton) {
      this.cancelButton[action]('click', this.hidePopover);
    }

    if (this.saveButton) {
      this.saveButton[action]('click', this.save);
    }
  }

  handleTriggerClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.togglePopover();
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  initializeCalendar() {
    this.updateCalendarLocale();
    this.updateCalendarMin();
    this.updateCalendarValue();
  }

  getMinDate() {
    return dayjs().add(this.minDateOffset, 'day');
  }

  updateCalendarLocale() {
    this.calendar.setAttribute('locale', this.locale);
  }

  updateCalendarMin() {
    this.calendar.setAttribute('min', this.minDate.format('YYYY-MM-DD'));
  }

  updateCalendarValue() {
    this.calendar.setAttribute('value', this.selectedDate.format('YYYY-MM-DD'));
  }

  togglePopover() {
    const isVisible = this.datepickerPopover.getAttribute('data-visibility') === 'hidden';

    if (isVisible) {
      this.closeAllDatepickers();
    }

    this.datepickerPopover.setAttribute('data-visibility', isVisible ? 'visible' : 'hidden');
    this.trigger.setAttribute('aria-expanded', isVisible ? 'true' : 'false');
  }

  closeAllDatepickers() {
    const datepickers = document.querySelectorAll('sm-datepicker');
    datepickers.forEach(datepicker => {
      if (datepicker !== this) {
        datepicker.hidePopover();
      }
    });
  }

  hidePopover() {
    this.datepickerPopover.setAttribute('data-visibility', 'hidden');
    this.trigger.setAttribute('aria-expanded', 'false');
  }

  save() {
    this.selectedDate = dayjs(this.calendar.value);
    this.hidePopover();

    if (!this.dateInput || !(this.dateInput instanceof HTMLInputElement)) {
      console.error('Date input not found');
      return;
    }

    this.dateInput.value = this.selectedDate.format('YYYY-MM-DD');
    this.reflectDate();

    if (this.submitOnSave) {
      const form = this.closest('form');
      if (form) {
        form.requestSubmit();
      } else {
        console.error('Form element not found');
      }
    }
  }

  handleOutsideClick(event) {
    if (!this.contains(event.target)) {
      this.hidePopover();
    }
  }

  handleKeydown(event) {
    if (event.key === 'Escape') {
      this.hidePopover();
    }
  }

  formatDate(value, format) {
    return value
      ? dayjs(value)
          .locale(this.locale)
          .format(format || 'LL')
      : '';
  }

  reflectDate() {
    const formattedDate = this.formatDate(this.selectedDate);

    this.reflectDateContainers.forEach(element => {
      const textNode = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE);

      if (textNode) {
        textNode.textContent = formattedDate;
      } else {
        element.appendChild(document.createTextNode(formattedDate));
      }
    });
  }

  updateLocale() {
    this.locale = document.documentElement.lang || 'en';
    this.updateCalendarLocale();
    this.reflectDate();
  }

  observeLangAttribute() {
    this.langObserver = new MutationObserver(this.updateLocale);

    this.langObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });
  }
}

const countriesDataPromise = fetch(
  'https://static.ordergroove.com/@ordergroove/i18n-data/latest/i18n_country_data.json'
).then(res => res.json());

function createOption(value, text, parent) {
  const option = document.createElement('option');
  option.value = value;
  option.innerText = text;
  parent.appendChild(option);
  return option;
}

class CountryStateDropdown extends HTMLElement {
  constructor() {
    super();
    this.countrySelect = this.querySelector('[name="country_code"]');
    this.stateSelect = this.querySelector('[name="state_province_code"]');
  }

  connectedCallback() {
    this.syncCountryAndStates = this.syncCountryAndStates.bind(this);
    this.addCountryOptions = this.addCountryOptions.bind(this);
    this.setUpStateAndCountry = this.setUpStateAndCountry.bind(this);
    this.addSelectedOption = this.addSelectedOption.bind(this);
    this.updateStates = this.updateStates.bind(this);
    this.countryDefaultValue = this.countrySelect.getAttribute('value');
    this.stateDefaultValue = this.stateSelect.getAttribute('value');

    this.setUpStateAndCountry();

    this.countrySelect.addEventListener('change', this.updateStates);
  }

  disconnectedCallback() {
    this.countrySelect.removeEventListener('change', this.updateStates);
  }

  async setUpStateAndCountry() {
    const countriesByCode = await countriesDataPromise;
    this.addCountryOptions(countriesByCode);
    this.syncCountryAndStates(this.countryDefaultValue);
    if (this.countryDefaultValue) this.addSelectedOption(this.countryDefaultValue, this.countrySelect);
    if (this.stateDefaultValue) this.addSelectedOption(this.stateDefaultValue, this.stateSelect);
  }

  async addCountryOptions(countriesByCode) {
    const enabledCountries = Object.entries(countriesByCode)
      .filter(([code]) => this.enabledCountries.includes(code))
      .sort((a, b) => (a[1].name > b[1].name ? 1 : -1));
    enabledCountries.forEach(([code, countryInfo]) => {
      const option = createOption(code, this.localizedCountries[code] || countryInfo.name, this.countrySelect);
      if (code === this.countryDefaultValue) option.selected = true;
    });
  }

  async syncCountryAndStates(countryValue) {
    const countriesByCode = await countriesDataPromise;
    const selectedCountry = countriesByCode[countryValue];
    const states = selectedCountry ? selectedCountry.regions : null;

    const currentOptions = this.stateSelect.querySelectorAll('option');
    currentOptions.forEach(option => {
      // Clear all options except default blank option
      if (option.value !== '') option.remove();
    });

    if (states && states.length) {
      states.forEach(({ code, name }) => {
        const option = createOption(code, name, this.stateSelect);
        if (code === this.stateDefaultValue) option.selected = true;
      });
    }
  }

  async addSelectedOption(selectedValue, selectElement) {
    // get all options from select Element
    const options = selectElement.querySelectorAll('option');
    // find the option with the selected value
    const selectedOption = Array.from(options).find(option => option.value === selectedValue);
    // if selectedOption is not found, create it
    if (!selectedOption && selectedValue) {
      createOption(selectedValue, selectedValue, selectElement);
    }
    if (selectElement.querySelectorAll('option').length === 0) {
      selectElement.style.visibility = 'hidden';
    }
  }

  async updateStates(event) {
    await this.syncCountryAndStates(event.target.value);
  }
}

class SMMultiStep extends HTMLElement {
  constructor() {
    super();
    this.handleStepChange = this.handleStepChange.bind(this);
    this.resetCurrentStep = this.resetCurrentStep.bind(this);
  }

  connectedCallback() {
    this.addEventListener('og-step-change', this.handleStepChange);
    this.addEventListener('og-step-reset', this.resetCurrentStep);
    this.resetCurrentStep();
  }

  disconnectedCallback() {
    this.removeEventListener('og-step-change', this.handleStepChange);
    this.removeEventListener('og-step-reset', this.resetCurrentStep);
  }

  setCurrentStep(step) {
    // the CSS uses a data-active attribute to only show the active step
    delete this.currentStep?.dataset.active;
    this.currentStep = step;
    if (this.currentStep) {
      this.currentStep.dataset.active = '';
    }
  }

  handleStepChange({ detail }) {
    this.setCurrentStep(this.querySelector(`[data-step="${detail.step}"]`));
  }

  resetCurrentStep() {
    const firstStep = this.querySelector('[data-step]');
    this.setCurrentStep(firstStep);
  }
}

class SMProductFilter extends HTMLElement {
  constructor() {
    super();
    this.handleSearchInput = debounce(this.handleSearchInput.bind(this), 150);
    this.clearSearchInput = this.clearSearchInput.bind(this);
    this.heightLocked = false;
  }

  connectedCallback() {
    this.searchInput = this.querySelector('[data-search-input]');
    this.clearButton = this.querySelector('[data-clear-button]');
    this.items = this.querySelector('[data-items]');
    this.noResults = this.querySelector('[data-no-results]');

    this.searchInput.addEventListener('input', this.handleSearchInput);
    this.clearButton.addEventListener('click', this.clearSearchInput);
  }

  disconnectedCallback() {
    this.searchInput.removeEventListener('input', this.handleSearchInput);
    this.clearButton.removeEventListener('click', this.clearSearchInput);
  }

  handleSearchInput(e) {
    // when the user searches, set the height of the items container so items don't jump around
    if (!this.heightLocked) {
      this.items.style.height = getComputedStyle(this.items).height;
      this.heightLocked = true;
    }
    const searchValue = e.target.value.toLowerCase();
    this.displayMatchingItems(searchValue);
  }

  clearSearchInput() {
    this.searchInput.value = '';
    this.searchInput.focus();
    this.displayMatchingItems('');
  }

  displayMatchingItems(searchText) {
    let matchingItems = 0;
    const items = this.querySelectorAll(`[data-product-name]`);
    items.forEach(item => {
      const itemValue = item.dataset.productName.toLowerCase();
      if (itemValue.includes(searchText)) {
        matchingItems++;
        item.style.display = null;
      } else {
        item.style.display = 'none';
        // if the product was selected, de-select it since we're hiding it
        if (item.control.checked) {
          item.control.checked = false;
          // manually dispatch a change event so the form submit button is disabled
          item.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });

    // hide or show the "no results" message
    if (matchingItems === 0) {
      this.noResults.style.display = 'block';
    } else {
      this.noResults.style.display = null;
    }
  }
}

function defineCustomElements() {
  const smCustomElements = {
    'sm-notifications': SMNotifications,
    'sm-dialog': SMDialog,
    'sm-dropdown': SMDropdown,
    'sm-toggle': SMToggle,
    'sm-datepicker': SMDatepicker,
    'sm-country-state-dropdown': CountryStateDropdown,
    'sm-multistep': SMMultiStep,
    'sm-product-filter': SMProductFilter
  };

  for (const tagName of Object.keys(smCustomElements)) {
    if (!customElements.get(tagName)) {
      customElements.define(tagName, smCustomElements[tagName]);
    }
  }
}

/* utilities */

/**
 * Returns a Promise that resolves when an animation finishes playing.
 * If the animation takes longer than `maxDuration`, the Promise will also resolve.
 */
function waitForAnimationToEnd(element, maxDuration, event = 'animationend') {
  return Promise.race([waitForEvent(element, event, { once: true }), waitForDelay(maxDuration)]);
}

function waitForEvent(target, eventName, eventOptions = {}) {
  return new Promise(resolve => {
    target.addEventListener(eventName, resolve, eventOptions);
  });
}

function waitForDelay(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

// gets the next order date for a subscription
function nthOrderDate(order, subscription, n = 1) {
  const increment = subscription.every * n;
  const unit = {
    1: 'day',
    2: 'week',
    3: 'month'
  }[subscription.every_period];

  const dayjs = ((window.og || {}).smi || {}).dayjs;

  return typeof dayjs === 'function' ? dayjs(order.place).add(increment, unit) : null;
}

function runAfterPaint(cb) {
  requestAnimationFrame(() => {
    setTimeout(cb);
  });
}

function disableFormElements(ev) {
  ev.target.querySelectorAll('select,input,button').forEach(it => it.toggleAttribute('disabled', true));
}

function enableFormElements(ev) {
  ev.target.querySelectorAll('select,input,button').forEach(it => it.toggleAttribute('disabled', false));
}

function submitFormOnchange(ev) {
  ev.target.closest('form').requestSubmit();
}

function dispatchOGEvent(event, name, detail) {
  event.currentTarget.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
}

function closeCurrentAndOpenNext(e, nextDialogId) {
  SMDialog.close(e);
  
  setTimeout(() => {
    SMDialog.open(nextDialogId);
  }, 300);
}

function onSwapCancellationFlow(e) {
   SMDialog.close(e);
   SMDialog.open(e);
}

function handleReasonSubmit(e) {
    const selectedReason = getSelectedReason();
    const reasonCode = selectedReason ? selectedReason.getAttribute('data-reason-code') : null;
    const subscriptionId = getSubscriptionIdFromForm(e.target);
    
    console.log("something");
    console.log(reasonCode);

    if (!reasonCode || !subscriptionId) {
        console.error("Missing reason code or subscription ID");
        return;
    }

    handleReasonAction(e, reasonCode, subscriptionId);
}

function getSelectedReason() {
    return document.querySelector('input[name="cancel_reason"]:checked');
}

function getSubscriptionIdFromForm(target) {
    const form = target.closest('form');
    return form ? form.querySelector('input[name="subscription"]').value : null;
}

function handleReasonAction(e, reasonCode, subscriptionId) {
    switch (reasonCode) {
        case '22':
            dispatchOGEvent(e, "og-step-change", { step: "swap-22" });
            break;
        case '70':
            dispatchOGEvent(e, "og-step-change", { step: "swap-70" });
            break;
        case '2':
            dispatchOGEvent(e, "og-step-change", { step: "skip" });
            break;
        default:
            processCancellation(e, reasonCode, subscriptionId);
            break;
    }
}

function getAuthorizationHeader() {
    const { public_id, sig_field, ts, sig } = og.smi.store.getState().customer;
    return JSON.stringify({ public_id, sig_field, ts, sig });
}

// Get common headers for API requests
function getCommonHeaders() {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': getAuthorizationHeader()
    };
}

function processCancellation(e, reasonCode, subscriptionId) {
    const options = {
        method: 'PATCH',
        headers: getCommonHeaders(),
        body: JSON.stringify({
            cancel_reason: reasonCode + "|"
        })
    };

    fetch(`https://restapi.ordergroove.com/subscriptions/${subscriptionId}/cancel/`, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(response => {
            if (response && response.cancel_reason) {
                // Show success notification
                showNotification('Success! Your subscription has been cancelled.', 'success');
            } else {
                // Handle case where response is not as expected
                showNotification('An error occurred while cancelling your subscription. Please try again later.', 'error');
            }
            SMDialog.close(e);
            updateOrderStatusWithSMIRequests();
        })
        .catch(err => {
            console.error(err);
            // Show error notification
            showNotification('An error occurred while cancelling your subscription. Please try again later.', 'error');
            SMDialog.close(e);
        });
}

function showNotification(message, type) {
    const notificationElement = document.createElement('li');
    notificationElement.classList.add('og-notification');
    
    if (type === 'error') {
        notificationElement.dataset.state = 'error';
        notificationElement.innerHTML = `
            <span class="og-notification-icon">
                <svg width="16" height="16"><use href="#notification-error"></use></svg>
            </span>
            <span class="visually-hidden">Error</span>
            <span>${message}</span>
            <button class="og-notification-close" aria-label="Close" @click="SMNotifications.hideClosestNotification(event)">
                <svg width="16" height="16"><use href="#notification-close"></use></svg>
            </button>
        `;
    } else {
        notificationElement.innerHTML = `
            <span class="og-notification-icon">
                <svg width="16" height="16"><use href="#notification-success"></use></svg>
            </span>
            <span class="visually-hidden">Success</span>
            <span>${message}</span>
            <button class="og-notification-close" aria-label="Close" @click="SMNotifications.hideClosestNotification(event)">
                <svg width="16" height="16"><use href="#notification-close"></use></svg>
            </button>
        `;
    }

    const notificationsList = document.querySelector('sm-notifications ul');
    notificationsList.appendChild(notificationElement);

    // Hide the notification after the defined delay
    setTimeout(() => SMNotifications._hideNotification(notificationElement), NOTIFICATION_HIDE_DELAY);
}

function updateOrderStatusWithSMIRequests() {
    window.og.smi.request_orders({ status: [1] });
    window.og.smi.request_orders_items({ status: [1] });
    window.og.smi.request_subscriptions({ status: [1] });
}

function updateOrderStatusWithMsiRequests() {
    const msiRequests = [
        window.og.msi.request_orders({ status: [1] }),
        window.og.msi.request_orders_items({ status: [1] }),
        window.og.msi.request_subscriptions({ status: [1] })
    ];

    return Promise.all(msiRequests);
}

// Add items to an order, handling both one-time and subscription purchases
async function addItems(orderId, e) {
    try {
        const container = document.querySelector(`#og-add-items-dialog-${orderId}`);
        const productId = container.querySelector('input[name="product"]:checked').value;
        const purchaseType = container.querySelector('input[name="purchase_type"]:checked').value;
        
        // Capture the selected frequency from the dropdown
        const frequencySelect = container.querySelector(`#frequency-select-${orderId}`);
        const selectedFrequency = frequencySelect ? frequencySelect.value : null;

        const apiUrl = 'https://restapi.ordergroove.com/orders?status=1';
        const createItemUrl = 'https://restapi.ordergroove.com/items/iu/';
        const convertToSubscriptionUrl = 'https://restapi.ordergroove.com/subscriptions/create_from_item/';
        const offerId = '4a56928c54c811efbcc2c254ca71c677';

        const actualOrderId = orderId || (await fetchOrders(apiUrl)).results[0]?.public_id;

        if (!actualOrderId) {
            throw new Error('No future orders found.');
        }

        // Create a one-time item for the order
        const createItemResponse = await createItem(createItemUrl, actualOrderId, productId, offerId);

        // Convert to subscription if required
        if (purchaseType === "subscription") {
            const [every, every_period] = selectedFrequency.split('_').map(Number);
            await convertToSubscription(convertToSubscriptionUrl, createItemResponse.public_id, offerId, every, every_period);
        }
    } catch (error) {
        showNotification('An error occurred. Please try again.', 'error');
        SMDialog.close(e);
        throw error; // Re-throw to be caught in addItemsWrapper
    }
}

// Wrapper function to handle item addition, status update, and notifications
function addItemsWrapper(orderId, e) {
    dispatchOGEvent(e, "og-step-change", { step: "processing" });
    
    addItems(orderId, e)
        .then(() => updateOrderStatusWithMsiRequests())
        .then(() => {
            SMDialog.close(e);
            showNotification('Items added and order updated successfully', 'success');
        })
        .catch(error => {
            showNotification('Failed to complete the operation. Please try again.', 'error');
        });
}

// Fetch orders data from the provided URL
async function fetchOrders(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: getCommonHeaders()
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch orders: ' + response.statusText);
    }
    
    return response.json();
}

// Create a one-time item associated with an order
async function createItem(url, orderId, productId, offerId) {
    const payload = {
        order: orderId,
        product: productId,
        quantity: 1
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: getCommonHeaders(),
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('Failed to create one-time item: ' + response.statusText);
    }

    return response.json();
}

// Convert a one-time item to a subscription
async function convertToSubscription(url, itemId, offerId, every, every_period) {
    const payload = {
        item: itemId,
        offer: offerId,
        every: every || 30,
        every_period: every_period || 1
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: getCommonHeaders(),
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('Failed to convert to subscription: ' + response.statusText);
    }

    return response.json();
}

function initializePurchaseOptionListeners(orderId) {
    const modalDialog = document.querySelector(`#og-add-items-dialog-${orderId}`);
    const purchaseTypeRadioButtons = modalDialog.querySelectorAll('input[name="purchase_type"]');
    const confirmSelectionButton = modalDialog.querySelector('#confirm-selection-button');

    const selectedProduct = modalDialog.querySelector('input[name="product"]:checked');
    if (selectedProduct) {
        const price = parseFloat(selectedProduct.getAttribute('data-price'));
        const discountedPrice = (price * 0.85).toFixed(2);
        const discountAmount = (price - discountedPrice).toFixed(2);

        // Update displayed prices
        modalDialog.querySelector('#otp-selected-product-price').textContent = `$${price.toFixed(2)}`;
        modalDialog.querySelector('#subscription-selected-product-price').textContent = `$${discountedPrice}`;
        modalDialog.querySelector('#subscription-selected-product-price-discount').textContent = `SAVE $${discountAmount}`;
    }

    // Function to update the button text based on the selected purchase option
    function updateConfirmSelectionButtonText() {
        const selectedPurchaseTypeRadio = modalDialog.querySelector('input[name="purchase_type"]:checked');

        if (selectedPurchaseTypeRadio) {
            const selectedPurchaseType = selectedPurchaseTypeRadio.value;
            if (selectedProduct) {
                const price = parseFloat(selectedProduct.getAttribute('data-price'));
                const discountedPrice = (price * 0.85);
                let selectedPriceText = '';
                
                // Set the price text based on purchase type
                if (selectedPurchaseType === 'one_time') {
                    selectedPriceText = `$${price.toFixed(2)}`;
                    confirmSelectionButton.textContent = `ADD PRODUCT - ${selectedPriceText}`;
                } else if (selectedPurchaseType === 'subscription') {
                    selectedPriceText = `$${discountedPrice.toFixed(2)}`;
                    confirmSelectionButton.textContent = `ADD SUBSCRIPTION - ${selectedPriceText}`;
                }
            }
        } else {
            confirmSelectionButton.textContent = 'Select Option';
        }
    }

    purchaseTypeRadioButtons.forEach(radio => {
        radio.addEventListener('click', () => {
            confirmSelectionButton.disabled = !modalDialog.querySelector('input[name="purchase_type"]:checked');
            updateConfirmSelectionButtonText();
        });
    });

    // Initial update of the button text
    updateConfirmSelectionButtonText();
}


function resetDialogSteps(e, orderId) {
    const modalDialog = document.querySelector(`#og-add-items-dialog-${orderId}`);
    
    dispatchOGEvent(e, "og-step-change", { step: "product-selection" });

    ['product', 'purchase_type'].forEach(name => {
        modalDialog.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
            radio.checked = false;
        });
    });

    modalDialog.querySelector('#select-options-button').disabled = true;
    modalDialog.querySelector('#confirm-selection-button').disabled = true;
    
    // Clear the search input value
    const searchInput = modalDialog.querySelector('input[data-search-input]');
    if (searchInput) {
        searchInput.value = '';
    }
}

// Fetch products by SKUs using the API
async function fetchProductsBySKUs() {
    const response = await fetch(`https://restapi.ordergroove.com/products/?page_size=100`, {
        method: 'GET',
        headers: getCommonHeaders()
    });

    if (!response.ok) {
        throw new Error('Failed to fetch products: ' + response.statusText);
    }

    return response.json();
}

function toggleProcessingBackdrop(orderId) {
    const modalDialog = document.querySelector(`#og-add-items-dialog-${orderId}`);
    
    if (!modalDialog) return;

    modalDialog.addEventListener('og-step-change', (e) => {
        const { step } = e.detail;
        if (step === 'processing') {
            modalDialog.classList.add('is-processing');
        } else {
            modalDialog.classList.remove('is-processing');
        }
    });
}

async function initializeSelectionListeners(orderId) {
    const modalDialog = document.querySelector(`#og-add-items-dialog-${orderId}`);
    const loaderWrapper = modalDialog.querySelector('.add-product-to-order__loader-wrapper');
    const productContainer = modalDialog.querySelector(`.og-sku-swap-products[data-product-items]`);
    const noResultMessage = modalDialog.querySelector('.og-no-result-message');
    const stepTwoHeaderTextDisplay = modalDialog.querySelector('div[data-step="purchase-options"] #dialog-header-text');
    const selectedProductFlavourLabel = modalDialog.querySelector('p.selected-product-flavour .selected-product-flavour__label');
    const selectedProductFlavourName = modalDialog.querySelector('p.selected-product-flavour .selected-product-flavour__name');
    
    toggleProcessingBackdrop(orderId);
    
    try {
        // Show the loader and hide the product container and no-result message initially
        loaderWrapper.style.display = 'flex';
        noResultMessage.style.display = 'none';
        productContainer.innerHTML = ''; // Clear existing products

        const products = await fetchProductsBySKUs(); // Fetch products

        // Hide loader after products are fetched
        loaderWrapper.style.display = 'none';

        if (products.results.length === 0) {
            noResultMessage.style.display = 'block';
            return;
        }

        // Filter out products with a group named "Test"
        const filteredProducts = products.results.filter(product => {
            return !product.groups.some(group => group.name === "Test");
        });

        // Sort the filtered products in ascending order by name
        const sortedProducts = filteredProducts.sort((a, b) => a.name.localeCompare(b.name));

        noResultMessage.style.display = sortedProducts.length === 0 ? 'block' : 'none';

        // Populate the product container with sorted and filtered products
        sortedProducts.forEach(product => {
            const { sku, name, price, image_url, external_product_id, groups } = product;

            const productInput = document.createElement('input');
            productInput.type = 'radio';
            productInput.name = 'product';
            productInput.value = external_product_id;
            productInput.setAttribute('data-price', price);
            productInput.setAttribute('data-name', name);
            productInput.classList.add('visually-hidden');
            productInput.id = `alternative-product-${sku}-for-${orderId}`;

            const label = document.createElement('label');
            label.classList.add('og-product-label');
            label.setAttribute('for', `alternative-product-${sku}-for-${orderId}`);
            label.setAttribute('data-product-name', name);
            label.innerHTML = `
                <div class="flex-row og-order-item-info og-text-sm">
                    <div class="og-thumbnail">
                        <img src="${image_url}" alt="${name}" onerror="this.style.display='none';">
                    </div>
                    <div class="flex-column og-justify-content-center">
                        <span class="og-text-sm og-fw-bold">${name}</span>
                        <span>Price: ${price}</span>
                    </div>
                </div>
            `;

            productContainer.appendChild(productInput);
            productContainer.appendChild(label);
        });

        const productRadioButtons = modalDialog.querySelectorAll('input[name="product"]');
        const selectOptionsButton = modalDialog.querySelector('#select-options-button');

        productRadioButtons.forEach(radio => {
            radio.addEventListener('click', () => {
                selectOptionsButton.disabled = !modalDialog.querySelector('input[name="product"]:checked');
            
                const selectedProduct = modalDialog.querySelector('input[name="product"]:checked');
                
                if (selectedProduct) {
                    const productName = selectedProduct.getAttribute('data-name');
                    const selectedProductData = sortedProducts.find(
                        product => product.external_product_id === selectedProduct.value
                    );

                    // Check for "sku_swap" group type or specific product exception
                    const hasSkuSwapGroup = selectedProductData.groups.some(group => group.group_type === "sku_swap");
                    const isExceptionProduct = selectedProductData.external_product_id === "41165483573420";

                    selectedProductFlavourLabel.textContent = hasSkuSwapGroup || isExceptionProduct ? "Flavor" : "Servings";

                    // Split the product name by the last occurrence of " - "
                    const lastDashIndex = productName.lastIndexOf(" - ");
                    const mainName = lastDashIndex > -1 ? productName.slice(0, lastDashIndex).trim() : productName;
                    const flavor = lastDashIndex > -1 ? productName.slice(lastDashIndex + 2).trim() : '';

                    stepTwoHeaderTextDisplay.textContent = `${mainName}`;
                    selectedProductFlavourName.textContent = `${flavor}`;
                }
            });
        });
    } catch (error) {
        console.error('Error initializing selection listeners:', error);
        loaderWrapper.style.display = 'none'; // Hide loader in case of error
    }
}

function navigateToStep(e, step, orderId) {
    const modalDialog = document.querySelector(`#og-add-items-dialog-${orderId}`);
    
    if (modalDialog) {
        // Dispatch a custom event to change the step
        dispatchOGEvent(e, "og-step-change", { step });
    }
}


