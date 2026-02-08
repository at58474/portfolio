(async () => {
  const mount = document.getElementById("svgMount");

  // Force-load the Adobe Fonts family before inserting the SVG
  try {
    await document.fonts.load('300 16px "degular-display"');
    await document.fonts.load('500 16px "degular-display"');
    await document.fonts.load('700 16px "degular-display"');
    await document.fonts.ready;
  } catch (e) {
    // Still proceed if Fonts API isn't available
  }

  // Fetch + inline SVG
  const resp = await fetch("assets/aot-portfolio2.svg");
  const svgText = await resp.text();
  mount.innerHTML = svgText;

  const svg = mount.querySelector("svg");
  if (!svg) return;
  svg.setAttribute("preserveAspectRatio", "xMidYMin meet");

  // Map "page anchors" -> SVG element IDs (your titles)
  const anchorToSvgId = {
  landing: "name",
  django: "_01-title",
  flask: "_02-title",
  arima: "_03-title",
  pdb: "_04-title",
  fba: "_05-title",
  top: null,
};

  function scrollToSvgId(id) {
    const el = svg.querySelector(`#${CSS.escape(id)}`);
    if (!el) return;

    const svgRect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    const bbox = el.getBBox();

    const yRatio = bbox.y / viewBox.height;
    const yOnPage = window.scrollY + svgRect.top + (yRatio * svgRect.height);

    window.scrollTo({ top: yOnPage - 12, behavior: "smooth" });
  }

  function scrollToAnchor(anchorName) {
    if (anchorName === "top" || anchorName === "landing") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const svgId = anchorToSvgId[anchorName];
    if (!svgId) return;
    scrollToSvgId(svgId);
  }

  // 1) Make SVG TOC items clickable (django-link -> #django, etc.)
  const svgNavMap = {
    "django-link": "django",
    "flask-link": "flask",
    "arima-link": "arima",
    "pdb-link": "pdb",
    "fba-link": "fba",
  };

  for (const [fromId, anchorName] of Object.entries(svgNavMap)) {
    const fromEl = svg.querySelector(`g#${CSS.escape(fromId)}`);
    if (!fromEl) continue;
    fromEl.style.cursor = "pointer";
    fromEl.addEventListener("click", (e) => {
      e.preventDefault?.();
      history.replaceState(null, "", `#${anchorName}`);
      scrollToAnchor(anchorName);
    });
  }

  // 2) Intercept clicks on ANY HTML anchor links like href="#django"
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const anchorName = a.getAttribute("href").slice(1);
    if (!(anchorName in anchorToSvgId)) return;

    e.preventDefault();
    history.replaceState(null, "", `#${anchorName}`);
    scrollToAnchor(anchorName);
  });

  // 3) If the page loads with a hash (/index.html#pdb), scroll after SVG loads
  const initial = (location.hash || "").slice(1);
  if (initial && initial in anchorToSvgId) {
    // wait 1 frame so layout is stable
    requestAnimationFrame(() => scrollToAnchor(initial));
  }

  // Back-to-top show/hide
  const btn = document.getElementById("backToTop");
  const toggleBtn = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y > 600) btn.classList.add("show");
    else btn.classList.remove("show");
  };
  window.addEventListener("scroll", toggleBtn, { passive: true });
  toggleBtn();
})();