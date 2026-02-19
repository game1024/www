/**
 * <github-card> Web Component
 * 用法: <github-card repo="owner/repo"></github-card>
 */

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Rust: '#dea584', Go: '#00ADD8', Java: '#b07219',
  'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
  Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
  Ruby: '#701516', PHP: '#4F5D95', Vue: '#41b883',
  HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
  Lua: '#000080', Zig: '#ec915c',
};

// prettier-ignore
const SVG = {
  github: '<svg class="github-card-icon" viewBox="0 0 16 16" width="20" height="20" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
  star:   '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>',
  fork:   '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg>',
  license:'<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8.75.75a.75.75 0 00-1.5 0V2h-.984c-.305 0-.604.08-.869.23l-1.288.737A.25.25 0 013.984 3H1.75a.75.75 0 000 1.5h.428L.066 9.192a.75.75 0 00.154.838l.53-.53-.53.53v.001l.002.002.004.004.012.011a1.07 1.07 0 00.056.05 1.96 1.96 0 00.16.129c.12.086.3.198.541.3.484.2 1.18.37 2.005.37.825 0 1.522-.17 2.006-.37a2.9 2.9 0 00.7-.428l.013-.012.004-.004.002-.002h.001L5.2 9.5l.53.53a.75.75 0 00.154-.838L3.772 4.5h.612a.25.25 0 01.124.033l1.29.736c.264.152.563.231.868.231h.984v7.75a.75.75 0 001.5 0V5.5h.984c.305 0 .604-.08.869-.23l1.288-.737a.25.25 0 01.124-.033h.612L10.8 9.192a.75.75 0 00.154.838l.53-.53-.53.53v.001l.002.002.004.004.012.011a1.07 1.07 0 00.056.05 1.96 1.96 0 00.16.129c.12.086.3.198.541.3.484.2 1.18.37 2.005.37.825 0 1.522-.17 2.006-.37a2.9 2.9 0 00.7-.428l.013-.012.004-.004.002-.002h.001l-.53-.53.53.53a.75.75 0 00.154-.838L13.823 4.5h.427a.75.75 0 000-1.5h-2.234a.25.25 0 01-.124-.033l-1.29-.736A1.75 1.75 0 009.735 2H8.75V.75zM1.695 9.227L3 6.039l1.305 3.188a1.6 1.6 0 01-.305.144c-.3.124-.766.269-1.3.269s-1-.145-1.3-.27a1.6 1.6 0 01-.305-.143zm10 0L13 6.039l1.305 3.188a1.6 1.6 0 01-.305.144c-.3.124-.766.269-1.3.269s-1-.145-1.3-.27a1.6 1.6 0 01-.305-.143z"/></svg>',
};

const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n);
const stat = (icon, key) => `<span class="github-card-stat">${SVG[icon]}<span data-gh="${key}">-</span></span>`;

class GithubCard extends HTMLElement {
  /** @param {string} sel */
  #$(sel) { return this.querySelector(sel); }

  connectedCallback() {
    const repo = this.getAttribute('repo');
    if (!repo) return;

    this.innerHTML = `
      <a class="github-card" href="https://github.com/${repo}" target="_blank" rel="noopener noreferrer">
        <div class="github-card-header">
          ${SVG.github}
          <span class="github-card-name">${repo}</span>
        </div>
        <p class="github-card-desc">Loading...</p>
        <div class="github-card-footer">
          ${stat('star', 'stars')}
          ${stat('fork', 'forks')}
          ${stat('license', 'license')}
        </div>
      </a>`;

    this.#fetchRepo(repo);
  }

  async #fetchRepo(repo) {
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`);
      if (!res.ok) throw new Error(res.status);
      const d = await res.json();

      this.#$('.github-card-desc').textContent = d.description || 'No description provided.';
      this.#$('[data-gh="stars"]').textContent = fmt(d.stargazers_count);
      this.#$('[data-gh="forks"]').textContent = fmt(d.forks_count);
      this.#$('[data-gh="license"]').textContent = d.license?.spdx_id ?? 'N/A';

      if (d.language) {
        const color = LANG_COLORS[d.language] || '#8b949e';
        this.#$('.github-card-footer').insertAdjacentHTML(
          'beforeend',
          `<span class="github-card-stat"><span class="github-card-lang-dot" style="background:${color}"></span>${d.language}</span>`
        );
      }
    } catch {
      this.#$('.github-card-desc').textContent = 'Failed to load repository info.';
    }
  }
}

if (!customElements.get('github-card')) customElements.define('github-card', GithubCard);
