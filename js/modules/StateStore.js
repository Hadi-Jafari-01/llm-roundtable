/**
 * OmniAI Hub — State Store Architecture
 * Manages spatial canvas cards, presets, active tabs, and chrome.storage sync.
 */

import { globalBus } from './EventBus.js';

class StateStore {
  constructor() {
    this.modelCatalog = {
      chatgpt: {
        name: 'ChatGPT',
        url: 'https://chatgpt.com',
        color: '#6ee7b7', /* Soft Mint Sage */
        defaultWidth: 640,
        defaultHeight: 820
      },
      claude: {
        name: 'Claude',
        url: 'https://claude.ai',
        color: '#fed7aa', /* Warm Champagne Peach */
        defaultWidth: 640,
        defaultHeight: 820
      },
      gemini: {
        name: 'Gemini',
        url: 'https://gemini.google.com',
        color: '#93c5fd', /* Celestial Opal Blue */
        defaultWidth: 640,
        defaultHeight: 820
      },
      perplexity: {
        name: 'Perplexity',
        url: 'https://www.perplexity.ai',
        color: '#99f6e4', /* Delicate Aquamarine */
        defaultWidth: 640,
        defaultHeight: 820
      },
      deepseek: {
        name: 'DeepSeek',
        url: 'https://chat.deepseek.com',
        color: '#c4b5fd', /* Luminous Lilac */
        defaultWidth: 640,
        defaultHeight: 820
      },
      grok: {
        name: 'Grok',
        url: 'https://grok.com',
        color: '#f1f5f9', /* Frosted Pearl White */
        defaultWidth: 640,
        defaultHeight: 820
      },
      mistral: {
        name: 'Mistral Le Chat',
        url: 'https://chat.mistral.ai',
        color: '#fdba74',
        defaultWidth: 640,
        defaultHeight: 820
      },
      poe: {
        name: 'Poe',
        url: 'https://poe.com',
        color: '#f472b6',
        defaultWidth: 640,
        defaultHeight: 820
      },
      phind: {
        name: 'Phind',
        url: 'https://www.phind.com',
        color: '#a7f3d0',
        defaultWidth: 640,
        defaultHeight: 820
      }
    };

    this.state = {
      cards: [],
      activeCardId: null,
      activeLayoutPreset: 'atelier',
      autoArrangeOnAdd: true,
      autoFitOnArrange: true,
      cardSpacing: 24,
      cardSizePreset: 'balanced',
      syncScope: 'visible',
      zenMode: false,
      customBots: {}
    };

    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    try {
      const stored = await this.getStorageItem('omni_spatial_state');
      if (stored && typeof stored === 'object') {
        this.state = {
          ...this.state,
          ...stored,
          customBots: stored.customBots || {}
        };
        // Merge custom bots into catalog
        Object.assign(this.modelCatalog, this.state.customBots);
      }
    } catch (e) {
      console.warn('[StateStore] Could not load state from storage, using defaults:', e);
    }

    // Ensure every card has both title and name defined
    if (this.state.cards && Array.isArray(this.state.cards)) {
      this.state.cards.forEach(c => {
        if (!c.name && c.title) c.name = c.title;
        if (!c.title && c.name) c.title = c.name;
      });
    }

    // Seed default cards if empty
    if (!this.state.cards || this.state.cards.length === 0) {
      this.state.cards = [
        this.createCardInstance('chatgpt', 60, 60),
        this.createCardInstance('claude', 730, 60),
        this.createCardInstance('perplexity', 1400, 60)
      ];
      this.state.activeCardId = this.state.cards[0].id;
    }

    if (!this.state.activeCardId && this.state.cards.length > 0) {
      this.state.activeCardId = this.state.cards[0].id;
    }

    this.isInitialized = true;
    this.notify();
  }

  createCardInstance(botKey, x = 60, y = 60, customMeta = null) {
    const meta = customMeta || this.modelCatalog[botKey] || {
      name: 'AI Intelligence',
      url: 'about:blank',
      color: '#c4b5fd',
      defaultWidth: 640,
      defaultHeight: 820
    };

    const size = this.getDimensionsForPreset(this.state.cardSizePreset, meta);

    return {
      id: `card_${botKey}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      botKey,
      title: meta.name,
      name: meta.name,
      url: meta.url,
      color: meta.color,
      x,
      y,
      width: size.width,
      height: size.height,
      zIndex: 10
    };
  }

  getDimensionsForPreset(preset, meta = {}) {
    if (preset === 'compact') {
      return { width: 520, height: 720 };
    }
    if (preset === 'fill') {
      return { width: 720, height: 860 };
    }
    return {
      width: meta.defaultWidth || 640,
      height: meta.defaultHeight || 820
    };
  }

  getState() {
    return { ...this.state };
  }

  getModelCatalog() {
    return { ...this.modelCatalog };
  }

  getCards() {
    return [...this.state.cards];
  }

  getCard(cardId) {
    return this.state.cards.find(c => c.id === cardId) || null;
  }

  registerCustomBot(bot) {
    if (!bot || !bot.id) return;
    this.modelCatalog[bot.id] = bot;
    this.state.customBots[bot.id] = bot;
    this.saveState();
  }

  addCard(botKey, customMeta = null) {
    let newX = 60;
    let newY = 60;

    if (this.state.cards.length > 0) {
      const last = this.state.cards[this.state.cards.length - 1];
      newX = last.x + 40;
      newY = last.y + 40;
    }

    const card = this.createCardInstance(botKey, newX, newY, customMeta);
    this.state.cards.push(card);
    this.state.activeCardId = card.id;

    if (this.state.autoArrangeOnAdd) {
      this.arrangeCards(this.state.activeLayoutPreset, false);
    } else {
      this.saveState();
      this.notify();
    }

    if (this.state.autoFitOnArrange) {
      setTimeout(() => globalBus.emit('FIT_VIEWPORT'), 60);
    }
  }

  removeCard(cardId) {
    const idx = this.state.cards.findIndex(c => c.id === cardId);
    if (idx === -1) return;

    this.state.cards.splice(idx, 1);

    if (this.state.activeCardId === cardId) {
      this.state.activeCardId = this.state.cards.length > 0 ? this.state.cards[Math.max(0, idx - 1)].id : null;
    }

    this.saveState();
    this.notify();
  }

  updateCard(cardId, partial, shouldSave = true) {
    const card = this.state.cards.find(c => c.id === cardId);
    if (!card) return;

    Object.assign(card, partial);
    if (shouldSave) {
      this.saveState();
    }
    this.notify();
  }

  /**
   * CRITICAL BUGFIX: setActiveCard purely elevates z-index and active focus.
   * It NEVER mutates card coordinates or triggers tidyUp().
   */
  setActiveCard(cardId) {
    if (this.state.activeCardId === cardId) return;

    const card = this.state.cards.find(c => c.id === cardId);
    if (!card) return;

    this.state.activeCardId = cardId;

    // Bump z-index to bring to front
    const maxZ = this.state.cards.reduce((max, c) => Math.max(max, c.zIndex || 1), 10);
    card.zIndex = maxZ + 1;

    this.saveState();
    this.notify();
  }

  setLayoutPreset(preset) {
    this.state.activeLayoutPreset = preset;
    this.arrangeCards(preset, true);
  }

  setAutoArrangeOnAdd(enabled) {
    this.state.autoArrangeOnAdd = Boolean(enabled);
    this.saveState();
    this.notify();
  }

  setAutoFitOnArrange(enabled) {
    this.state.autoFitOnArrange = Boolean(enabled);
    this.saveState();
    this.notify();
  }

  setCardSpacing(spacing) {
    this.state.cardSpacing = spacing;
    this.arrangeCards(this.state.activeLayoutPreset, true);
  }

  setCardSizePreset(sizePreset) {
    this.state.cardSizePreset = sizePreset;
    this.state.cards.forEach(card => {
      const meta = this.modelCatalog[card.botKey] || {};
      const dims = this.getDimensionsForPreset(sizePreset, meta);
      card.width = dims.width;
      card.height = dims.height;
    });
    this.arrangeCards(this.state.activeLayoutPreset, true);
  }

  tidyUp() {
    this.arrangeCards(this.state.activeLayoutPreset, true);
  }

  arrangeCards(preset, autoFit = false) {
    const count = this.state.cards.length;
    if (count === 0) return;

    const gap = this.state.cardSpacing;
    const startX = 60;
    const startY = 60;

    switch (preset) {
      case 'ribbon': {
        let curX = startX;
        this.state.cards.forEach(card => {
          card.x = curX;
          card.y = startY;
          curX += card.width + gap;
        });
        break;
      }
      case 'duet': {
        const cols = 2;
        this.state.cards.forEach((card, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          card.x = startX + col * (card.width + gap);
          card.y = startY + row * (card.height + gap);
        });
        break;
      }
      case 'hero': {
        if (count === 1) {
          this.state.cards[0].x = startX;
          this.state.cards[0].y = startY;
        } else {
          // Card 0 is Hero
          const hero = this.state.cards[0];
          hero.x = startX;
          hero.y = startY;
          const sideX = startX + hero.width + gap;
          let curY = startY;
          for (let i = 1; i < count; i++) {
            const sideCard = this.state.cards[i];
            sideCard.x = sideX;
            sideCard.y = curY;
            curY += sideCard.height + gap;
          }
        }
        break;
      }
      case 'vertical': {
        let curY = startY;
        this.state.cards.forEach(card => {
          card.x = startX;
          card.y = curY;
          curY += card.height + gap;
        });
        break;
      }
      case 'cascade': {
        const stepX = 48;
        const stepY = 40;
        this.state.cards.forEach((card, i) => {
          card.x = startX + i * stepX;
          card.y = startY + i * stepY;
          card.zIndex = 10 + i;
        });
        break;
      }
      case 'atelier':
      default: {
        // Optimal Dynamic Grid
        const cols = Math.max(1, Math.min(count, Math.ceil(Math.sqrt(count))));
        const colHeights = new Array(cols).fill(startY);
        const colWidths = new Array(cols).fill(0);

        this.state.cards.forEach((card, i) => {
          const col = i % cols;
          colWidths[col] = Math.max(colWidths[col], card.width);
        });

        this.state.cards.forEach((card, i) => {
          const col = i % cols;
          let x = startX;
          for (let c = 0; c < col; c++) {
            x += colWidths[c] + gap;
          }
          card.x = x;
          card.y = colHeights[col];
          colHeights[col] += card.height + gap;
        });
        break;
      }
    }

    this.saveState();
    this.notify();

    if (autoFit && this.state.autoFitOnArrange) {
      setTimeout(() => globalBus.emit('FIT_VIEWPORT'), 60);
    }
  }

  setState(partial, notify = true) {
    Object.assign(this.state, partial);
    this.saveState();
    if (notify) this.notify();
  }

  notify() {
    globalBus.emit('STATE_CHANGED', this.getState());
  }

  async saveState() {
    try {
      const payload = {
        cards: this.state.cards,
        activeCardId: this.state.activeCardId,
        activeLayoutPreset: this.state.activeLayoutPreset,
        autoArrangeOnAdd: this.state.autoArrangeOnAdd,
        autoFitOnArrange: this.state.autoFitOnArrange,
        cardSpacing: this.state.cardSpacing,
        cardSizePreset: this.state.cardSizePreset,
        syncScope: this.state.syncScope,
        zenMode: this.state.zenMode,
        customBots: this.state.customBots
      };
      await this.setStorageItem('omni_spatial_state', payload);
    } catch (e) {
      console.warn('[StateStore] Failed to save state:', e);
    }
  }

  getStorageItem(key) {
    return new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try {
            const val = localStorage.getItem(key);
            resolve(val ? JSON.parse(val) : null);
          } catch (_) {
            resolve(null);
          }
        }
      }, 400);

      try {
        const storage = (typeof browser !== 'undefined' && browser.storage?.local)
          ? browser.storage.local
          : (typeof chrome !== 'undefined' && chrome.storage?.local ? chrome.storage.local : null);

        if (storage) {
          const p = storage.get([key], (res) => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timer);
              resolve(res && res[key] !== undefined ? res[key] : null);
            }
          });
          if (p && typeof p.then === 'function') {
            p.then((res) => {
              if (!resolved) {
                resolved = true;
                clearTimeout(timer);
                resolve(res && res[key] !== undefined ? res[key] : null);
              }
            }).catch(() => {
              if (!resolved) {
                resolved = true;
                clearTimeout(timer);
                resolve(null);
              }
            });
          }
        } else {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            const val = localStorage.getItem(key);
            resolve(val ? JSON.parse(val) : null);
          }
        }
      } catch (_) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          try {
            const val = localStorage.getItem(key);
            resolve(val ? JSON.parse(val) : null);
          } catch (__) {
            resolve(null);
          }
        }
      }
    });
  }

  setStorageItem(key, value) {
    return new Promise((resolve) => {
      let resolved = false;
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch (_) {}
          resolve();
        }
      }, 400);

      try {
        const storage = (typeof browser !== 'undefined' && browser.storage?.local)
          ? browser.storage.local
          : (typeof chrome !== 'undefined' && chrome.storage?.local ? chrome.storage.local : null);

        if (storage) {
          const p = storage.set({ [key]: value }, () => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timer);
              resolve();
            }
          });
          if (p && typeof p.then === 'function') {
            p.then(() => {
              if (!resolved) {
                resolved = true;
                clearTimeout(timer);
                resolve();
              }
            }).catch(() => {
              if (!resolved) {
                resolved = true;
                clearTimeout(timer);
                resolve();
              }
            });
          }
        } else {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            try {
              localStorage.setItem(key, JSON.stringify(value));
            } catch (_) {}
            resolve();
          }
        }
      } catch (_) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch (__) {}
          resolve();
        }
      }
    });
  }
}

export const stateStore = new StateStore();
