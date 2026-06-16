const options = {
  method: 'GET',
  headers: { accept: 'application/json', Authorization: 'Bearer sk_56a09935e252179d21d78ba26409cd8d' },
};

export const checkSubscriptionByPhone = async (phone) => {
  // postscript consume it without the + symbol
  const formattedPhone = phone.replaceAll('+', '');
  const url = `https://api.postscript.io/api/v2/subscribers?phone_number__contains=${formattedPhone}`;

  try {
    const res = await fetch(url, options);
    const data = await res.json();

    return Boolean(data.subscribers.find(subscriber => String(subscriber.phone_number) === String(formattedPhone) && subscriber.subscriptions.promotional.can_send === true));
  } catch (e) {
    return false;
  }
};
