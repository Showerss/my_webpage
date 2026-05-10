/**
 * Section config — single source of truth for nav + dialogs.
 * To add a new section: append an entry here and add the
 * corresponding <dialog> shell in index.html. Nothing else changes.
 */
const SECTIONS = [
  { dialogId: 'user-manual-dialog', labelKey: 'nav.userManual', defaultLabel: 'User Manual' },
  { dialogId: 'timeline-dialog',    labelKey: 'nav.timeline',   defaultLabel: 'Work History' },
  { dialogId: 'projects-dialog',    labelKey: 'nav.projects',   defaultLabel: 'Projects & Skills' },
  { dialogId: 'contact-dialog',     labelKey: 'nav.contact',    defaultLabel: 'Contact' },
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

  // One listener on the list handles all button clicks (event delegation).
  // closest() walks up the DOM so clicks on child nodes still match .nav-btn.
  list.addEventListener('click', e => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    const dialog = document.getElementById(btn.dataset.dialog);
    // Toggle: clicking an open dialog's button closes it instead of re-opening.
    dialog?.open ? closeDialog(dialog) : openDialog(btn.dataset.dialog);
  });
}

// ─── Dialog management ────────────────────────────────────────────────────────

function openDialog(id) {
  // Enforce single-dialog-at-a-time: close any currently open dialog first.
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

  // .catch(() => null) turns network errors into a null value so the
  // null-check below handles both fetch failure and non-2xx HTTP uniformly.
  const res = await fetch(GITHUB_API).catch(() => null);

  if (!res || !res.ok) {
    // aria-busy signals to screen readers that a region is loading. Remove it once settled.
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
  container.removeAttribute('aria-busy'); // content is ready; unblock screen reader announcements
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

// Resolves a dot-separated key ("userManual.title") into a nested object.
// e.g. getVal({userManual:{title:"X"}}, "userManual.title") → "X"
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

// ─── Theme ────────────────────────────────────────────────────────────────────

function initTheme() {
  const saved = localStorage.getItem('theme') ?? 'crt';
  document.documentElement.dataset.theme = saved;

  const select = document.getElementById('theme-select');
  if (select) select.value = saved;

  select?.addEventListener('change', e => {
    const theme = e.target.value;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  });
}

// ─── Contact form ─────────────────────────────────────────────────────────────

// Sign up at formspree.io, create a form, then replace YOUR_FORM_ID.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

const RITUAL_LOADING = 'preparing the ritual…';

const RITUAL_SUCCESS = [
  'The ritual is complete. Your message has been bound and delivered.',
  'The spirits have accepted your offering. Phillip has been summoned.',
  'Transmission successful. The runes are inscribed. Await a reply from the void.',
  'Your scroll has been sealed and dispatched by raven. A response shall come.',
  'The sigil is drawn. Your words now echo across the astral plane.',
  'It is done. The dark courier has taken your message into the between-spaces.',
  'Your offering has been accepted. The stars have aligned in acknowledgement.',
  'Message delivered beyond the veil. Phillip has been alerted by means best left unspecified.',
  'The rite succeeded. Expect a reply before the next conjunction of the outer spheres.',
  'Delivered. The elder gods noted your message with mild, eldritch interest.',
];

const RITUAL_ERROR = [
  'The ritual failed. A dark force intercepted your offering. Try again, mortal.',
  'The void did not accept your scroll. Verify your fields and try again.',
  'Error: the ritual circle is broken. The ether could not carry your message.',
  'Your message was consumed by shadow before it could arrive. Please retry.',
  'The stars are not aligned. Your words float, undelivered, in the between-spaces.',
  'A shoggoth ate the packet. This is not a metaphor. Please retry.',
  'The dark courier returned your message unopened. Check your details and reattempt the rite.',
  'Transmission failed. The Old Ones are displeased, though admittedly that is not new.',
  'The portal collapsed mid-send. Your message is somewhere in the void. Try again.',
  'Ritual interrupted by an unforeseen elder entity. The network is temporarily cursed.',
];

const RITUAL_PERSONAS = [
  {
    name:    'Cornelius P. Tentacle',
    email:   'c.tentacle@rlyeh.deep',
    reason:  'job',
    message: "My previous employer was consumed by a dimensional rift. Seeking new opportunities — remote preferred, as the commute from R'lyeh is deeply unpredictable.",
  },
  {
    name:    'Lavinia Whateley',
    email:   'lavinia@dunwich.local',
    reason:  'research',
    message: 'I am conducting research into geometries that should not exist and require a collaborator unbothered by angles beyond the fourth dimension.',
  },
  {
    name:    'Herbert West III',
    email:   'h.west@reanimator.io',
    reason:  'general',
    message: 'I have perfected a serum that may or may not reverse death. Thought you might find this relevant. Side effects: mild shambling.',
  },
  {
    name:    'Obed Marsh Jr.',
    email:   'obed@innsmouth.gov',
    reason:  'job',
    message: 'The stars are finally right. I am available immediately. Please note: I prefer coastal offices and thrive on the night shift.',
  },
  {
    name:    'Iphigenia Grimshaw',
    email:   'i.grimshaw@miskatonic.edu',
    reason:  'phd',
    message: 'I wish to pursue doctoral research into the memetic properties of elder signs. My previous supervisor was driven to madness — I consider this a promising reference.',
  },
  {
    name:    'Nyarlathotep R. Jones',
    email:   'crawling.chaos@outer.dark',
    reason:  'general',
    message: "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn. Also — do you offer remote work? The commute from the Void is genuinely unreasonable.",
  },
  {
    name:    'Pickman G. Ghoulsworth',
    email:   'pickman@ghoul.gallery',
    reason:  'research',
    message: 'I am an artist with a very particular perspective on the human form. My models are difficult to schedule but extremely dedicated.',
  },
  {
    name:    'Azathoth, Blind Idiot',
    email:   'azathoth@nuclear.chaos',
    reason:  'general',
    message: 'I have dreamt at the centre of ultimate chaos for millennia and your portfolio disrupted my slumber. This is either a complaint or a compliment — I genuinely cannot tell.',
  },
  {
    name:    'Seraphina Dreadmoore',
    email:   's.dreadmoore@nightshade.eld',
    reason:  'job',
    message: 'I bring seven centuries of cross-functional experience serving the Old Ones. Proficient in dark rituals, forbidden tomes, and stakeholder management.',
  },
  {
    name:    'Thaddeus von Gloom',
    email:   'thaddeus@cyclopean.city',
    reason:  'research',
    message: "I have mapped seventeen non-Euclidean cities and would love to collaborate. Fair warning: my field notes are written in an alphabet that predates mankind.",
  },
  {
    name:    'Wilbur Whateley Jr.',
    email:   'w.whateley@dunwich.local',
    reason:  'job',
    message: 'I am told I have a face for remote work. Seeking a fully distributed team where video is optional and questions about my appearance are gently discouraged.',
  },
  {
    name:    'Randolph Carter, Esq.',
    email:   'r.carter@dreamlands.net',
    reason:  'research',
    message: 'I have traversed the Dreamlands, scaled Kadath, and spoken with the gods of Earth. I believe this qualifies me for at least a mid-level research position.',
  },
  {
    name:    'Professor H.P. Armitage',
    email:   'armitage@miskatonic.edu',
    reason:  'phd',
    message: 'I am seeking a PhD candidate to assist with translating the Necronomicon into a modern microservices architecture. Funding is available. NDAs required.',
  },
  {
    name:    'Dagon, Lord of the Deep',
    email:   'dagon@innsmouth.gov',
    reason:  'job',
    message: 'I oversee a large distributed team of Deep Ones and have extensive experience in aquatic infrastructure. Open to hybrid roles — water and land.',
  },
  {
    name:    'Yog-Sothoth (The Gate)',
    email:   'yog-sothoth@all-in-one.void',
    reason:  'general',
    message: 'I am the key and the gate. I am also available for consulting engagements. My rate is one soul per sprint or negotiable in cosmic favours.',
  },
  {
    name:    'Gerald Fungi, Mi-Go Regional',
    email:   'g.fungi@yuggoth.biz',
    reason:  'job',
    message: 'Our mining operations on Yuggoth have hit some regulatory obstacles. I am exploring a career pivot and believe software engineering could be a good fit.',
  },
  {
    name:    'The Colour (Out of Space)',
    email:   'thecolour@spectral.void',
    reason:  'general',
    message: 'I do not have a name that human language can express, but I have excellent chromatic skills and am available immediately. References: the Gardner farm.',
  },
  {
    name:    'Elder Thing Consulting LLC',
    email:   'et.consulting@antarctic.ice',
    reason:  'research',
    message: 'We pioneered life on this planet several hundred million years ago and are now pivoting to technology consulting. Our previous clients include all of biology.',
  },
  {
    name:    'Zkauba of the Great Race',
    email:   'zkauba@yith.edu',
    reason:  'phd',
    message: 'I have inhabited seventeen bodies across four geological epochs. My research interests include temporal mechanics, cognitive displacement, and tuition waivers.',
  },
  {
    name:    'Shoggoth (No Surname)',
    email:   'shoggoth@tekeli.li',
    reason:  'job',
    message: "Tekeli-li. Tekeli-li. I am a highly adaptable team player and can take any shape the role requires. References available upon request. Tekeli-li.",
  },
  {
    name:    'Mordicai Blackthorn',
    email:   'm.blackthorn@hexwood.eld',
    reason:  'research',
    message: 'I have spent forty years studying the intersection of necromancy and distributed systems. I believe we have overlapping interests and would welcome a chat.',
  },
  {
    name:    'Countess Velira Duskmourne',
    email:   'velira@duskmourne.castle',
    reason:  'job',
    message: 'I have led a household of seventeen thralls for three centuries. I am decisive, detail-oriented, and allergic to neither criticism nor direct sunlight. (One of those is a lie.)',
  },
  {
    name:    'Archlich Morthikael',
    email:   'morthikael@phylactery.net',
    reason:  'phd',
    message: 'I achieved lichdom specifically to escape the limitations of mortal scholarship. I am now seeking a PhD because it turns out you still need the credentials.',
  },
  {
    name:    'Baroness Griselda Hexwood',
    email:   'g.hexwood@blighted.fen',
    reason:  'general',
    message: 'My familiar intercepted a crow carrying word of your work. I have some questions. Please respond before the next new moon — I will be occupied with a ritual.',
  },
  {
    name:    'Xibalba Q. Bonecrown',
    email:   'xq.bonecrown@underworld.gov',
    reason:  'job',
    message: 'I currently manage the administrative operations of an underworld spanning twelve death-realms. Seeking a change of pace and a better work-life balance.',
  },
  {
    name:    'Ragnara the Undying',
    email:   'ragnara@undying.horde',
    reason:  'research',
    message: 'I have died four times and each resurrection has granted me new perspective. I am researching whether there is a theoretical upper bound on this.',
  },
  {
    name:    'Sir Aldric Plaguemantle',
    email:   'a.plaguemantle@knighthood.blk',
    reason:  'other',
    message: 'I represent the Order of the Blighted Lance. We are interested in sponsoring your work, provided you are comfortable with our branding guidelines (mostly skulls).',
  },
  {
    name:    'Elowen Shadowmere',
    email:   'elowen@shadowmere.moor',
    reason:  'general',
    message: 'I found your portfolio while wandering an infinite fog-bound moor at 3am. It was either a cosmic sign or an algorithm. Either way, here I am.',
  },
  {
    name:    'Gormath the Pale',
    email:   'gormath@pale.court',
    reason:  'job',
    message: 'My last role ended when the kingdom I served was swallowed by a generational curse. Looking to transition into a more stable industry. Open to contract work.',
  },
  {
    name:    'Thessaly Vex',
    email:   'thessaly@hexcraft.io',
    reason:  'research',
    message: 'I have hexed seventeen compilers and two entire programming languages. I am interested in discussing collaborative research into why JavaScript exists.',
  },
  {
    name:    'Ignatius Hexmonger',
    email:   'i.hexmonger@spellwright.guild',
    reason:  'phd',
    message: 'My thesis proposes a unified theory of cursed code and legacy systems. My advisor says it is either groundbreaking or grounds for expulsion. Seeking a second opinion.',
  },
  {
    name:    'Duchess Morvaine Ashen',
    email:   'morvaine@ashen.duchy',
    reason:  'job',
    message: 'I ruled the Duchy of Ashen for two hundred years before it was claimed by blight. I have strong opinions about infrastructure and am extremely available.',
  },
  {
    name:    'The Nameless Scrivener',
    email:   'noname@voidscript.ink',
    reason:  'general',
    message: 'I have written every forbidden text since the first age of the world. My current availability is good. My rates are competitive. I do not do cover letters.',
  },
  {
    name:    'Brother Carrow Deathwhisper',
    email:   'c.deathwhisper@ossuary.org',
    reason:  'phd',
    message: 'My monastic order studies the philosophy of endings. I am applying to doctoral programmes as part of my personal journey toward understanding beginnings.',
  },
  {
    name:    'Morrigan Nightcradle',
    email:   'morrigan@nightcradle.fae',
    reason:  'research',
    message: 'I crossed from the Unseelie Court specifically to make contact with you. The fae do not do this lightly. Please reply promptly — I cannot stay in this realm indefinitely.',
  },
  {
    name:    'Ptolemy Wraithbone',
    email:   'p.wraithbone@tomb-scholars.net',
    reason:  'job',
    message: 'I have catalogued the contents of nine thousand tombs and am looking to apply these archival skills in a more growth-oriented environment.',
  },
  {
    name:    'Cressida Wolfsbane',
    email:   'cressida@wolfsbane.hex',
    reason:  'other',
    message: 'I am reaching out on behalf of a consortium of witches who have followed your work with great interest. We have funding, questions, and a cauldron.',
  },
  {
    name:    'Executor Vreth',
    email:   'vreth@darklord.exec',
    reason:  'general',
    message: 'I handle all correspondence for the Dark Lord, who prefers not to email directly. He finds your portfolio intriguing and wishes to discuss terms. No pressure.',
  },
  {
    name:    'Ondine, She Who Drowns',
    email:   'ondine@the-deep.tides',
    reason:  'research',
    message: 'I am a water spirit with a deep interest in fluid dynamics and recursive systems. I believe our research interests overlap. Please meet me at the shoreline at midnight.',
  },
  {
    name:    'Grand Archivist Skullum',
    email:   'g.skullum@forbidden-library.eld',
    reason:  'phd',
    message: 'I maintain the Forbidden Library and have read everything humanity was not meant to see. I am pursuing a PhD because apparently that still matters.',
  },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function initContactForm() {
  const dialog = document.getElementById('contact-dialog');
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('contact-status');
  if (!dialog || !form || !status) return;

  function setField(el, value) {
    el.value = value;
    el.dataset.personaDefault = value;
  }

  function loadPersona() {
    const p = pick(RITUAL_PERSONAS);
    setField(form.elements['name'],    p.name);
    setField(form.elements['email'],   p.email);
    setField(form.elements['message'], p.message);
    form.elements['reason'].value = p.reason;
  }

  // Clear on first focus; restore the persona default on blur if left empty.
  ['name', 'email', 'message'].forEach(fieldName => {
    const el = form.elements[fieldName];
    el.addEventListener('focus', () => {
      if (el.value === el.dataset.personaDefault) el.value = '';
    });
    el.addEventListener('blur', () => {
      if (!el.value) el.value = el.dataset.personaDefault ?? '';
    });
  });

  // Fresh persona every time the dialog opens; also clear any previous status.
  new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.attributeName === 'open' && dialog.hasAttribute('open')) {
        loadPersona();
        status.hidden    = true;
        status.className = 'contact-status';
      }
    }
  }).observe(dialog, { attributes: true, attributeFilter: ['open'] });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    status.hidden      = false;
    status.className   = 'contact-status contact-status--loading';
    status.textContent = RITUAL_LOADING;

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method:  'POST',
        body:    new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        status.className   = 'contact-status contact-status--success';
        status.textContent = pick(RITUAL_SUCCESS);
        loadPersona();
      } else {
        status.className   = 'contact-status contact-status--error';
        status.textContent = pick(RITUAL_ERROR);
      }
    } catch {
      status.className   = 'contact-status contact-status--error';
      status.textContent = pick(RITUAL_ERROR);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  initDialogs();
  initLocale();
  initTheme();
  loadGitHubRepos();
  initContactForm();
});
