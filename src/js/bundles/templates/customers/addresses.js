import 'Styles/templates/customers/addresses.scss';

const dom = {};

const DELETE_MODAL_ID = 'delete-address-modal-container';

const isMobile = () => window.innerWidth <= 991;

const isTabletLarge = () => window.innerWidth >= 991;

const toggleContentVisibility = (action = 'add') => {
  if (isMobile()) {
    if (action === 'add') {
      dom.pageContent.classList.add('hidden');

      dom.banners.forEach((item) => {
        item.classList.add('hidden');
      });
    }
  }

  if (action === 'remove') {
    dom.pageContent.classList.remove('hidden');

    dom.banners.forEach((item) => {
      item.classList.remove('hidden');
    });
  }
};

const openDeleteModal = (modalId) => {
  dom.modals.forEach(modal => {
    if (modal.id === modalId) {
      modal.classList.remove('hidden');
    }
  });

  document.body.classList.add('overflow-hidden');
};

const openModal = (modalId) => {
  dom.modals.forEach(modal => {
    if (modal.id === modalId) {
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  });


  if (modalId !== DELETE_MODAL_ID) {
    toggleContentVisibility('add');
  }

  if (isTabletLarge() || modalId === DELETE_MODAL_ID) {
    document.body.classList.add('overflow-hidden');
  }
};

const closeModal = () => {
  dom.modals.forEach(item => {
    item.classList.add('hidden');
  });

  toggleContentVisibility('remove');

  document.body.classList.remove('overflow-hidden');
};

const closeDeleteAddressModal = () => {
  document.querySelector(`#${DELETE_MODAL_ID}`).classList.add('hidden');

  document.body.classList.remove('overflow-hidden');
};

const onModalContainerClick = (event) => {
  console.log(event.target.id);

  if (event.target.id === DELETE_MODAL_ID) {
    closeDeleteAddressModal();
  } else {
    if (event.target.classList.contains('account-modal-container')) {
      closeModal();
    }
  }
};

const onOpenAddModalClick = (event) => {
  event.preventDefault();
  event.stopPropagation();

  openModal('add-address-modal-container');

  return false;
};

const openEditAddressModal = (modalId) => {
  if (modalId) {
    dom.modals.forEach(modal => {
      if (modal.id === `update-address-modal-container-${modalId}`) {
        modal.classList.remove('hidden');
        toggleContentVisibility('add');
        if (isTabletLarge()) {
          document.body.classList.add('overflow-hidden');
        }
      } else {
        modal.classList.add('hidden');
      }
    });
  } else {
    if (isTabletLarge()) {
      document.body.classList.remove('overflow-hidden');
    }
  }
};

const onCloseAddModalClick = (event) => {
  event.preventDefault();
  event.stopPropagation();

  closeModal();
  openEditAddressModal();
  toggleContentVisibility('remove');

  return false;
};

const onEditAddressClick = event => {
  event.preventDefault();
  event.stopPropagation();

  window.scroll(0, 0);

  openEditAddressModal(event.target.dataset.id);

  return false;
};

const onOpenDeleteAddressModalClick = event => {
  event.preventDefault();
  event.stopPropagation();

  const { id } = event.target.dataset;

  const deleteModalAddress = document.querySelector(`#${DELETE_MODAL_ID} .delete-modal__address`);
  const address = document.querySelector(`#address-cart-${id} .address-card__text`);

  deleteModalAddress.innerHTML = address.innerHTML;

  dom.deleteAddressModalDeleteButton.setAttribute('data-target', event.target.dataset.target);

  openDeleteModal(DELETE_MODAL_ID);

  return false;
};

const onRemoveAddressClick = (event) => {
  event.preventDefault();
  event.stopPropagation();

  const { target } = dom.deleteAddressModalDeleteButton.dataset;

  if (target) {
    window.Shopify.postLink(target, {
      parameters: { _method: 'delete' },
    });
  }

  return false;
};

const initShopifyCountryProvince = () => {
  if (window.Shopify) {
    new window.Shopify.CountryProvinceSelector(
      'AddressCountryNew',
      'AddressProvinceNew',
      { hideElement: 'AddressProvinceContainerNew' },
    );

    document.querySelectorAll('.update-address-modal-container .account-form__select.city').forEach((form) => {
      const { formId } = form.dataset;

      const countrySelector = 'AddressCountry_' + formId;
      const provinceSelector = 'AddressProvince_' + formId;
      const containerSelector = 'AddressProvinceContainer_' + formId;

      new window.Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
        hideElement: containerSelector,
      });
    });
  }
};

const initDom = () => {
  dom.banners = document.querySelectorAll('.account-addresses .account-sms-subscription-banner');
  dom.pageContent = document.querySelector('.account__page-content');
  dom.addButton = document.querySelector('#add-new-address');
  dom.cards = document.querySelectorAll('.address-card');
  dom.backLinks = document.querySelectorAll('.account-addresses .account-modal__back-link');
  dom.modals = document.querySelectorAll('.account-modal-container');
  dom.deleteAddressModalDeleteButton = document.querySelector('.delete-modal #delete-address');
  dom.closeDeleteAddressModal = document.querySelector('#close-delete-modal');
};

const initEventListeners = () => {
  initDom();
  initShopifyCountryProvince();

  dom.backLinks.forEach((item) => {
    item.addEventListener('click', onCloseAddModalClick);
  });

  dom.addButton.addEventListener('click', onOpenAddModalClick);

  dom.cards.forEach(item => {
    item.querySelector('.delete-address-button').addEventListener('click', onOpenDeleteAddressModalClick);
    item.querySelector('.edit-address-button').addEventListener('click', onEditAddressClick);
  });

  dom.modals.forEach(item => {
    const deleteButton = item.querySelector('.delete-address-button');

    item.addEventListener('click', onModalContainerClick);

    if (deleteButton) {
      deleteButton.addEventListener('click', onOpenDeleteAddressModalClick);
    }
  });

  dom.deleteAddressModalDeleteButton.addEventListener('click', onRemoveAddressClick);

  dom.closeDeleteAddressModal.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    closeDeleteAddressModal();

    return false;
  });

  const items = document.querySelectorAll('.address-account-modal .zip');

  items.forEach(input => {
    input.addEventListener('input', () => {
      input.value = input.value
        .replace(/[^0-9.-]/g, '')
        .replace(/(?!^)-/g, '')
        .replace(/(\..*?)\./g, '$1');
    });
  });

};

initEventListeners();
