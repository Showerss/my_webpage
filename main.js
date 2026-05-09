/**
 * Section config — single source of truth for nav + dialogs.
 * To add a new section: append an entry here and add the
 * corresponding <dialog> shell in index.html. Nothing else changes.
 */
const SECTIONS = [
  { dialogId: 'user-manual-dialog', labelKey: 'nav.userManual', defaultLabel: 'User Manual' },
  { dialogId: 'projects-dialog',    labelKey: 'nav.projects',   defaultLabel: 'Projects & Skills' },
];

const GITHUB_USER = 'Showerss';
const GITHUB_API  = `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6&type=public`;

// ─── Nav ──────────────────────────────────────────────────────────────────────

function buildNav() {
  const list = document.getElementById('nav-list');
  if (!list) return;

  for (const { dialogId, defaultLabel } of SECTIONS) {
    const li  = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    btn.dataset.dialog = dialogId;
    btn.setAttribute('aria-controls', dialogId);
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = defaultLabel;
    li.append(btn);
    list.append(li);
  }

  list.addEventListener('click', e => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    const dialog = document.getElementById(btn.dataset.dialog);
    dialog?.open ? closeDialog(dialog) : openDialog(btn.dataset.dialog);
  });
}

// ─── Dialog management ────────────────────────────────────────────────────────

function openDialog(id) {
  document.querySelectorAll('dialog[open]').forEach(closeDialog);
  const dialog = document.getElementById(id);
  if (!dialog) return;
  dialog.showModal();
  syncNavBtn(id, true);
}

function closeDialog(dialog) {
  dialog.close();
  syncNavBtn(dialog.id, false);
}

function syncNavBtn(dialogId, expanded) {
  const btn = document.querySelector(`.nav-btn[data-dialog="${dialogId}"]`);
  btn?.setAttribute('aria-expanded', String(expanded));
}

function initDialogs() {
  // Close buttons
  document.querySelectorAll('[data-close-dialog]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog');
      if (dialog) closeDialog(dialog);
    });
  });

  // Backdrop click (native <dialog> fills the viewport, click outside = on <dialog> itself)
  document.querySelectorAll('dialog.mac-os-window').forEach(dialog => {
    dialog.addEventListener('click', e => {
      if (e.target === dialog) closeDialog(dialog);
    });

    // Sync aria-expanded when closed via Escape key
    dialog.addEventListener('close', () => syncNavBtn(dialog.id, false));
  });
}

// ─── GitHub repos ─────────────────────────────────────────────────────────────

function buildRepoCard(repo) {
  const article = document.createElement('article');
  article.className = 'repo-card';

  const h4   = document.createElement('h4');
  const link = document.createElement('a');
  link.href      = repo.html_url;
  link.target    = '_blank';
  link.rel       = 'noopener noreferrer';
  link.textContent = repo.name;
  h4.append(link);
  article.append(h4);

  if (repo.description) {
    const p = document.createElement('p');
    p.textContent = repo.description;
    article.append(p);
  }

  const meta = document.createElement('footer');
  meta.className = 'repo-meta';

  if (repo.language) {
    const lang = document.createElement('span');
    lang.className   = 'repo-lang';
    lang.textContent = repo.language;
    meta.append(lang);
  }

  const stars = document.createElement('span');
  stars.className   = 'repo-stars';
  stars.textContent = `★ ${repo.stargazers_count}`;
  meta.append(stars);

  const updated = document.createElement('time');
  updated.dateTime  = repo.updated_at;
  updated.textContent = new Date(repo.updated_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short',
  });
  meta.append(updated);

  article.append(meta);
  return article;
}

async function loadGitHubRepos() {
  const container = document.getElementById('github-repos');
  if (!container) return;

  const res = await fetch(GITHUB_API).catch(() => null);

  if (!res || !res.ok) {
    container.removeAttribute('aria-busy');
    container.innerHTML = '';

    const p = document.createElement('p');
    p.className   = 'error-state';
    p.textContent = 'Could not load repositories. ';

    const a = document.createElement('a');
    a.href        = `https://github.com/${GITHUB_USER}`;
    a.target      = '_blank';
    a.rel         = 'noopener noreferrer';
    a.textContent = 'View on GitHub →';
    p.append(a);

    container.append(p);
    return;
  }

  const repos = await res.json();
  container.removeAttribute('aria-busy');
  container.innerHTML = '';

  if (repos.length === 0) {
    const p = document.createElement('p');
    p.className   = 'loading-state';
    p.textContent = 'No public repositories found.';
    container.append(p);
    return;
  }

  repos.forEach(repo => container.append(buildRepoCard(repo)));
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

const localeCache = {};

async function loadLocale(locale) {
  if (localeCache[locale]) return localeCache[locale];
  const res = await fetch(`locales/${locale}.json`);
  if (!res.ok) throw new Error(`Locale not found: ${locale}`);
  localeCache[locale] = await res.json();
  return localeCache[locale];
}

function getVal(obj, dotKey) {
  return dotKey.split('.').reduce((acc, k) => acc?.[k], obj);
}

async function applyLocale(locale) {
  let strings;
  try {
    strings = await loadLocale(locale);
  } catch {
    return; // keep current locale on failure
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = getVal(strings, el.dataset.i18n);
    if (val != null) el.textContent = val;
  });

  // Update nav button labels (rendered by JS, not in DOM at parse time)
  for (const { dialogId, labelKey } of SECTIONS) {
    const btn = document.querySelector(`.nav-btn[data-dialog="${dialogId}"]`);
    const val = getVal(strings, labelKey);
    if (btn && val != null) btn.textContent = val;
  }

  document.documentElement.lang = locale;
}

function initLocale() {
  const select = document.getElementById('locale-select');
  select?.addEventListener('change', e => applyLocale(e.target.value));
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  initDialogs();
  initLocale();
  loadGitHubRepos();
});
