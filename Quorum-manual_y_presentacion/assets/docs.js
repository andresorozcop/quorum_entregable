(function () {
  "use strict";

  var nav = document.querySelector(".doc-nav");
  var toggle = document.querySelector(".doc-nav-toggle");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      var open = nav.classList.contains("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href").slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  var themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    var stored = null;
    try {
      stored = localStorage.getItem("quorum-docs-theme");
    } catch (err) {}
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    }
    themeBtn.addEventListener("click", function () {
      document.documentElement.classList.toggle("dark");
      try {
        localStorage.setItem(
          "quorum-docs-theme",
          document.documentElement.classList.contains("dark") ? "dark" : "light"
        );
      } catch (err) {}
    });
  }

  var path = (window.location.pathname.split("/").pop() || "").toLowerCase();
  document.querySelectorAll(".doc-nav a[data-doc]").forEach(function (a) {
    var doc = (a.getAttribute("data-doc") || "").toLowerCase();
    if (doc && path === doc) {
      a.classList.add("is-active");
    }
  });

  var tocLinks = document.querySelectorAll(".manual-toc a[href^='#']");
  var sections = [];
  tocLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var sec = document.getElementById(id);
    if (sec) sections.push({ id: id, el: sec, link: link });
  });

  if (sections.length && "IntersectionObserver" in window) {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          tocLinks.forEach(function (l) {
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + id);
          });
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      obs.observe(s.el);
    });
  }
})();
