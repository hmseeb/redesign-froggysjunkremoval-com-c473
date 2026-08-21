/* Froggy's Junk Removal — interactions */
(function () {
  "use strict";

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");

  function closeNav() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeNav();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("open") &&
        !e.target.closest(".main-nav") &&
        !e.target.closest(".nav-toggle")) {
      closeNav();
    }
  });

  /* ---------- FAQ accordion (one open at a time) ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---------- Before / After sliders ---------- */
  document.querySelectorAll("[data-ba]").forEach(function (slider) {
    var range = slider.querySelector(".ba-range");
    var beforeWrap = slider.querySelector(".ba-before-wrap");
    var handle = slider.querySelector(".ba-handle");

    function setPos(pct) {
      pct = Math.max(0, Math.min(100, pct));
      beforeWrap.style.width = pct + "%";
      handle.style.left = pct + "%";
    }
    range.addEventListener("input", function () { setPos(range.value); });

    // Pointer support for touch/mouse drag anywhere on the image
    function pctFromEvent(e) {
      var rect = slider.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * 100;
    }
    var dragging = false;
    slider.addEventListener("pointerdown", function (e) {
      dragging = true;
      setPos(pctFromEvent(e));
      range.value = Math.round(pctFromEvent(e));
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var pct = pctFromEvent(e);
      setPos(pct);
      range.value = Math.round(pct);
    });
    window.addEventListener("pointerup", function () { dragging = false; });

    setPos(50);
  });

  /* ---------- File input label ---------- */
  var fileInput = document.getElementById("photos");
  var fileText = document.getElementById("fileDropText");
  fileInput.addEventListener("change", function () {
    if (fileInput.files.length === 0) {
      fileText.textContent = "Tap to add photos or a short video";
    } else if (fileInput.files.length === 1) {
      fileText.textContent = fileInput.files[0].name;
    } else {
      fileText.textContent = fileInput.files.length + " files selected — remember to attach them in your text message";
    }
  });

  /* ---------- Quote form → prefilled SMS to the business ---------- */
  var form = document.getElementById("quoteForm");
  var note = document.getElementById("formNote");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;
    form.querySelectorAll("[required]").forEach(function (el) {
      el.classList.toggle("invalid", !el.value.trim());
      if (!el.value.trim()) valid = false;
    });
    var email = document.getElementById("email");
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add("invalid");
      valid = false;
    }
    if (!valid) {
      note.textContent = "Please fill in the highlighted fields above.";
      note.classList.remove("sent");
      return;
    }

    var get = function (id) { return document.getElementById(id).value.trim(); };
    var lines = [
      "Hi Froggy's! I'd like a free quote.",
      "Name: " + get("firstName") + " " + get("lastName"),
      "Email: " + get("email"),
      "Phone: " + get("phone"),
      "Address: " + get("address"),
      "Pickup: " + get("details")
    ];
    if (fileInput.files.length > 0) {
      lines.push("(I have " + fileInput.files.length + " photo/video file(s) to attach.)");
    }
    var smsUrl = "sms:+14803311842?&body=" + encodeURIComponent(lines.join("\n"));

    note.innerHTML = "Opening your messaging app with the quote request addressed to <strong>(480) 331-1842</strong> — just press send! You can also email <a href='mailto:Froggysjunkremoval@gmail.com'>Froggysjunkremoval@gmail.com</a>.";
    note.classList.add("sent");
    window.location.href = smsUrl;
  });

  // Clear invalid state as the user types
  form.addEventListener("input", function (e) {
    if (e.target.classList) e.target.classList.remove("invalid");
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(
    ".why-card, .service-card, .ba-card, .faq-item, .about-photo, .about-copy, .quote-form, .quote-intro"
  );
  if ("IntersectionObserver" in window) {
    revealEls.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
