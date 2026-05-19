# Phillip M. Banky — Personal Portfolio

A minimalist, retro-styled personal portfolio built with vanilla HTML, CSS, and JavaScript. Zero runtime dependencies. No build step.

Live at: `TODO: add deployed URL`

---

## Stack

- **HTML5** — semantic-first; `<dialog>`, `<section>`, `<article>`, `<nav>`, `<time>` over `<div>`
- **CSS3** — custom properties for theming, dithered retro Mac OS aesthetic
- **Vanilla JS (ES Modules)** — no frameworks, no bundler
- **Web Components** — native Custom Elements / Shadow DOM for encapsulated UI
- **GitHub API** — live repo and commit data pulled from [`github.com/Showerss`](https://github.com/Showerss)
- **i18n** — locale JSON files for English, French, German, Spanish, Italian; English works with JS disabled

---

## Features

- Modal-driven UI: content lives in native `<dialog>` elements styled as Mac OS windows
- Floating bottom nav, data-driven from a single JS config — add a new section by adding one entry
- No body scroll — `overflow: hidden` on `<body>`; all content scrolls inside dialogs
- Self-hosted fonts and images; no external CDN dependencies
- Fully readable in English with JS disabled
- Accessible: ARIA roles and labels wherever native semantics fall short
- Open Graph meta tags for LinkedIn / Slack / iMessage link previews

---

## File Layout

```
index.html          — skeleton + all default (English) text
style.css           — all styles; theming via CSS custom properties
main.js             — JS entry point
components/
  project-card.js   — <project-card> Web Component
  theme-picker.js   — <theme-picker> Web Component
locales/
  en.json           — English (source of truth)
  fr.json
  de.json
  es.json
  it.json
assets/
  fonts/            — self-hosted webfonts
  img/              — self-hosted images and favicon
docs/
  PRD.md            — full product requirements and design rationale
```

---

## Running Locally

No install required.

```bash
# Option 1
npx serve .

# Option 2
python3 -m http.server
```

Then open `http://localhost:3000` (or whichever port is shown).

---

## Design System

| Variable              | Value     | Usage                        |
|-----------------------|-----------|------------------------------|
| `--color-primary`     | `#BABCFA` | Accents, shadows (periwinkle)|
| `--color-bg`          | `#EAEAEA` | Page background              |
| `--color-text`        | `#000000` | Body text                    |
| `--color-border`      | `#000000` | Borders                      |
| `--color-window-bg`   | `#FFFFFF` | Dialog background            |
| `--color-window-bar`  | `#CCCCCC` | Dialog title bar             |

Themes are swappable by overriding CSS custom properties — no layout CSS changes required.

---

## Principles

- **HTML before JS** — structure is complete and readable before JS runs
- **No `<div>` if a semantic element fits**
- **SOLID at the component level** — each component has one responsibility
- **Self-hosted assets only** — no Google Fonts, no external image URLs
- **Scoping discipline** — no implicit globals; CSS custom properties scoped to their component

Full rationale in [`docs/PRD.md`](docs/PRD.md).
