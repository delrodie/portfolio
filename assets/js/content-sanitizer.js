(function () {
  'use strict';

  const allowedTags = new Set(['A', 'STRONG', 'B', 'EM', 'I', 'U', 'BR', 'CODE']);
  const blockedTags = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON']);

  const sanitize = (value) => {
    const template = document.createElement('template');
    template.innerHTML = String(value || '');

    const cleanChildren = (parent) => {
      Array.from(parent.childNodes).forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }

        if (blockedTags.has(node.tagName)) {
          node.remove();
          return;
        }

        if (!allowedTags.has(node.tagName)) {
          cleanChildren(node);
          node.replaceWith(...node.childNodes);
          return;
        }

        const href = node.tagName === 'A' ? node.getAttribute('href') : null;
        Array.from(node.attributes).forEach((attribute) => node.removeAttribute(attribute.name));

        if (node.tagName === 'A') {
          try {
            const url = new URL(href || '', window.location.href);
            if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) {
              throw new Error('Protocole non autorisé');
            }

            node.setAttribute('href', url.href);
            node.className = 'content-link';

            if (url.origin !== window.location.origin && url.protocol !== 'mailto:') {
              node.setAttribute('target', '_blank');
              node.setAttribute('rel', 'noopener noreferrer');
            }
          } catch (_error) {
            node.replaceWith(...node.childNodes);
            return;
          }
        }

        cleanChildren(node);
      });
    };

    cleanChildren(template.content);
    return template.innerHTML;
  };

  const toText = (value) => {
    const template = document.createElement('template');
    template.innerHTML = sanitize(value);
    return template.content.textContent.trim();
  };

  window.portfolioContent = Object.freeze({ sanitize, toText });
}());
