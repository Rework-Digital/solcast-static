(function () {

  const RECAPTCHA_SELECTOR = '.g-recaptcha';
  const RESPONSE_SELECTOR  = 'textarea.g-recaptcha-response';
  const POLL_MS = 400;

const PUBLIC_EMAIL_PROVIDERS = [
  'gmail',
  'hotmail',
  'outlook',
  'live',
  'yahoo',
  'icloud',
  'aol',
  'gmx',
  'gg',
  'zoho'
];

function isPublicEmail(email) {

  if (!email || !email.includes('@')) return false;

  const domain = email.split('@')[1].toLowerCase();

  return PUBLIC_EMAIL_PROVIDERS.some(provider =>
    domain.startsWith(provider + '.')
  );

}

  const formState = new Map();

  const disableBtn = (btn) => {
    if (!btn) return;
    btn.classList.add('is-disabled');
    btn.setAttribute('disabled', 'disabled');
  };

  const enableBtn = (btn) => {
    if (!btn) return;
    btn.classList.remove('is-disabled');
    btn.removeAttribute('disabled');
  };

  function formCaptchaSolved(form) {

    const responses = form.querySelectorAll(RESPONSE_SELECTOR);

    for (const ta of responses) {

      const val = (ta && typeof ta.value === 'string')
        ? ta.value.trim()
        : '';

      if (val.length > 0) return true;

    }

    return false;
  }

  function validateCompanyEmail(form) {

    const validationDiv = form.querySelector('[data-company-email-validation="true"]');
    if (!validationDiv) return true;

    const emailInput = validationDiv.querySelector('input[type="email"]');
    const errorEl = form.querySelector('#company-email_error');
    const inputWrapper = validationDiv.querySelector('.form_input');

    if (!emailInput) return true;

    const emailValue = emailInput.value.trim();
    const invalid = isPublicEmail(emailValue);

    if (invalid) {

      // show error
      if (errorEl) errorEl.style.display = 'block';

      // add combo class
      if (inputWrapper) {
        inputWrapper.classList.add('is-wrong-email');
      }

      return false;

    } else {

      // hide error
      if (errorEl) errorEl.style.display = 'none';

      // remove combo class
      if (inputWrapper) {
        inputWrapper.classList.remove('is-wrong-email');
      }

      return true;

    }

  }
  
  function updateSubmitState(form) {

    const state = formState.get(form);
    if (!state) return;

    const captchaSolved = formCaptchaSolved(form);
    const emailValid = validateCompanyEmail(form);

    if (captchaSolved && emailValid) {
      enableBtn(state.button);
    } else {
      disableBtn(state.button);
    }

  }

  function wireEmailValidation(form) {

    const validationDiv = form.querySelector('[data-company-email-validation="true"]');
    if (!validationDiv) return;

    const emailInput = validationDiv.querySelector('input[type="email"]');
    if (!emailInput) return;

    if (emailInput.dataset._company_validation === '1') return;
    emailInput.dataset._company_validation = '1';

    emailInput.addEventListener('blur', () => {
      updateSubmitState(form);
    });

  }

  function wireSubmitGuard(form) {

    if (form.dataset._rc_guard === '1') return;
    form.dataset._rc_guard = '1';

    form.addEventListener('submit', (e) => {

      if (!validateCompanyEmail(form)) {
        e.preventDefault();
        return;
      }

      if (!formCaptchaSolved(form)) {
        e.preventDefault();
        const state = formState.get(form);
        disableBtn(state?.button);
      }

    });

  }

  function startPoll(form) {

    const state = formState.get(form);
    if (!state) return;

    if (state.pollId) clearInterval(state.pollId);

    const evaluate = () => {

      const solved = formCaptchaSolved(form);

      if (solved !== state.lastSolved) {

        state.lastSolved = solved;
        updateSubmitState(form);

      }

    };

    state.lastSolved = formCaptchaSolved(form);
    updateSubmitState(form);

    state.pollId = setInterval(evaluate, POLL_MS);

  }

  function wireFormForRecaptchaContainer(container) {

    const form = container.closest('form');
    if (!form || formState.has(form)) return;

    const button = form.querySelector('button[type="submit"], input[type="submit"]');

    formState.set(form, {
      button,
      lastSolved: false,
      pollId: null
    });

    wireSubmitGuard(form);
    wireEmailValidation(form);
    startPoll(form);

  }

  function scanRecaptchaContainers() {

    document
      .querySelectorAll(RECAPTCHA_SELECTOR)
      .forEach(wireFormForRecaptchaContainer);

  }

  function init() {

    scanRecaptchaContainers();

    const mo = new MutationObserver((muts) => {

      for (const m of muts) {

        if (m.type === 'childList' && m.addedNodes?.length) {

          m.addedNodes.forEach((n) => {

            if (n.nodeType !== 1) return;

            if (n.matches?.(RECAPTCHA_SELECTOR)) {

              wireFormForRecaptchaContainer(n);

            } else {

              const found = n.querySelector?.(RECAPTCHA_SELECTOR);
              if (found) wireFormForRecaptchaContainer(found);

            }

          });

        }

      }

    });

    mo.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

  }

  window.onCaptchaSuccess = function () {

    formState.forEach((state, form) => {
      updateSubmitState(form);
    });

  };

  window.onCaptchaExpired = function () {

    formState.forEach((state) => {
      disableBtn(state.button);
    });

  };

  window.refreshRecaptchaPerFormStrict = function () {
    scanRecaptchaContainers();
  };

  if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', init);

  } else {

    init();

  }

})();
