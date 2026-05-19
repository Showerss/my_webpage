class ProjectCard extends HTMLElement {
  connectedCallback() {
    const name    = this.getAttribute('repo-name') ?? '';
    const url     = this.getAttribute('url') ?? '#';
    const desc    = this.getAttribute('description') ?? '';
    const lang    = this.getAttribute('language') ?? '';
    const stars   = this.getAttribute('stars') ?? '0';
    const updated = this.getAttribute('updated') ?? '';

    const article = document.createElement('article');
    article.className = 'repo-card';

    const h4   = document.createElement('h4');
    const link = document.createElement('a');
    link.href        = url;
    link.target      = '_blank';
    link.rel         = 'noopener noreferrer';
    link.textContent = name;
    h4.append(link);
    article.append(h4);

    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      article.append(p);
    }

    const meta = document.createElement('footer');
    meta.className = 'repo-meta';

    if (lang) {
      const langEl = document.createElement('span');
      langEl.className   = 'repo-lang';
      langEl.textContent = lang;
      meta.append(langEl);
    }

    const starsEl = document.createElement('span');
    starsEl.className   = 'repo-stars';
    starsEl.textContent = `★ ${stars}`;
    meta.append(starsEl);

    if (updated) {
      const time = document.createElement('time');
      time.dateTime    = updated;
      time.textContent = new Date(updated).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short',
      });
      meta.append(time);
    }

    article.append(meta);
    this.replaceChildren(article);
  }
}

customElements.define('project-card', ProjectCard);
