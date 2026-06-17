const GA4_MEASUREMENT_ID = 'G-4D17CZC526';
const COOKIECONSENT_VERSION = '3.1.0';
const CDN = `https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@${COOKIECONSENT_VERSION}/dist`;

window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}

gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500,
});

loadStylesheet(`${CDN}/cookieconsent.css`);
loadScript(`${CDN}/cookieconsent.umd.js`, initConsentBanner);

// GA4 is only fetched after the visitor accepts analytics, so rejecting it
// sends nothing to Google. enableAnalytics() loads gtag.js exactly once.
let analyticsLoaded = false;
function enableAnalytics() {
  if (analyticsLoaded) return;
  analyticsLoaded = true;
  gtag('js', new Date());
  gtag('config', GA4_MEASUREMENT_ID);
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`);
}

function loadScript(src, onload) {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  if (onload) script.onload = onload;
  document.head.appendChild(script);
}

function loadStylesheet(href) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function syncConsentMode() {
  const accepted = CookieConsent.acceptedCategory('analytics');
  const state = accepted ? 'granted' : 'denied';
  gtag('consent', 'update', {
    analytics_storage: state,
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });
  if (accepted) enableAnalytics();
}

function initConsentBanner() {
  CookieConsent.run({
    categories: {
      necessary: { enabled: true, readOnly: true },
      analytics: {},
    },
    language: {
      default: 'en',
      translations: {
        en: {
          consentModal: {
            title: 'We use cookies',
            description:
              'We use analytics cookies to understand how you use the Velora docs. They stay off until you accept.',
            acceptAllBtn: 'Accept',
            acceptNecessaryBtn: 'Reject',
            showPreferencesBtn: 'Manage preferences',
          },
          preferencesModal: {
            title: 'Cookie preferences',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Reject all',
            savePreferencesBtn: 'Save preferences',
            closeIconLabel: 'Close',
            sections: [
              {
                title: 'Strictly necessary',
                description: 'Required for the docs to work. Always on.',
                linkedCategory: 'necessary',
              },
              {
                title: 'Analytics',
                description: 'Google Analytics, to measure how the docs are used.',
                linkedCategory: 'analytics',
              },
            ],
          },
        },
      },
    },
    onConsent: syncConsentMode,
    onChange: syncConsentMode,
  });
}
