// ── HAMBURGER MENU ──
function toggleMenu() {
  var m = document.getElementById('mobileMenu');
  m.classList.toggle('open');
}

// DISCLAIMER LOGIC
document.addEventListener("DOMContentLoaded", function () {
  var t = null;
  try {
    // Check for reset parameter in URL
    var params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true') {
      localStorage.removeItem('akblex_disc');
    }
    t = localStorage.getItem('akblex_disc');
  } catch (e) {
    console.warn("Storage access not available:", e);
  }

  var overlay = document.getElementById('disclaimer-overlay');
  var discBtn = document.querySelector('.disc-btn');

  function closeDisclaimer() {
    try {
      localStorage.setItem('akblex_disc', Date.now());
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
    if (overlay) {
      overlay.style.setProperty('display', 'none', 'important');
    }
    document.documentElement.classList.add('disclaimer-accepted');
    document.body.classList.remove('no-scroll');
  }

  if (t && Date.now() - Number(t) < 86400000) {
    if (overlay) overlay.style.setProperty('display', 'none', 'important');
    document.documentElement.classList.add('disclaimer-accepted');
    document.body.classList.remove('no-scroll');
  } else {
    document.body.classList.add('no-scroll');
    setTimeout(function() {
      window.scrollTo(0, 0);
    }, 10);
  }

  if (discBtn) {
    discBtn.addEventListener('click', closeDisclaimer);
  }
});

// ── TEXT REVEAL ANIMATION ──
(function () {
  function revealWords() {
    var reveals = document.querySelectorAll('.word-reveal');
    reveals.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        el.classList.add('visible');
      }
    });
  }
  window.addEventListener('scroll', revealWords);
  window.addEventListener('load', revealWords);
  setTimeout(function () {
    var heroTitle = document.getElementById('heroTitle');
    if (heroTitle) heroTitle.classList.add('visible');
  }, 300);
})();

// ── SCROLL ANIMATIONS ──
var obs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) { e.target.classList.add('visible') }
  });
}, { threshold: 0.02 });

document.querySelectorAll('.fade-up, .fade-left, .fade-right, .slide-left-to-right, .slide-right-to-left').forEach(function (el) {
  obs.observe(el)
});

// ── SMOOTH THEME SWITCHER (DYNAMIC FOR MULTI-PAGE) ──
window.addEventListener('scroll', function () {
  var scrollPos = window.scrollY + (window.innerHeight / 2);
  var darkTriggers = document.querySelectorAll('.dark-bg-trigger');
  var inDarkSection = false;

  darkTriggers.forEach(function (section) {
    var top = section.offsetTop;
    var bottom = top + section.offsetHeight;
    if (scrollPos >= top && scrollPos <= bottom) {
      inDarkSection = true;
    }
  });

  if (inDarkSection) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
});

// ── STICKY NAV SHADOW ──
window.addEventListener('scroll', function () {
  var nav = document.querySelector('nav');
  if (nav) {
    nav.style.boxShadow = window.scrollY > 20 ? '0 4px 24px rgba(0,0,0,.06)' : 'none';
  }
});

// ── FORM SUBMIT ──
function handleFormSubmit(event) {
  event.preventDefault(); // Prevent default redirection
  var form = event.target;
  var btn = form.querySelector('.form-submit');
  if (!btn) return;
  
  btn.textContent = 'Sending...';
  btn.style.background = '#888';
  btn.disabled = true;

  // We attempt AJAX submission. If it fails for any reason (CORS on local file://, network, or pending activation),
  // we gracefully fall back immediately to standard form submission so it is 100% reliable.
  fetch(form.action.replace("formsubmit.co", "formsubmit.co/ajax"), {
    method: "POST",
    headers: {
      'Accept': 'application/json'
    },
    body: new FormData(form)
  })
  .then(function(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('AJAX failed, status: ' + response.status);
    }
  })
  .then(function(data) {
    if (data && (data.success === 'true' || data.success === true)) {
      btn.textContent = '✓ Message Sent';
      btn.style.background = '#2e7d32';
      form.reset();
    } else {
      // Fallback to standard submission if response contains success: false
      form.submit();
    }
  })
  .catch(function(error) {
    console.warn("AJAX submit failed, falling back to standard submit:", error);
    // Fallback immediately to standard HTML submit
    form.submit();
  });
}

// ── EMAIL REDIRECTION FOR MOBILE & PC ──
function handleCareerEmail(event, type) {
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  var email = "akblex@gmail.com";
  var subject = "";
  var body = "";
  
  if (type === 'training') {
    subject = "Application for Advocate Training - AKB LEX";
    body = "Dear AKB LEX Team,\n\nI would like to submit my CV for the Advocate Training position.\n\nRegards,";
  } else if (type === 'internship') {
    subject = "Application for Internship - AKB LEX";
    body = "Dear AKB LEX Team,\n\nI would like to apply for the Internship position.\n\nRegards,";
  } else {
    subject = "Career Application - AKB LEX";
  }
  
  if (isMobile) {
    // Mobile: Mailto link triggers native app beautifully
    var mailtoUrl = "mailto:" + email + "?subject=" + encodeURIComponent(subject);
    if (body) {
      mailtoUrl += "&body=" + encodeURIComponent(body);
    }
    window.location.href = mailtoUrl;
  } else {
    // PC/Desktop: Redirect to web Gmail compose to guarantee it opens even if no default mail client is set
    var gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(email) + "&su=" + encodeURIComponent(subject);
    if (body) {
      gmailUrl += "&body=" + encodeURIComponent(body);
    }
    window.open(gmailUrl, "_blank");
  }
  
  if (event) {
    event.preventDefault();
  }
}