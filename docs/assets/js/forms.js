(function () {
  'use strict';

  var forms = document.querySelectorAll('form[data-ajax-form]');

  function setStatus(status, state, message) {
    status.className = 'form-status is-' + state;
    status.setAttribute('role', state === 'error' ? 'alert' : 'status');
    status.textContent = message;
  }

  function getErrorMessage(response, data) {
    if (response.status === 429) {
      return 'Too many requests were sent. Please wait a moment and try again.';
    }

    if (data && Array.isArray(data.errors) && data.errors.length) {
      return data.errors.map(function (error) {
        return error.message;
      }).filter(Boolean).join(' ');
    }

    if (data && typeof data.error === 'string' && data.error) {
      return data.error;
    }

    return 'We could not send your message. Please try again or call Tune MTB at 585-434-4030.';
  }

  Array.prototype.forEach.call(forms, function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      var status = document.getElementById(form.getAttribute('aria-describedby'));
      var originalButtonText = button.textContent;

      button.disabled = true;
      button.textContent = 'Sending...';
      form.setAttribute('aria-busy', 'true');
      setStatus(status, 'pending', 'Sending your message...');

      fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: {
          'Accept': 'application/json'
        }
      }).then(function (response) {
        return response.json().catch(function () {
          return {};
        }).then(function (data) {
          if (!response.ok) {
            throw new Error(getErrorMessage(response, data));
          }

          form.reset();
          setStatus(status, 'success', form.getAttribute('data-success-message'));
        });
      }).catch(function (error) {
        setStatus(status, 'error', error.message || 'We could not send your message. Please try again.');
      }).then(function () {
        button.disabled = false;
        button.textContent = originalButtonText;
        form.removeAttribute('aria-busy');
      });
    });
  });
}());
