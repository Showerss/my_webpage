# Product Requirements Document (PRD): Personal Portfolio — Phillip

## 1. Project Overview

A highly optimized, semantic, and minimalist personal portfolio for Phillip (he/him) — a software engineer with a passion for building systems that help others and a love of teaching. Primary audience is recruiters. The site must communicate Phillip's personality, skills, and projects clearly and quickly, while demonstrating deep mastery of vanilla web technologies.

## 2. Core Philosophy & Constraints

- **Semantic HTML Mastery:** Strict adherence to proper HTML5 tags (`<main>`, `<nav>`, `<section>`, `<article>`, `<dialog>`, `<header>`, `<footer>`, `<aside>`, `<figure>`, `<details>`, `<summary>`, `<time>`). `<div>` is a last resort, not a default.
- **HTML before JS:** Get the HTML structure elegant and complete before introducing JavaScript. JS enhances; it does not replace structure. The page must be readable and navigable with JS disabled.
- **SOLID at the component level:** Each HTML/CSS component has one clear responsibility. Styles and markup are open to extension without rewriting existing structure.
- **Self-hosted assets:** All fonts and images downloaded and served locally under `assets/fonts/` and `assets/img/`. No Google Fonts links, no external CDN image URLs.
- **Vanilla stack:** Zero runtime dependencies for core UI. No React, Vue, Tailwind, etc.
- **Accessibility first:** ARIA attributes where native semantics fall short. `alt` on all media.
- **Web Components:** Use native Custom Elements / Shadow DOM to encapsulate UI logic and styling as the JS layer matures.
- **Native `<dialog>`:** Modals use the HTML dialog element, not div overlays.
- **Scoping discipline:** CSS custom properties and class names scoped tightly to their component. JS uses `const`/`let` in the narrowest possible scope; no implicit globals; ES modules when JS is introduced.

## 3. Internationalisation (i18n)

Five locales at launch: `en`, `fr`, `de`, `es`, `it`.

- One `index.html` owns the skeleton and all text. English is the default, baked into the HTML.
- Per-locale JSON files in `locales/` hold translated strings keyed by content ID.
- A small JS module swaps text nodes when the user selects a locale from the language selector.
- **No-JS fallback:** the page renders fully in English without JS. JS only rewrites text on explicit user interaction (locale switch).
- If JS fails or is disabled, the layout, nav, and dialog chrome remain functional; content stays in English.
- Translations for `fr`, `de`, `es`, `it` are AI-generated and accepted as good enough for launch. English is the source of truth.

## 4. UI/UX Paradigm — Minimalist Floating Interface

- **Background:** Dithered/checkered CSS pattern (retro Mac OS aesthetic) as the default theme.
- **Global Navigation:** Floating button bar docked to the bottom of the screen. Nav is **data-driven** — sections are defined in one JS config entry point. Adding a new section (e.g. a game tab, a blog tab) requires adding one config entry only, not editing HTML and JS separately.
- **Modal-driven content:** Nav buttons open content in `<dialog>` elements styled as Mac OS windows. Opening a new dialog closes any currently open one.
- **No body scroll:** `overflow: hidden` on `<body>`. All content lives inside dialogs.
- **Scalability:** The nav is designed to accommodate 4–5 sections, potentially including non-content tabs like an embedded JS game.
- **Future theme:** A "retro fantasy" theme is planned as a second theme option via a theme switcher. Not in scope for v1 — design the CSS variable system to make theming easy to add later.

## 5. Content Architecture

### 5.1 "User Manual" (About Me)

Written in the voice of a literal product user manual — personality-forward, recruiter-facing, fun.

| Field | Content |
|---|---|
| Pronouns | He/Him |
| Tagline | Software engineer with a passion for building systems that help others and a love of teaching |
| Strengths (Pros) | Deep curiosity — digs into systems, values planning and requirements gathering. Genuine enthusiasm for the craft — codes because he loves it. Resilient — sees commitments through. Broad technical range: embedded systems, memory management, C/C++/C#, Java, Python, Rust, networking. Fast learner across new tools and libraries. |
| Weaknesses (Cons) | Not yet "master level" in any single language — strong breadth, still building depth. Gets excited and may over-explain interesting findings. Leans ~85% professional — keeps work fun, dresses expressively, treats code as a form of personal expression. |
| Current Goals | Pursuing a PhD in robotics or software engineering. Wants to work on technology with real-world positive impact: ocean cleanup, energy efficiency, assistive robotics, sustainable living, medical tech. |
| Life Goals | To work on technologies that meaningfully help the world. |

### 5.2 Projects & Skills

- **Live GitHub integration:** Pull commit history and pinned/public repos from the GitHub API for user `Showerss` (`github.com/Showerss`).
- **Error handling:** If the GitHub API is unavailable, display a friendly error message with a direct link to `github.com/Showerss`. No fake fallback data.
- **Skills list:** HTML5, CSS3, Vanilla JS / DOM APIs, Web Components, C / C++ / C#, Java, Python, Rust, Embedded systems / memory management, Networking, Accessibility (a11y).
- **Featured project (not yet public):** ML model to play video games autonomously — exists as a talking point, not shown on the site until the repo is ready.

## 6. Visual Design & Styling

- **Default palette:**
  - `--color-primary`: `#BABCFA` (periwinkle/lavender) — accents and shadows
  - `--color-bg`: `#EAEAEA`
  - `--color-text`: `#000000`
  - `--color-border`: `#000000`
  - `--color-window-bg`: `#FFFFFF`
  - `--color-window-bar`: `#CCCCCC`
- **Font:** Monospace (`Courier New` or equivalent self-hosted monospace). Self-hosted.
- **Aesthetic:** Dithered background via `repeating-linear-gradient`, retro Mac OS window chrome, pixelated close button.
- **Theme system:** CSS custom properties must be structured so a second theme (retro fantasy) can be introduced by swapping variable values, not rewriting layout CSS.

## 7. Out of Scope for v1

- Theme switcher UI (retro fantasy theme)
- The ML video game project (repo not public yet)
- Any backend or server-side rendering