/**
 * OmniAI Hub — Frame Prompt Injection Engine (Manifest V3)
 * Operates inside embedded AI frames with human-like dispatch kinematics.
 * Supports ProseMirror, Lexical, Draft.js, Quill, and Virtual DOM event cycles.
 */

(() => {
  if (window === window.top) return;

  const HOST = window.location.hostname;
  let cardId = window.name || null;
  let lastHandledMessageId = null;
  const handledMessageIds = new Set();
  let lastInjectedPrompt = '';
  let lastInjectedTime = 0;
  let activeDriver = null;
  let streamObserver = null;
  let streamThrottleTimer = null;
  let streamInactivityTimer = null;
  let activeTypingAbortCtrl = null;

  const DEFAULT_HUMAN_KINEMATICS = {
    humanizeEnabled: true,
    humanizeMode: 'burst', // 'burst' | 'cadence' | 'paste' | 'instant'
    humanizeSpeed: 'natural',
    minKeystrokeDelay: 25,
    maxKeystrokeDelay: 70,
    punctuationPauseMs: 220,
    preSubmitDelayMs: 500,
    clickDwellMs: 75,
    simulateTypos: true,
    cursorJitter: true,
    hoverBeforeClick: true
  };

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  // Adjacent keys map on standard QWERTY for realistic typo simulation
  const ADJACENT_KEYS = {
    'q': 'wa', 'w': 'qes', 'e': 'wrd', 'r': 'etf', 't': 'ryg',
    'y': 'tuh', 'u': 'yij', 'i': 'uok', 'o': 'ipl', 'p': 'ol',
    'a': 'qwsz', 's': 'awedxz', 'd': 'serfcx', 'f': 'drtgvc',
    'g': 'ftyhbv', 'h': 'gyujnb', 'j': 'huikmn', 'k': 'jiolm',
    'l': 'kop', 'z': 'asx', 'x': 'zsdc', 'c': 'xdfv',
    'v': 'cfgb', 'b': 'vghn', 'n': 'bhjm', 'm': 'njk'
  };

  function getDriverMerged(customDriver) {
    return {
      ...DEFAULT_HUMAN_KINEMATICS,
      ...(activeDriver || {}),
      ...(customDriver || {})
    };
  }

  // Multi-Strategy Input Injection Engine (Supports React, Lexical, ProseMirror, Quill)
  function setNativeValue(element, value) {
    element.focus();
    const tracker = element._valueTracker;
    if (tracker) {
      tracker.setValue('');
    }

    const prototype = Object.getPrototypeOf(element);
    const protoSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;

    if (protoSetter && valueSetter !== protoSetter) {
      protoSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }

    try {
      element.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType: 'insertText', data: value }));
    } catch (_) {}
    element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  function setContentEditableValue(element, text) {
    element.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    sel.removeAllRanges();
    sel.addRange(range);

    let execOk = false;
    try {
      execOk = document.execCommand('insertText', false, text);
    } catch (_) {}

    const curText = (element.innerText || element.textContent || '').trim();
    if (!execOk || !curText.includes(text.trim())) {
      let p = element.querySelector('p');
      if (!p) {
        p = document.createElement('p');
        element.innerHTML = '';
        element.appendChild(p);
      }
      p.textContent = text;

      const newRange = document.createRange();
      newRange.selectNodeContents(p);
      newRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    try {
      element.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        composed: true,
        inputType: 'insertText',
        data: text
      }));
    } catch (_) {}
    element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  function applyInputStrategy(element, text, strategy = 'auto') {
    if (!element || !text) return;
    element.focus();

    if (strategy === 'native') {
      setNativeValue(element, text);
    } else if (strategy === 'execCommand' || strategy === 'lexical') {
      setContentEditableValue(element, text);
    } else {
      if (element.isContentEditable || element.getAttribute('contenteditable') === 'true') {
        setContentEditableValue(element, text);
      } else {
        setNativeValue(element, text);
      }
    }
  }

  // Realistic Human Cursor & Pointer Engine with Bounding Box Jitter & Hover
  async function dispatchHumanClick(el, kinematics = {}) {
    if (!el) return false;
    try { el.focus?.(); } catch (_) {}

    const rect = el.getBoundingClientRect();
    const useJitter = kinematics.cursorJitter !== false;

    // Realistic target coordinate inside element bounds (15% to 85% range)
    const offsetX = useJitter ? rect.width * (0.15 + Math.random() * 0.7) : rect.width / 2;
    const offsetY = useJitter ? rect.height * (0.15 + Math.random() * 0.7) : rect.height / 2;
    const clientX = Math.round(rect.left + Math.max(1, offsetX));
    const clientY = Math.round(rect.top + Math.max(1, offsetY));
    const screenX = Math.round((window.screenX || 0) + clientX);
    const screenY = Math.round((window.screenY || 0) + clientY);

    const baseOpts = {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX,
      clientY,
      screenX,
      screenY,
      button: 0,
      buttons: 1,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true
    };

    // 1. Hover & Approach simulation
    if (kinematics.hoverBeforeClick !== false) {
      const approachX = clientX + Math.round((Math.random() - 0.5) * 14);
      const approachY = clientY + Math.round((Math.random() - 0.5) * 10);
      el.dispatchEvent(new PointerEvent('pointerover', { ...baseOpts, clientX: approachX, clientY: approachY, buttons: 0 }));
      el.dispatchEvent(new PointerEvent('pointerenter', { ...baseOpts, clientX: approachX, clientY: approachY, buttons: 0 }));
      el.dispatchEvent(new MouseEvent('mouseover', { ...baseOpts, clientX: approachX, clientY: approachY, buttons: 0 }));
      el.dispatchEvent(new PointerEvent('pointermove', { ...baseOpts, clientX, clientY, buttons: 0 }));
      el.dispatchEvent(new MouseEvent('mousemove', { ...baseOpts, clientX, clientY, buttons: 0 }));
      await sleep(30 + Math.floor(Math.random() * 55));
    }

    // 2. Pointer down + Mouse down with natural pressure
    el.dispatchEvent(new PointerEvent('pointerdown', { ...baseOpts, pressure: 0.5 + Math.random() * 0.2 }));
    el.dispatchEvent(new MouseEvent('mousedown', baseOpts));

    // 3. Natural human click dwell time
    const dwell = kinematics.clickDwellMs || (55 + Math.floor(Math.random() * 50));
    await sleep(dwell);

    // 4. Pointer up + Mouse up
    el.dispatchEvent(new PointerEvent('pointerup', { ...baseOpts, buttons: 0, pressure: 0 }));
    el.dispatchEvent(new MouseEvent('mouseup', { ...baseOpts, buttons: 0 }));

    // 5. Final Click
    el.dispatchEvent(new MouseEvent('click', { ...baseOpts, buttons: 0 }));
    return true;
  }

  function clickElement(el) {
    if (!el) return false;
    try { el.focus?.(); } catch (_) {}
    return dispatchHumanClick(el, { hoverBeforeClick: false, cursorJitter: true });
  }

  function dispatchEnterKey(inputElement) {
    if (!inputElement) return;
    const opts = {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window
    };
    inputElement.dispatchEvent(new KeyboardEvent('keydown', opts));
    inputElement.dispatchEvent(new KeyboardEvent('keypress', opts));
    inputElement.dispatchEvent(new KeyboardEvent('keyup', opts));
  }

  function isButtonReady(btn) {
    if (!btn) return false;
    if (btn.disabled || btn.hasAttribute('disabled')) return false;
    if (btn.getAttribute('aria-disabled') === 'true') return false;
    if (btn.classList.contains('disabled')) return false;
    try {
      const style = window.getComputedStyle(btn);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (style.pointerEvents === 'none') return false;
    } catch (_) {}
    return true;
  }

  // --- Human Keystroke & Typing Emulation Sub-Engine ---

  function typeChunkIntoElement(element, chunk, strategy = 'auto') {
    element.focus();
    if (element.isContentEditable || element.getAttribute('contenteditable') === 'true' || strategy === 'lexical' || strategy === 'execCommand') {
      let success = false;
      try {
        success = document.execCommand('insertText', false, chunk);
      } catch (_) {}

      if (!success) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const textNode = document.createTextNode(chunk);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          element.textContent += chunk;
        }
      }

      try {
        element.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          composed: true,
          inputType: 'insertText',
          data: chunk
        }));
      } catch (_) {}
      element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    } else {
      const start = element.selectionStart ?? element.value.length;
      const end = element.selectionEnd ?? element.value.length;
      const oldVal = element.value || '';
      const newVal = oldVal.slice(0, start) + chunk + oldVal.slice(end);

      const prototype = Object.getPrototypeOf(element);
      const protoSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      if (protoSetter) {
        protoSetter.call(element, newVal);
      } else {
        element.value = newVal;
      }
      element.selectionStart = element.selectionEnd = start + chunk.length;

      try {
        element.dispatchEvent(new InputEvent('input', {
          bubbles: true,
          composed: true,
          inputType: 'insertText',
          data: chunk
        }));
      } catch (_) {}
      element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }
  }

  function backspaceOneChar(element) {
    element.focus();
    let success = false;
    try {
      success = document.execCommand('delete', false, null);
    } catch (_) {}

    if (!success && !element.isContentEditable) {
      const start = element.selectionStart ?? element.value.length;
      if (start > 0) {
        const oldVal = element.value || '';
        const newVal = oldVal.slice(0, start - 1) + oldVal.slice(start);
        const prototype = Object.getPrototypeOf(element);
        const protoSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
        if (protoSetter) protoSetter.call(element, newVal);
        else element.value = newVal;
        element.selectionStart = element.selectionEnd = start - 1;
      }
    }

    try {
      element.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        composed: true,
        inputType: 'deleteContentBackward'
      }));
    } catch (_) {}
    element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  function calculateKeystrokeDelay(kinematics, char) {
    let min = kinematics.minKeystrokeDelay || 25;
    let max = kinematics.maxKeystrokeDelay || 70;

    if (kinematics.humanizeSpeed === 'relaxed') {
      min = 45; max = 95;
    } else if (kinematics.humanizeSpeed === 'rapid') {
      min = 12; max = 38;
    }

    let delay = min + Math.random() * (max - min);

    // Natural log-normal micro-hesitations
    if (Math.random() < 0.08) {
      delay += 80 + Math.random() * 120;
    }

    // Punctuation and newline thinking pauses
    if (char && /[.,!?;:\n]/.test(char)) {
      delay += kinematics.punctuationPauseMs || 220;
    } else if (char === ' ') {
      delay += 35 + Math.random() * 45;
    }

    return Math.round(delay);
  }

  // Mode 1: Natural Keystroke Cadence (Character by Character)
  async function simulateHumanCadenceTyping(element, text, strategy, kinematics, abortSignal) {
    element.focus();
    const chars = Array.from(text);

    for (let i = 0; i < chars.length; i++) {
      if (abortSignal?.aborted) return;
      const char = chars[i];

      // Occasional natural typo & backspace correction
      if (kinematics.simulateTypos && /[a-z]/i.test(char) && Math.random() < 0.018) {
        const lower = char.toLowerCase();
        const adjacent = ADJACENT_KEYS[lower] || 's';
        const typoChar = adjacent[Math.floor(Math.random() * adjacent.length)];
        typeChunkIntoElement(element, typoChar, strategy);
        await sleep(90 + Math.random() * 100);
        backspaceOneChar(element);
        await sleep(70 + Math.random() * 80);
      }

      typeChunkIntoElement(element, char, strategy);
      const delay = calculateKeystrokeDelay(kinematics, char);
      await sleep(delay);
    }
  }

  // Mode 2: Adaptive Human Burst (Syllable / Word Chunks)
  async function simulateHumanBurstTyping(element, text, strategy, kinematics, abortSignal) {
    element.focus();
    const chunks = [];
    let cur = '';

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      cur += ch;
      const isPunct = /[.,!?;:\n]/.test(ch);
      const isSpace = ch === ' ';
      const isChunkLimit = cur.length >= (2 + Math.floor(Math.random() * 5));

      if (isPunct || isSpace || isChunkLimit || i === text.length - 1) {
        chunks.push(cur);
        cur = '';
      }
    }
    if (cur) chunks.push(cur);

    for (const chunk of chunks) {
      if (abortSignal?.aborted) return;
      typeChunkIntoElement(element, chunk, strategy);

      const lastChar = chunk.slice(-1);
      let burstDelay = 35 + Math.random() * 45;
      if (kinematics.humanizeSpeed === 'relaxed') burstDelay += 35;
      if (kinematics.humanizeSpeed === 'rapid') burstDelay = Math.max(15, burstDelay - 18);

      if (/[.,!?;:\n]/.test(lastChar)) {
        burstDelay += (kinematics.punctuationPauseMs || 220);
      } else if (lastChar === ' ') {
        burstDelay += 30 + Math.random() * 30;
      }

      await sleep(Math.round(burstDelay));
    }
  }

  // Mode 3: Smart Human Paste Simulation
  async function simulateHumanPaste(element, text, strategy, kinematics, abortSignal) {
    element.focus();
    await sleep(80 + Math.random() * 60);
    applyInputStrategy(element, text, strategy);
    await sleep(250 + Math.random() * 200);
  }

  function showInjectionBadge(modeText = '⚡ Dispatched') {
    let badge = document.getElementById('omni-jewel-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'omni-jewel-badge';
      badge.style.cssText = `
        position: fixed;
        top: 8px;
        right: 8px;
        background: linear-gradient(135deg, rgba(192, 132, 252, 0.95) 0%, rgba(244, 114, 182, 0.9) 100%);
        backdrop-filter: blur(16px);
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
        font-size: 9.5px;
        font-weight: 600;
        letter-spacing: -0.01em;
        padding: 3px 8px;
        border-radius: 6px;
        box-shadow: 0 4px 18px rgba(244, 114, 182, 0.45);
        z-index: 2147483647;
        opacity: 0;
        transform: translateY(-4px) scale(0.96);
        transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      `;
      document.body.appendChild(badge);
    }
    badge.innerText = modeText;

    requestAnimationFrame(() => {
      badge.style.opacity = '1';
      badge.style.transform = 'translateY(0) scale(1)';
      setTimeout(() => {
        badge.style.opacity = '0';
        badge.style.transform = 'translateY(-4px) scale(0.96)';
      }, 1500);
    });
  }

  // Dynamic Selector Resolution with Driver Support
  function locateElementsWithDriver(driver) {
    let inputEl = null;
    let submitBtn = null;

    if (driver?.inputSelector) {
      try { inputEl = document.querySelector(driver.inputSelector); } catch (_) {}
    }

    if (!inputEl) {
      if (HOST.includes('chatgpt.com') || HOST.includes('openai.com')) {
        inputEl = document.querySelector('#prompt-textarea') ||
                  document.querySelector('div[contenteditable="true"]#prompt-textarea') ||
                  document.querySelector('div[contenteditable="true"][data-placeholder]') ||
                  document.querySelector('textarea[data-id="root"]') ||
                  document.querySelector('textarea');
      } else if (HOST.includes('claude.ai')) {
        inputEl = document.querySelector('div.ProseMirror[contenteditable="true"]') ||
                  document.querySelector('div[contenteditable="true"][aria-label*="Claude" i]') ||
                  document.querySelector('div[contenteditable="true"]');
      } else if (HOST.includes('gemini.google.com')) {
        inputEl = document.querySelector('.ql-editor[contenteditable="true"]') ||
                  document.querySelector('rich-textarea div[contenteditable="true"]') ||
                  document.querySelector('textarea[aria-label*="prompt" i]') ||
                  document.querySelector('div[contenteditable="true"]');
      } else if (HOST.includes('deepseek.com')) {
        inputEl = document.querySelector('textarea#chat-input') ||
                  document.querySelector('textarea[placeholder*="DeepSeek" i]') ||
                  document.querySelector('textarea');
      } else if (HOST.includes('grok.com')) {
        inputEl = document.querySelector('textarea[placeholder*="Ask" i]') ||
                  document.querySelector('div[contenteditable="true"]') ||
                  document.querySelector('textarea');
      } else if (HOST.includes('z.ai') || HOST.includes('chatglm.cn')) {
        inputEl = document.querySelector('#chat-input') ||
                  document.querySelector('textarea[placeholder*="Ask" i]') ||
                  document.querySelector('textarea[placeholder*="Type" i]') ||
                  document.querySelector('textarea') ||
                  document.querySelector('div[contenteditable="true"]');
      } else if (HOST.includes('qwen.ai') || HOST.includes('qwenlm.ai')) {
        inputEl = document.querySelector('textarea[placeholder*="Qwen" i]') ||
                  document.querySelector('textarea.chat-input') ||
                  document.querySelector('textarea') ||
                  document.querySelector('div[contenteditable="true"]');
      } else if (HOST.includes('kimi.ai') || HOST.includes('kimi.moonshot.cn')) {
        inputEl = document.querySelector('div.chat-input-editor[contenteditable="true"]') ||
                  document.querySelector('div[data-testid="msh-chatinput-editor"]') ||
                  document.querySelector('div[contenteditable="true"]') ||
                  document.querySelector('textarea');
      } else if (HOST.includes('aistudio.google.com')) {
        inputEl = document.querySelector('textarea[aria-label="Type something"]') ||
                  document.querySelector('ms-autosize-textarea textarea') ||
                  document.querySelector('textarea[placeholder*="Type something" i]') ||
                  document.querySelector('textarea') ||
                  document.querySelector('div[contenteditable="true"]');
      } else if (HOST.includes('lmarena.ai') || HOST.includes('arena.ai') || HOST.includes('lmsys.org')) {
        inputEl = document.querySelector('textarea[name="message"]') ||
                  document.querySelector('textarea[placeholder*="Send a message" i]') ||
                  document.querySelector('textarea') ||
                  document.querySelector('div[contenteditable="true"]');
      } else if (HOST.includes('mistral.ai')) {
        inputEl = document.querySelector('textarea[placeholder*="Ask" i]') ||
                  document.querySelector('textarea') ||
                  document.querySelector('div[contenteditable="true"]');
      }
    }

    if (!inputEl) {
      inputEl = document.querySelector('textarea:not([disabled])') ||
                document.querySelector('div[contenteditable="true"]:not([disabled])') ||
                document.querySelector('*[role="textbox"]');
    }

    if (driver?.submitSelector) {
      try { submitBtn = document.querySelector(driver.submitSelector); } catch (_) {}
    }

    if (!submitBtn) {
      if (HOST.includes('aistudio.google.com')) {
        submitBtn = document.querySelector('button.run-button[aria-label="Run"]') ||
                    document.querySelector('button.run-button') ||
                    document.querySelector('button[aria-label*="Run" i]');
      } else if (HOST.includes('z.ai') || HOST.includes('chatglm.cn')) {
        submitBtn = document.querySelector('#send-message-button') ||
                    document.querySelector('.message-input-right-button-send button.send-button');
      } else if (HOST.includes('qwen.ai') || HOST.includes('qwenlm.ai')) {
        submitBtn = document.querySelector('button.send-button') ||
                    document.querySelector('.message-input-right-button-send button');
      } else if (HOST.includes('kimi.ai') || HOST.includes('kimi.moonshot.cn')) {
        submitBtn = document.querySelector('#send-button') ||
                    document.querySelector('button[data-testid="send-button"]') ||
                    document.querySelector('button.send-button');
      } else if (HOST.includes('lmarena.ai') || HOST.includes('arena.ai') || HOST.includes('lmsys.org')) {
        submitBtn = document.querySelector('button[data-testid="send-button"]') ||
                    document.querySelector('button.send-button');
      }
    }

    if (!submitBtn) {
      submitBtn = document.querySelector('button[data-testid*="send" i]') ||
                  document.querySelector('button[aria-label*="send" i]') ||
                  document.querySelector('button[aria-label*="submit" i]') ||
                  document.querySelector('button[aria-label*="run" i]') ||
                  document.querySelector('button[aria-label*="ارسال" i]') ||
                  document.querySelector('div[role="button"][aria-label*="send" i]') ||
                  document.querySelector('div[role="button"][aria-label*="ارسال" i]') ||
                  document.querySelector('button[type="submit"]');
    }

    if (!submitBtn && inputEl) {
      const container = inputEl.closest('form, [class*="composer"], [class*="prompt"], [class*="input"], fieldset') || inputEl.parentElement;
      if (container) {
        submitBtn = container.querySelector('button:not([disabled])') ||
                    container.querySelector('button[type="submit"]') ||
                    container.querySelector('button');
      }
    }

    return { inputEl, submitBtn };
  }

  const REASONING_CONTAINER_FILTER = '.ds-think, [class*="think-content"], [class*="thought"], [class*="reasoning"], details.thought, expandable-thought, ms-thought-chunk, [data-turn-role="Thought"], [data-testid*="thought"], [data-testid*="thinking"], div.thinking-content, .thought-container, [aria-label*="Thinking" i]';

  function extractStructuredContent(element, options = {}) {
    if (!element) return '';

    // If caller did not explicitly request preserving reasoning, and the target element itself is a reasoning container, return empty
    if (!options.preserveReasoning) {
      if (element.matches?.(REASONING_CONTAINER_FILTER) || element.closest?.(REASONING_CONTAINER_FILTER)) {
        return '';
      }
    }

    if (!element.children || element.children.length === 0) {
      return (element.innerText || element.textContent || '').trim();
    }

    const clone = element.cloneNode(true);

    const stripReasoning = options.preserveReasoning !== true;
    const reasoningSelectors = stripReasoning ? `, ${REASONING_CONTAINER_FILTER}` : '';

    clone.querySelectorAll(
      'button, svg, [role="button"], [class*="copy"], [class*="toolbar"], ' +
      '[class*="actions"], [class*="feedback"], .sr-only, [aria-hidden="true"]' +
      reasoningSelectors
    ).forEach(el => el.remove());

    clone.querySelectorAll('pre').forEach(pre => {
      const codeEl = pre.querySelector('code') || pre;
      let lang = '';

      const classStr = `${codeEl.className || ''} ${pre.className || ''}`;
      const langMatch = classStr.match(/(?:language|lang)-([a-zA-Z0-9_#-]+)/i);
      if (langMatch) {
        lang = langMatch[1];
      } else {
        const headerEl = pre.querySelector('[class*="header"], [class*="title"], [class*="lang"]');
        if (headerEl) {
          const headerText = (headerEl.innerText || headerEl.textContent || '').trim().toLowerCase();
          if (/^[a-z0-9#+_-]{1,15}$/.test(headerText)) {
            lang = headerText;
          }
        }
      }

      const rawCode = (codeEl.textContent || '').replace(/\r\n/g, '\n').trim();
      const codeFence = `\n\n\`\`\`${lang}\n${rawCode}\n\`\`\`\n\n`;
      pre.replaceWith(document.createTextNode(codeFence));
    });

    clone.querySelectorAll('code').forEach(code => {
      const inlineText = (code.textContent || '').trim();
      if (inlineText && !inlineText.includes('`')) {
        code.replaceWith(document.createTextNode(`\`${inlineText}\``));
      }
    });

    let text = (clone.innerText || clone.textContent || '').trim();
    text = text.replace(/\n{3,}/g, '\n\n');
    return text;
  }

  function extractConversationHistory(targetCardId, driver) {
    const userSel = driver?.userBubbleSelector || '[data-message-author-role="user"], [data-testid*="user"]';
    const botSel = driver?.responseContainerSelector || '[data-message-author-role="assistant"], [data-testid*="assistant"]';
    const reasoningSel = driver?.reasoningSelector || REASONING_CONTAINER_FILTER;

    let userNodes = [];
    let botNodes = [];

    try { userNodes = Array.from(document.querySelectorAll(userSel)); } catch (_) {}
    try {
      botNodes = Array.from(document.querySelectorAll(botSel)).filter(el => {
        return !el.matches?.(REASONING_CONTAINER_FILTER) && !el.closest?.(REASONING_CONTAINER_FILTER);
      });
    } catch (_) {}

    const allElements = [];
    userNodes.forEach(node => allElements.push({ node, role: 'user' }));
    botNodes.forEach(node => allElements.push({ node, role: 'assistant' }));

    allElements.sort((a, b) => {
      const pos = a.node.compareDocumentPosition(b.node);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    const messages = [];
    allElements.forEach((item, idx) => {
      let thinkingText = '';
      if (item.role === 'assistant') {
        const reasoningEl = item.node.querySelector?.(reasoningSel);
        if (reasoningEl) {
          thinkingText = extractStructuredContent(reasoningEl, { preserveReasoning: true });
        }
      }

      const text = extractStructuredContent(item.node);
      if (text && text.length > 0) {
        messages.push({
          id: `hist_${item.role}_${idx}_${Date.now()}`,
          role: item.role,
          text,
          thinkingText: thinkingText || undefined,
          time: 'Synced'
        });
      }
    });

    const payload = {
      action: 'EXTRACT_HISTORY_RESULT',
      cardId: targetCardId || cardId || window.name,
      messages
    };

    window.top.postMessage(payload, '*');
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      try { chrome.runtime.sendMessage(payload); } catch (_) {}
    }
  }

  function startStreamingScraper(driver) {
    stopStreamingScraper();

    const responseSelector = driver?.streamingTokenSelector || driver?.responseContainerSelector || 'div.markdown, div.prose, [data-message-author-role="assistant"]';
    const reasoningSelector = driver?.reasoningSelector || 'div[class*="thought"], div[class*="think"], div.ds-think, [data-testid*="thought"], [data-testid*="thinking"], expandable-thought';
    const stopSelector = driver?.stopSelector || 'div[role="button"][aria-label*="Stop" i], button[data-testid="stop-button"], button[aria-label*="Stop" i], button[aria-label*="توقف" i], div.ds-icon-button:has(svg rect), button:has(rect)';

    const getValidResponseElements = () => {
      try {
        const all = Array.from(document.querySelectorAll(responseSelector));
        return all.filter(el => {
          if (el.matches?.(REASONING_CONTAINER_FILTER)) return false;
          if (el.closest?.(REASONING_CONTAINER_FILTER)) return false;
          return true;
        });
      } catch (_) {
        return [];
      }
    };

    const isStopButtonActive = () => {
      try {
        const btns = document.querySelectorAll(stopSelector);
        for (const btn of btns) {
          if (isButtonReady(btn)) return true;
        }
      } catch (_) {}

      // Fallback check for active streaming indicator, cursor or running state
      try {
        const indicators = document.querySelectorAll(
          '[data-is-streaming="true"], .result-streaming, .ds-cursor, span[class*="cursor"], ' +
          'button[data-testid="stop-button"], button[aria-label*="Stop" i], button[aria-label*="توقف" i]'
        );
        for (const ind of indicators) {
          if (ind.tagName === 'BUTTON') {
            if (isButtonReady(ind)) return true;
          } else if (ind.offsetParent !== null) {
            return true;
          }
        }
      } catch (_) {}

      return false;
    };

    let initialCount = getValidResponseElements().length;
    let hasStarted = false;
    let hasThinkingStarted = false;
    let hasResponseStarted = false;
    let transitionGraceCount = 0;

    const scrapeAndRelay = (isFinished = false) => {
      const currentValidElements = getValidResponseElements();

      let latestResponseEl = null;
      if (currentValidElements.length > initialCount) {
        latestResponseEl = currentValidElements[currentValidElements.length - 1];
      } else if (initialCount === 0 && currentValidElements.length > 0) {
        latestResponseEl = currentValidElements[currentValidElements.length - 1];
      }

      let text = latestResponseEl ? extractStructuredContent(latestResponseEl) : '';
      let html = latestResponseEl ? latestResponseEl.innerHTML : '';

      let thinkingText = '';
      try {
        const reasoningEls = Array.from(document.querySelectorAll(reasoningSelector));
        if (reasoningEls.length > 0) {
          const latestReasoning = reasoningEls[reasoningEls.length - 1];
          thinkingText = extractStructuredContent(latestReasoning, { preserveReasoning: true });
        }
      } catch (_) {}

      if (thinkingText) {
        hasThinkingStarted = true;
      }
      if (text && text.trim().length > 0) {
        hasResponseStarted = true;
      }

      const stopBtnActive = isStopButtonActive();
      if (currentValidElements.length > initialCount || stopBtnActive || thinkingText || text) {
        hasStarted = true;
      }

      // isThinking is strictly true ONLY when thinkingText exists and the main response text has not arrived yet
      const isThinking = Boolean(thinkingText && (!text || text.trim().length === 0));

      // Safety Fallback: If terminating after generous timeout and no text was produced, keep thinkingText to prevent freezing
      if (isFinished && !text && thinkingText) {
        console.warn('[OmniAI Hub] Model produced only reasoning without final text. Providing graceful fallback.');
        text = thinkingText;
      }

      if (text || thinkingText || isFinished) {
        const payload = {
          action: 'MIRROR_STREAM_CHUNK',
          cardId: cardId || window.name,
          text,
          html,
          isThinking,
          thinkingText,
          isFinished,
          timestamp: Date.now()
        };

        window.top.postMessage(payload, '*');
        if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
          try { chrome.runtime.sendMessage(payload); } catch (_) {}
        }
      }

      if (isFinished) {
        stopStreamingScraper();
      }
    };

    const scheduleInactivityCheck = () => {
      clearTimeout(streamInactivityTimer);

      // Adaptive timeout: If thinking has started but final answer tokens haven't arrived yet,
      // allow 6000ms pause to bridge the 1.5 - 4.5s transition gap. Once response is streaming, use 5000ms.
      const timeoutMs = (hasThinkingStarted && !hasResponseStarted) ? 6000 : 5000;

      streamInactivityTimer = setTimeout(() => {
        const stopActive = isStopButtonActive();

        // 1. If stop button or streaming indicator is STILL active, NEVER mark finished!
        if (stopActive) {
          scheduleInactivityCheck();
          return;
        }

        // 2. If thinking started, but answer tokens haven't started yet:
        // Give transition grace attempts (up to 4 attempts = ~14 seconds max transition wait)
        if (hasThinkingStarted && !hasResponseStarted && transitionGraceCount < 4) {
          transitionGraceCount++;
          scheduleInactivityCheck();
          return;
        }

        // 3. If generation started and is now idle with no stop button active
        if (hasStarted) {
          scrapeAndRelay(true);
        }
      }, timeoutMs);
    };

    streamObserver = new MutationObserver(() => {
      if (!streamThrottleTimer) {
        streamThrottleTimer = setTimeout(() => {
          streamThrottleTimer = null;
          scrapeAndRelay(false);
        }, 50);
      }

      scheduleInactivityCheck();
    });

    streamObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    scheduleInactivityCheck();

    // Absolute fallback safety timeout (180s for deep reasoning models)
    setTimeout(() => {
      if (streamObserver) {
        scrapeAndRelay(true);
      }
    }, 180000);
  }

  function stopStreamingScraper() {
    if (streamObserver) {
      streamObserver.disconnect();
      streamObserver = null;
    }
    clearTimeout(streamThrottleTimer);
    clearTimeout(streamInactivityTimer);
    streamThrottleTimer = null;
    streamInactivityTimer = null;
  }

  async function executePromptInjection(promptText, customDriver = null, messageId = null, attempt = 1) {
    if (!promptText) return;

    const trimmedPrompt = promptText.trim();
    const now = Date.now();

    // بررسی محافظت تکرار فقط در تلاش اول تا در صورت نیاز به ریتری درخواست مسدود نشود
    if (attempt === 1) {
      if (messageId && handledMessageIds.has(messageId)) {
        return;
      }
      if (lastInjectedPrompt === trimmedPrompt && (now - lastInjectedTime) < 2000) {
        console.log('[OmniAI Hub] Duplicate prompt dispatch blocked:', trimmedPrompt);
        return;
      }
    }

    if (activeTypingAbortCtrl) {
      activeTypingAbortCtrl.abort();
    }
    activeTypingAbortCtrl = new AbortController();
    const abortSignal = activeTypingAbortCtrl.signal;

    const driver = getDriverMerged(customDriver);
    const { inputEl } = locateElementsWithDriver(driver);

    if (inputEl) {
      if (messageId) {
        handledMessageIds.add(messageId);
        setTimeout(() => handledMessageIds.delete(messageId), 30000);
      }
      lastInjectedPrompt = trimmedPrompt;
      lastInjectedTime = now;

      const mode = driver.humanizeEnabled === false ? 'instant' : (driver.humanizeMode || 'burst');
      const strategy = driver.inputStrategy || 'auto';

      if (inputEl.isContentEditable || elementIsEditable(inputEl)) {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(inputEl);
        sel.removeAllRanges();
        sel.addRange(range);
      }

      // 1. تایپ با متد انتخابی
      if (mode === 'cadence') {
        await simulateHumanCadenceTyping(inputEl, promptText, strategy, driver, abortSignal);
      } else if (mode === 'burst') {
        await simulateHumanBurstTyping(inputEl, promptText, strategy, driver, abortSignal);
      } else if (mode === 'paste') {
        await simulateHumanPaste(inputEl, promptText, strategy, driver, abortSignal);
      } else {
        applyInputStrategy(inputEl, promptText, strategy);
      }

      if (abortSignal.aborted) return;

      // 2. تاخیر طبیعی قبل از سابمیت
      if (driver.humanizeEnabled !== false && driver.preSubmitDelayMs > 0) {
        const dwellTime = Math.round(driver.preSubmitDelayMs + (Math.random() - 0.5) * 80);
        await sleep(Math.max(100, dwellTime));
      }

      // 3. ارسال فقط یک‌بار
      const pollStartTime = Date.now();
      const maxWaitMs = 3200;
      let submitted = false;

      const attemptSubmit = async () => {
        if (abortSignal.aborted || submitted) return;
        const { submitBtn } = locateElementsWithDriver(driver);

        if (submitBtn && isButtonReady(submitBtn)) {
          submitted = true;
          await dispatchHumanClick(submitBtn, driver);
          showInjectionBadge(mode === 'instant' ? '⚡ Direct Dispatched' : '🛡️ Human Cadence Sent');
          startStreamingScraper(driver);
          return;
        }

        if (Date.now() - pollStartTime < maxWaitMs) {
          setTimeout(attemptSubmit, 60);
          return;
        }

        submitted = true;
        if (submitBtn) {
          await dispatchHumanClick(submitBtn, driver);
        } else {
          dispatchEnterKey(inputEl);
          const form = inputEl.closest('form');
          if (form && typeof form.requestSubmit === 'function') {
            try { form.requestSubmit(); } catch (_) {}
          }
        }

        showInjectionBadge(mode === 'instant' ? '⚡ Dispatched' : '🛡️ Human Sent');
        startStreamingScraper(driver);
      };

      setTimeout(attemptSubmit, 50);
    } else if (attempt < 12) {
      setTimeout(() => executePromptInjection(promptText, customDriver, messageId, attempt + 1), 250);
    }
  }

  function elementIsEditable(el) {
    if (!el) return false;
    return el.isContentEditable || el.getAttribute('contenteditable') === 'true';
  }

  async function testHumanTypingSimulation(sampleText, driverData) {
    if (activeTypingAbortCtrl) activeTypingAbortCtrl.abort();
    activeTypingAbortCtrl = new AbortController();

    const driver = getDriverMerged(driverData);
    const { inputEl } = locateElementsWithDriver(driver);

    if (!inputEl) {
      return { success: false, error: 'Input box element not found' };
    }

    const testPrompt = sampleText || "Testing human cadence typing on " + (driver.name || HOST) + "...";
    const mode = driver.humanizeMode || 'burst';
    const strategy = driver.inputStrategy || 'auto';

    if (mode === 'cadence') {
      await simulateHumanCadenceTyping(inputEl, testPrompt, strategy, driver, activeTypingAbortCtrl.signal);
    } else if (mode === 'burst') {
      await simulateHumanBurstTyping(inputEl, testPrompt, strategy, driver, activeTypingAbortCtrl.signal);
    } else {
      await simulateHumanPaste(inputEl, testPrompt, strategy, driver, activeTypingAbortCtrl.signal);
    }

    return { success: true, count: testPrompt.length, mode };
  }

  function probeSelectorOnPage(selector, probeId) {
    let found = false;
    let count = 0;
    let tagName = '';
    let previewText = '';

    try {
      const elements = document.querySelectorAll(selector);
      count = elements.length;
      found = count > 0;

      if (found) {
        const el = elements[elements.length - 1];
        tagName = el.tagName.toLowerCase();
        if (el.id) tagName += `#${el.id}`;
        else if (el.className && typeof el.className === 'string') {
          const cls = el.className.split(/\s+/).filter(Boolean).slice(0, 2).join('.');
          if (cls) tagName += `.${cls}`;
        }
        previewText = (el.innerText || el.textContent || el.value || el.placeholder || '').trim().slice(0, 60);
      }
    } catch (err) {
      found = false;
      previewText = err.message;
    }

    const result = {
      action: 'PROBE_RESULT',
      probeId,
      found,
      count,
      tagName,
      previewText,
      selector,
      host: HOST
    };

    window.top.postMessage(result, '*');

    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      try { chrome.runtime.sendMessage(result); } catch (_) {}
    }
  }

  // Cross-Window PostMessage Listener
  window.addEventListener('message', (event) => {
    if (!event.data) return;

    const currentCardId = cardId || window.name;

    if (event.data.action === 'SET_CARD_ID') {
      if (event.data.cardId) {
        cardId = event.data.cardId;
        try { window.name = cardId; } catch (_) {}
      }
      return;
    }

    if (event.data.action === 'DOM_DRIVERS_UPDATED' && event.data.drivers) {
      for (const key of Object.keys(event.data.drivers)) {
        const d = event.data.drivers[key];
        if (d.domain && d.domain !== '*') {
          const domains = d.domain.split(',').map(s => s.trim().toLowerCase());
          if (domains.some(dom => HOST === dom || HOST.endsWith('.' + dom) || HOST.includes(dom))) {
            activeDriver = d;
            break;
          }
        }
      }
      return;
    }

    if (event.data.action === 'TEST_HUMAN_TYPING') {
      testHumanTypingSimulation(event.data.text, event.data.driver).then(res => {
        window.top.postMessage({
          action: 'TEST_HUMAN_TYPING_RESULT',
          probeId: event.data.probeId,
          ...res
        }, '*');
      });
      return;
    }

    if (event.data.action === 'PROBE_SELECTOR') {
      probeSelectorOnPage(event.data.selector, event.data.probeId);
      return;
    }

    if (event.data.action === 'MIRROR_DISPATCH_PROMPT') {
      if (event.data.cardId && cardId && event.data.cardId !== cardId) {
        return;
      }
      if (!cardId && event.data.cardId) {
        cardId = event.data.cardId;
        try { window.name = cardId; } catch (_) {}
      }
      executePromptInjection(event.data.prompt, event.data.driver, event.data.messageId);
      return;
    }

    if (event.data.action === 'MIRROR_STOP_GENERATION') {
      if (event.data.cardId) cardId = event.data.cardId;
      const stopSel = event.data.driver?.stopSelector || 'button[aria-label*="Stop" i], button[data-testid="stop-button"]';
      let stopBtn = null;
      try { stopBtn = document.querySelector(stopSel); } catch (_) {}
      if (stopBtn) clickElement(stopBtn);
      stopStreamingScraper();
      return;
    }

    if (event.data.action === 'MIRROR_NEW_CHAT') {
      if (event.data.cardId) cardId = event.data.cardId;
      const newSel = event.data.driver?.newChatSelector || 'a[href="/"], button[aria-label*="New chat" i]';
      let newBtn = null;
      try { newBtn = document.querySelector(newSel); } catch (_) {}
      if (newBtn) clickElement(newBtn);
      return;
    }

    if (event.data.action === 'MIRROR_EXTRACT_HISTORY') {
      if (event.data.cardId) cardId = event.data.cardId;
      extractConversationHistory(event.data.cardId || cardId, event.data.driver);
      return;
    }

    if (event.data.action !== 'OMNI_DISPATCH_PROMPT') return;

    if (event.data.targetCardId && currentCardId && event.data.targetCardId !== currentCardId) {
      return;
    }

    executePromptInjection(event.data.prompt, event.data.driver, event.data.messageId);
  });

  // Chrome Runtime Messaging Listener
  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      const currentCardId = cardId || window.name;

      if (msg?.action === 'PROBE_SELECTOR') {
        probeSelectorOnPage(msg.selector, msg.probeId);
        sendResponse({ received: true });
        return;
      }

      if (msg?.action === 'OMNI_DISPATCH_PROMPT') {
        if (msg.targetCardId && currentCardId && msg.targetCardId !== currentCardId) return;
        if (Array.isArray(msg.targetCardIds) && currentCardId && !msg.targetCardIds.includes(currentCardId)) return;
        if (msg.targetHost && !HOST.includes(msg.targetHost) && !msg.targetHost.includes(HOST)) return;

        if (msg.messageId && msg.messageId === lastHandledMessageId) return;
        lastHandledMessageId = msg.messageId;
        executePromptInjection(msg.prompt, msg.driver);
        sendResponse({ status: 'ok', host: HOST });
        return;
      }

      if (msg?.action && msg.action.startsWith('MIRROR_')) {
        if (msg.cardId && currentCardId && msg.cardId !== currentCardId) return;
        if (!cardId && msg.cardId) cardId = msg.cardId;

        if (msg.action === 'MIRROR_DISPATCH_PROMPT') {
          executePromptInjection(msg.prompt, msg.driver, msg.messageId);
        } else if (msg.action === 'MIRROR_STOP_GENERATION') {
          const stopSel = msg.driver?.stopSelector || 'button[aria-label*="Stop" i], button[data-testid="stop-button"]';
          const stopBtn = document.querySelector(stopSel);
          if (stopBtn) clickElement(stopBtn);
          stopStreamingScraper();
        } else if (msg.action === 'MIRROR_NEW_CHAT') {
          const newSel = msg.driver?.newChatSelector || 'a[href="/"], button[aria-label*="New chat" i]';
          const newBtn = document.querySelector(newSel);
          if (newBtn) clickElement(newBtn);
        } else if (msg.action === 'MIRROR_EXTRACT_HISTORY') {
          extractConversationHistory(msg.cardId || cardId, msg.driver);
        }
        sendResponse?.({ received: true });
        return;
      }
    });
  }
})();
