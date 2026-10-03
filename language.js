(() => {
  'use strict';
  const translations = window.showcaseTranslations;
  const selector = document.querySelector('#language-select');
  if (!translations || !selector) return;
  const storageKey = 'speakup-showcase-language';
  const supports = locale => Object.hasOwn(translations, locale);

  function applyLanguage(locale) {
    const language = supports(locale) ? locale : 'en';
    const copy = translations[language];
    document.querySelectorAll('[data-i18n]').forEach(element => {
      element.textContent = copy[element.dataset.i18n];
    });
    for (const attribute of ['aria-label', 'alt', 'content']) {
      document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
        element.setAttribute(attribute, copy[element.getAttribute(`data-i18n-${attribute}`)]);
      });
    }
    document.documentElement.lang = language;
    selector.value = language;
  }

  let initialLanguage = 'en';
  try {
    initialLanguage = localStorage.getItem(storageKey) || 'en';
  } catch {
    // Browser privacy settings may disable storage; switching still works.
  }
  applyLanguage(initialLanguage);
  selector.closest('.language-control').hidden = false;
  selector.addEventListener('change', () => {
    applyLanguage(selector.value);
    try {
      localStorage.setItem(storageKey, selector.value);
    } catch {
      // Persistence is optional when the browser denies storage.
    }
  });
})();
