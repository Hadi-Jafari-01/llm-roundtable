/**
 * OmniAI Hub — Master Application Entry Point (ES Module)
 * Connects Infinite Spatial Canvas, Jewel Omnibar, Top Nano-Horizon Bar, and Modals.
 */

import { stateStore } from './modules/StateStore.js';
import { WorkspaceCanvas } from './modules/WorkspaceCanvas.js';
import { OmnibarController } from './modules/OmnibarController.js';
import { globalBus } from './modules/EventBus.js';
import { domDriverRegistry } from './modules/DomDriverRegistry.js';
import { SelectorStudioDrawer } from './modules/SelectorStudioDrawer.js';
import { MirrorChatStudio } from './modules/MirrorChatStudio.js';

class PopoverManager {
  constructor() {
    this.popovers = [];
  }

  register(triggerEl, popoverEl, wrapperEl) {
    if (!triggerEl || !popoverEl) return;
    this.popovers.push({ triggerEl, popoverEl, wrapperEl });

    triggerEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlyOpen = !popoverEl.classList.contains('hidden');
      this.closeAll();
      if (!isCurrentlyOpen) {
        popoverEl.classList.remove('hidden');
        triggerEl.classList.add('active');
        if (wrapperEl) wrapperEl.classList.add('active');
        this.clampToViewport(popoverEl);
      }
    });
  }

  clampToViewport(popoverEl) {
    if (!popoverEl) return;
    requestAnimationFrame(() => {
      const pad = 12;
      const rect = popoverEl.getBoundingClientRect();

      // Check right overflow
      if (rect.right > window.innerWidth - pad) {
        const overflowX = rect.right - (window.innerWidth - pad);
        const curRight = parseFloat(window.getComputedStyle(popoverEl).right) || 0;
        popoverEl.style.right = `${curRight + overflowX}px`;
      }

      // Check left overflow
      const updatedRect = popoverEl.getBoundingClientRect();
      if (updatedRect.left < pad) {
        popoverEl.style.left = `${pad}px`;
        popoverEl.style.right = 'auto';
      }

      // Check bottom overflow
      if (updatedRect.bottom > window.innerHeight - pad) {
        const availableHeight = window.innerHeight - updatedRect.top - pad;
        if (availableHeight > 160) {
          popoverEl.style.maxHeight = `${availableHeight}px`;
          popoverEl.style.overflowY = 'auto';
        }
      }
    });
  }

  closeAll() {
    this.popovers.forEach(({ triggerEl, popoverEl, wrapperEl }) => {
      popoverEl.classList.add('hidden');
      triggerEl.classList.remove('active');
      if (wrapperEl) wrapperEl.classList.remove('active');
    });
  }

  hasOpen() {
    return this.popovers.some(({ popoverEl }) => !popoverEl.classList.contains('hidden'));
  }
}

class OmniApp {
  constructor() {
    this.currentFocusedCardId = null;
    this.syncScope = 'all';
  }

  getFocusedCard() {
    const state = stateStore.getState();
    const cards = state?.cards || [];
    if (!cards.length) return null;

    // 1. Explicitly tracked focused ID
    if (this.currentFocusedCardId) {
      const card = cards.find(c => c.id === this.currentFocusedCardId);
      if (card) return card;
    }

    // 2. Check canvas instance properties
    if (this.canvas) {
      const canvasId = this.canvas.activeCardId || this.canvas.focusedCardId;
      if (canvasId) {
        const card = cards.find(c => c.id === canvasId);
        if (card) return card;
      }
    }

    // 3. Check stateStore properties
    const storeId = state.focusedCardId || state.activeCardId || state.selectedCardId;
    if (storeId) {
      const card = cards.find(c => c.id === storeId);
      if (card) return card;
    }

    // 4. Check active flag on card objects
    const flagCard = cards.find(c => c.isFocused || c.focused || c.active);
    if (flagCard) return flagCard;

    // 5. Check active tab in silk-tabs-container
    const activeTab = document.querySelector('#silk-tabs-container .silk-tab.active, #silk-tabs-container .active');
    if (activeTab) {
      const tabCardId = activeTab.dataset.cardId || activeTab.dataset.id || activeTab.getAttribute('data-card-id') || activeTab.getAttribute('data-id');
      if (tabCardId) {
        const card = cards.find(c => c.id === tabCardId);
        if (card) return card;
      }
    }

    // 6. Check active/focused card element on canvas
    const focusedCardEl = document.querySelector(
      '#spatial-cards-container .spatial-card.focused, #spatial-cards-container .spatial-card.active, ' +
      '#spatial-cards-container .focused, #spatial-cards-container .active'
    );
    if (focusedCardEl) {
      const cardId = focusedCardEl.dataset.cardId || focusedCardEl.dataset.id || focusedCardEl.id?.replace(/^card-/, '');
      if (cardId) {
        const card = cards.find(c => c.id === cardId);
        if (card) return card;
      }
    }

    // 7. Fallback to first available card
    return cards[0] || null;
  }

  setFocusedCard(cardId) {
    if (!cardId) return;
    this.currentFocusedCardId = cardId;

    try {
      if (typeof stateStore.setState === 'function') {
        stateStore.setState({ activeCardId: cardId, focusedCardId: cardId }, false);
      }
    } catch (_) {}

    try {
      if (typeof this.canvas?.focusCard === 'function') {
        this.canvas.focusCard(cardId);
      } else if (typeof this.canvas?.setActiveCard === 'function') {
        this.canvas.setActiveCard(cardId);
      }
    } catch (_) {}

    document.querySelectorAll('#spatial-cards-container .spatial-card, #spatial-cards-container [data-card-id]').forEach(el => {
      const id = el.dataset.cardId || el.dataset.id || el.id?.replace(/^card-/, '');
      const isTarget = id === cardId;
      el.classList.toggle('focused', isTarget);
      el.classList.toggle('active', isTarget);
    });

    document.querySelectorAll('#silk-tabs-container .silk-tab, #silk-tabs-container [data-card-id]').forEach(tab => {
      const id = tab.dataset.cardId || tab.dataset.id || tab.getAttribute('data-card-id') || tab.getAttribute('data-id');
      tab.classList.toggle('active', id === cardId);
    });

    this.updateStudioRibbon();
  }

  syncIframesIdentity() {
    const state = stateStore.getState();
    const cards = state?.cards || [];
    cards.forEach(card => {
      const cardEl = document.getElementById(card.id) || document.querySelector(
        `#spatial-cards-container [data-card-id="${card.id}"], #spatial-cards-container #card-${card.id}, #spatial-cards-container [data-id="${card.id}"]`
      );
      if (cardEl) {
        if (!cardEl.dataset.cardId) cardEl.dataset.cardId = card.id;
        const iframe = cardEl.querySelector('iframe');
        if (iframe) {
          if (iframe.name !== card.id) {
            iframe.name = card.id;
            iframe.setAttribute('name', card.id);
          }
          iframe.dataset.cardId = card.id;
          if (!iframe.id) iframe.id = `iframe-${card.id}`;
          try {
            iframe.contentWindow?.postMessage({
              action: 'SET_CARD_ID',
              cardId: card.id
            }, '*');
          } catch (_) {}
        }
      }
    });
  }

  updateStudioRibbon() {
    const ribbon = document.getElementById('studio-bots-ribbon');
    const textarea = document.getElementById('studio-prompt-textarea');
    const totalCountEl = document.getElementById('total-cards-count');
    const state = stateStore.getState();
    const cards = state?.cards || [];

    if (totalCountEl) {
      totalCountEl.textContent = cards.length;
    }

    const focusedCard = this.getFocusedCard();

    if (this.syncScope === 'focused') {
      const botName = focusedCard ? (focusedCard.title || focusedCard.name || 'Focused Intelligence') : 'Focused Intelligence';

      if (textarea && !textarea.value) {
        textarea.placeholder = `Compose prompt for ${botName}... (⌘↵ to send, Esc to collapse)`;
      }

      if (ribbon) {
        ribbon.innerHTML = '';
        cards.forEach(card => {
          const isFocused = focusedCard && card.id === focusedCard.id;
          const cardName = card.title || card.name || 'AI Intelligence';
          const pearl = document.createElement('button');
          pearl.type = 'button';
          pearl.title = isFocused ? `${cardName} (Active Target)` : `Switch target to ${cardName}`;
          pearl.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: ${isFocused ? '2px 8px' : '2px 5px'};
            background: ${isFocused ? 'rgba(192, 132, 252, 0.22)' : 'rgba(255, 255, 255, 0.05)'};
            border: 1px solid ${isFocused ? (card.color || '#c084fc') : 'rgba(255, 255, 255, 0.12)'};
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.18s ease;
            color: #f1f5f9;
            font-size: 11px;
            font-weight: ${isFocused ? '600' : '400'};
            opacity: ${isFocused ? '1' : '0.55'};
          `;
          pearl.innerHTML = `
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${card.color || '#c084fc'}; box-shadow: ${isFocused ? `0 0 8px ${card.color || '#c084fc'}` : 'none'}; flex-shrink: 0;"></span>
            ${isFocused ? `<span>${cardName}</span>` : ''}
          `;
          pearl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setFocusedCard(card.id);
          });
          ribbon.appendChild(pearl);
        });
      }
    } else {
      if (textarea && !textarea.value) {
        textarea.placeholder = `Compose prompt for all intelligences (${cards.length})... (⌘↵ to send, Esc to collapse)`;
      }
      if (ribbon) {
        ribbon.innerHTML = '';
        cards.forEach(card => {
          const cardName = card.title || card.name || 'AI Intelligence';
          const pearl = document.createElement('button');
          pearl.type = 'button';
          pearl.title = `${cardName} (Active in All Cards)`;
          pearl.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 14px;
            height: 14px;
            padding: 0;
            background: transparent;
            border: none;
            cursor: default;
          `;
          pearl.innerHTML = `
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${card.color || '#818cf8'}; box-shadow: 0 0 6px ${card.color || '#818cf8'}; opacity: 0.9;"></span>
          `;
          ribbon.appendChild(pearl);
        });
      }
    }
  }

  setupFocusTracking() {
    // Listen for canvas card clicks
    document.getElementById('spatial-cards-container')?.addEventListener('pointerdown', (e) => {
      const cardEl = e.target.closest('.spatial-card, [data-card-id], [class*="card"]');
      if (cardEl) {
        const cardId = cardEl.dataset.cardId || cardEl.dataset.id || cardEl.id?.replace(/^card-/, '');
        if (cardId) this.setFocusedCard(cardId);
      }
    }, true);

    // Listen for tabs ribbon clicks
    document.getElementById('silk-tabs-container')?.addEventListener('click', (e) => {
      const tabEl = e.target.closest('.silk-tab, [data-card-id], [class*="tab"]');
      if (tabEl) {
        const cardId = tabEl.dataset.cardId || tabEl.dataset.id || tabEl.getAttribute('data-card-id') || tabEl.getAttribute('data-id');
        if (cardId) this.setFocusedCard(cardId);
      }
    }, true);

    // Track active element if an iframe inside a card gets focus
    window.addEventListener('blur', () => {
      setTimeout(() => {
        const activeEl = document.activeElement;
        if (activeEl && activeEl.tagName === 'IFRAME') {
          const cardEl = activeEl.closest('.spatial-card, [data-card-id], [class*="card"]');
          const cardId = activeEl.name || activeEl.dataset.cardId || (cardEl && (cardEl.dataset.cardId || cardEl.dataset.id || cardEl.id?.replace(/^card-/, '')));
          if (cardId) this.setFocusedCard(cardId);
        }
      }, 50);
    });

    ['CARD_FOCUSED', 'CARD_SELECTED', 'CARD_ACTIVATED', 'ACTIVE_CARD_CHANGED'].forEach(evt => {
      globalBus.on(evt, (data) => {
        const id = (typeof data === 'string') ? data : (data?.id || data?.cardId);
        if (id) this.setFocusedCard(id);
      });
    });
  }

  applyDesktopLayout() {
    const state = stateStore.getState();
    const cards = state?.cards || [];
    if (!cards.length) return;

    const DESKTOP_WIDTH = 1280;
    const DESKTOP_HEIGHT = 850;
    const spacing = typeof state.cardSpacing === 'number' ? state.cardSpacing : 32;

    const updatedCards = cards.map((card, index) => {
      let x = 0;
      let y = 0;

      if (cards.length <= 3) {
        // Panoramic horizontal ribbon across wide workspace
        x = index * (DESKTOP_WIDTH + spacing);
        y = 0;
      } else {
        // 2-column wide desktop multi-screen grid
        const cols = 2;
        const col = index % cols;
        const row = Math.floor(index / cols);
        x = col * (DESKTOP_WIDTH + spacing);
        y = row * (DESKTOP_HEIGHT + spacing);
      }

      return {
        ...card,
        x,
        y,
        width: DESKTOP_WIDTH,
        height: DESKTOP_HEIGHT
      };
    });

    stateStore.setState({
      activeLayoutPreset: 'desktop',
      cardSizePreset: 'desktop',
      cards: updatedCards
    }, true);

    // Apply immediate dimensions to DOM cards
    updatedCards.forEach(card => {
      const cardEl = document.querySelector(
        `#spatial-cards-container [data-card-id="${card.id}"], #spatial-cards-container #card-${card.id}, #spatial-cards-container [data-id="${card.id}"]`
      );
      if (cardEl) {
        cardEl.style.width = `${DESKTOP_WIDTH}px`;
        cardEl.style.height = `${DESKTOP_HEIGHT}px`;
        cardEl.style.transform = `translate3d(${card.x}px, ${card.y}px, 0)`;
        cardEl.dataset.sizing = 'desktop';
      }
    });

    if (this.canvas && typeof this.canvas.render === 'function') {
      try { this.canvas.render(); } catch (_) {}
    }

    globalBus.emit('STATE_CHANGED', stateStore.getState());

    if (state.autoFitOnArrange !== false) {
      setTimeout(() => {
        globalBus.emit('FIT_VIEWPORT');
      }, 60);
    }
  }

  applyDesktopSizing() {
    const state = stateStore.getState();
    const cards = state?.cards || [];
    if (!cards.length) return;

    const DESKTOP_WIDTH = 1280;
    const DESKTOP_HEIGHT = 850;

    const updatedCards = cards.map(card => ({
      ...card,
      width: DESKTOP_WIDTH,
      height: DESKTOP_HEIGHT
    }));

    stateStore.setState({
      cardSizePreset: 'desktop',
      cards: updatedCards
    }, true);

    updatedCards.forEach(card => {
      const cardEl = document.querySelector(
        `#spatial-cards-container [data-card-id="${card.id}"], #spatial-cards-container #card-${card.id}, #spatial-cards-container [data-id="${card.id}"]`
      );
      if (cardEl) {
        cardEl.style.width = `${DESKTOP_WIDTH}px`;
        cardEl.style.height = `${DESKTOP_HEIGHT}px`;
        cardEl.dataset.sizing = 'desktop';
      }
    });

    if (typeof stateStore.tidyUp === 'function') {
      try { stateStore.tidyUp(); } catch (_) {}
    }

    if (this.canvas && typeof this.canvas.render === 'function') {
      try { this.canvas.render(); } catch (_) {}
    }

    globalBus.emit('STATE_CHANGED', stateStore.getState());

    if (state.autoFitOnArrange !== false) {
      setTimeout(() => {
        globalBus.emit('FIT_VIEWPORT');
      }, 60);
    }
  }

  async init() {
    await stateStore.init();
    await domDriverRegistry.init();

    // Intercept and handle desktop layout & sizing commands gracefully
    const origSetLayoutPreset = stateStore.setLayoutPreset?.bind(stateStore);
    stateStore.setLayoutPreset = (preset) => {
      if (preset === 'desktop') {
        this.applyDesktopLayout();
        return;
      }
      if (origSetLayoutPreset) origSetLayoutPreset(preset);
    };

    const origSetCardSizePreset = stateStore.setCardSizePreset?.bind(stateStore);
    stateStore.setCardSizePreset = (sizing) => {
      if (sizing === 'desktop') {
        this.applyDesktopSizing();
        return;
      }
      if (origSetCardSizePreset) origSetCardSizePreset(sizing);
    };

    const origTidyUp = stateStore.tidyUp?.bind(stateStore);
    stateStore.tidyUp = () => {
      const state = stateStore.getState();
      if (state?.activeLayoutPreset === 'desktop') {
        this.applyDesktopLayout();
        return;
      }
      if (origTidyUp) origTidyUp();
    };

    const origAddCard = stateStore.addCard?.bind(stateStore);
    stateStore.addCard = (botKey, customConfig) => {
      const state = stateStore.getState();
      if (state.cardSizePreset === 'desktop' || state.activeLayoutPreset === 'desktop') {
        const config = {
          ...(customConfig || {}),
          defaultWidth: 1280,
          defaultHeight: 850,
          width: 1280,
          height: 850
        };
        return origAddCard ? origAddCard(botKey, config) : null;
      }
      return origAddCard ? origAddCard(botKey, customConfig) : null;
    };

    const viewportEl = document.getElementById('spatial-viewport');
    this.canvas = new WorkspaceCanvas(viewportEl, null, stateStore);

    const omnibarDom = {
      island: document.getElementById('omnibar-island'),
      compactTrigger: document.getElementById('capsule-compact-trigger'),
      textarea: document.getElementById('studio-prompt-textarea'),
      btnSend: document.getElementById('btn-jewel-send'),
      btnClear: document.getElementById('btn-studio-clear'),
      btnCollapse: document.getElementById('btn-collapse-studio'),
      charCount: document.getElementById('studio-char-count'),
      botsRibbon: document.getElementById('studio-bots-ribbon'),
      visibleSyncCount: document.getElementById('visible-sync-count') || document.createElement('span'),
      totalCardsCount: document.getElementById('total-cards-count'),
      syncButtons: document.querySelectorAll('.sync-scope-btn')
    };

    this.omnibar = new OmnibarController(omnibarDom, stateStore);
    this.syncScope = (this.omnibar?.syncScope === 'focused') ? 'focused' : 'all';
    if (this.omnibar) {
      this.omnibar.syncScope = this.syncScope;
    }

    this.setupFocusTracking();
    this.setupOmnibarInteractions(omnibarDom);
    this.popoverManager = new PopoverManager();

    // Initialize Module A (Neural DOM Driver Studio) & Module B (The Silk Mirror Sanctuary)
    this.selectorStudio = new SelectorStudioDrawer(stateStore);
    this.mirrorChat = new MirrorChatStudio(stateStore);

    this.setupTopNavigation();
    this.setupModals();
    this.setupGlobalHotkeys();
    this.setupPwaInstall();
    this.setupWindowControls();

    // Initial render
    this.canvas.render();

    setTimeout(() => {
      this.syncIframesIdentity();
      const initialCard = this.getFocusedCard();
      if (initialCard) {
        this.setFocusedCard(initialCard.id);
      }
    }, 150);

    console.log('[OmniAI Hub] Obsidian Silk Spatial Canvas Active.');
  }

  setupOmnibarInteractions(dom) {
    const { island, compactTrigger, textarea, btnSend, btnClear, btnCollapse, charCount } = dom;
    const studio = document.getElementById('capsule-studio');
    const placeholderEl = compactTrigger?.querySelector('.capsule-placeholder');
    const origPlaceholder = placeholderEl ? placeholderEl.textContent : 'Dispatch prompt across active intelligences...';

    const collapseOmnibar = () => {
      if (typeof this.omnibar?.collapse === 'function') {
        this.omnibar.collapse();
      }
      island?.classList.remove('expanded');
      studio?.classList.add('hidden');
      compactTrigger?.classList.remove('hidden');
      textarea?.blur();
    };

    const expandOmnibar = () => {
      this.popoverManager?.closeAll();
      this.syncIframesIdentity();
      this.updateStudioRibbon();

      if (typeof this.omnibar?.expand === 'function') {
        this.omnibar.expand();
      }
      island?.classList.add('expanded');
      compactTrigger?.classList.add('hidden');
      studio?.classList.remove('hidden');
      requestAnimationFrame(() => {
        textarea?.focus();
      });
    };

    const triggerDispatchFeedback = (targetName, count) => {
      if (!compactTrigger) return;
      compactTrigger.classList.remove('pill-dispatched');
      void compactTrigger.offsetWidth;
      compactTrigger.classList.add('pill-dispatched');

      if (placeholderEl) {
        if (targetName) {
          placeholderEl.textContent = `⚡ Dispatched to ${targetName}!`;
        } else {
          placeholderEl.textContent = `⚡ Dispatched to ${count} intelligence${count > 1 ? 's' : ''}!`;
        }
        setTimeout(() => {
          placeholderEl.textContent = origPlaceholder;
          compactTrigger.classList.remove('pill-dispatched');
        }, 2200);
      }
    };

    // Scope button click listeners (All Cards vs Focused Pearl)
    document.querySelectorAll('.sync-scope-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const scope = btn.dataset.sync;
        this.syncScope = (scope === 'focused') ? 'focused' : 'all';
        if (this.omnibar) this.omnibar.syncScope = this.syncScope;

        document.querySelectorAll('.sync-scope-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.sync === this.syncScope);
        });

        this.updateStudioRibbon();
      });
    });

    // Textarea input and clear button handling
    textarea?.addEventListener('input', () => {
      const len = textarea.value.length;
      if (charCount) charCount.textContent = len;
      if (btnClear) {
        btnClear.classList.toggle('hidden', len === 0);
      }
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px';
    });

    btnClear?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (textarea) {
        textarea.value = '';
        textarea.style.height = 'auto';
        textarea.focus();
      }
      if (charCount) charCount.textContent = '0';
      btnClear.classList.add('hidden');
    });

    // Core focused-aware dispatch engine
    const executeDispatch = (promptOverride) => {
      const text = (typeof promptOverride === 'string' ? promptOverride : textarea?.value || '').trim();
      if (!text) return;

      const state = stateStore.getState();
      const cards = state?.cards || [];
      if (!cards.length) return;

      const messageId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      this.syncIframesIdentity();

      if (this.syncScope === 'focused') {
        const focusedCard = this.getFocusedCard();
        if (!focusedCard) return;

        // 1. Target ONLY the focused card's iframe window directly via postMessage
        const cardEl = document.querySelector(
          `#spatial-cards-container [data-card-id="${focusedCard.id}"], #spatial-cards-container #card-${focusedCard.id}, #spatial-cards-container [data-id="${focusedCard.id}"]`
        );
        let targetIframe = cardEl ? cardEl.querySelector('iframe') : null;
        if (!targetIframe) {
          const allIframes = document.querySelectorAll('#spatial-cards-container iframe');
          for (const ifr of allIframes) {
            if (ifr.name === focusedCard.id || ifr.dataset.cardId === focusedCard.id || (focusedCard.url && ifr.src?.includes(focusedCard.url))) {
              targetIframe = ifr;
              break;
            }
          }
        }

        const focusedDriver = focusedCard.url ? domDriverRegistry.getDriverForUrl(focusedCard.url) : domDriverRegistry.getDrivers().generic;

        let delivered = false;
        if (targetIframe && targetIframe.contentWindow) {
          try {
            targetIframe.contentWindow.postMessage({
              action: 'OMNI_DISPATCH_PROMPT',
              prompt: text,
              messageId: messageId,
              targetCardId: focusedCard.id,
              driver: focusedDriver
            }, '*');
            delivered = true;
          } catch (err) {
            console.warn('[OmniAI Hub] Direct postMessage failed:', err);
          }
        }

        // ارسال رله پس‌زمینه تنها در صورت ناموفق بودن ارتباط مستقیم
        if (!delivered) {
          let targetHost = '';
          try {
            if (focusedCard.url) {
              targetHost = new URL(focusedCard.url).hostname;
            }
          } catch (_) {}

          const runtimeApi = (typeof browser !== 'undefined' && browser.runtime) 
            ? browser.runtime 
            : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null);

          if (runtimeApi?.sendMessage) {
            runtimeApi.sendMessage({
              action: 'RELAY_PROMPT',
              prompt: text,
              messageId: messageId,
              targetCardId: focusedCard.id,
              targetHost: targetHost,
              scope: 'focused'
            });
          }
        }

        // Reset studio inputs
        if (textarea) {
          textarea.value = '';
          textarea.style.height = 'auto';
        }
        if (charCount) charCount.textContent = '0';
        btnClear?.classList.add('hidden');

        collapseOmnibar();
        triggerDispatchFeedback(focusedCard.name || 'focused intelligence', 1);

      } else {
        // Broadcast to ALL cards
        const allIframes = document.querySelectorAll('#spatial-cards-container iframe');
        allIframes.forEach(ifr => {
          const cardId = ifr.name || ifr.dataset.cardId;
          const cardObj = cards.find(c => c.id === cardId);
          const cardDriver = cardObj?.url ? domDriverRegistry.getDriverForUrl(cardObj.url) : domDriverRegistry.getDrivers().generic;

          try {
            ifr.contentWindow?.postMessage({
              action: 'OMNI_DISPATCH_PROMPT',
              prompt: text,
              messageId: messageId,
              driver: cardDriver
            }, '*');
          } catch (err) {
            console.warn('[OmniAI Hub] postMessage to frame failed:', err);
          }
        });

        const runtimeApi = (typeof browser !== 'undefined' && browser.runtime) 
          ? browser.runtime 
          : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null);

        if (runtimeApi?.sendMessage) {
          runtimeApi.sendMessage({
            action: 'RELAY_PROMPT',
            prompt: text,
            messageId: messageId,
            scope: 'all'
          });
        }

        if (textarea) {
          textarea.value = '';
          textarea.style.height = 'auto';
        }
        if (charCount) charCount.textContent = '0';
        btnClear?.classList.add('hidden');

        collapseOmnibar();
        triggerDispatchFeedback(null, cards.length);
      }
    };

    // Primary send triggers using capture phase
    btnSend?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      executeDispatch();
    }, true);

    textarea?.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        executeDispatch();
      }
    }, true);

    // Intercept OmnibarController internal dispatch methods to ensure focused awareness
    const dispatchMethodNames = [
      'dispatch', 'send', 'sendPrompt', 'submit', 'submitPrompt',
      'executeDispatch', 'dispatchPrompt', 'handleSend', 'broadcastPrompt'
    ];
    dispatchMethodNames.forEach(fnName => {
      if (this.omnibar && typeof this.omnibar[fnName] === 'function') {
        this.omnibar[fnName] = (promptText) => {
          executeDispatch(promptText);
        };
      }
    });

    // Clicking compact resting pill opens studio
    compactTrigger?.addEventListener('click', () => {
      expandOmnibar();
    });

    // Collapse button in studio header
    btnCollapse?.addEventListener('click', (e) => {
      e.stopPropagation();
      collapseOmnibar();
    });

    // Click outside studio collapses it
    document.addEventListener('pointerdown', (e) => {
      const isExpanded = island?.classList.contains('expanded') ||
                         (studio && !studio.classList.contains('hidden'));
      if (isExpanded) {
        const insideOmnibar = e.target.closest('#omnibar-island');
        if (!insideOmnibar) {
          collapseOmnibar();
        }
      }
    });

    // Global bus handler for Cmd+K
    globalBus.on('OPEN_OMNIBAR', () => {
      expandOmnibar();
    });
  }

  setupTopNavigation() {
    const appRoot = document.getElementById('app');

    // 1. Register Collapsible Popover Islands
    const btnTriggerView = document.getElementById('btn-trigger-view');
    const popoverView = document.getElementById('popover-view-controls');
    const wrapperView = document.getElementById('wrapper-view-controls');
    this.popoverManager.register(btnTriggerView, popoverView, wrapperView);

    const btnQuickAddTab = document.getElementById('btn-quick-add-tab') || document.getElementById('btn-quick-launcher');
    const popoverQuickLauncher = document.getElementById('quick-launcher-popover');
    const wrapperQuickLauncher = document.querySelector('.quick-launcher-wrapper');
    this.popoverManager.register(btnQuickAddTab, popoverQuickLauncher, wrapperQuickLauncher);

    const btnLayoutMenu = document.getElementById('btn-layout-menu') || document.getElementById('btn-auto-arrange-menu');
    const popoverLayout = document.getElementById('auto-arrange-popover');
    const wrapperLayout = document.getElementById('wrapper-layout-menu');
    this.popoverManager.register(btnLayoutMenu, popoverLayout, wrapperLayout);

    const btnToolsMenu = document.getElementById('btn-tools-menu');
    const popoverTools = document.getElementById('popover-tools-menu');
    const wrapperTools = document.getElementById('wrapper-tools-menu');
    this.popoverManager.register(btnToolsMenu, popoverTools, wrapperTools);

    // Module A: Trigger Neural DOM Driver Studio
    const btnDriverStudio = document.getElementById('btn-driver-studio');
    btnDriverStudio?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.popoverManager.closeAll();
      this.selectorStudio?.toggle();
    });

    // Module B: Trigger Native Silk Mirror Sanctuary Chat
    const btnMirrorChat = document.getElementById('btn-mirror-chat');
    btnMirrorChat?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.popoverManager.closeAll();
      const focusedCard = this.getFocusedCard();
      if (focusedCard) {
        this.mirrorChat.selectTargetCard(focusedCard.id);
      }
      this.mirrorChat?.toggle();
    });

    // Global Click Outside Listener for Popovers
    document.addEventListener('click', (e) => {
      const insidePopover = e.target.closest('.spatial-popover-menu, .quick-launcher-popover');
      const insideTrigger = e.target.closest('#btn-trigger-view, #btn-quick-add-tab, #btn-quick-launcher, #btn-layout-menu, #btn-auto-arrange-menu, #btn-tools-menu');
      if (!insidePopover && !insideTrigger) {
        this.popoverManager.closeAll();
      }
    });

    // 2. View Optics & Zoom Controls
    const updateZoomReadouts = (scale) => {
      if (typeof scale !== 'number' || isNaN(scale)) return;
      const pct = `${Math.round(scale * 100)}%`;
      const compactEl = document.getElementById('zoom-readout-compact');
      if (compactEl) compactEl.textContent = pct;
      const popoverBtn = document.getElementById('zoom-readout-btn');
      if (popoverBtn) popoverBtn.textContent = pct;
    };

    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      globalBus.emit('ZOOM_OUT');
    });

    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      globalBus.emit('ZOOM_IN');
    });

    document.getElementById('zoom-readout-btn')?.addEventListener('click', () => {
      globalBus.emit('ZOOM_RESET');
    });

    document.getElementById('btn-fit-all')?.addEventListener('click', () => {
      globalBus.emit('FIT_VIEWPORT');
      this.popoverManager.closeAll();
    });

    // 3. Zen Mode Immersion Toggle
    const btnZen = document.getElementById('btn-zen-mode');
    btnZen?.addEventListener('click', () => {
      const state = stateStore.getState();
      const nextZen = !state.zenMode;
      btnZen.classList.toggle('active', nextZen);
      appRoot.classList.toggle('zen-mode', nextZen);
      stateStore.setState({ zenMode: nextZen }, false);
      this.popoverManager.closeAll();
    });

    // 4. Fluid Silk Tab Strip Horizontal Wheel Navigation
    const tabsContainer = document.getElementById('silk-tabs-container');
    tabsContainer?.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        tabsContainer.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    // 5. Layout Architecture Presets
    document.querySelectorAll('.layout-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.layout-preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const preset = chip.dataset.preset;
        if (preset === 'desktop') {
          this.applyDesktopLayout();
        } else {
          stateStore.setLayoutPreset(preset);
        }
      });
    });

    // Auto-Arrange Switches
    const switchAutoArrange = document.getElementById('switch-auto-arrange');
    switchAutoArrange?.addEventListener('change', (e) => {
      stateStore.setAutoArrangeOnAdd(e.target.checked);
      document.getElementById('auto-arrange-status-dot')?.classList.toggle('disabled', !e.target.checked);
    });

    const switchAutoFit = document.getElementById('switch-auto-fit');
    switchAutoFit?.addEventListener('change', (e) => {
      stateStore.setAutoFitOnArrange(e.target.checked);
    });

    // Spacing Preset Chips
    document.querySelectorAll('.spacing-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.spacing-preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        stateStore.setCardSpacing(parseInt(chip.dataset.spacing, 10));
      });
    });

    // Sizing Preset Chips
    document.querySelectorAll('.sizing-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.sizing-preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const sizing = chip.dataset.sizing;
        if (sizing === 'desktop') {
          this.applyDesktopSizing();
        } else {
          stateStore.setCardSizePreset(sizing);
        }
      });
    });

    // Tidy Up Action
    document.getElementById('btn-tidy-up-now')?.addEventListener('click', () => {
      const state = stateStore.getState();
      if (state?.activeLayoutPreset === 'desktop') {
        this.applyDesktopLayout();
      } else {
        stateStore.tidyUp();
      }
      this.popoverManager.closeAll();
    });

    // 6. Tools & Settings Menu Items
    document.getElementById('menu-item-custom-bot')?.addEventListener('click', () => {
      this.popoverManager.closeAll();
      document.getElementById('modal-custom-bot')?.classList.remove('hidden');
      document.getElementById('custom-bot-name')?.focus();
    });

    document.getElementById('btn-open-custom-modal')?.addEventListener('click', () => {
      this.popoverManager.closeAll();
      document.getElementById('modal-custom-bot')?.classList.remove('hidden');
      document.getElementById('custom-bot-name')?.focus();
    });

    document.getElementById('menu-item-shortcuts')?.addEventListener('click', () => {
      this.popoverManager.closeAll();
      document.getElementById('modal-shortcuts')?.classList.remove('hidden');
    });

    // Quick AI Model Launcher Popover
    this.setupQuickLauncher();

    // Auto-fit on initial render after small layout tick
    setTimeout(() => {
      globalBus.emit('FIT_VIEWPORT');
    }, 120);

    // Dynamic Zoom Listeners
    globalBus.on('ZOOM_CHANGED', (scale) => updateZoomReadouts(scale));
    globalBus.on('SCALE_CHANGED', (scale) => updateZoomReadouts(scale));

    // Sync button & switches states on store changes
    globalBus.on('STATE_CHANGED', (state) => {
      btnZen?.classList.toggle('active', Boolean(state.zenMode));
      appRoot.classList.toggle('zen-mode', Boolean(state.zenMode));

      if (state.scale !== undefined) updateZoomReadouts(state.scale);
      else if (state.zoom !== undefined) updateZoomReadouts(state.zoom);

      document.querySelectorAll('.layout-preset-chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.preset === state.activeLayoutPreset);
      });

      if (switchAutoArrange) switchAutoArrange.checked = Boolean(state.autoArrangeOnAdd);
      if (switchAutoFit) switchAutoFit.checked = Boolean(state.autoFitOnArrange);
      document.getElementById('auto-arrange-status-dot')?.classList.toggle('disabled', !state.autoArrangeOnAdd);

      document.querySelectorAll('.spacing-preset-chip').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.spacing, 10) === state.cardSpacing);
      });

      document.querySelectorAll('.sizing-preset-chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sizing === state.cardSizePreset);
      });

      this.syncIframesIdentity();
      this.updateStudioRibbon();
    });
  }

  setupQuickLauncher() {
    const quickGrid = document.getElementById('quick-models-grid');
    if (!quickGrid) return;

    // Populate standard catalog items
    const catalog = stateStore.getModelCatalog();
    quickGrid.innerHTML = '';
    Object.keys(catalog).forEach(botKey => {
      const bot = catalog[botKey];
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'quick-launcher-chip';
      item.innerHTML = `
        <span class="quick-chip-color" style="background: ${bot.color}; box-shadow: 0 0 10px ${bot.color}40;"></span>
        <span class="quick-chip-name">${bot.name}</span>
      `;
      item.addEventListener('click', () => {
        stateStore.addCard(botKey);
        this.popoverManager.closeAll();
      });
      quickGrid.appendChild(item);
    });
  }

  setupModals() {
    const modalCustomBot = document.getElementById('modal-custom-bot');
    const modalShortcuts = document.getElementById('modal-shortcuts');
    const formCustomBot = document.getElementById('form-custom-bot');

    // Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById(btn.dataset.closeModal).classList.add('hidden');
      });
    });

    document.querySelectorAll('.modal-veil').forEach(veil => {
      veil.addEventListener('click', (e) => {
        if (e.target === veil) veil.classList.add('hidden');
      });
    });

    // Quick presets in custom bot modal
    document.querySelectorAll('.quick-bot-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('custom-bot-name').value = chip.dataset.name;
        document.getElementById('custom-bot-url').value = chip.dataset.url;
      });
    });

    // Form submit
    formCustomBot.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('custom-bot-name').value.trim();
      let url = document.getElementById('custom-bot-url').value.trim();

      if (name && url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = `https://${url}`;
        }
        const botKey = `custom_${Date.now()}`;
        const newBot = {
          name,
          url,
          color: '#c084fc',
          defaultWidth: 600,
          defaultHeight: 820
        };

        stateStore.registerCustomBot({ id: botKey, ...newBot });
        stateStore.addCard(botKey, newBot);

        modalCustomBot.classList.add('hidden');
        formCustomBot.reset();
      }
    });
  }

  setupPwaInstall() {
    const btnInstall = document.getElementById('menu-item-pwa-install') || document.getElementById('btn-install-pwa');
    if (!btnInstall) return;

    let deferredPrompt = null;

    // Catch browser PWA install event if fired (Chromium/Edge)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });

    btnInstall.addEventListener('click', async () => {
      // Visual click feedback
      btnInstall.style.transform = 'scale(0.88)';
      setTimeout(() => { btnInstall.style.transform = ''; }, 160);

      // 1. If native PWA prompt is supported by browser (Chrome/Edge)
      if (deferredPrompt) {
        try {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            btnInstall.classList.add('hidden');
          }
          deferredPrompt = null;
          return;
        } catch (err) {
          console.warn('[OmniAI Hub] PWA prompt failed:', err);
        }
      }

      // 2. Direct standalone maximized window for Firefox & extensions (taskbar visible, controls unlocked)
      const winApi = (typeof browser !== 'undefined' && browser.windows) 
        ? browser.windows 
        : (typeof chrome !== 'undefined' && chrome.windows ? chrome.windows : null);

      const runtimeApi = (typeof browser !== 'undefined' && browser.runtime) 
        ? browser.runtime 
        : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null);

      const hubUrl = runtimeApi?.getURL ? runtimeApi.getURL('newtab.html') : window.location.href;

        const cleanAppUrl = hubUrl + (hubUrl.includes('?') ? '&' : '?') + 'mode=app';

        // Open standalone app window without browser URL bar and features
        if (winApi?.create) {
          try {
            await winApi.create({
              url: cleanAppUrl,
              type: 'popup'
            });
            return;
          } catch (err) {
            console.warn('[OmniAI Hub] Direct popup window create failed:', err);
          }
        }

        // 3. Fallback message to background script
        if (runtimeApi?.sendMessage) {
          runtimeApi.sendMessage({ action: 'OPEN_DESKTOP_WINDOW' });
        } else {
          window.open(cleanAppUrl, '_blank', 'popup=yes');
        }

        this.popoverManager?.closeAll();
      });

    window.addEventListener('appinstalled', () => {
      btnInstall.classList.add('hidden');
    });

    // Automatically hide button if already running inside the clean desktop app window
    if (
      window.location.search.includes('mode=app') ||
      window.matchMedia('(display-mode: standalone)').matches ||
      !window.toolbar?.visible
    ) {
      btnInstall.classList.add('hidden');
    }
  }

  async getCurrentWindow() {
    const winApi = (typeof browser !== 'undefined' && browser.windows) 
      ? browser.windows 
      : (typeof chrome !== 'undefined' && chrome.windows ? chrome.windows : null);

    if (!winApi?.getCurrent) return null;

    try {
      const res = winApi.getCurrent();
      if (res && typeof res.then === 'function') {
        return await res;
      }
      return await new Promise(resolve => winApi.getCurrent(resolve));
    } catch {
      return null;
    }
  }

  async updateWindow(winId, updateInfo) {
    const winApi = (typeof browser !== 'undefined' && browser.windows) 
      ? browser.windows 
      : (typeof chrome !== 'undefined' && chrome.windows ? chrome.windows : null);

    if (!winApi?.update) return null;

    try {
      const res = winApi.update(winId, updateInfo);
      if (res && typeof res.then === 'function') {
        return await res;
      }
      return await new Promise(resolve => winApi.update(winId, updateInfo, resolve));
    } catch {
      return null;
    }
  }

  async minimizeWindow() {
    const win = await this.getCurrentWindow();
    if (win?.id) {
      await this.updateWindow(win.id, { state: 'minimized' });
    }
  }

  isWindowMaximized(win) {
    if (!win) return false;
    if (win.state === 'maximized') return true;
    const sWidth = window.screen?.availWidth || 1440;
    const sHeight = window.screen?.availHeight || 900;
    const widthDiff = Math.abs((win.width || 0) - sWidth);
    const heightDiff = Math.abs((win.height || 0) - sHeight);
    return widthDiff < 35 && heightDiff < 35;
  }

  async fitWindowToWorkArea() {
    const win = await this.getCurrentWindow();
    if (!win?.id) return;

    const sLeft = window.screen?.availLeft || 0;
    const sTop = window.screen?.availTop || 0;
    const sWidth = window.screen?.availWidth || 1440;
    const sHeight = window.screen?.availHeight || 900;

    await this.updateWindow(win.id, {
      state: 'normal',
      left: sLeft,
      top: sTop,
      width: sWidth,
      height: sHeight
    });

    const btnMax = document.getElementById('btn-win-max');
    btnMax?.querySelector('.icon-max')?.classList.add('hidden');
    btnMax?.querySelector('.icon-restore')?.classList.remove('hidden');
  }

  async toggleWindowMaximize() {
    const win = await this.getCurrentWindow();
    if (!win?.id) return;

    const btnMax = document.getElementById('btn-win-max');
    const iconMax = btnMax?.querySelector('.icon-max');
    const iconRestore = btnMax?.querySelector('.icon-restore');

    const sLeft = window.screen?.availLeft || 0;
    const sTop = window.screen?.availTop || 0;
    const sWidth = window.screen?.availWidth || 1440;
    const sHeight = window.screen?.availHeight || 900;

    const isMax = this.isWindowMaximized(win);

    if (isMax) {
      // Restore to centered window
      const targetW = Math.round(sWidth * 0.85);
      const targetH = Math.round(sHeight * 0.88);
      const targetLeft = Math.round((sWidth - targetW) / 2) + sLeft;
      const targetTop = Math.round((sHeight - targetH) / 2) + sTop;

      await this.updateWindow(win.id, {
        state: 'normal',
        left: targetLeft,
        top: targetTop,
        width: targetW,
        height: targetH
      });

      iconMax?.classList.remove('hidden');
      iconRestore?.classList.add('hidden');
    } else {
      // Maximize to exact desktop work area - taskbar is NEVER occupied
      await this.updateWindow(win.id, {
        state: 'normal',
        left: sLeft,
        top: sTop,
        width: sWidth,
        height: sHeight
      });

      iconMax?.classList.add('hidden');
      iconRestore?.classList.remove('hidden');
    }
  }

  async setupWindowControls() {
    const controlsCluster = document.getElementById('window-controls-cluster');
    if (!controlsCluster) return;

    const isStandalone = 
      window.location.search.includes('mode=app') ||
      window.matchMedia('(display-mode: standalone)').matches ||
      !window.toolbar?.visible;

    // Show active in-app window controls in standalone app mode
    if (isStandalone) {
      controlsCluster.classList.remove('hidden');
      // Automatically fit window to desktop work area on initial launch
      await this.fitWindowToWorkArea();
    }

    const btnMin = document.getElementById('btn-win-min');
    const btnMax = document.getElementById('btn-win-max');
    const btnClose = document.getElementById('btn-win-close');
    const topNav = document.getElementById('top-nav');

    btnMin?.addEventListener('click', () => this.minimizeWindow());
    btnMax?.addEventListener('click', () => this.toggleWindowMaximize());
    btnClose?.addEventListener('click', () => window.close());

    // Double-click top navigation ribbon to toggle maximize/restore
    topNav?.addEventListener('dblclick', (e) => {
      if (e.target.closest('button, input, textarea, a, select')) return;
      this.toggleWindowMaximize();
    });

    // Dynamic sync of maximize/restore button icon
    const syncMaxButtonState = async () => {
      const currentWin = await this.getCurrentWindow();
      if (!currentWin) return;
      const isMax = this.isWindowMaximized(currentWin);
      btnMax?.querySelector('.icon-max')?.classList.toggle('hidden', isMax);
      btnMax?.querySelector('.icon-restore')?.classList.toggle('hidden', !isMax);
    };

    window.addEventListener('resize', syncMaxButtonState);

    const winApi = (typeof browser !== 'undefined' && browser.windows) 
      ? browser.windows 
      : (typeof chrome !== 'undefined' && chrome.windows ? chrome.windows : null);

    if (winApi?.onBoundsChanged) {
      winApi.onBoundsChanged.addListener(syncMaxButtonState);
    }
  }

  setupGlobalHotkeys() {
    window.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K: Focus Omnibar Studio
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.popoverManager?.closeAll();
        globalBus.emit('OPEN_OMNIBAR');
      }

      // Cmd/Ctrl + Z: Toggle Zen Mode
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        document.getElementById('btn-zen-mode')?.click();
      }

      // Cmd/Ctrl + Shift + L: Tidy Up & Auto-Arrange
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        this.popoverManager?.closeAll();
        const state = stateStore.getState();
        if (state?.activeLayoutPreset === 'desktop') {
          this.applyDesktopLayout();
        } else {
          stateStore.tidyUp();
        }
      }

      // Cmd/Ctrl + Shift + A: Quick AI Tab Launcher
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const btnQuickAdd = document.getElementById('btn-quick-add-tab') || document.getElementById('btn-quick-launcher');
        btnQuickAdd?.click();
      }

      // Cmd/Ctrl + 0: Fit Viewport
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        globalBus.emit('FIT_VIEWPORT');
      }

      // Cmd/Ctrl + /: Keyboard Shortcuts Modal
      if ((e.metaKey || e.ctrlKey) && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        this.popoverManager?.closeAll();
        document.getElementById('modal-shortcuts')?.classList.toggle('hidden');
      }

      // Escape: layered dismissal (Studio Drawer -> Mirror Chat -> Popovers -> Modals -> Omnibar)
      if (e.key === 'Escape') {
        if (this.selectorStudio?.isOpen) {
          e.preventDefault();
          this.selectorStudio.close();
          return;
        }

        if (this.mirrorChat?.isOpen) {
          e.preventDefault();
          this.mirrorChat.close();
          return;
        }

        if (this.popoverManager?.hasOpen()) {
          e.preventDefault();
          this.popoverManager.closeAll();
          return;
        }

        const modalCustom = document.getElementById('modal-custom-bot');
        const modalShortcuts = document.getElementById('modal-shortcuts');
        if (!modalCustom?.classList.contains('hidden') || !modalShortcuts?.classList.contains('hidden')) {
          modalCustom?.classList.add('hidden');
          modalShortcuts?.classList.add('hidden');
          return;
        }

        this.omnibar?.collapse();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new OmniApp();
  app.init();
});
