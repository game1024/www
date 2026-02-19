/**
 * <x-tabs> Web Component
 * 为 remark 指令和 Tabs.astro 提供统一的 Tab 交互
 */

const KEY_MAP = { ArrowRight: 1, ArrowLeft: -1, Home: 0, End: -0 };

let uid = 0;

class XTabs extends HTMLElement {
  #tabs = [];
  #panels = [];

  connectedCallback() {
    this.#panels = [...this.querySelectorAll(':scope > [role="tabpanel"]')];
    if (!this.#panels.length) return;

    // Tabs.astro 已有 tab-list → 直接绑定事件；remark 指令 → 动态生成
    if (!this.querySelector('.tab-list')) this.#buildTabList();

    this.#tabs = [...this.querySelectorAll('[role="tab"]')];
    this.#bindEvents();
  }

  #buildTabList() {
    const gid = uid++;
    const tablist = document.createElement('div');
    tablist.className = 'tab-list';
    tablist.setAttribute('role', 'tablist');

    this.#panels.forEach((panel, i) => {
      const tabId = `tab-${gid}-${i}`;
      const panelId = `panel-${gid}-${i}`;

      Object.assign(panel, { id: panelId, hidden: i !== 0 });
      panel.setAttribute('aria-labelledby', tabId);

      const btn = Object.assign(document.createElement('button'), {
        id: tabId,
        textContent: panel.dataset.label || `Tab ${i + 1}`,
      });
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(i === 0));
      btn.setAttribute('aria-controls', panelId);
      if (i) btn.tabIndex = -1;

      tablist.append(btn);
    });

    const wrapper = Object.assign(document.createElement('div'), { className: 'tablist-wrapper' });
    wrapper.append(tablist);
    this.prepend(wrapper);
  }

  #bindEvents() {
    // 使用事件委托，只绑定一次
    this.querySelector('[role="tablist"]')?.addEventListener('click', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) this.#switchTo(tab);
    });

    this.querySelector('[role="tablist"]')?.addEventListener('keydown', (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (!tab || !(e.key in KEY_MAP)) return;

      e.preventDefault();
      const i = this.#tabs.indexOf(tab);
      const len = this.#tabs.length;

      // Home → 0, End → last, Arrow → offset
      const next =
        e.key === 'Home' ? 0
        : e.key === 'End' ? len - 1
        : (i + KEY_MAP[e.key] + len) % len;

      this.#switchTo(this.#tabs[next]);
      this.#tabs[next].focus();
    });
  }

  #switchTo(active) {
    this.#tabs.forEach((t) => {
      const selected = t === active;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    this.#panels.forEach((p) => {
      p.hidden = p.id !== active.getAttribute('aria-controls');
    });
  }
}

if (!customElements.get('x-tabs')) customElements.define('x-tabs', XTabs);
