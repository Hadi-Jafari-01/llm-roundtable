/**
 * OmniAI Hub — Master Omnibar Studio Controller
 * Handles prompt composing, scope filtering, muse sparks, and human-like multi-model dispatch.
 */

import { globalBus } from './EventBus.js';

export class OmnibarController {
  constructor(dom, stateStore) {
    this.dom = dom;
    this.stateStore = stateStore;
    this.syncScope = 'visible';

    this.setupEvents();
    this.setupBusListeners();
    this.render();
  }

  setupBusListeners() {
    globalBus.on('OPEN_OMNIBAR', () => {
      this.expand();
    });

    globalBus.on('STATE_CHANGED', () => {
      this.render();
    });
  }

  setupEvents() {
    // Compact trigger expands studio
    this.dom.compactTrigger?.addEventListener('click', () => {
      this.expand();
    });

    // Collapse button
    this.dom.btnCollapse?.addEventListener('click', () => {
      this.collapse();
    });

    // Textarea input adjustments & char counter
    this.dom.textarea?.addEventListener('input', () => {
      this.adjustTextareaHeight();
      const length = this.dom.textarea.value.length;
      if (this.dom.charCount) {
        this.dom.charCount.textContent = length;
      }
      this.dom.btnClear?.classList.toggle('hidden', length === 0);
    });

    // Textarea hotkeys (Cmd/Ctrl + Enter dispatches)
    this.dom.textarea?.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        this.dispatchPrompt();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.collapse();
      }
    });

    // Send button click
    this.dom.btnSend?.addEventListener('click', () => {
      this.dispatchPrompt();
    });

    // Clear button
    this.dom.btnClear?.addEventListener('click', () => {
      if (this.dom.textarea) {
        this.dom.textarea.value = '';
        this.dom.textarea.style.height = 'auto';
        if (this.dom.charCount) this.dom.charCount.textContent = '0';
        this.dom.btnClear.classList.add('hidden');
        this.dom.textarea.focus({ preventScroll: true });
      }
    });

    // Scope cluster buttons
    this.dom.syncButtons?.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.syncButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.syncScope = btn.dataset.sync || 'visible';
        this.renderBotsRibbon();
      });
    });

    // Muse sparks chips
    document.querySelectorAll('.muse-spark-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const promptLead = chip.dataset.prompt;
        if (!promptLead || !this.dom.textarea) return;

        this.expand();
        this.dom.textarea.value = promptLead;
        this.dom.textarea.focus({ preventScroll: true });
        this.dom.textarea.setSelectionRange(promptLead.length, promptLead.length);
        this.adjustTextareaHeight();
        if (this.dom.charCount) {
          this.dom.charCount.textContent = promptLead.length;
        }
        this.dom.btnClear?.classList.remove('hidden');
      });
    });
  }

  expand() {
    this.dom.island?.classList.add('expanded');
    setTimeout(() => {
      this.dom.textarea?.focus({ preventScroll: true });
      this.adjustTextareaHeight();
    }, 50);
  }

  collapse() {
    this.dom.island?.classList.remove('expanded');
  }

  adjustTextareaHeight() {
    if (!this.dom.textarea) return;
    this.dom.textarea.style.height = 'auto';
    const nextH = Math.min(180, Math.max(48, this.dom.textarea.scrollHeight));
    this.dom.textarea.style.height = `${nextH}px`;
  }

  getTargetCards() {
    const cards = this.stateStore.getCards();
    const activeId = this.stateStore.getState().activeCardId;

    if (this.syncScope === 'focused') {
      return cards.filter(c => c.id === activeId);
    }
    if (this.syncScope === 'all') {
      return cards;
    }
    // 'visible': cards within approximate viewport
    return cards;
  }

  render() {
    const cards = this.stateStore.getCards();
    if (this.dom.totalCardsCount) {
      this.dom.totalCardsCount.textContent = cards.length;
    }
    if (this.dom.visibleSyncCount) {
      this.dom.visibleSyncCount.textContent = cards.length;
    }
    this.renderBotsRibbon();
  }

  renderBotsRibbon() {
    if (!this.dom.botsRibbon) return;
    const targetCards = this.getTargetCards();

    this.dom.botsRibbon.innerHTML = '';
    targetCards.forEach(card => {
      const badge = document.createElement('span');
      badge.className = 'bot-pearl-badge';
      badge.innerHTML = `
        <span class="bot-pearl-dot" style="color: ${card.color}; background: ${card.color};"></span>
        <span>${card.title}</span>
      `;
      this.dom.botsRibbon.appendChild(badge);
    });
  }

  dispatchPrompt() {
    const promptText = this.dom.textarea?.value?.trim();
    if (!promptText) return;

    const targetCards = this.getTargetCards();
    if (targetCards.length === 0) return;

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payload = {
      action: 'OMNI_DISPATCH_PROMPT',
      prompt: promptText,
      messageId
    };

    // 1. Dispatch directly via PostMessage to embedded frames
    let delivered = false;
    targetCards.forEach(card => {
      const cardEl = document.getElementById(card.id);
      const iframe = cardEl?.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage({ ...payload, targetCardId: card.id }, '*');
          delivered = true;
        } catch (e) {
          console.warn('[Omnibar] PostMessage relay skipped:', e);
        }
      }
    });

    // 2. تنها در صورت عدم امکان تحویل مستقیم از طریق postMessage رله می‌شود
    if (!delivered && typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'RELAY_PROMPT',
        prompt: promptText,
        messageId
      });
    }

    // Dopamine button feedback
    if (this.dom.btnSend) {
      const originalHtml = this.dom.btnSend.innerHTML;
      this.dom.btnSend.innerHTML = `<span>Sent ⚡</span>`;
      this.dom.btnSend.style.borderColor = 'var(--orb-sage)';
      setTimeout(() => {
        this.dom.btnSend.innerHTML = originalHtml;
        this.dom.btnSend.style.borderColor = '';
      }, 1200);
    }
  }
}
