/**
 * OmniAI Hub — Pane Component Architecture
 * Renders individual column panes, micro-tab bar, tools, and persistent sub-tab iframes.
 */

import { MODEL_REGISTRY, createTabInstance } from './ModelRegistry.js';
import { globalBus } from './EventBus.js';

export class PaneComponent {
  constructor(column, colIndex, isFocused, isMaximized) {
    this.column = column;
    this.colIndex = colIndex;
    this.isFocused = isFocused;
    this.isMaximized = isMaximized;
  }

  render() {
    const colCard = document.createElement('section');
    colCard.className = `pane-column ${this.isFocused ? 'is-focused' : ''} ${this.isMaximized ? 'is-maximized' : ''}`;
    colCard.dataset.columnId = this.column.id;

    colCard.addEventListener('mousedown', () => {
      globalBus.emit('FOCUS_COLUMN', this.column.id);
    });

    // 1. Micro-Tab Bar (24px)
    const tabBar = document.createElement('header');
    tabBar.className = 'pane-tab-bar';

    const tabScroll = document.createElement('div');
    tabScroll.className = 'tab-scroll-strip';

    this.column.tabs.forEach((tab, tabIdx) => {
      const isTabActive = tabIdx === this.column.activeTabIndex;
      const tabPill = document.createElement('div');
      tabPill.className = `sub-tab-pill ${isTabActive ? 'active' : ''}`;
      tabPill.dataset.tabIndex = tabIdx;

      tabPill.innerHTML = `
        <span class="tab-gem-dot" style="background:${tab.color || '#a78bfa'};"></span>
        <span class="tab-title" title="Double click to rename">${this.escape(tab.title)}</span>
        <button class="tab-close-icon" title="Close sub-tab">✕</button>
      `;

      tabPill.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-close-icon')) return;
        globalBus.emit('SWITCH_SUB_TAB', { colId: this.column.id, tabIdx });
      });

      // Inline renaming
      const titleSpan = tabPill.querySelector('.tab-title');
      titleSpan.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        titleSpan.contentEditable = 'true';
        titleSpan.focus();
        document.execCommand('selectAll', false, null);
      });

      titleSpan.addEventListener('blur', () => {
        titleSpan.contentEditable = 'false';
        const newTitle = titleSpan.innerText.trim();
        if (newTitle) {
          tab.title = newTitle;
          globalBus.emit('TAB_RENAMED', { colId: this.column.id, tabIdx, newTitle });
        } else {
          titleSpan.innerText = tab.title;
        }
      });

      titleSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          titleSpan.blur();
        }
      });

      // Close sub-tab
      const closeBtn = tabPill.querySelector('.tab-close-icon');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        globalBus.emit('CLOSE_SUB_TAB', { colId: this.column.id, tabIdx });
      });

      tabScroll.appendChild(tabPill);
    });

    // Add sub-tab inline button
    const btnAddSubTab = document.createElement('button');
    btnAddSubTab.className = 'btn-add-subtab';
    btnAddSubTab.title = 'Add sub-tab to this column';
    btnAddSubTab.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>`;
    btnAddSubTab.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openBotPicker(btnAddSubTab, this.column.id);
    });
    tabScroll.appendChild(btnAddSubTab);

    // Right Action Tools
    const tools = document.createElement('div');
    tools.className = 'pane-tools-cluster';
    tools.innerHTML = `
      <button class="pane-tool-btn btn-reload" title="Reload Active Tab">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
      </button>
      <button class="pane-tool-btn btn-popout" title="Open in New Window">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
      </button>
      <button class="pane-tool-btn btn-maximize" title="${this.isMaximized ? 'Restore View' : 'Maximize Pane'}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${this.isMaximized
            ? `<path stroke-linecap="round" stroke-linejoin="round" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7"/>`
            : `<path stroke-linecap="round" stroke-linejoin="round" d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7"/>`}
        </svg>
      </button>
      <button class="pane-tool-btn btn-close-col" title="Close Column">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;

    tools.querySelector('.btn-reload').addEventListener('click', (e) => {
      e.stopPropagation();
      globalBus.emit('RELOAD_ACTIVE_TAB', this.column.id);
    });

    tools.querySelector('.btn-popout').addEventListener('click', (e) => {
      e.stopPropagation();
      const currentTab = this.column.tabs[this.column.activeTabIndex];
      if (currentTab?.url) window.open(currentTab.url, '_blank');
    });

    tools.querySelector('.btn-maximize').addEventListener('click', (e) => {
      e.stopPropagation();
      globalBus.emit('TOGGLE_MAXIMIZE', this.column.id);
    });

    tools.querySelector('.btn-close-col').addEventListener('click', (e) => {
      e.stopPropagation();
      globalBus.emit('CLOSE_COLUMN', this.column.id);
    });

    tabBar.appendChild(tabScroll);
    tabBar.appendChild(tools);
    colCard.appendChild(tabBar);

    // 2. Persistent Frame Viewport
    const framesViewport = document.createElement('div');
    framesViewport.className = 'pane-frames-viewport';

    this.column.tabs.forEach((tab, tabIdx) => {
      const isTabActive = tabIdx === this.column.activeTabIndex;
      const frameWrapper = document.createElement('div');
      frameWrapper.className = `tab-iframe-wrapper ${isTabActive ? 'active' : ''}`;
      frameWrapper.dataset.instanceId = tab.id;
      frameWrapper.dataset.tabIndex = tabIdx;

      // Celestial Eclipse Loader
      const veil = document.createElement('div');
      veil.className = 'frame-loading-veil';
      veil.innerHTML = `
        <div class="eclipse-ring-loader">
          <div class="ring-outer"></div>
          <div class="ring-inner"></div>
          <div class="ring-core"></div>
        </div>
        <span class="loading-label">Connecting to ${this.escape(tab.title)}</span>
      `;
      frameWrapper.appendChild(veil);

      const iframe = document.createElement('iframe');
      iframe.src = tab.url;
      iframe.title = tab.title;
      iframe.setAttribute('allow', 'clipboard-read; clipboard-write; microphone; camera; geolocation; autoplay');
      iframe.setAttribute('loading', 'eager');
      iframe.dataset.instanceId = tab.id;

      iframe.addEventListener('load', () => {
        veil.classList.add('loaded');
      });

      frameWrapper.appendChild(iframe);
      framesViewport.appendChild(frameWrapper);
    });

    colCard.appendChild(framesViewport);
    return colCard;
  }

  openBotPicker(anchorEl, colId) {
    document.querySelectorAll('.bot-picker-popover').forEach(p => p.remove());
    const popover = document.createElement('div');
    popover.className = 'bot-picker-popover';

    Object.values(MODEL_REGISTRY).forEach(bot => {
      const row = document.createElement('div');
      row.className = 'bot-picker-row';
      row.innerHTML = `
        <span style="width:5.5px;height:5.5px;border-radius:50%;background:${bot.color || '#a78bfa'};"></span>
        <span>${this.escape(bot.name)}</span>
      `;
      row.addEventListener('click', () => {
        globalBus.emit('ADD_SUB_TAB', { colId, botId: bot.id });
        popover.remove();
      });
      popover.appendChild(row);
    });

    anchorEl.parentElement.appendChild(popover);

    const onOutside = (evt) => {
      if (!popover.contains(evt.target) && evt.target !== anchorEl) {
        popover.remove();
        document.removeEventListener('click', onOutside);
      }
    };
    setTimeout(() => document.addEventListener('click', onOutside), 20);
  }

  escape(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}