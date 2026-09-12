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
    inputSelector: '#prompt-textarea, div[contenteditable="true"]#prompt-textarea, div[contenteditable="true"][data-placeholder], textarea[data-id="root"], textarea',
    inputStrategy: 'lexical', // lexical | execCommand | native | simulatedKeys | auto
    submitSelector: 'button[data-testid="send-button"], button[data-testid="fruitjuice-send-button"], button[aria-label*="Send" i], button[aria-label*="ارسال" i], button:has(svg[data-icon="arrow-up"])',
    submitMechanism: 'click',
    responseContainerSelector: 'div[data-message-author-role="assistant"] div.markdown:not([data-testid*="thought"] *):not([class*="thought"] *):not([class*="reasoning"] *), article[data-testid*="conversation-turn"]:has([data-message-author-role="assistant"]) .markdown:not([data-testid*="thought"] *), div[data-message-author-role="assistant"], div.agent-turn, div[class*="agent-turn"]',
    streamingTokenSelector: 'div[data-message-author-role="assistant"] div.markdown:not([data-testid*="thought"] *):not([class*="thought"] *):not([class*="reasoning"] *), article[data-testid*="conversation-turn"]:has([data-message-author-role="assistant"]) .markdown:not([data-testid*="thought"] *), .markdown:not([data-testid*="thought"] *):not([class*="thought"] *):not([class*="reasoning"] *)',
    stopSelector: 'button[data-testid="stop-button"], button[aria-label*="Stop" i], button[aria-label*="توقف" i]',
    newChatSelector: 'a[data-testid="create-new-chat-button"], a[href="/"], button[aria-label*="New chat" i]',
    reasoningSelector: 'div[data-testid*="thought"], div.thought-content, div[class*="reasoning"], div[class*="thought"]',
    userBubbleSelector: 'div[data-message-author-role="user"], article[data-testid*="conversation-turn"]:has([data-message-author-role="user"])'
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
    responseContainerSelector: 'message-content:not(expandable-thought *):not(.thought-container *), .model-response-text:not(expandable-thought *), div.response-container, div[class*="model-response"]',
    streamingTokenSelector: '.model-response-text:not(expandable-thought *):not(.thought-container *), message-content .markdown:not(expandable-thought *), div.response-container-content:not(expandable-thought *), message-content:not(expandable-thought *)',
    stopSelector: 'button[aria-label*="Stop" i], button.stop-button',
    newChatSelector: 'button[aria-label*="New chat" i], a[aria-label*="New chat" i], .side-nav-button',
    reasoningSelector: 'expandable-thought, .thought-container, [aria-label*="Thinking" i], div[class*="thought"]',
    userBubbleSelector: 'user-query, .user-query-container'
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'deepseek.com, chat.deepseek.com',
    color: '#0ea5e9',
    inputSelector: 'textarea#chat-input, textarea[placeholder*="DeepSeek" i], textarea',
    inputStrategy: 'native',
    submitSelector: 'div[role="button"][aria-label*="Send" i], button[aria-label*="Send" i], div[class*="send-btn"], div[class*="sendBtn"], div.ds-icon-button, button[type="submit"]',
    submitMechanism: 'click',
    responseContainerSelector: 'div.ds-markdown:not(.ds-think *):not([class*="think"] *), div[class*="chat-message"]:not([class*="user"])',
    streamingTokenSelector: 'div.ds-markdown:not(.ds-think *):not([class*="think"] *)',
    stopSelector: 'div[role="button"][aria-label*="Stop" i], button[aria-label*="Stop" i], div.ds-icon-button:has(svg rect), button:has(rect), div[class*="stop-button"], button[class*="stop-button"]',
    newChatSelector: 'div[class*="new-chat"], button[class*="new-chat"]',
    reasoningSelector: 'div.ds-think, div[class*="think-content"], div[class*="thought"]',
    userBubbleSelector: 'div[class*="chat-message"][class*="user"], div.ds-user-content'
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
  zai: {
    id: 'zai',
    name: 'Z.ai (GLM)',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'z.ai, chat.z.ai, chatglm.cn',
    color: '#38bdf8',
    inputSelector: '#chat-input, textarea[placeholder*="Ask" i], textarea[placeholder*="Type" i], textarea, div[contenteditable="true"]',
    inputStrategy: 'native',
    submitSelector: '#send-message-button, .message-input-right-button-send button.send-button, button[type="submit"], button:has(svg)',
    submitMechanism: 'click',
    responseContainerSelector: '#response-content-container, div[class*="assistant"], div.message-bubble:not(.user), div.message-item:not(.user)',
    streamingTokenSelector: '#response-content-container, div[class*="markdown"], div.ds-markdown, div.message-bubble',
    stopSelector: 'button[class*="stop" i], button[aria-label*="Stop" i], button[title*="Stop" i]',
    newChatSelector: 'a[href="/"], button[class*="new-chat"], button[aria-label*="New chat" i]',
    reasoningSelector: '.thinking-chain-container, .thinking-block, div[class*="thinking"], div[class*="thought"]',
    userBubbleSelector: 'div[class*="user"], div.message-bubble.user, div.message-item.user'
  },
  qwen: {
    id: 'qwen',
    name: 'Qwen (Alibaba)',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'chat.qwen.ai, qwen.ai, chat.qwenlm.ai, qwenlm.ai',
    color: '#6366f1',
    inputSelector: 'textarea[placeholder*="Qwen" i], textarea[placeholder*="Type" i], textarea.chat-input, textarea, div[contenteditable="true"]',
    inputStrategy: 'native',
    submitSelector: 'button.send-button, .message-input-right-button-send button, button[type="submit"], button[aria-label*="Send" i]',
    submitMechanism: 'click',
    responseContainerSelector: 'div[class*="assistant"]:not([class*="thinking"] *):not([class*="thought"] *), div.message-item:not(.user):not([class*="thinking"] *), div[class*="chat-message"]:not([class*="user"])',
    streamingTokenSelector: 'div.markdown-body:not([class*="thinking"] *):not([class*="thought"] *):not([class*="reasoning"] *), div[class*="markdown"]:not([class*="thinking"] *):not([class*="thought"] *), div[class*="content"]:not([class*="thinking"] *)',
    stopSelector: 'button.stop-button, button[aria-label*="Stop" i], button:has(svg.stop-icon)',
    newChatSelector: 'button.new-chat-button, button[aria-label*="New chat" i], a[href="/"]',
    reasoningSelector: 'div[class*="thought"], div[class*="thinking"], div[class*="reasoning"]',
    userBubbleSelector: 'div[class*="user"], div.message-item.user, div[class*="chat-message"][class*="user"]'
  },
  kimi: {
    id: 'kimi',
    name: 'Kimi.ai (Moonshot)',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'kimi.ai, chat.kimi.ai, kimi.moonshot.cn',
    color: '#06b6d4',
    inputSelector: 'div.chat-input-editor[contenteditable="true"], div[data-testid="msh-chatinput-editor"], textarea, div[contenteditable="true"]',
    inputStrategy: 'execCommand',
    submitSelector: '#send-button, button[data-testid="send-button"], button.send-button, button:has(svg)',
    submitMechanism: 'click',
    responseContainerSelector: 'div[class*="segment-assistant"], div[class*="chat-message-assistant"], div.markdown',
    streamingTokenSelector: 'div.markdown, div[class*="markdown"], div[class*="segment-content"]',
    stopSelector: 'button[data-testid="stop-button"], button[aria-label*="Stop" i], button.stop-btn',
    newChatSelector: 'button[data-testid="new-chat-button"], button[aria-label*="New chat" i], a[href="/"]',
    reasoningSelector: 'div[class*="thought"], div[class*="thinking"], div[class*="reasoning"]',
    userBubbleSelector: 'div[class*="segment-user"], div[class*="chat-message-user"]'
  },
  aistudio: {
    id: 'aistudio',
    name: 'Google AI Studio',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'aistudio.google.com',
    color: '#4285f4',
    inputSelector: 'textarea[aria-label="Type something"], ms-autosize-textarea textarea, textarea[placeholder*="Type something" i], textarea, div[contenteditable="true"]',
    inputStrategy: 'native',
    submitSelector: 'button.run-button[aria-label="Run"], button.run-button, button[aria-label*="Run" i]',
    submitMechanism: 'click',
    responseContainerSelector: 'ms-chat-turn:has([data-turn-role="Model"]):not(:has([data-turn-role="Thought"])), ms-chat-turn[data-turn-role="Model"], ms-chat-turn',
    streamingTokenSelector: 'ms-chat-turn .markdown:not(ms-thought-chunk *):not([data-turn-role="Thought"] *), ms-chat-turn [class*="content"]:not(ms-thought-chunk *), ms-chat-turn',
    stopSelector: 'button.run-button.running, button[aria-label*="Stop" i], button[aria-label*="Cancel" i]',
    newChatSelector: 'button[aria-label*="New prompt" i], a[href*="/prompts/new"], a[href="/"]',
    reasoningSelector: 'div[class*="thought"], ms-thought-chunk, [data-turn-role="Thought"]',
    userBubbleSelector: 'ms-chat-turn:has([data-turn-role="User"]), ms-chat-turn[data-turn-role="User"]'
  },
  arena: {
    id: 'arena',
    name: 'Arena.ai (LMSYS)',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'lmarena.ai, arena.ai, chat.lmsys.org',
    color: '#f59e0b',
    inputSelector: 'textarea[name="message"], textarea[placeholder*="Send a message" i], textarea, div[contenteditable="true"]',
    inputStrategy: 'native',
    submitSelector: 'button[type="submit"], button[data-testid="send-button"], button.send-button, button[aria-label*="Send" i]',
    submitMechanism: 'click',
    responseContainerSelector: 'div[class*="assistant"]:not(details.thought *):not([class*="thought"] *), div[data-testid*="bot"]:not(details.thought *), div.message-row:not(.user)',
    streamingTokenSelector: 'div.markdown:not(details.thought *):not([class*="thought"] *), div.prose:not(details.thought *), [data-message-content]:not(details.thought *)',
    stopSelector: 'button[aria-label*="Stop" i], button.stop-button',
    newChatSelector: 'button[aria-label*="Clear" i], button[aria-label*="New" i], a[href="/"]',
    reasoningSelector: 'details.thought, div[class*="thought"], div[class*="thinking"]',
    userBubbleSelector: 'div[class*="user"], div.message-row.user'
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
    responseContainerSelector: 'div.font-claude-message:not([data-testid*="thinking"] *):not([class*="thinking"] *), div[data-is-streaming]:not([data-testid*="thinking"] *), div[data-testid*="chat-message-assistant"]:not([data-testid*="thinking"] *), div.font-claude-response',
    streamingTokenSelector: 'div.font-claude-message:not([data-testid*="thinking"] *):not([class*="thinking"] *), div[data-is-streaming="true"]:not([data-testid*="thinking"] *), div.prose:not([data-testid*="thinking"] *), div.font-claude-response:not([data-testid*="thinking"] *)',
    stopSelector: 'button[aria-label*="Stop" i], button[aria-label*="Cancel" i], button[aria-label*="توقف" i]',
    newChatSelector: 'a[href="/new"], button[aria-label*="Start new chat" i], a[aria-label*="New chat" i]',
    reasoningSelector: 'div[data-testid*="thinking"], div.thinking-content, [class*="thinking"]',
    userBubbleSelector: 'div[data-testid*="chat-message-user"], div.font-user-message'
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral Le Chat',
    ...DEFAULT_HUMAN_KINEMATICS,
    domain: 'chat.mistral.ai, mistral.ai',
    color: '#f97316',
    inputSelector: 'textarea[placeholder*="Ask" i], textarea, div[contenteditable="true"]',
    inputStrategy: 'native',
    submitSelector: 'button[type="submit"], button[aria-label*="Send" i], button:has(svg)',
    submitMechanism: 'click',
    responseContainerSelector: 'div.prose, div[data-message-role="assistant"]',
    streamingTokenSelector: 'div.prose',
    stopSelector: 'button[aria-label*="Stop" i]',
    newChatSelector: 'a[href="/chat"], a[href="/"], button[aria-label*="New chat" i]',
    reasoningSelector: 'div.reasoning-block, div[class*="thought"]',
    userBubbleSelector: 'div[data-message-role="user"]'
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
    responseContainerSelector: 'div.markdown:not(.reasoning *):not([class*="thought"] *):not([class*="think"] *):not(details *), div[class*="message"]:not([class*="user"]):not(.reasoning *), div.prose:not(.reasoning *)',
    streamingTokenSelector: 'div.markdown:not(.reasoning *):not([class*="thought"] *):not([class*="think"] *):not(details *), div.prose:not(.reasoning *):not(details *), [data-message-content]:not(.reasoning *)',
    stopSelector: 'button[aria-label*="stop" i], button[title*="stop" i], button[data-testid*="stop" i]',
    newChatSelector: 'button[aria-label*="new" i], a[aria-label*="new" i]',
    reasoningSelector: 'details, summary, .reasoning, div[class*="thought"], div[class*="think"]',
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
          let resolved = false;
          const timer = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve(null);
            }
          }, 400);

          try {
            const p = storage.get([STORAGE_KEY_DOM_DRIVERS], res => {
              if (!resolved) {
                resolved = true;
                clearTimeout(timer);
                resolve(res?.[STORAGE_KEY_DOM_DRIVERS]);
              }
            });
            if (p && typeof p.then === 'function') {
              p.then(res => {
                if (!resolved) {
                  resolved = true;
                  clearTimeout(timer);
                  resolve(res?.[STORAGE_KEY_DOM_DRIVERS]);
                }
              }).catch(() => {
                if (!resolved) {
                  resolved = true;
                  clearTimeout(timer);
                  resolve(null);
                }
              });
            }
          } catch (_) {
            if (!resolved) {
              resolved = true;
              clearTimeout(timer);
              resolve(null);
            }
          }
        });

        if (stored && typeof stored === 'object') {
          this.drivers = { ...FACTORY_DRIVER_PRESETS, ...stored };

          // Migration: upgrade any stale preset selectors that lack reasoning protection
          Object.keys(FACTORY_DRIVER_PRESETS).forEach(k => {
            const factory = FACTORY_DRIVER_PRESETS[k];
            const current = this.drivers[k];
            if (current && factory) {
              const isStale = (
                k === 'deepseek' && (current.streamingTokenSelector === 'div.ds-markdown' || !current.streamingTokenSelector?.includes(':not'))
              ) || (
                factory.streamingTokenSelector.includes(':not') && !current.streamingTokenSelector?.includes(':not')
              );

              if (isStale) {
                current.streamingTokenSelector = factory.streamingTokenSelector;
                current.responseContainerSelector = factory.responseContainerSelector;
                current.stopSelector = factory.stopSelector;
                current.reasoningSelector = factory.reasoningSelector;
              }
            }
          });
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
          let resolved = false;
          const timer = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          }, 400);

          try {
            const p = storage.set({ [STORAGE_KEY_DOM_DRIVERS]: this.drivers }, () => {
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
          } catch (_) {
            if (!resolved) {
              resolved = true;
              clearTimeout(timer);
              resolve();
            }
          }
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
