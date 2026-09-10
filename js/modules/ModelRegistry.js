/**
 * OmniAI Hub — Haute Model Registry & Signature Brand Gems
 */

export const MODEL_REGISTRY = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    url: 'https://chatgpt.com',
    color: '#10a37f',
    aura: 'rgba(16, 163, 127, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google',
    url: 'https://gemini.google.com',
    color: '#3b82f6',
    aura: 'rgba(59, 130, 246, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2l2.4 7.2L21 12l-6.6 2.8L12 22l-2.4-7.2L3 12l6.6-2.8L12 2z"/></svg>`
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek AI',
    url: 'https://chat.deepseek.com',
    color: '#0ea5e9',
    aura: 'rgba(14, 165, 233, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>`
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    provider: 'xAI',
    url: 'https://grok.com',
    color: '#ec4899',
    aura: 'rgba(236, 72, 153, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9l6 6m0-6l-6 6"/></svg>`
  },
  zai: {
    id: 'zai',
    name: 'Z.ai',
    provider: 'Zhipu AI',
    url: 'https://chat.z.ai',
    color: '#38bdf8',
    aura: 'rgba(56, 189, 248, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 5h16L7 19h13M12 3v4M12 17v4"/></svg>`
  },
  qwen: {
    id: 'qwen',
    name: 'Qwen',
    provider: 'Alibaba Cloud',
    url: 'https://chat.qwen.ai',
    color: '#6366f1',
    aura: 'rgba(99, 102, 241, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="M17 17l4 4M11 7v8M7 11h8"/></svg>`
  },
  kimi: {
    id: 'kimi',
    name: 'Kimi.ai',
    provider: 'Moonshot AI',
    url: 'https://kimi.ai',
    color: '#06b6d4',
    aura: 'rgba(6, 182, 212, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/><polygon points="19 3 20 6 23 7 20 8 19 11 18 8 15 7 18 6"/></svg>`
  },
  aistudio: {
    id: 'aistudio',
    name: 'Google AI Studio',
    provider: 'Google',
    url: 'https://aistudio.google.com',
    color: '#4285f4',
    aura: 'rgba(66, 133, 244, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 10l3 2-3 2M13 14h4"/></svg>`
  },
  arena: {
    id: 'arena',
    name: 'Arena.ai',
    provider: 'LMSYS Org',
    url: 'https://lmarena.ai',
    color: '#f59e0b',
    aura: 'rgba(245, 158, 11, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M6 3h12v7a6 6 0 0 1-12 0V3zM9 21h6M12 16v5"/></svg>`
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    url: 'https://claude.ai',
    color: '#d97706',
    aura: 'rgba(217, 119, 6, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3l2.8 5.6L21 9.5l-4.5 4.4 1 6.3L12 17.4 6.5 20.2l1-6.3L3 9.5l6.2-.9L12 3z"/></svg>`
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral Le Chat',
    provider: 'Mistral AI',
    url: 'https://chat.mistral.ai',
    color: '#f97316',
    aura: 'rgba(249, 115, 22, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h10M7 13h6"/></svg>`
  }
};

export const STANDARD_CARD_WIDTH = 500;
export const STANDARD_CARD_HEIGHT = 820;

export function createCardInstance(modelKey, x = 0, y = 0) {
  const model = MODEL_REGISTRY[modelKey] || {
    id: modelKey,
    name: 'Custom AI',
    url: 'https://chatgpt.com',
    color: '#10a37f',
    aura: 'rgba(16, 163, 127, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/></svg>`
  };

  return {
    id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    modelKey: model.id,
    title: model.name,
    url: model.url,
    color: model.color,
    aura: model.aura,
    x,
    y,
    width: STANDARD_CARD_WIDTH,
    height: STANDARD_CARD_HEIGHT,
    zIndex: 10,
    isMaximized: false
  };
}

export const INITIAL_CANVAS_PRESETS = {
  duo: ['claude', 'chatgpt'],
  trio: ['claude', 'chatgpt', 'gemini'],
  quad: ['claude', 'chatgpt', 'gemini', 'deepseek'],
  constellation: ['chatgpt', 'gemini', 'deepseek', 'grok', 'zai', 'qwen', 'kimi', 'aistudio', 'arena', 'claude', 'mistral']
};
