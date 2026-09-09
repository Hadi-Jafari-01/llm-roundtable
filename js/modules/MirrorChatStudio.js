/**
 * OmniAI Hub — The Silk Mirror Sanctuary Controller (Native Unified Chat Studio)
 * Provides a distraction-free, native chat experience that mirrors any target
 * canvas AI card in real time via DOM MutationObserver scraping and prompt dispatch.
 */

import { domDriverRegistry } from './DomDriverRegistry.js';
import { globalBus } from './EventBus.js';

export class MirrorChatStudio {
  constructor(stateStore) {
    this.stateStore = stateStore;
    this.activeCardId = null;
    this.isOpen = false;
    this.isGenerating = false;
    this.conversations = new Map(); // cardId -> Array of message objects
    this.currentStreamingTurn = null;

    this.initElements();
    this.bindEvents();
    this.setupResizeHandle();
  }

  initElements() {
    this.studioEl = document.getElementById('mirror-chat-studio');
    this.pearlBar = document.getElementById('mirror-pearl-bar');
    this.streamViewport = document.getElementById('mirror-stream-viewport');
    this.textarea = document.getElementById('mirror-prompt-textarea');
    this.btnSend = document.getElementById('btn-mirror-send');
    this.btnStop = document.getElementById('btn-mirror-stop');
    this.btnNewChat = document.getElementById('btn-mirror-new-chat');
    this.btnSyncHistory = document.getElementById('btn-mirror-sync-history');
    this.btnClose = document.getElementById('btn-close-mirror-studio');
    this.charCountEl = document.getElementById('mirror-char-count');
    this.targetModelNameEl = document.getElementById('mirror-target-model-name');
    this.btnStealthToggle = document.getElementById('btn-mirror-toggle-stealth');
    this.stealthLabel = document.getElementById('mirror-stealth-mode-label');
  }

  bindEvents() {
    this.btnClose?.addEventListener('click', () => this.close());

    // Switch model card when clicking a pearl
    this.pearlBar?.addEventListener('click', (e) => {
      const pearl = e.target.closest('.mirror-pearl-btn');
      if (pearl?.dataset.cardId) {
        this.selectTargetCard(pearl.dataset.cardId);
      }
    });

    // Quick toggle for Stealth / Human Mode
    this.btnStealthToggle?.addEventListener('click', () => {
      const card = this.stateStore.getState()?.cards?.find(c => c.id === this.activeCardId);
      const driver = card?.url ? domDriverRegistry.getDriverForUrl(card.url) : domDriverRegistry.getDrivers().generic;
      if (!driver) return;

      const modes = ['burst', 'cadence', 'paste', 'instant'];
      const curIdx = modes.indexOf(driver.humanizeMode || 'burst');
      const nextMode = modes[(curIdx + 1) % modes.length];

      driver.humanizeMode = nextMode;
      driver.humanizeEnabled = nextMode !== 'instant';
      domDriverRegistry.saveDriver(driver.id, driver);
      this.updateStealthIndicator(driver);
    });

    // Auto-expanding textarea & character count
    this.textarea?.addEventListener('input', () => {
      const len = this.textarea.value.length;
      if (this.charCountEl) this.charCountEl.textContent = `${len} chars`;
      this.textarea.style.height = 'auto';
      this.textarea.style.height = Math.min(this.textarea.scrollHeight, 150) + 'px';
    });

    // Keyboard dispatch (Cmd/Ctrl + Enter)
    this.textarea?.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        this.dispatchPrompt();
      }
    });

    this.btnSend?.addEventListener('click', (e) => {
      e.preventDefault();
      this.dispatchPrompt();
    });

    // Stop Generation
    this.btnStop?.addEventListener('click', () => {
      this.stopGeneration();
    });

    // New Chat Trigger
    this.btnNewChat?.addEventListener('click', () => {
      this.triggerNewChat();
    });

    // Sync / Extract History
    this.btnSyncHistory?.addEventListener('click', () => {
      this.extractHistoryFromTarget();
    });

    // Copy code blocks
    this.streamViewport?.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.btn-copy-code');
      if (copyBtn) {
        const pre = copyBtn.closest('.mirror-code-block')?.querySelector('.mirror-code-body');
        if (pre) {
          navigator.clipboard.writeText(pre.innerText);
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1800);
        }
      }
    });

    // Cross-frame stream chunk and history listener via postMessage
    window.addEventListener('message', (e) => {
      if (!e.data) return;
      if (e.data.action === 'MIRROR_STREAM_CHUNK') {
        this.handleStreamChunk(e.data);
      } else if (e.data.action === 'EXTRACT_HISTORY_RESULT') {
        this.handleHistoryResult(e.data);
      }
    });

    // Cross-frame stream chunk and history listener via chrome.runtime
    const runtimeApi = (typeof browser !== 'undefined' && browser.runtime)
      ? browser.runtime
      : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null);

    if (runtimeApi?.onMessage) {
      runtimeApi.onMessage.addListener((msg) => {
        if (msg?.action === 'MIRROR_STREAM_CHUNK') {
          this.handleStreamChunk(msg);
        } else if (msg?.action === 'EXTRACT_HISTORY_RESULT') {
          this.handleHistoryResult(msg);
        }
      });
    }

    // Toggle reasoning fold process
    this.streamViewport?.addEventListener('click', (e) => {
      const trigger = e.target.closest('.reasoning-fold-trigger');
      if (trigger) {
        const body = trigger.parentElement?.querySelector('.reasoning-fold-body');
        if (body) {
          const isHidden = body.style.display === 'none';
          body.style.display = isHidden ? 'block' : 'none';
          const arrow = trigger.querySelector('span:last-child');
          if (arrow) arrow.textContent = isHidden ? '▲' : '▼';
        }
      }
    });

    // Shortcut: Cmd+J / Ctrl+J
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        const state = this.stateStore?.getState();
        const cards = state?.cards || [];
        const targetId = state?.activeCardId || (cards[0] ? cards[0].id : null);
        if (targetId && (!this.activeCardId || !this.isOpen)) {
          this.selectTargetCard(targetId);
        }
        this.toggle();
      }
    });

    // Update pearl bar whenever canvas cards change
    globalBus.on('STATE_CHANGED', () => {
      this.renderPearlBar();
    });
  }

  setupResizeHandle() {
    const handle = document.getElementById('mirror-resize-handle');
    if (!handle || !this.studioEl) return;

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    handle.addEventListener('pointerdown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startWidth = this.studioEl.offsetWidth;
      handle.classList.add('resizing');
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const delta = startX - e.clientX;
      const newWidth = Math.max(420, Math.min(startWidth + delta, window.innerWidth - 60));
      this.studioEl.style.width = `${newWidth}px`;
    });

    window.addEventListener('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        handle.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }

  open() {
    this.isOpen = true;
    this.studioEl?.classList.add('open');
    this.renderPearlBar();

    const state = this.stateStore.getState();
    const cards = state?.cards || [];
    const targetId = this.activeCardId || state.activeCardId || (cards[0] ? cards[0].id : null);

    if (targetId) {
      this.selectTargetCard(targetId);
    } else {
      this.renderConversation();
    }

    requestAnimationFrame(() => this.textarea?.focus());
    globalBus.emit('MIRROR_STUDIO_OPENED');
  }

  close() {
    this.isOpen = false;
    this.studioEl?.classList.remove('open');
    globalBus.emit('MIRROR_STUDIO_CLOSED');
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  renderPearlBar() {
    if (!this.pearlBar) return;
    const state = this.stateStore.getState();
    const cards = state?.cards || [];

    this.pearlBar.innerHTML = '';

    if (cards.length === 0) {
      this.pearlBar.innerHTML = `<span style="font-size:11px;color:#64748b;padding:2px 8px;">No active AI cards on canvas</span>`;
      return;
    }

    cards.forEach(card => {
      const isSelected = card.id === this.activeCardId;
      const cardName = card.title || card.name || 'AI Model';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `mirror-pearl-btn ${isSelected ? 'active' : ''}`;
      btn.dataset.cardId = card.id;
      btn.innerHTML = `
        <span class="pearl-status-dot" style="background: ${card.color || '#c084fc'}; color: ${card.color || '#c084fc'};"></span>
        <span>${this.escapeHtml(cardName)}</span>
      `;
      this.pearlBar.appendChild(btn);
    });
  }

  selectTargetCard(cardId) {
    this.activeCardId = cardId;
    this.renderPearlBar();

    const state = this.stateStore.getState();
    const card = state?.cards?.find(c => c.id === cardId);
    const cardName = card ? (card.title || card.name || 'AI Model') : 'AI Intelligence';

    if (this.targetModelNameEl) {
      this.targetModelNameEl.textContent = cardName;
    }
    if (this.textarea) {
      this.textarea.placeholder = `Message ${cardName} in pristine silk mode... (⌘↵ to send)`;
    }

    const driver = card?.url ? domDriverRegistry.getDriverForUrl(card.url) : domDriverRegistry.getDrivers().generic;
    this.updateStealthIndicator(driver);

    // Auto-extract history if conversation is clean
    if (!this.conversations.has(cardId) || this.conversations.get(cardId).length === 0) {
      this.extractHistoryFromTarget();
    } else {
      this.renderConversation();
    }
  }

  getTargetIframe() {
    if (!this.activeCardId) return null;
    // 1. Direct lookup by container ID or data attribute
    const cardEl = document.getElementById(this.activeCardId) ||
      document.querySelector(`#spatial-cards-container [data-card-id="${this.activeCardId}"]`) ||
      document.querySelector(`[data-card-id="${this.activeCardId}"]`) ||
      document.getElementById(`card-${this.activeCardId}`);
    if (cardEl) {
      const ifr = cardEl.querySelector('iframe');
      if (ifr) return ifr;
    }
    // 2. Direct iframe lookup by ID, name, or dataset
    return document.getElementById(`iframe-${this.activeCardId}`) ||
      document.querySelector(`iframe[name="${this.activeCardId}"]`) ||
      document.querySelector(`iframe[data-card-id="${this.activeCardId}"]`);
  }

  updateStealthIndicator(driver) {
    if (!this.btnStealthToggle || !this.stealthLabel) return;
    const isEnabled = driver?.humanizeEnabled !== false;
    const mode = driver?.humanizeMode || 'burst';

    const modeLabels = {
      burst: 'Human Burst 🛡️',
      cadence: 'Bio Cadence ⚡',
      paste: 'Smart Paste 📋',
      instant: 'Instant 🚀'
    };

    this.btnStealthToggle.classList.toggle('disabled', !isEnabled || mode === 'instant');
    this.stealthLabel.textContent = isEnabled ? `Stealth: ${modeLabels[mode] || mode}` : 'Stealth: Off';
  }

  dispatchPrompt() {
    const text = (this.textarea?.value || '').trim();
    if (!text || this.isGenerating) return;

    if (!this.activeCardId) {
      alert('Please open or select an AI card on the canvas first.');
      return;
    }

    const state = this.stateStore.getState();
    const card = state?.cards?.find(c => c.id === this.activeCardId);
    const driver = card?.url ? domDriverRegistry.getDriverForUrl(card.url) : domDriverRegistry.getDrivers().generic;

    // Append User Message to Local Stream
    const userTurn = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (!this.conversations.has(this.activeCardId)) {
      this.conversations.set(this.activeCardId, []);
    }
    this.conversations.get(this.activeCardId).push(userTurn);

    // Prepare Placeholder for Streaming Assistant Turn
    const assistantTurn = {
      id: `msg_${Date.now()}_a`,
      role: 'assistant',
      text: '',
      html: '',
      thinkingText: '',
      isThinking: false,
      isStreaming: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.conversations.get(this.activeCardId).push(assistantTurn);
    this.currentStreamingTurn = assistantTurn;

    // Render Stream
    this.renderConversation();
    this.setGenerating(true);

    // Reset textarea
    this.textarea.value = '';
    this.textarea.style.height = 'auto';
    if (this.charCountEl) this.charCountEl.textContent = '0 chars';

    // Dispatch to Target Iframe
    const iframe = this.getTargetIframe();
    const payload = {
      action: 'MIRROR_DISPATCH_PROMPT',
      cardId: this.activeCardId,
      prompt: text,
      driver
    };

    if (iframe?.contentWindow) {
      try {
        iframe.contentWindow.postMessage(payload, '*');
      } catch (e) {
        console.warn('[MirrorChat] Direct postMessage failed:', e);
      }
    }

    // Also broadcast to matching card iframe containers
    document.querySelectorAll('#spatial-cards-container iframe').forEach(ifr => {
      if (ifr !== iframe && (ifr.dataset.cardId === this.activeCardId || ifr.name === this.activeCardId)) {
        try { ifr.contentWindow?.postMessage(payload, '*'); } catch (_) {}
      }
    });

    const runtimeApi = (typeof browser !== 'undefined' && browser.runtime)
      ? browser.runtime
      : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null);

    if (runtimeApi?.sendMessage) {
      runtimeApi.sendMessage(payload);
    }

    // Safety timeout: prevent UI lock if model takes over 50s without streaming
    if (this.generationSafetyTimer) clearTimeout(this.generationSafetyTimer);
    this.generationSafetyTimer = setTimeout(() => {
      if (this.isGenerating) {
        if (this.currentStreamingTurn) {
          this.currentStreamingTurn.isStreaming = false;
          if (!this.currentStreamingTurn.text) {
            this.currentStreamingTurn.text = '✓ Prompt dispatched to model card.';
          }
        }
        this.currentStreamingTurn = null;
        this.setGenerating(false);
        this.renderConversation();
      }
    }, 45000);
  }

  handleStreamChunk(data) {
    const { cardId, text, html, isThinking, thinkingText, isFinished } = data;
    if (cardId && this.activeCardId && cardId !== this.activeCardId) return;

    if (!this.currentStreamingTurn) {
      const history = this.conversations.get(this.activeCardId) || [];
      const last = history[history.length - 1];
      if (last && last.role === 'assistant') {
        this.currentStreamingTurn = last;
      }
    }

    if (this.currentStreamingTurn) {
      if (text !== undefined && text !== '') this.currentStreamingTurn.text = text;
      if (html !== undefined && html !== '') this.currentStreamingTurn.html = html;
      if (isThinking !== undefined) this.currentStreamingTurn.isThinking = isThinking;
      if (thinkingText !== undefined && thinkingText !== '') this.currentStreamingTurn.thinkingText = thinkingText;

      this.updateActiveStreamingTurnElement();
    }

    if (isFinished) {
      if (this.generationSafetyTimer) clearTimeout(this.generationSafetyTimer);
      if (this.currentStreamingTurn) {
        this.currentStreamingTurn.isStreaming = false;
        if (!this.currentStreamingTurn.text && this.currentStreamingTurn.thinkingText) {
          this.currentStreamingTurn.text = this.currentStreamingTurn.thinkingText;
        }
      }
      this.currentStreamingTurn = null;
      this.setGenerating(false);
      this.renderConversation();
    }
  }

  setGenerating(isGen) {
    this.isGenerating = isGen;
    if (this.btnStop) {
      this.btnStop.classList.toggle('hidden', !isGen);
    }
    if (this.btnSend) {
      this.btnSend.style.opacity = isGen ? '0.6' : '1';
      this.btnSend.style.pointerEvents = isGen ? 'none' : 'auto';
    }
  }

  stopGeneration() {
    const iframe = this.getTargetIframe();
    const state = this.stateStore.getState();
    const card = state?.cards?.find(c => c.id === this.activeCardId);
    const driver = card?.url ? domDriverRegistry.getDriverForUrl(card.url) : domDriverRegistry.getDrivers().generic;

    const payload = {
      action: 'MIRROR_STOP_GENERATION',
      cardId: this.activeCardId,
      driver
    };

    iframe?.contentWindow?.postMessage(payload, '*');
    this.setGenerating(false);
    if (this.currentStreamingTurn) {
      this.currentStreamingTurn.isStreaming = false;
      this.currentStreamingTurn = null;
    }
    this.renderConversation();
  }

  triggerNewChat() {
    if (confirm('Start a new clean chat with this intelligence?')) {
      const iframe = this.getTargetIframe();
      const state = this.stateStore.getState();
      const card = state?.cards?.find(c => c.id === this.activeCardId);
      const driver = card?.url ? domDriverRegistry.getDriverForUrl(card.url) : domDriverRegistry.getDrivers().generic;

      iframe?.contentWindow?.postMessage({
        action: 'MIRROR_NEW_CHAT',
        cardId: this.activeCardId,
        driver
      }, '*');

      this.conversations.set(this.activeCardId, []);
      this.renderConversation();
    }
  }

  extractHistoryFromTarget() {
    const iframe = this.getTargetIframe();
    if (!iframe?.contentWindow) return;

    const state = this.stateStore.getState();
    const card = state?.cards?.find(c => c.id === this.activeCardId);
    const driver = card?.url ? domDriverRegistry.getDriverForUrl(card.url) : domDriverRegistry.getDrivers().generic;

    iframe.contentWindow.postMessage({
      action: 'MIRROR_EXTRACT_HISTORY',
      cardId: this.activeCardId,
      driver
    }, '*');
  }

  handleHistoryResult(data) {
    if (data.cardId && this.activeCardId && data.cardId !== this.activeCardId) return;
    if (Array.isArray(data.messages) && data.messages.length > 0) {
      this.conversations.set(this.activeCardId, data.messages);
      this.renderConversation();
    }
  }

  renderConversation() {
    if (!this.streamViewport) return;
    const history = this.conversations.get(this.activeCardId) || [];

    if (history.length === 0) {
      const state = this.stateStore.getState();
      const card = state?.cards?.find(c => c.id === this.activeCardId);
      this.streamViewport.innerHTML = `
        <div class="mirror-empty-sanctuary">
          <div class="sanctuary-orb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h4>Silk Mirror Sanctuary</h4>
          <p>Connected to <strong>${card?.title || card?.name || 'Active Intelligence'}</strong>. Prompt dispatch and real-time response scraping active.</p>
        </div>
      `;
      return;
    }

    this.streamViewport.innerHTML = '';
    history.forEach(turn => {
      const turnEl = document.createElement('div');
      turnEl.className = `mirror-message-turn ${turn.role}`;
      turnEl.id = `turn-${turn.id}`;

      if (turn.role === 'user') {
        turnEl.innerHTML = `
          <div class="mirror-turn-meta"><span>You</span> • <span>${turn.time}</span></div>
          <div class="mirror-bubble-card">${this.escapeHtml(turn.text)}</div>
        `;
      } else {
        const renderedMarkdown = this.renderMarkdown(turn.text || '');
        const reasoningHtml = turn.thinkingText ? `
          <div class="mirror-reasoning-fold">
            <button type="button" class="reasoning-fold-trigger">
              <span>🧠 Thinking Process</span>
              <span>▼</span>
            </button>
            <div class="reasoning-fold-body">${this.escapeHtml(turn.thinkingText)}</div>
          </div>
        ` : '';

        const streamingPulse = turn.isStreaming ? `
          <div class="mirror-streaming-pulse"><span></span><span></span><span></span></div>
        ` : '';

        turnEl.innerHTML = `
          <div class="mirror-turn-meta"><span>Intelligence</span> • <span>${turn.time}</span></div>
          <div class="mirror-bubble-card">
            ${reasoningHtml}
            <div class="mirror-markdown-content">${renderedMarkdown}</div>
            ${streamingPulse}
          </div>
        `;
      }

      this.streamViewport.appendChild(turnEl);
    });

    this.scrollToBottom();
  }

  updateActiveStreamingTurnElement() {
    if (!this.currentStreamingTurn) return;
    const turnEl = document.getElementById(`turn-${this.currentStreamingTurn.id}`);
    if (!turnEl) {
      this.renderConversation();
      return;
    }

    const contentEl = turnEl.querySelector('.mirror-markdown-content');
    if (contentEl) {
      contentEl.innerHTML = this.renderMarkdown(this.currentStreamingTurn.text || '');
    }

    if (this.currentStreamingTurn.thinkingText) {
      let reasoningFold = turnEl.querySelector('.mirror-reasoning-fold');
      if (!reasoningFold) {
        const bubble = turnEl.querySelector('.mirror-bubble-card');
        reasoningFold = document.createElement('div');
        reasoningFold.className = 'mirror-reasoning-fold';
        reasoningFold.innerHTML = `
          <button type="button" class="reasoning-fold-trigger">
            <span>🧠 Thinking Process</span><span>▼</span>
          </button>
          <div class="reasoning-fold-body"></div>
        `;
        bubble?.prepend(reasoningFold);
      }
      const body = reasoningFold.querySelector('.reasoning-fold-body');
      if (body) body.textContent = this.currentStreamingTurn.thinkingText;
    }

    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.streamViewport) {
      this.streamViewport.scrollTop = this.streamViewport.scrollHeight;
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  renderMarkdown(raw) {
    if (!raw) return '<p></p>';

    let out = raw;

    // 1. Code blocks with copy button
    out = out.replace(/```([a-zA-Z0-9_-]*)[ \t]*\n?([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'code';
      const cleanCode = this.escapeHtml(code.trim());
      return `
        <div class="mirror-code-block">
          <div class="mirror-code-header">
            <span>${language}</span>
            <button type="button" class="btn-copy-code">Copy</button>
          </div>
          <pre class="mirror-code-body"><code>${cleanCode}</code></pre>
        </div>
      `;
    });

    // 2. Inline code
    out = out.replace(/`([^`\n]+)`/g, (m, c) => `<code class="inline-code">${this.escapeHtml(c)}</code>`);

    // 3. Headers & lists
    out = out.replace(/^### (.*$)/gim, '<h5 style="margin:6px 0;color:#ddd6fe;font-size:12px;">$1</h5>');
    out = out.replace(/^## (.*$)/gim, '<h4 style="margin:8px 0;color:#ddd6fe;font-size:13px;">$1</h4>');
    out = out.replace(/^# (.*$)/gim, '<h3 style="margin:10px 0;color:#ddd6fe;font-size:14px;">$1</h3>');
    out = out.replace(/^\s*[-*]\s+(.*$)/gim, '<li style="margin-left:14px;">$1</li>');

    // 4. Bold & Italic
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 4. Line breaks to paragraphs
    const paragraphs = out.split(/\n\n+/);
    return paragraphs.map(p => {
      if (p.includes('<div class="mirror-code-block"')) return p;
      return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
    }).join('');
  }
}
