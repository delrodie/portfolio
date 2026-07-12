(function () {
  'use strict';

  const GTM_ID = 'GTM-K2R6GX37';
  // GA4 est chargé explicitement dans le <head> pour rester détectable par les outils Google.
  const CONSENT_KEY = 'portfolio_analytics_consent';

  const readConsent = () => {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (_error) {
      return null;
    }
  };

  const saveConsent = (value) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (_error) {
      // Le consentement reste valable pour la page courante si le stockage est bloqué.
    }
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  const storedConsent = readConsent();
  const analyticsGranted = storedConsent === 'granted';

  // Consent Mode v2 : aucune mesure Analytics avant le choix du visiteur.
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    wait_for_update: storedConsent ? 0 : 500
  });

  window.dataLayer.push({
    'gtm.start': Date.now(),
    event: 'gtm.js'
  });

  const firstScript = document.getElementsByTagName('script')[0];
  const gtmScript = document.createElement('script');
  gtmScript.async = true;
  gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  firstScript.parentNode.insertBefore(gtmScript, firstScript);

  const pushEvent = (event, parameters = {}) => {
    window.gtag('event', event, parameters);
  };

  window.portfolioAnalytics = Object.freeze({
    track: pushEvent,
    projectView(project) {
      pushEvent('project_view', {
        project_slug: project.slug,
        project_name: project.title,
        project_status: project.status || '',
        project_role: project.role || ''
      });
    }
  });

  const setConsent = (granted) => {
    const value = granted ? 'granted' : 'denied';
    saveConsent(value);
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: value
    });
    pushEvent('analytics_consent_update', { analytics_consent: value });
  };

  const addPrivacyControls = () => {
    const style = document.createElement('style');
    style.textContent = `
      .privacy-banner{position:fixed;z-index:10000;right:1rem;bottom:1rem;left:1rem;max-width:42rem;margin:auto;padding:1rem 1.1rem;border:1px solid #374151;border-radius:.75rem;background:#111827;color:#e5e7eb;box-shadow:0 20px 45px rgba(0,0,0,.45);font:14px/1.5 system-ui,sans-serif}
      .privacy-banner[hidden],.privacy-settings[hidden]{display:none}
      .privacy-banner__actions{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:.85rem}
      .privacy-button{border:1px solid #4b5563;border-radius:.4rem;padding:.55rem .9rem;background:#1f2937;color:#fff;cursor:pointer}
      .privacy-button--accept{border-color:#15803d;background:#15803d}
      .privacy-settings{position:fixed;z-index:9999;left:.75rem;bottom:.75rem;border:1px solid #374151;border-radius:999px;padding:.45rem .7rem;background:#111827;color:#d1d5db;font:12px system-ui,sans-serif;cursor:pointer}
    `;
    document.head.appendChild(style);

    const banner = document.createElement('section');
    banner.className = 'privacy-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Préférences de confidentialité');
    banner.hidden = storedConsent !== null;
    banner.innerHTML = `
      <strong>Mesure d’audience</strong>
      <p>Ce portfolio utilise Google Analytics via Google Tag Manager pour mesurer son audience et améliorer son contenu. Vous pouvez accepter ou refuser cette mesure.</p>
      <div class="privacy-banner__actions">
        <button class="privacy-button privacy-button--accept" type="button" data-consent="granted">Accepter</button>
        <button class="privacy-button" type="button" data-consent="denied">Refuser</button>
      </div>
    `;

    const settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'privacy-settings';
    settings.textContent = 'Confidentialité';
    settings.hidden = storedConsent === null;
    settings.setAttribute('aria-label', 'Modifier les préférences de confidentialité');

    banner.addEventListener('click', (event) => {
      const button = event.target.closest('[data-consent]');
      if (!button) return;
      setConsent(button.dataset.consent === 'granted');
      banner.hidden = true;
      settings.hidden = false;
    });
    settings.addEventListener('click', () => {
      banner.hidden = false;
      settings.hidden = true;
    });

    document.body.append(banner, settings);
  };

  document.addEventListener('DOMContentLoaded', () => {
    addPrivacyControls();

    const contactForm = document.querySelector('form[action*="formsubmit.co"]');
    if (contactForm) {
      contactForm.addEventListener('submit', () => {
        pushEvent('contact_form_submit', {
          form_name: 'portfolio_contact',
          requested_service: contactForm.elements.besoin?.value || ''
        });
      });
    }

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="http"]');
      if (!link || link.hostname === window.location.hostname) return;
      pushEvent('outbound_link_click', {
        link_url: link.href,
        link_text: link.textContent.trim().slice(0, 100)
      });
    });
  });
}());
