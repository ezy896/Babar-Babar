// Babar Ali Law Associates — Main Website & Motion Graphics Script

document.addEventListener('DOMContentLoaded', function () {
  
  // 0. Motion Graphic Quote Intro Screen Controller (Scroll to Enter)
  var introOverlay = document.getElementById('intro-overlay');
  var introSkipBtn = document.getElementById('intro-skip');
  var introScrollHint = document.getElementById('intro-scroll-hint');

  if (introOverlay) {
    document.body.classList.add('intro-active');
    var isDismissed = false;

    function dismissIntro() {
      if (isDismissed) return;
      isDismissed = true;
      introOverlay.classList.add('is-dismissed');
      document.body.classList.remove('intro-active');

      // Clean up event listeners
      window.removeEventListener('wheel', onWheelScroll);
      window.removeEventListener('keydown', onKeyScroll);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);

      setTimeout(function () {
        if (introOverlay && introOverlay.parentNode) {
          introOverlay.style.display = 'none';
        }
      }, 900);
    }

    // Dismiss on mouse wheel / trackpad scroll
    function onWheelScroll(e) {
      if (Math.abs(e.deltaY) > 4 || Math.abs(e.deltaX) > 4) {
        dismissIntro();
      }
    }

    // Dismiss on keyboard navigation keys
    function onKeyScroll(e) {
      if (['ArrowDown', 'PageDown', ' ', 'Enter', 'ArrowRight'].indexOf(e.key) !== -1) {
        dismissIntro();
      }
    }

    // Dismiss on mobile touch swipe
    var touchStartY = 0;
    function onTouchStart(e) {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    }
    function onTouchMove(e) {
      if (e.touches && e.touches[0]) {
        var diff = touchStartY - e.touches[0].clientY;
        if (Math.abs(diff) > 15) {
          dismissIntro();
        }
      }
    }

    window.addEventListener('wheel', onWheelScroll, { passive: true });
    window.addEventListener('keydown', onKeyScroll);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    if (introSkipBtn) {
      introSkipBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dismissIntro();
      });
    }

    if (introScrollHint) {
      introScrollHint.addEventListener('click', function (e) {
        e.stopPropagation();
        dismissIntro();
      });
    }

    // Also allow clicking anywhere on intro screen
    introOverlay.addEventListener('click', function () {
      dismissIntro();
    });
  }

  // 1. Scroll Progress Bar
  var progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  document.body.prepend(progressBar);

  var siteHeader = document.querySelector('.site-header');

  window.addEventListener('scroll', function () {
    var winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    progressBar.style.width = scrolled + '%';

    if (siteHeader) {
      if (winScroll > 30) {
        siteHeader.classList.add('is-scrolled');
      } else {
        siteHeader.classList.remove('is-scrolled');
      }
    }
  }, { passive: true });

  // 2. High-Performance IntersectionObserver for Scroll Reveal
  var revealElements = document.querySelectorAll(
    '.reveal, .card, .profile, .values-list li, .info-block, .pull, .stat-card'
  );

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function (el, index) {
      el.classList.add('reveal');
      // Add subtle stagger delays for siblings in grids
      var parent = el.parentElement;
      if (parent && (parent.classList.contains('grid-3') || parent.classList.contains('values-list'))) {
        var childIndex = Array.prototype.indexOf.call(parent.children, el);
        el.style.transitionDelay = (childIndex * 0.12) + 's';
      }
      revealObserver.observe(el);
    });
  } else {
    // Fallback for older browsers
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // 3. Subtle 3D Card Tilt on Mouse Movement (Desktop only)
  if (window.matchMedia('(hover: hover) and (min-width: 992px)').matches) {
    var interactiveCards = document.querySelectorAll('.card, .profile, .pull');
    interactiveCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var deltaX = (x - centerX) / centerX;
        var deltaY = (y - centerY) / centerY;
        card.style.transform = 'perspective(1000px) rotateY(' + (deltaX * 3) + 'deg) rotateX(' + (-deltaY * 3) + 'deg) translateY(-6px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  // 4. Mobile Nav Toggle
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('is-open');
    });
  }

  // 5. Modal Handling
  var modal = document.querySelector('[data-modal="consult"]');
  var openBtns = document.querySelectorAll('[data-modal-open="consult"]');
  var closeBtns = document.querySelectorAll('[data-modal-close]');

  function openModal() {
    if (!modal) return;
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    var form = modal.querySelector('form');
    var success = modal.querySelector('.modal-success');
    if (form) form.style.display = 'block';
    if (success) success.classList.remove('is-shown');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });

  closeBtns.forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  // 6. Modal Form Submission
  if (modal) {
    var modalForm = modal.querySelector('form');
    var modalError = modal.querySelector('.modal-error');
    var modalSuccess = modal.querySelector('.modal-success');

    if (modalForm) {
      modalForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var nameInput = modal.querySelector('#m-name');
        var phoneInput = modal.querySelector('#m-phone');
        var detailsInput = modal.querySelector('#m-details');
        var submitBtn = modalForm.querySelector('button[type="submit"]');

        var name = nameInput ? nameInput.value.trim() : '';
        var phone = phoneInput ? phoneInput.value.trim() : '';
        var details = detailsInput ? detailsInput.value.trim() : '';

        if (!name || !phone) {
          if (modalError) {
            modalError.textContent = 'Please provide both your name and phone number.';
            modalError.classList.add('is-shown');
          }
          return;
        }

        if (modalError) modalError.classList.remove('is-shown');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';
        }

        if (window.BALA_DB && window.BALA_DB.submitAppointment) {
          window.BALA_DB.submitAppointment({
            name: name,
            phone: phone,
            details: details,
            area: details || 'Consultation Request',
            source: 'Schedule Modal'
          }).then(function () {
            modalForm.style.display = 'none';
            modalSuccess.classList.add('is-shown');
            modalForm.reset();
          }).catch(function () {
            if (modalError) {
              modalError.textContent = 'Could not submit request. Please try again or call directly.';
              modalError.classList.add('is-shown');
            }
          }).finally(function () {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Request Callback';
            }
          });
        }
      });
    }
  }

  // 7. Contact Page Form Submission
  var contactForm = document.getElementById('contact-form');
  var contactError = document.getElementById('contact-error');
  var contactSuccess = document.getElementById('contact-success');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('name') || {}).value || '';
      var phone = (document.getElementById('phone') || {}).value || '';
      var area = (document.getElementById('area') || {}).value || '';
      var details = (document.getElementById('details') || {}).value || '';
      var submitBtn = contactForm.querySelector('button[type="submit"]');

      if (!name.trim() || !phone.trim()) {
        if (contactError) {
          contactError.textContent = 'Please fill out your name and phone number.';
          contactError.classList.add('is-shown');
        }
        return;
      }

      if (contactError) contactError.classList.remove('is-shown');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }

      if (window.BALA_DB && window.BALA_DB.submitAppointment) {
        window.BALA_DB.submitAppointment({
          name: name.trim(),
          phone: phone.trim(),
          area: area,
          details: details.trim(),
          source: 'Contact Page'
        }).then(function () {
          contactForm.style.display = 'none';
          if (contactSuccess) contactSuccess.classList.add('is-shown');
          contactForm.reset();
        }).catch(function () {
          if (contactError) {
            contactError.textContent = 'Could not submit. Please check your connection or call us directly.';
            contactError.classList.add('is-shown');
          }
        }).finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Consultation Request';
          }
        });
      }
    });
  }

  // 8. Contact Page Feedback Form Submission
  var feedbackForm = document.getElementById('feedback-form');
  var feedbackError = document.getElementById('feedback-error');
  var feedbackSuccess = document.getElementById('feedback-success');

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var category = (document.getElementById('fb-category') || {}).value || 'General Suggestion';
      var message = (document.getElementById('fb-message') || {}).value || '';
      var contact = (document.getElementById('fb-contact') || {}).value || '';
      var submitBtn = feedbackForm.querySelector('button[type="submit"]');

      if (!message.trim()) {
        if (feedbackError) {
          feedbackError.textContent = 'Please enter your suggestion or feedback.';
          feedbackError.classList.add('is-shown');
        }
        return;
      }

      if (feedbackError) feedbackError.classList.remove('is-shown');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      if (window.BALA_DB && window.BALA_DB.submitFeedback) {
        window.BALA_DB.submitFeedback({
          category: category,
          message: message.trim(),
          contact: contact.trim(),
          source: 'Contact Page Feedback'
        }).then(function () {
          feedbackForm.style.display = 'none';
          if (feedbackSuccess) feedbackSuccess.classList.add('is-shown');
          feedbackForm.reset();
        }).catch(function () {
          if (feedbackError) {
            feedbackError.textContent = 'Could not send feedback. Please try again.';
            feedbackError.classList.add('is-shown');
          }
        }).finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Feedback';
          }
        });
      }
    });
  }
});
