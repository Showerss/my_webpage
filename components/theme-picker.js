const THEMES = [
  { value: 'crt',      label: 'CRT',      color: '#BABCFA' },
  { value: 'tui',      label: 'TUI',      color: '#bd93f9' },
  { value: 'mint',     label: 'Mint',     color: '#6DB99A' },
  { value: 'material', label: 'Material', color: '#4285F4' },
];

class ThemePicker extends HTMLElement {
  #active = 'crt';

  connectedCallback() {
    this.#active = localStorage.getItem('theme') ?? 'crt';
    document.documentElement.dataset.theme = this.#active;
    this.#render();
  }

  #setTheme(value) {
    this.#active = value;
    document.documentElement.dataset.theme = value;
    localStorage.setItem('theme', value);
    this.#render();
  }

  #render() {
    const group = document.createElement('div');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Select theme');
    group.className = 'theme-swatches';

    for (const theme of THEMES) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-swatch';
      if (theme.value === this.#active) btn.classList.add('theme-swatch--active');
      btn.setAttribute('aria-label', `${theme.label} theme`);
      btn.setAttribute('aria-pressed', String(theme.value === this.#active));
      btn.title = theme.label;
      btn.style.setProperty('--swatch-color', theme.color);
      btn.addEventListener('click', () => this.#setTheme(theme.value));
      group.append(btn);
    }

    this.replaceChildren(group);
  }
}

customElements.define('theme-picker', ThemePicker);
