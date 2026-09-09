/**
 * OmniAI Hub — Haute Model Registry & Signature Brand Gems
 */

export const MODEL_REGISTRY = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    url: 'https://chatgpt.com',
    color: '#10b981',
    aura: 'rgba(16, 185, 129, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    url: 'https://claude.ai',
    color: '#f59e0b',
    aura: 'rgba(245, 158, 11, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3l2.8 5.6L21 9.5l-4.5 4.4 1 6.3L12 17.4 6.5 20.2l1-6.3L3 9.5l6.2-.9L12 3z"/></svg>`
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google',
    url: 'https://gemini.google.com',
    color: '#60a5fa',
    aura: 'rgba(96, 165, 250, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2l2.4 7.2L21 12l-6.6 2.8L12 22l-2.4-7.2L3 12l6.6-2.8L12 2z"/></svg>`
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    provider: 'Perplexity AI',
    url: 'https://www.perplexity.ai',
    color: '#2dd4bf',
    aura: 'rgba(45, 212, 191, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek AI',
    url: 'https://chat.deepseek.com',
    color: '#38bdf8',
    aura: 'rgba(56, 189, 248, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>`
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    provider: 'xAI',
    url: 'https://grok.com',
    color: '#e2e8f0',
    aura: 'rgba(226, 232, 240, 0.22)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9l6 6m0-6l-6 6"/></svg>`
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral Le Chat',
    provider: 'Mistral AI',
    url: 'https://chat.mistral.ai',
    color: '#fb923c',
    aura: 'rgba(251, 146, 60, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>`
  },
  poe: {
    id: 'poe',
    name: 'Poe',
    provider: 'Quora',
    url: 'https://poe.com',
    color: '#a78bfa',
    aura: 'rgba(167, 139, 250, 0.25)',
    iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8 12 2"/></svg>`
  }
};

export const STANDARD_CARD_WIDTH = 500;
export const STANDARD_CARD_HEIGHT = 820;

export function createCardInstance(modelKey, x = 0, y = 0) {
  const model = MODEL_REGISTRY[modelKey] || {
    id: modelKey,
    name: 'Custom AI',
    url: 'https://chatgpt.com',
    color: '#c084fc',
    aura: 'rgba(192, 132, 252, 0.25)',
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
  quad: ['claude', 'chatgpt', 'gemini', 'perplexity'],
  constellation: ['claude', 'chatgpt', 'gemini', 'perplexity', 'deepseek', 'grok']
};
