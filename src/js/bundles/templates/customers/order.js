import 'Styles/templates/customers/order.scss';
import cartMethods from '../../utils/helpers/cart-helper';

const { post } = cartMethods;

const addProduct = async (event) => {
  event.preventDefault();
  event.stopPropagation();

  const { variantId } = event.target.dataset;

  await post('add', { id: parseInt(variantId), quantity: 1 });

  return null;
};


const init = () => {
  const triggers = document.querySelectorAll('.account.account-order .add-to-cart-trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', addProduct);
  });
};

init();
