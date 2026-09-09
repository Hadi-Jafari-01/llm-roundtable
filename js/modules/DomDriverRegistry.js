/**
 * OmniAI Hub — Neural DOM Driver Registry (Manifest V3)
 * Manages factory default selector profiles, custom overrides, persistent storage,
 * and live hostname matching for all AI models.
 */

export const STORAGE_KEY_DOM_DRIVERS = 'omni_dom_drivers_v2';

export const DEFAULT_HUMAN_KINEMATICS = {
  humanizeEnabled: true,
  humanizeMode: 'burst', // 'burst' | 'cadence' | 'paste' | 'instant'
  humanizeSpeed: 'natural', // 'relaxed' | 'natural' | 'rapid'
  minKeystrokeDelay: 25,
  maxKeystrokeDelay: 70,
  punctuationPauseMs: 220,
  preSubmitDelayMs: 500,
  clickDwellMs: 75,
  simulateTypos: true,
  cursorJitter: true,
  hoverBeforeClick: true
};

export const FACTORY_DRIVER_PRESETS = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT (OpenAI)',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'chatgpt.com, openai.com',
    color: '#10a37f',
    inputSelector: '#prompt-textarea, div[contenteditable="true"]#prompt-textarea, div[contenteditable="true"][data-placeholder], textarea[data-id="root"], textarea[placeholder*="Ask" i], textarea',
    inputStrategy: 'lexical', // lexical | execCommand | native | simulatedKeys | auto
    submitSelector: 'button[data-testid="send-button"], button[data-testid="fruitjuice-send-button"], button[aria-label*="Send" i], button[aria-label*="ارسال" i], button:has(svg[data-icon="arrow-up"])',
    submitMechanism: 'click', // click | enterKey | formSubmit
    responseContainerSelector: 'div[data-message-author-role="assistant"], article[data-testid*="conversation-turn"]:has([data-message-author-role="assistant"]), div.agent-turn, div[class*="agent-turn"]',
    streamingTokenSelector: 'div[data-message-author-role="assistant"] div.markdown, article[data-testid*="conversation-turn"]:has([data-message-author-role="assistant"]) .markdown, div[data-message-author-role="assistant"], .markdown',
    stopSelector: 'button[data-testid="stop-button"], button[aria-label*="Stop" i], button[aria-label*="توقف" i]',
    newChatSelector: 'a[data-testid="create-new-chat-button"], a[href="/"], button[aria-label*="New chat" i]',
    reasoningSelector: 'div[data-testid*="thought"], div.thought-content, div[class*="reasoning"], div[class*="thought"]',
    userBubbleSelector: 'div[data-message-author-role="user"], article[data-testid*="conversation-turn"]:has([data-message-author-role="user"])'
  },
  claude: {
    id: 'claude',
    name: 'Claude (Anthropic)',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'claude.ai, anthropic.com',
    color: '#d97706',
    inputSelector: 'div.ProseMirror[contenteditable="true"], fieldset div[contenteditable="true"], div[contenteditable="true"][aria-label*="Claude" i], div[contenteditable="true"]',
    inputStrategy: 'execCommand',
    submitSelector: 'button[aria-label*="Send" i], button[data-testid="send-button"], fieldset button:last-child, button[aria-label*="ارسال" i], button:has(svg)',
    submitMechanism: 'click',
    responseContainerSelector: 'div[data-is-streaming], div.font-claude-message, div[data-testid*="chat-message-assistant"], div.font-claude-response',
    streamingTokenSelector: 'div.font-claude-message, div[data-is-streaming="true"], div.prose, div.font-claude-response',
    stopSelector: 'button[aria-label*="Stop" i], button[aria-label*="Cancel" i], button[aria-label*="توقف" i]',
    newChatSelector: 'a[href="/new"], button[aria-label*="Start new chat" i], a[aria-label*="New chat" i]',
    reasoningSelector: 'div[data-testid*="thinking"], div.thinking-content',
    userBubbleSelector: 'div[data-testid*="chat-message-user"], div.font-user-message'
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini (Google)',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'gemini.google.com, google.com',
    color: '#3b82f6',
    inputSelector: 'div.ql-editor[contenteditable="true"], rich-textarea div[contenteditable="true"], textarea[aria-label*="prompt" i], div[contenteditable="true"]',
    inputStrategy: 'execCommand',
    submitSelector: 'button[aria-label*="Send" i], button.send-button, button.send-button-container, button[aria-label*="ارسال" i]',
    submitMechanism: 'click',
    responseContainerSelector: 'message-content, .model-response-text, div.response-container, div[class*="model-response"]',
    streamingTokenSelector: '.model-response-text, message-content .markdown, div.response-container-content, message-content',
    stopSelector: 'button[aria-label*="Stop" i], button.stop-button',
    newChatSelector: 'button[aria-label*="New chat" i], a[aria-label*="New chat" i], .side-nav-button',
    reasoningSelector: 'expandable-thought, .thought-container, [aria-label*="Thinking" i]',
    userBubbleSelector: 'user-query, .user-query-container'
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'deepseek.com',
    color: '#0ea5e9',
    inputSelector: 'textarea#chat-input, textarea[placeholder*="DeepSeek" i], textarea',
    inputStrategy: 'native',
    submitSelector: 'div[role="button"][aria-label*="Send" i], button[aria-label*="Send" i], div[class*="send-btn"], div[class*="sendBtn"], div.ds-icon-button',
    submitMechanism: 'click',
    responseContainerSelector: 'div.ds-markdown, div[class*="chat-message"]:not([class*="user"]), div[class*="assistant"]',
    streamingTokenSelector: 'div.ds-markdown',
    stopSelector: 'div[role="button"][aria-label*="Stop" i], button[aria-label*="Stop" i]',
    newChatSelector: 'div[class*="new-chat"], button[class*="new-chat"]',
    reasoningSelector: 'div.ds-think, div[class*="think-content"], div[class*="thought"]',
    userBubbleSelector: 'div[class*="chat-message"][class*="user"], div.ds-user-content'
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity AI',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'perplexity.ai',
    color: '#14b8a6',
    inputSelector: 'textarea[placeholder*="Ask" i], textarea[placeholder*="search" i], textarea',
    inputStrategy: 'native',
    submitSelector: 'button[aria-label*="Submit" i], button[aria-label*="Ask" i], button[aria-label*="Send" i], button:has(svg)',
    submitMechanism: 'click',
    responseContainerSelector: 'div.default.font-sans, div.prose, div[class*="answer"]',
    streamingTokenSelector: 'div.prose, div[class*="answer"] .markdown',
    stopSelector: 'button[aria-label*="Stop" i]',
    newChatSelector: 'button[aria-label*="New Thread" i], a[href="/"]',
    reasoningSelector: 'div[class*="thought"], div[class*="reasoning"]',
    userBubbleSelector: 'div.font-display, div[class*="query"]'
  },
  grok: {
    id: 'grok',
    name: 'Grok (xAI)',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'grok.com, x.com',
    color: '#ec4899',
    inputSelector: 'textarea[placeholder*="Ask" i], div[contenteditable="true"], textarea',
    inputStrategy: 'native',
    submitSelector: 'button[aria-label*="Grok" i], button[aria-label*="Send" i], button[type="submit"], button:has(svg)',
    submitMechanism: 'click',
    responseContainerSelector: 'div.message-bubble:not(.user), div[class*="response"], div.markdown',
    streamingTokenSelector: 'div.markdown, div[class*="response"]',
    stopSelector: 'button[aria-label*="Stop" i]',
    newChatSelector: 'a[aria-label*="New chat" i], button[aria-label*="New chat" i]',
    reasoningSelector: 'div[class*="thought"], div[class*="thinking"]',
    userBubbleSelector: 'div.message-bubble.user, div[class*="user-bubble"]'
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral Le Chat',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'chat.mistral.ai, mistral.ai',
    color: '#f97316',
    inputSelector: 'textarea[placeholder*="Ask" i], textarea',
    inputStrategy: 'native',
    submitSelector: 'button[type="submit"], button[aria-label*="Send" i], button:has(svg)',
    submitMechanism: 'click',
    responseContainerSelector: 'div.prose, div[data-message-role="assistant"]',
    streamingTokenSelector: 'div.prose',
    stopSelector: 'button[aria-label*="Stop" i]',
    newChatSelector: 'a[href="/chat"], button[aria-label*="New chat" i]',
    reasoningSelector: 'div.reasoning-block, div[class*="thought"]',
    userBubbleSelector: 'div[data-message-role="user"]'
  },
  poe: {
    id: 'poe',
    name: 'Poe',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'poe.com',
    color: '#8b5cf6',
    inputSelector: 'textarea[class*="ChatMessageInputContainer"], textarea',
    inputStrategy: 'native',
    submitSelector: 'button[class*="ChatMessageSendButton"], button[aria-label*="Send" i]',
    submitMechanism: 'click',
    responseContainerSelector: 'div[class*="Message_botMessage"], div[class*="Markdown_markdown"]',
    streamingTokenSelector: 'div[class*="Markdown_markdown"]',
    stopSelector: 'button[class*="ChatStopButton"]',
    newChatSelector: 'button[class*="ChatHeader_clearButton"]',
    reasoningSelector: 'div[class*="thinking"]',
    userBubbleSelector: 'div[class*="Message_humanMessage"]'
  },
  generic: {
    id: 'generic',
    name: 'Generic AI Platform',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: '*',
    color: '#94a3b8',
    inputSelector: 'textarea:not([disabled]), div[contenteditable="true"]:not([disabled]), *[role="textbox"]',
    inputStrategy: 'auto',
    submitSelector: 'button[type="submit"], button[aria-label*="send" i], button[aria-label*="submit" i], button[aria-label*="ارسال" i]',
    submitMechanism: 'click',
    responseContainerSelector: 'div.markdown, div[class*="message"]:not([class*="user"]), div.prose',
    streamingTokenSelector: 'div.markdown, div.prose, [data-message-content]',
    stopSelector: 'button[aria-label*="stop" i], button[title*="stop" i]',
    newChatSelector: 'button[aria-label*="new" i], a[aria-label*="new" i]',
    reasoningSelector: 'details, summary, .reasoning, div[class*="thought"]',
    userBubbleSelector: '[data-message-author-role="user"], .user-message, div[class*="user"]'
  }
};

class DomDriverRegistry {
  constructor() {
    this.drivers = { ...FACTORY_DRIVER_PRESETS };
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return this.drivers;

    try {
      const storage = (typeof browser !== 'undefined' && browser.storage?.local)
        ? browser.storage.local
        : (typeof chrome !== 'undefined' && chrome.storage?.local ? chrome.storage.local : null);

      if (storage) {
        const stored = await new Promise(resolve => {
          storage.get([STORAGE_KEY_DOM_DRIVERS], res => resolve(res?.[STORAGE_KEY_DOM_DRIVERS]));
        });

        if (stored && typeof stored === 'object') {
          this.drivers = { ...FACTORY_DRIVER_PRESETS, ...stored };
        }
      }
    } catch (err) {
      console.warn('[DomDriverRegistry] Failed loading from storage, fallback to defaults:', err);
    }

    this.isInitialized = true;
    return this.drivers;
  }

  getDrivers() {
    return { ...this.drivers };
  }

  getDriver(id) {
    const d = this.drivers[id];
    if (!d) return null;
    return { ...DEFAULT_HUMAN_KINEMATICS, ...d };
  }

  getDriverForHost(hostname) {
    if (!hostname) return { ...DEFAULT_HUMAN_KINEMATICS, ...this.drivers.generic };
    const cleanHost = hostname.toLowerCase().trim();

    // 1. Direct domain matcher check
    for (const key of Object.keys(this.drivers)) {
      const driver = this.drivers[key];
      if (!driver.domain || driver.domain === '*') continue;

      const domains = driver.domain.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
      for (const d of domains) {
        if (cleanHost === d || cleanHost.endsWith('.' + d) || cleanHost.includes(d)) {
          return { ...DEFAULT_HUMAN_KINEMATICS, ...driver };
        }
      }
    }

    return { ...DEFAULT_HUMAN_KINEMATICS, ...this.drivers.generic };
  }

  getDriverForUrl(url) {
    try {
      const parsed = new URL(url);
      return this.getDriverForHost(parsed.hostname);
    } catch {
      return this.getDriverForHost(url);
    }
  }

  async saveDriver(id, driverData) {
    this.drivers[id] = {
      ...(this.drivers[id] || {}),
      ...driverData,
      id,
      lastModified: Date.now()
    };
    await this.persist();
    this.broadcastUpdate();
    return this.drivers[id];
  }

  async deleteDriver(id) {
    if (FACTORY_DRIVER_PRESETS[id]) {
      // Reset back to factory preset rather than leaving orphaned
      this.drivers[id] = { ...FACTORY_DRIVER_PRESETS[id] };
    } else {
      delete this.drivers[id];
    }
    await this.persist();
    this.broadcastUpdate();
  }

  async resetToDefaults() {
    this.drivers = JSON.parse(JSON.stringify(FACTORY_DRIVER_PRESETS));
    await this.persist();
    this.broadcastUpdate();
    return this.drivers;
  }

  async persist() {
    try {
      const storage = (typeof browser !== 'undefined' && browser.storage?.local)
        ? browser.storage.local
        : (typeof chrome !== 'undefined' && chrome.storage?.local ? chrome.storage.local : null);

      if (storage) {
        await new Promise(resolve => {
          storage.set({ [STORAGE_KEY_DOM_DRIVERS]: this.drivers }, resolve);
        });
      }
    } catch (err) {
      console.error('[DomDriverRegistry] Persist failed:', err);
    }
  }

  exportDriversJson() {
    return JSON.stringify(this.drivers, null, 2);
  }

  async importDriversJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || !parsed) throw new Error('Invalid JSON structure');

      this.drivers = {
        ...FACTORY_DRIVER_PRESETS,
        ...parsed
      };
      await this.persist();
      this.broadcastUpdate();
      return { success: true, count: Object.keys(parsed).length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  broadcastUpdate() {
    const runtimeApi = (typeof browser !== 'undefined' && browser.runtime)
      ? browser.runtime
      : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null);

    if (runtimeApi?.sendMessage) {
      try {
        runtimeApi.sendMessage({
          action: 'DOM_DRIVERS_UPDATED',
          drivers: this.drivers
        });
      } catch (_) {}
    }

    // Broadcast across all frames
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(ifr => {
      try {
        ifr.contentWindow?.postMessage({
          action: 'DOM_DRIVERS_UPDATED',
          drivers: this.drivers
        }, '*');
      } catch (_) {}
    });
  }
}

export const domDriverRegistry = new DomDriverRegistry();
