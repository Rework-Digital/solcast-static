/*----------------------------------------------*/
/*              UTM Capture & Populate          */
/*  Captures utm_* params from the URL on every */
/*  page, persists them for the session, and    */
/*  fills the hidden form inputs by id.         */
/*----------------------------------------------*/
(function () {
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_form', 'utm_content', 'utm_matchtype', 'utm_keyword'];
  // Field id -> alternate URL param name (Google Ads sends utm_term)
  var ALIAS = { utm_keyword: 'utm_term' };
  var STORE_KEY = 'solcast_utm';

  function readStore() {
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function writeStore(obj) {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) { /* storage unavailable */ }
  }

  // 1) Capture from URL (runs on every page so landing page -> form page works)
  var params = new URLSearchParams(window.location.search);
  var stored = readStore();
  var changed = false;
  KEYS.forEach(function (key) {
    var value = params.get(key) || (ALIAS[key] ? params.get(ALIAS[key]) : null);
    if (value) { stored[key] = value; changed = true; }
  });
  if (changed) writeStore(stored);

  // 2) Populate hidden inputs
  function populate() {
    KEYS.forEach(function (key) {
      var input = document.getElementById(key);
      if (input && stored[key]) input.value = stored[key];
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
    
