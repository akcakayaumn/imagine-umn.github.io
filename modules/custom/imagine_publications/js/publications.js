((Drupal, once) => {
  'use strict';

  Drupal.behaviors.imaginePublications = {
    attach(context) {
      once('pub-bibtex', '[data-pub-bibtex]', context).forEach((wrapper) => {
        const toggle = wrapper.querySelector('[data-pub-bibtex-toggle]');
        const panel = wrapper.querySelector('[data-pub-bibtex-panel]');
        const copy = wrapper.querySelector('[data-pub-bibtex-copy]');
        const code = wrapper.querySelector('[data-pub-bibtex-code]');
        const status = wrapper.querySelector('[data-pub-bibtex-status]');

        if (!toggle || !panel) {
          return;
        }

        // Collapse only now that JS is confirmed running. Without JS the
        // citation stays visible and selectable.
        panel.hidden = true;

        toggle.addEventListener('click', () => {
          const isOpen = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', String(!isOpen));
          panel.hidden = isOpen;
        });

        // role="status" only announces on *change*, so clear before setting
        // or a second identical message is silent.
        const announce = (message) => {
          if (!status) {
            return;
          }
          status.textContent = '';
          window.setTimeout(() => {
            status.textContent = message;
          }, 100);
        };

        if (copy && code) {
          copy.hidden = false;

          copy.addEventListener('click', async () => {
            const text = code.textContent;
            let ok = false;

            // Requires a secure context; undefined on plain HTTP.
            if (navigator.clipboard && window.isSecureContext) {
              try {
                await navigator.clipboard.writeText(text);
                ok = true;
              } catch (e) {
                ok = false;
              }
            }

            if (!ok) {
              // Fallback: select the text so the user can copy manually.
              const range = document.createRange();
              range.selectNodeContents(code);
              const selection = window.getSelection();
              selection.removeAllRanges();
              selection.addRange(range);
              try {
                ok = document.execCommand('copy');
              } catch (e) {
                ok = false;
              }
            }

            if (ok) {
              announce(Drupal.t('BibTeX citation copied to clipboard.'));
              copy.classList.add('is-copied');
              window.setTimeout(() => copy.classList.remove('is-copied'), 2000);
            } else {
              announce(Drupal.t('Copy failed. The citation is selected — press Ctrl+C or Command+C.'));
            }
          });
        }
      });
    },
  };
})(Drupal, once);