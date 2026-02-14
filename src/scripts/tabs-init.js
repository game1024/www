/**
 * x-tabs 自定义元素初始化脚本
 * 为 remark-custom-directives 生成的 <x-tabs> 提供交互支持
 * 自动从 div[role="tabpanel"][data-label] 子节点生成 tab 按钮
 * 与 Tabs.astro 组件共享同一个自定义元素
 */

if (!customElements.get('x-tabs')) {
  let groupCounter = 0;

  class XTabs extends HTMLElement {
    connectedCallback() {
      const panels = this.querySelectorAll(':scope > [role="tabpanel"]');
      if (panels.length === 0) return;

      // 如果已经有 tablist-wrapper，说明是 Tabs.astro 生成的，直接绑定事件
      const existingTablist = this.querySelector('.tab-list');
      if (existingTablist) {
        this._bindEvents();
        return;
      }

      // 否则是 remark 指令生成的，需要动态创建 tab 按钮
      const gid = groupCounter++;

      // 创建 tablist
      const tablistWrapper = document.createElement('div');
      tablistWrapper.className = 'tablist-wrapper';
      const tablist = document.createElement('div');
      tablist.className = 'tab-list';
      tablist.setAttribute('role', 'tablist');

      panels.forEach((panel, idx) => {
        const label = panel.getAttribute('data-label') || `Tab ${idx + 1}`;
        const tabId = `dtab-g${gid}-${idx}`;
        const panelId = `dtab-panel-g${gid}-${idx}`;

        // 设置 panel id & aria
        panel.id = panelId;
        panel.setAttribute('aria-labelledby', tabId);
        if (idx !== 0) panel.hidden = true;

        // 创建 tab 按钮
        const btn = document.createElement('button');
        btn.setAttribute('role', 'tab');
        btn.id = tabId;
        btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        btn.setAttribute('aria-controls', panelId);
        if (idx !== 0) btn.setAttribute('tabindex', '-1');
        btn.textContent = label;
        tablist.appendChild(btn);
      });

      tablistWrapper.appendChild(tablist);
      this.insertBefore(tablistWrapper, this.firstChild);

      this._bindEvents();
    }

    _bindEvents() {
      const tabs = this.querySelectorAll('[role="tab"]');
      const panels = this.querySelectorAll('[role="tabpanel"]');

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          this._switchTab(tab, tabs, panels);
        });

        tab.addEventListener('keydown', (e) => {
          const tabArray = Array.from(tabs);
          const currentIdx = tabArray.indexOf(tab);
          let newIdx = null;

          if (e.key === 'ArrowRight') {
            newIdx = (currentIdx + 1) % tabArray.length;
          } else if (e.key === 'ArrowLeft') {
            newIdx = (currentIdx - 1 + tabArray.length) % tabArray.length;
          } else if (e.key === 'Home') {
            newIdx = 0;
          } else if (e.key === 'End') {
            newIdx = tabArray.length - 1;
          }

          if (newIdx !== null) {
            e.preventDefault();
            this._switchTab(tabArray[newIdx], tabs, panels);
            tabArray[newIdx].focus();
          }
        });
      });
    }

    _switchTab(newTab, tabs, panels) {
      tabs.forEach((tab) => {
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
      });

      panels.forEach((panel) => {
        panel.hidden = true;
      });

      newTab.setAttribute('aria-selected', 'true');
      newTab.removeAttribute('tabindex');

      const panelId = newTab.getAttribute('aria-controls');
      if (panelId) {
        const panel = this.querySelector(`#${panelId}`);
        if (panel) panel.hidden = false;
      }
    }
  }

  customElements.define('x-tabs', XTabs);
}
