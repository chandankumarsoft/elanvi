/**
 * elanvi-theme.js
 * Client-side interactivity for the Elanvi brand page.
 * Handles: bundle selection, platform redirect modal, hero CTAs,
 *          and newsletter validation.
 */
(function () {
  'use strict';

  /* ================================================================
     TOAST NOTIFICATION
     ================================================================ */
  var ElanviToast = {
    el: null,
    timer: null,

    _getEl: function () {
      if (!this.el) {
        this.el = document.createElement('div');
        this.el.className = 'elanvi-toast is-hidden';
        this.el.setAttribute('role', 'status');
        this.el.setAttribute('aria-live', 'polite');
        this.el.innerHTML = '<div class="elanvi-toast__inner"></div>';
        document.body.appendChild(this.el);
      }
      return this.el;
    },

    show: function (message, type) {
      var el = this._getEl();
      var inner = el.querySelector('.elanvi-toast__inner');
      inner.className = 'elanvi-toast__inner' + (type === 'success' ? ' elanvi-toast__inner--success' : '');
      inner.textContent = message;
      el.classList.remove('is-hidden');
      clearTimeout(this.timer);
      var self = this;
      this.timer = setTimeout(function () { el.classList.add('is-hidden'); }, 3000);
    }
  };

  /* ================================================================
     BUNDLE SELECTION
     ================================================================ */
  function initBundleSelection() {
    // Select button click
    document.querySelectorAll('.elanvi-bundle-item__select-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        handleBundleSelect(btn.closest('.elanvi-bundle-item'));
      });
    });

    // Clicking the entire row also triggers select
    document.querySelectorAll('.elanvi-bundle-item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        // Avoid double-firing when the button itself is clicked
        if (!e.target.classList.contains('elanvi-bundle-item__select-btn')) {
          handleBundleSelect(item);
        }
      });
    });
  }

  function handleBundleSelect(item) {
    if (!item) return;
    var name      = item.dataset.bundleName || 'Bundle';
    var variantId = item.dataset.variantId;
    var inputId   = item.dataset.buyInputId;

    // Wire selected variant into the buy form
    if (variantId && inputId) {
      var formInput = document.getElementById(inputId);
      if (formInput) formInput.value = variantId;
    }

    // Update aria + visual selection state across all sibling items
    var allItems = document.querySelectorAll('.elanvi-bundle-item');
    allItems.forEach(function (el) {
      el.classList.remove('is-selected');
      el.setAttribute('aria-checked', 'false');
    });
    item.classList.add('is-selected');
    item.setAttribute('aria-checked', 'true');

    ElanviToast.show('\u2728 ' + name + ' selected!', 'success');
  }

  /* ================================================================
     PLATFORM REDIRECT MODAL
     ================================================================ */
  function initPlatformRedirect() {
    var modal      = document.getElementById('elanvi-redirect-modal');
    var storeEl    = document.getElementById('elanvi-modal-store');
    var confirmBtn = document.getElementById('elanvi-modal-confirm');
    var cancelBtn  = document.getElementById('elanvi-modal-cancel');
    if (!modal) return;

    var pendingUrl = null;

    function openModal(storeName, url) {
      pendingUrl = url;
      if (storeEl) storeEl.textContent = storeName;
      modal.showModal();
    }

    function closeModal() {
      modal.close();
      pendingUrl = null;
    }

    document.querySelectorAll('[data-platform-url]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var url   = btn.dataset.platformUrl;
        var store = btn.dataset.platformStore || 'Partner Store';
        if (url) openModal(store, url);
      });
    });

    if (confirmBtn) {
      confirmBtn.addEventListener('click', function () {
        if (pendingUrl) {
          window.location.href = pendingUrl;
        }
        closeModal();
      });
    }

    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Close when clicking the native ::backdrop (click target is the <dialog> itself)
    modal.addEventListener('click', function (e) {
      var rect = modal.getBoundingClientRect();
      var clickedInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!clickedInDialog) closeModal();
    });
    // Native <dialog> handles Escape key automatically; no manual listener needed.
  }

  /* ================================================================
     HERO CTA ACTIONS
     - "buy"     → navigate to product_url OR scroll to bundle block
     - "explore" → scroll to ingredients section
     ================================================================ */
  function initHeroCTAs() {
    document.querySelectorAll('[data-elanvi-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.dataset.elanviAction;

        if (action === 'buy') {
          var buyTarget = document.querySelector('.elanvi-bundle');
          if (buyTarget) {
            buyTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }

        if (action === 'explore') {
          var exploreTarget =
            document.getElementById('elanvi-ingredients') ||
            document.getElementById('ingredients');
          if (exploreTarget) {
            exploreTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  /* ================================================================
     NEWSLETTER CLIENT-SIDE VALIDATION
     (Shopify handles the actual submission via {% form 'customer' %})
     ================================================================ */
  function initNewsletter() {
    var form     = document.getElementById('elanvi-newsletter-form');
    var input    = document.getElementById('elanvi-newsletter-email');
    var feedback = document.getElementById('elanvi-newsletter-feedback');
    if (!form || !input) return;

    form.addEventListener('submit', function (e) {
      var email = input.value.trim();
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        e.preventDefault();
        if (feedback) {
          feedback.textContent = 'Please enter a valid email address.';
          feedback.classList.remove('is-hidden');
          feedback.style.color = '#c0392b';
        }
      }
    });
  }

  /* ================================================================
     INIT
     ================================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    initBundleSelection();
    initPlatformRedirect();
    initHeroCTAs();
    initNewsletter();
  });

})();
