export function formatPhoneNumber(input) {
  const numbers = input.replace(/\D/g, '').substring(0, 10); // Extract only numerical values and limit input to 10 digits
  const firstPart = numbers.substring(0, 3);
  const secondPart = numbers.substring(3, 6);
  const thirdPart = numbers.substring(6, 10);

  if (numbers.length > 6) {
    return `${firstPart}-${secondPart}-${thirdPart}`;
  } else if (numbers.length > 3) {
    return `${firstPart}-${secondPart}`;
  } else {
    return numbers;
  }
}
