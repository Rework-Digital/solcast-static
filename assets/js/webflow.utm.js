window.addEventListener('load', function () {
  initUtmPopulation();
});

function initUtmPopulation() {
  var utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_form', 'utm_content', 'utm_matchtype', 'utm_keyword'];

  function getCookieValue(name) {
    var match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  // Populate UTM fields from cookies
  utmKeys.forEach(function (key) {
    var value = getCookieValue(key);
    if (!value) return;

    var input = document.getElementById(key);
    if (input) input.value = value;
  });

  var utmUrlInput = document.getElementById('utm_url');
  if (utmUrlInput) {
    var relativeUrl = window.location.pathname + window.location.search + window.location.hash;
    utmUrlInput.value = relativeUrl.replace(/\?$/, '');
  }
}
