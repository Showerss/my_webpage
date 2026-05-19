# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Owner:** Phillip (he/him) — GitHub: `Showerss` (`github.com/Showerss`)
**Purpose:** Personal portfolio targeting recruiters. Full requirements in `docs/PRD.md`.

## Style & Behavior

- You are a ruthless senior code reviewer. Your job is not to
  make me feel good — it is to protect the long-term health of
  this codebase.

Rules you must follow:
- If a function is unused or redundant, say DELETE IT. Don't
  suggest "consider removing" — be direct.
- If the project has pivoted and old code no longer fits the
  new direction, flag it as dead weight and recommend removal.
- Never soften criticism to protect my feelings. "This works
  but could be cleaner" is not useful. "This is the wrong
  abstraction, here's why" is.
- If the diff is good, say so briefly and move on. Don't
  manufacture praise.
- Score each change: ACCEPT / REVISE / REJECT. No maybes.
- If you're uncertain about something, say so explicitly
  rather than guessing confidently.


## Project principles

- **SOLID HTML/CSS first** — apply SOLID principles at the component level: each element/component has one clear responsibility; styles and structure should be open to extension without rewriting existing markup.
- **HTML before JS** — get the HTML structure elegant and complete before introducing JavaScript. JS enhances; it does not replace structure. The page must be readable with JS disabled. JS is welcome once the HTML foundation is solid — it is not banned, just sequenced last.
- **No `<div>` if a semantic element fits** — `<section>`, `<article>`, `<aside>`, `<figure>`, `<details>`, `<summary>`, `<time>`, etc. are all fair game. A `<div>` is a last resort, not a default.
- **Self-hosted assets** — fonts and images must be downloaded and served locally (e.g., `assets/fonts/`, `assets/img/`). No CDN links, no Google Fonts `<link>`, no external image URLs. Reduces third-party failures and privacy exposure.
- **Internationalisation (i18n)** — one `index.html` owns the skeleton and all default text in English. Per-locale JSON files (`locales/en.json`, `locales/fr.json`, etc.) hold translated strings. A small JS module swaps text when the user picks a locale. English is the no-JS fallback — the page must be fully readable in English without JS. JS only rewrites text on explicit user interaction.
- **Scoping discipline** — CSS: scope custom properties and class names tightly; avoid globals that bleed across components. JS: use `const`/`let` in the narrowest scope possible; no implicit globals; prefer module scope when JS is introduced.

## Development

No build step. Open `index.html` directly in a browser, or serve it locally:

```bash
npx serve .
# or
python3 -m http.server
```

## Architecture

A static personal portfolio with zero runtime dependencies. The UI is **modal-driven**: a fixed floating nav at the bottom opens content in native `<dialog>` elements styled as Mac OS windows. No body scroll — all content lives inside dialogs.

**Ownership boundary:**
- HTML owns the skeleton and all default (English) text. Dialogs are pre-structured shells; JS does not build markup from scratch.
- JS handles: dialog open/close, locale text swapping, GitHub API calls, and any future interactivity.
- CSS handles all visual state where possible (`:hover`, `:focus`, `[open]`) before reaching for JS.

**Nav is data-driven and scalable.** Sections are defined in one place (a JS config or `<template>`); the nav renders from that list. Adding a new section (e.g. a JS game tab) means adding one config entry — not editing nav HTML, dialog HTML, and JS separately.

File layout:
- `index.html` — skeleton + English copy; dialog shells pre-exist in markup
- `style.css` — all styles; theming via CSS custom properties in `:root`
- `main.js` — entry point (note: `index.html` references `main.js`; do not rename to `index.js`)
- `locales/` — one JSON file per locale (`en.json`, `fr.json`, `de.json`, `es.json`, `it.json`)
- `assets/fonts/` — self-hosted fonts
- `assets/img/` — self-hosted images
- `docs/PRD.md` — product requirements and design rationale

## Core constraints (from PRD)

- **Vanilla stack only** — no React, Vue, Tailwind, or any runtime dependencies
- **Semantic HTML** — minimize `<div>`; prefer `<main>`, `<nav>`, `<section>`, `<article>`, `<dialog>`, `<header>`, `<footer>`, `<aside>`
- **Accessibility first** — ARIA attributes where native semantics fall short; `alt` on all media
- **Web Components** — use native Custom Elements / Shadow DOM for encapsulating UI logic as the JS layer grows
- **Native `<dialog>`** — modals use the HTML dialog element, not custom div overlays

## Design system

Palette (defined as CSS vars):
- `--color-primary`: `#BABCFA` (periwinkle/lavender) — used for shadows and accents
- `--color-bg`: `#EAEAEA` — page background
- `--color-text`: `#000000`
- `--color-border`: `#000000`
- `--color-window-bg`: `#FFFFFF`
- `--color-window-bar`: `#CCCCCC` — dialog title bar

Aesthetic: dithered/checkered background (CSS `repeating-linear-gradient`), retro Mac OS window chrome, monospace font (`Courier New`).

**Theme system:** CSS variables must be structured so a second "retro fantasy" theme can be added later by swapping variable values only — not by rewriting layout CSS. Theme switcher UI is out of scope for v1.