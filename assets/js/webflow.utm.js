/*----------------------------------------------*/
/*              UTM Capture & Populate          */
/*  Captures utm_* params from the URL, stores  */
/*  each as its own cookie, and fills the       */
/*  hidden form inputs by id from those cookies.*/
/*----------------------------------------------*/
(function () {
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_form', 'utm_content', 'utm_matchtype', 'utm_keyword'];
  // Field id -> alternate URL param name (Google Ads sends utm_term)
  var ALIAS = { utm_keyword: 'utm_term' };
  var COOKIE_DAYS = 30;

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  }
  function setCookie(name, value) {
    var d = new Date();
    d.setTime(d.getTime() + COOKIE_DAYS * 864e5);
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; expires=' + d.toUTCString() + '; path=/; domain=.solcast.com; SameSite=Lax; Secure';
  }

  // 1) Capture from URL -> cookies (runs on every page so landing page -> form page works)
  var params = new URLSearchParams(window.location.search);
  KEYS.forEach(function (key) {
    var value = params.get(key) || (ALIAS[key] ? params.get(ALIAS[key]) : null);
    if (value) setCookie(key, value);
  });

  // 2) Populate hidden inputs from cookies
  function populate() {
    KEYS.forEach(function (key) {
      var input = document.getElementById(key);
      var value = getCookie(key);
      if (input && value) input.value = value;
    });
    var utmUrlInput = document.getElementById('utm_url');
    if (utmUrlInput) {
      var relativeUrl = window.location.pathname + window.location.search + window.location.hash;
      utmUrlInput.value = relativeUrl.replace(/\?$/, '');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populate, { once: true });
  } else {
    populate();
  }
})();
