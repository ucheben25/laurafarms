/* ====================================================
   LAURA FARMS — Main JavaScript
   Navigation, scroll effects, animations, FAQ, modals
   ==================================================== */

// ========== NAVBAR ==========
(function () {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Determine if this is a hero/dark-bg page or an inner page
  const isInnerPage = document.body.classList.contains('inner-page');

  function updateNavbar() {
    if (!navbar) return;
    if (isInnerPage) {
      navbar.classList.add('light-bg');
    } else {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // Hamburger toggle
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();


// ========== SCROLL REVEAL ==========
(function () {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();


// ========== SCROLL TO TOP ==========
(function () {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


// ========== COUNTER ANIMATION ==========
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const isFloat = target % 1 !== 0;
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

(function () {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


// ========== FAQ ACCORDION ==========
(function () {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close all
      faqItems.forEach(f => f.classList.remove('open'));
      // toggle current
      if (!isOpen) item.classList.add('open');
    });
  });
})();


// ========== MODAL HELPERS ==========
function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Global modal triggers
document.addEventListener('DOMContentLoaded', () => {
  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
  // Close on X button
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.modal-overlay');
      if (overlay) closeModal(overlay.id);
    });
  });
  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(o => closeModal(o.id));
    }
  });
});


// ========== QUOTE REQUEST MODAL ==========
(function () {
  const quoteButtons = document.querySelectorAll('[data-quote]');
  const packageNameInput = document.getElementById('quotePackage');
  const quotePlanInput   = document.getElementById('quotePlan');
  const quoteForm        = document.getElementById('quoteForm');

  quoteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const packageName = btn.dataset.quote;
      const plan = btn.dataset.plan || '';
      if (packageNameInput) packageNameInput.value = packageName;
      if (quotePlanInput)   quotePlanInput.value   = plan;

      // Update modal header
      const modalTitle = document.getElementById('quoteModalTitle');
      if (modalTitle) modalTitle.textContent = `Request a Quote — ${packageName}`;

      openModal('quoteModal');
    });
  });

  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(quoteForm));
      const subject = encodeURIComponent(`Investment Quote Request — ${data.package}`);
      const body = encodeURIComponent(
        `Hello Laura Farms Team,\n\nI am interested in the ${data.package} investment package.\n\n` +
        `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\nInvestment Amount: $${data.amount || 'TBD'}\n\n` +
        `Message:\n${data.message || 'Please send me more details about this package.'}\n\nThank you.`
      );
      const mailtoLink = `mailto:invest@laurafarms.com?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;
      quoteForm.reset();
      closeModal('quoteModal');
    });
  }
})();


// ========== CONTACT FORM ==========
(function () {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(contactForm));
    const subject = encodeURIComponent(`Contact from ${data.name} — Laura Farms`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\nSubject: ${data.subject}\n\nMessage:\n${data.message}`
    );
    window.location.href = `mailto:info@laurafarms.com?subject=${subject}&body=${body}`;
    contactForm.reset();
    showFormSuccess(contactForm);
  });

  function showFormSuccess(form) {
    const existing = form.parentElement.querySelector('.alert');
    if (existing) existing.remove();
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.innerHTML = '✓ Your email client has opened. We\'ll be in touch within 24 hours!';
    form.parentElement.insertBefore(alert, form);
    setTimeout(() => alert.remove(), 6000);
  }
})();
