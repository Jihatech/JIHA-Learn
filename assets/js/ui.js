/* ============================================================
 * jiha.tech — UI enrichments
 * Bascule langue + thème (persistées en localStorage)
 * Copy-to-clipboard sur les blocs de code
 * Téléchargement PDF (impression de la langue active)
 * Tout est progressif : le contenu reste lisible sans JS.
 * ============================================================ */

(function () {
  'use strict';
  const html = document.documentElement;

  /* ---------- Langue ---------- */
  function getStored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function setStored(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* fail silent */ }
  }

  const savedLang = getStored('lang');
  if (savedLang === 'fr' || savedLang === 'en') html.setAttribute('lang', savedLang);

  function syncLangButtons() {
    const cur = html.getAttribute('lang');
    document.querySelectorAll('[data-set-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-set-lang') === cur);
      btn.setAttribute('aria-pressed', btn.getAttribute('data-set-lang') === cur);
    });
  }
  document.querySelectorAll('[data-set-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-set-lang');
      html.setAttribute('lang', lang);
      setStored('lang', lang);
      syncLangButtons();
    });
  });
  syncLangButtons();

  /* ---------- Thème ---------- */
  const savedTheme = getStored('theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    html.setAttribute('data-theme', savedTheme);
  } else {
    // défaut : sombre, sauf si le système préfère explicitement clair
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    html.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
  }

  function syncThemeButton() {
    const cur = html.getAttribute('data-theme');
    document.querySelectorAll('[data-toggle-theme]').forEach(btn => {
      btn.textContent = cur === 'dark' ? '☀ Light' : '☾ Dark';
      btn.setAttribute('aria-label', cur === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }
  document.querySelectorAll('[data-toggle-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cur = html.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      setStored('theme', next);
      syncThemeButton();
    });
  });
  syncThemeButton();

  /* ---------- Copy code blocks ---------- */
  document.querySelectorAll('pre.term').forEach(pre => {
    const btn = pre.querySelector('.copy-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      if (!code) return;
      const text = code.innerText;
      try {
        await navigator.clipboard.writeText(text);
        const orig = btn.textContent;
        btn.textContent = '✓ Copied';
        setTimeout(() => { btn.textContent = orig; }, 1400);
      } catch (e) {
        btn.textContent = '✗ Err';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1400);
      }
    });
  });

  /* ---------- PDF download (print active language) ---------- */
  document.querySelectorAll('[data-print-pdf]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = html.getAttribute('lang') || 'fr';
      const slug = document.body.getAttribute('data-guide-slug') || 'guide';
      // Annonce un titre adapté pour le PDF (le titre de la fenêtre devient le nom du fichier par défaut sur la plupart des navigateurs)
      const originalTitle = document.title;
      document.title = slug + '-' + lang;
      window.print();
      setTimeout(() => { document.title = originalTitle; }, 1000);
    });
  });

})();
