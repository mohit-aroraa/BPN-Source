export function getCookie(name) {
  // Split cookie string and get all individual name=value pairs in an array
  var cookieArr = document.cookie.split(';');

  // Loop through the array elements
  for (var i = 0; i < cookieArr.length; i++) {
    var cookiePair = cookieArr[i].split('=');

    /* Removing whitespace at the beginning of the cookie name
      and compare it with the given string */
    if (name === cookiePair[0].trim()) {
      // Decode the cookie value and return
      return decodeURIComponent(cookiePair[1]);
    }
  }
  // Return null if not found
  return null;
}

export function setCookie(key, countryСode, days = 1) {
  var now = new Date();
  var time = now.getTime();
  time += 24 * 60 * 60 * 1000 * days;
  now.setTime(time);
  document.cookie =
    `${key}=` +
    JSON.stringify(countryСode) +
    '; expires=' +
    now.toUTCString() +
    '; path=/';
}
