export const getTagDiscount = (tags = []) => {
  const discountCode = tags.find((tag) => tag.includes('ssale'));

  if (discountCode) {
    const discountNumber = discountCode.match(/\d+/)[0];

    return parseInt(discountNumber, 10);
  }

  return undefined;
};

export const isOtpOnlySale = (tags = []) => {
  return tags.some(tag => (tag || '').toLowerCase().trim() === 'otp-only-sale');
};
