/**
 * GitHub 仓库卡片初始化脚本
 * 使用 GitHub API 获取仓库信息并渲染卡片
 */

const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Lua: '#000080',
  Zig: '#ec915c',
};

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

async function initGithubCards() {
  const cards = document.querySelectorAll('.github-card[data-repo]');
  if (!cards.length) return;

  for (const card of cards) {
    const repo = card.getAttribute('data-repo');
    if (!repo) continue;

    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // 描述
      const descEl = card.querySelector('.github-card-desc');
      if (descEl) descEl.textContent = data.description || 'No description provided.';

      // Stars
      const starsEl = card.querySelector('[data-github="stars"]');
      if (starsEl) starsEl.textContent = formatCount(data.stargazers_count);

      // Forks
      const forksEl = card.querySelector('[data-github="forks"]');
      if (forksEl) forksEl.textContent = formatCount(data.forks_count);

      // License
      const licenseEl = card.querySelector('[data-github="license"]');
      if (licenseEl) licenseEl.textContent = data.license?.spdx_id || 'N/A';

      // Language (如果有)
      if (data.language) {
        const footer = card.querySelector('.github-card-footer');
        if (footer) {
          const langSpan = document.createElement('span');
          langSpan.className = 'github-card-stat';
          const color = LANGUAGE_COLORS[data.language] || '#8b949e';
          langSpan.innerHTML = `<span class="github-card-lang-dot" style="background:${color}"></span><span>${data.language}</span>`;
          footer.appendChild(langSpan);
        }
      }
    } catch {
      const descEl = card.querySelector('.github-card-desc');
      if (descEl) descEl.textContent = 'Failed to load repository info.';
    }
  }
}

initGithubCards();
