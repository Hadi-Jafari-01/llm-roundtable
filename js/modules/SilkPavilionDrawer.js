/**
 * OmniAI Hub — The Silk Pavilion Controller (Atelier Studio Chamber)
 * Haute Digital Spatial Architecture: Central chamber & navigation gateway for all sub-studios.
 * Provides a pluggable registry, live studio cards, search/filter, and workspace statistics.
 */

import { globalBus } from './EventBus.js';
import { domDriverRegistry } from './DomDriverRegistry.js';

export class SilkPavilionDrawer {
  constructor(stateStore) {
    this.stateStore = stateStore;
    this.isOpen = false;
    this.searchQuery = '';

    // Extensible Studio Registry (Curated Atelier Chambers)
    this.studios = [
      {
        id: 'llm-council',
        title: 'The Celestial Council',
        subtitle: 'Autonomous Multi-Model Debate, Peer-Review & Synthesis',
        badge: 'Consensus',
        badgeColor: '#fbcfe8',
        color: '#f472b6',
        iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9M12 21a9 9 0 0 1-9-9"/><circle cx="12" cy="12" r="4"/><polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8 12 2" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>`,
        hotkey: '⌘⌥C',
        action: () => globalBus.emit('TRIGGER_COUNCIL_STUDIO')
      },
      {
        id: 'mirror-sanctuary',
        title: 'Silk Mirror Sanctuary',
        subtitle: 'Native Unified Chat & Real-Time Scraper',
        badge: 'Chat Studio',
        badgeColor: '#f472b6',
        color: '#f472b6',
        iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>`,
        hotkey: '⌘J',
        action: () => globalBus.emit('TRIGGER_MIRROR_STUDIO')
      },
      {
        id: 'dom-drivers',
        title: 'Neural DOM Driver Studio',
        subtitle: 'Live Selector Prober & Anti-Bot Armor',
        badge: 'Automation',
        badgeColor: '#c084fc',
        color: '#c084fc',
        iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>`,
        hotkey: '⌘⇧S',
        action: () => globalBus.emit('TRIGGER_DRIVER_STUDIO')
      }
    ];

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.drawerEl = document.getElementById('silk-pavilion-drawer');
    this.backdropEl = document.getElementById('silk-pavilion-backdrop');
    this.gridEl = document.getElementById('pavilion-studios-grid');
    this.searchInput = document.getElementById('pavilion-search-input');
    this.countPill = document.getElementById('pavilion-studios-count');
    this.statsEl = document.getElementById('pavilion-footer-stats');
    this.btnClose = document.getElementById('btn-close-pavilion-drawer');
  }

  bindEvents() {
    this.btnClose?.addEventListener('click', () => this.close());
    this.backdropEl?.addEventListener('click', () => this.close());

    // Search filter input
    this.searchInput?.addEventListener('input', (e) => {
      this.searchQuery = (e.target.value || '').trim().toLowerCase();
      this.renderGrid();
    });

    // Handle studio card clicks
    this.gridEl?.addEventListener('click', (e) => {
      const card = e.target.closest('.pavilion-studio-card');
      if (!card) return;

      const studioId = card.dataset.studioId;
      const studio = this.studios.find(s => s.id === studioId);
      if (studio && typeof studio.action === 'function') {
        this.close();
        // Allow spring transition to complete smoothly before launching target studio
        setTimeout(() => {
          studio.action();
        }, 120);
      }
    });

    // Clear search button in empty state
    this.gridEl?.addEventListener('click', (e) => {
      if (e.target.closest('.btn-clear-pavilion-search')) {
        if (this.searchInput) {
          this.searchInput.value = '';
          this.searchQuery = '';
          this.renderGrid();
          this.searchInput.focus();
        }
      }
    });

    // Global bus listeners
    globalBus.on('TRIGGER_SILK_PAVILION', () => this.toggle());
    globalBus.on('STATE_CHANGED', () => {
      if (this.isOpen) this.renderStats();
    });
  }

  /**
   * Pluggable registry method for third-party extensions and future panels
   */
  registerStudio(studioConfig) {
    if (!studioConfig || !studioConfig.id || !studioConfig.title) {
      console.warn('[SilkPavilion] Invalid studio registration config:', studioConfig);
      return false;
    }

    const existingIdx = this.studios.findIndex(s => s.id === studioConfig.id);
    if (existingIdx >= 0) {
      this.studios[existingIdx] = { ...this.studios[existingIdx], ...studioConfig };
    } else {
      this.studios.push(studioConfig);
    }

    if (this.isOpen) {
      this.renderGrid();
      this.renderStats();
    }
    return true;
  }

  unregisterStudio(id) {
    const idx = this.studios.findIndex(s => s.id === id);
    if (idx >= 0) {
      this.studios.splice(idx, 1);
      if (this.isOpen) {
        this.renderGrid();
        this.renderStats();
      }
      return true;
    }
    return false;
  }

  open() {
    this.isOpen = true;
    this.drawerEl?.classList.add('open');
    this.backdropEl?.classList.add('open');
    document.getElementById('btn-silk-pavilion')?.classList.add('active');

    this.renderGrid();
    this.renderStats();

    requestAnimationFrame(() => {
      this.searchInput?.focus();
    });

    globalBus.emit('SILK_PAVILION_OPENED');
  }

  close() {
    this.isOpen = false;
    this.drawerEl?.classList.remove('open');
    this.backdropEl?.classList.remove('open');
    document.getElementById('btn-silk-pavilion')?.classList.remove('active');

    if (this.searchInput) {
      this.searchInput.value = '';
      this.searchQuery = '';
    }

    globalBus.emit('SILK_PAVILION_CLOSED');
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  renderGrid() {
    if (!this.gridEl) return;

    const query = this.searchQuery;
    const filtered = this.studios.filter(studio => {
      if (!query) return true;
      return (
        studio.title.toLowerCase().includes(query) ||
        studio.subtitle.toLowerCase().includes(query) ||
        (studio.badge && studio.badge.toLowerCase().includes(query)) ||
        studio.id.toLowerCase().includes(query)
      );
    });

    if (this.countPill) {
      this.countPill.textContent = `${filtered.length} Studio${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      this.gridEl.innerHTML = `
        <div class="pavilion-empty-state">
          <div class="pavilion-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <p>No studios matching &ldquo;<strong>${this.escapeHtml(query)}</strong>&rdquo;</p>
          <button type="button" class="btn-clear-pavilion-search">Clear Search</button>
        </div>
      `;
      return;
    }

    this.gridEl.innerHTML = filtered.map(studio => {
      const studioColor = studio.color || '#c084fc';
      const badgeColor = studio.badgeColor || studioColor;

      return `
        <div class="pavilion-studio-card" data-studio-id="${studio.id}" style="--studio-color: ${studioColor};">
          <div class="pavilion-gem-badge" style="background: radial-gradient(circle, ${studioColor}30 0%, rgba(255, 255, 255, 0.04) 100%); border-color: ${studioColor}60; color: ${studioColor};">
            ${studio.iconSvg}
          </div>

          <div class="pavilion-studio-info">
            <div class="pavilion-studio-title-row">
              <h3 class="pavilion-studio-title">${this.escapeHtml(studio.title)}</h3>
              <span class="pavilion-studio-badge" style="background: ${badgeColor}18; color: ${badgeColor}; border: 1px solid ${badgeColor}35;">
                ${this.escapeHtml(studio.badge || 'Studio')}
              </span>
            </div>
            <p class="pavilion-studio-subtitle">${this.escapeHtml(studio.subtitle)}</p>
          </div>

          <div class="pavilion-card-action">
            ${studio.hotkey ? `<kbd class="pavilion-hotkey-chip">${this.escapeHtml(studio.hotkey)}</kbd>` : ''}
            <div class="pavilion-arrow-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderStats() {
    if (!this.statsEl) return;

    const cards = this.stateStore?.getCards() || [];
    const state = this.stateStore?.getState() || {};
    const drivers = domDriverRegistry?.getDrivers() || {};
    const driverCount = Object.keys(drivers).length;

    const layoutLabels = {
      atelier: 'Atelier Grid',
      ribbon: 'Panoramic Ribbon',
      duet: 'Duet Focus',
      hero: 'Hero Master',
      vertical: 'Columns',
      cascade: 'Cascade Stack',
      desktop: 'Full Desktop'
    };

    const currentLayout = layoutLabels[state.activeLayoutPreset] || 'Atelier Grid';
    const activeScope = state.syncScope === 'focused' ? 'Focused Pearl' : 'All Cards';

    this.statsEl.innerHTML = `
      <div class="pavilion-stat-card">
        <span class="pavilion-stat-label">Active AI Intelligences</span>
        <div class="pavilion-stat-value">
          <span class="pavilion-stat-dot"></span>
          <span>${cards.length} Loaded Cards</span>
        </div>
      </div>

      <div class="pavilion-stat-card">
        <span class="pavilion-stat-label">Neural DOM Drivers</span>
        <div class="pavilion-stat-value">
          <span class="pavilion-stat-dot" style="background: #c084fc; box-shadow: 0 0 6px #c084fc;"></span>
          <span>${driverCount} Active Profiles</span>
        </div>
      </div>

      <div class="pavilion-stat-card">
        <span class="pavilion-stat-label">Spatial Layout</span>
        <div class="pavilion-stat-value">
          <span class="pavilion-stat-dot" style="background: #818cf8; box-shadow: 0 0 6px #818cf8;"></span>
          <span>${currentLayout}</span>
        </div>
      </div>

      <div class="pavilion-stat-card">
        <span class="pavilion-stat-label">Dispatch Sync Scope</span>
        <div class="pavilion-stat-value">
          <span class="pavilion-stat-dot" style="background: #f472b6; box-shadow: 0 0 6px #f472b6;"></span>
          <span>${activeScope}</span>
        </div>
      </div>
    `;
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
