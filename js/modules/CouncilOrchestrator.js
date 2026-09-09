/**
 * OmniAI Hub — The Celestial Council Orchestrator (تالار شورای افلاک)
 * Implements Andrej Karpathy's 3-Stage Autonomous LLM Council Pipeline:
 *   Stage 1: First Opinions (Parallel dispatch & scraping across canvas models)
 *   Stage 2: Peer Review & Anonymized Ranking (Candidate Alpha, Beta... cross-critique)
 *   Stage 3: Final Synthesis by the Chairman (Authoritative consensus master answer)
 *
 * Strictly ZERO-API: Powered by client-side frame keystroke injection & MutationObserver scraping.
 */

import { domDriverRegistry } from './DomDriverRegistry.js';
import { globalBus } from './EventBus.js';

export const GREEK_CODENAMES = [
  'Candidate Alpha',
  'Candidate Beta',
  'Candidate Gamma',
  'Candidate Delta',
  'Candidate Epsilon',
  'Candidate Zeta',
  'Candidate Theta',
  'Candidate Omega'
];

export class CouncilOrchestrator {
  constructor(stateStore) {
    this.stateStore = stateStore;
    this.isOpen = false;
    this.stage = 'IDLE'; // 'IDLE' | 'STAGE_1' | 'STAGE_2' | 'STAGE_3' | 'COMPLETED'
    this.activeStageTab = 1; // User navigation tab (1, 2, or 3)

    this.selectedCardIds = [];
    this.chairmanCardId = null;
    this.userQuery = '';

    // Anonymization mapping: cardId -> { codename, name, color, cardId }
    this.candidateMap = new Map();

    // Responses store
    this.stage1Data = new Map(); // cardId -> { text, thinkingText, isThinking, isStreaming, isFinished }
    this.stage2Data = new Map(); // cardId -> { text, thinkingText, isThinking, isStreaming, isFinished }
    this.stage3Data = { text: '', thinkingText: '', isThinking: false, isStreaming: false, isFinished: false };

    this.stageTimeoutTimer = null;

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.overlayEl = document.getElementById('council-chamber-overlay');
    this.btnClose = document.getElementById('btn-close-council-chamber');
    this.timelineSteps = document.querySelectorAll('.council-stage-step');

    this.setupView = document.getElementById('council-setup-view');
    this.stageView = document.getElementById('council-stage-view');

    this.queryInput = document.getElementById('council-query-input');
    this.modelPickerGrid = document.getElementById('council-model-picker-grid');
    this.btnConvene = document.getElementById('btn-convene-council');

    this.stage1Container = document.getElementById('council-stage1-container');
    this.stage2Container = document.getElementById('council-stage2-container');
    this.stage3Container = document.getElementById('council-stage3-container');

    this.btnProceedStage2 = document.getElementById('btn-council-proceed-stage2');
    this.btnProceedStage3 = document.getElementById('btn-council-proceed-stage3');
    this.btnExportBriefing = document.getElementById('btn-council-export-briefing');
    this.btnCopySynthesis = document.getElementById('btn-council-copy-synthesis');
    this.btnRestartCouncil = document.getElementById('btn-council-restart');
  }

  bindEvents() {
    this.btnClose?.addEventListener('click', () => this.close());

    // Stage timeline tab clicks
    this.timelineSteps?.forEach(step => {
      step.addEventListener('click', () => {
        const stageNum = parseInt(step.dataset.stage, 10);
        this.switchStageTab(stageNum);
      });
    });

    // Query textarea auto-expand & RTL detection
    this.queryInput?.addEventListener('input', () => {
      const val = this.queryInput.value;
      const dir = this.detectTextDirection(val);
      this.queryInput.setAttribute('dir', dir);
      this.queryInput.classList.toggle('is-rtl', dir === 'rtl');
    });

    // Convene Button
    this.btnConvene?.addEventListener('click', () => {
      this.startCouncil();
    });

    // Manual Advance Buttons (in case one model takes abnormally long)
    this.btnProceedStage2?.addEventListener('click', () => {
      this.advanceToStage2();
    });

    this.btnProceedStage3?.addEventListener('click', () => {
      this.advanceToStage3();
    });

    // Copy Synthesis
    this.btnCopySynthesis?.addEventListener('click', () => {
      if (this.stage3Data.text) {
        navigator.clipboard.writeText(this.stage3Data.text);
        const originalText = this.btnCopySynthesis.textContent;
        this.btnCopySynthesis.textContent = '✓ Copied!';
        setTimeout(() => { this.btnCopySynthesis.textContent = originalText; }, 1800);
      }
    });

    // Export Full Council Briefing as Markdown
    this.btnExportBriefing?.addEventListener('click', () => {
      this.exportCouncilMarkdown();
    });

    // Restart / New Query
    this.btnRestartCouncil?.addEventListener('click', () => {
      if (confirm('Start a new session in the Celestial Council?')) {
        this.resetToSetup();
      }
    });

    // Native live scraper listener (postMessage & chrome.runtime)
    window.addEventListener('message', (e) => {
      if (e.data?.action === 'MIRROR_STREAM_CHUNK') {
        this.handleStreamChunk(e.data);
      }
    });

    const runtimeApi = (typeof browser !== 'undefined' && browser.runtime)
      ? browser.runtime
      : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null);

    if (runtimeApi?.onMessage) {
      runtimeApi.onMessage.addListener((msg) => {
        if (msg?.action === 'MIRROR_STREAM_CHUNK') {
          this.handleStreamChunk(msg);
        }
      });
    }
  }

  open() {
    this.isOpen = true;
    this.overlayEl?.classList.add('open');

    if (this.stage === 'IDLE') {
      this.renderSetupView();
      requestAnimationFrame(() => this.queryInput?.focus());
    }

    globalBus.emit('COUNCIL_CHAMBER_OPENED');
  }

  close() {
    this.isOpen = false;
    this.overlayEl?.classList.remove('open');
    globalBus.emit('COUNCIL_CHAMBER_CLOSED');
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  renderSetupView() {
    const cards = this.stateStore.getCards() || [];
    if (!this.modelPickerGrid) return;

    this.modelPickerGrid.innerHTML = '';

    if (cards.length === 0) {
      this.modelPickerGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
          No active AI cards on canvas. Please open at least 3 models (e.g. Claude, ChatGPT, Gemini).
        </div>
      `;
      return;
    }

    // Default: select up to 5 models
    if (this.selectedCardIds.length === 0) {
      this.selectedCardIds = cards.slice(0, 5).map(c => c.id);
    }
    if (!this.chairmanCardId && this.selectedCardIds.length > 0) {
      this.chairmanCardId = this.selectedCardIds[0];
    }

    cards.forEach(card => {
      const isSelected = this.selectedCardIds.includes(card.id);
      const isChairman = card.id === this.chairmanCardId;
      const cardName = card.title || card.name || 'AI Model';

      const cardEl = document.createElement('div');
      cardEl.className = `council-model-card ${isSelected ? 'selected' : ''} ${isChairman ? 'is-chairman' : ''}`;
      cardEl.innerHTML = `
        <div class="council-model-info">
          <span class="model-pearl-dot" style="background: ${card.color || '#c084fc'}; color: ${card.color || '#c084fc'};"></span>
          <span class="model-title-text">${this.escapeHtml(cardName)}</span>
        </div>
        <button type="button" class="btn-make-chairman" title="Designate as Chairman">
          ${isChairman ? '👑 Chairman' : 'Make Chairman'}
        </button>
      `;

      cardEl.addEventListener('click', (e) => {
        if (e.target.closest('.btn-make-chairman')) {
          e.stopPropagation();
          this.chairmanCardId = card.id;
          if (!this.selectedCardIds.includes(card.id)) {
            this.selectedCardIds.push(card.id);
          }
          this.renderSetupView();
          return;
        }

        const idx = this.selectedCardIds.indexOf(card.id);
        if (idx >= 0) {
          if (this.selectedCardIds.length <= 2) {
            alert('The Council requires at least 2 models for peer debate.');
            return;
          }
          this.selectedCardIds.splice(idx, 1);
          if (this.chairmanCardId === card.id) {
            this.chairmanCardId = this.selectedCardIds[0] || null;
          }
        } else {
          this.selectedCardIds.push(card.id);
        }
        this.renderSetupView();
      });

      this.modelPickerGrid.appendChild(cardEl);
    });

    this.updateChairmanHeaderBadge();
  }

  updateChairmanHeaderBadge() {
    const badge = document.getElementById('council-chairman-header-badge');
    if (!badge) return;
    const cards = this.stateStore.getCards() || [];
    const chairman = cards.find(c => c.id === this.chairmanCardId);
    badge.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8 12 2" />
      </svg>
      <span>Chairman: ${chairman?.title || chairman?.name || 'Assigned'}</span>
    `;
  }

  /**
   * Dispatches a prompt to an embedded model card's iframe
   */
  dispatchToCard(cardId, promptText, stageContext) {
    const card = this.stateStore.getCard(cardId);
    if (!card) return;

    const iframe = document.getElementById(`iframe-${cardId}`) ||
      document.querySelector(`iframe[name="${cardId}"]`) ||
      document.querySelector(`iframe[data-card-id="${cardId}"]`) ||
      document.querySelector(`[data-card-id="${cardId}"] iframe`);

    const driver = card.url ? domDriverRegistry.getDriverForUrl(card.url) : domDriverRegistry.getDrivers().generic;
    const messageId = `council_${stageContext}_${cardId}_${Date.now()}`;

    const payload = {
      action: 'MIRROR_DISPATCH_PROMPT',
      cardId,
      messageId,
      prompt: promptText,
      driver
    };

    let delivered = false;
    if (iframe?.contentWindow) {
      try {
        iframe.contentWindow.postMessage(payload, '*');
        delivered = true;
      } catch (e) {
        console.warn('[CouncilOrchestrator] Direct postMessage failed:', e);
      }
    }

    if (!delivered) {
      const runtimeApi = (typeof browser !== 'undefined' && browser.runtime)
        ? browser.runtime
        : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null);

      if (runtimeApi?.sendMessage) {
        runtimeApi.sendMessage(payload);
      }
    }
  }

  // ── Stage 1: First Opinions ──
  startCouncil() {
    const query = (this.queryInput?.value || '').trim();
    if (!query) {
      alert('Please enter a query or challenge for the Council.');
      return;
    }
    if (this.selectedCardIds.length < 2) {
      alert('Please select at least 2 active models for the Council.');
      return;
    }

    this.userQuery = query;
    this.stage = 'STAGE_1';
    this.activeStageTab = 1;

    // Build Candidate Anonymization Mapping
    this.candidateMap.clear();
    const cards = this.stateStore.getCards() || [];
    this.selectedCardIds.forEach((id, index) => {
      const card = cards.find(c => c.id === id);
      const codename = GREEK_CODENAMES[index] || `Candidate #${index + 1}`;
      this.candidateMap.set(id, {
        cardId: id,
        codename,
        name: card?.title || card?.name || 'AI Intelligence',
        color: card?.color || '#c084fc'
      });
      this.stage1Data.set(id, {
        text: '',
        thinkingText: '',
        isThinking: false,
        isStreaming: true,
        isFinished: false
      });
    });

    // Switch UI to Stages View
    if (this.setupView) this.setupView.style.display = 'none';
    if (this.stageView) this.stageView.style.display = 'flex';

    this.updateTimelineUI();
    this.renderStage1UI();

    // Dispatch Stage 1 queries
    this.selectedCardIds.forEach(cardId => {
      this.dispatchToCard(cardId, this.userQuery, 'stage1');
    });

    // Fallback timer: 65s max wait for Stage 1 before showing manual override
    clearTimeout(this.stageTimeoutTimer);
    this.stageTimeoutTimer = setTimeout(() => {
      if (this.stage === 'STAGE_1' && this.btnProceedStage2) {
        this.btnProceedStage2.style.display = 'inline-flex';
      }
    }, 45000);
  }

  // ── Stage 2: Peer Review & Anonymized Ranking ──
  advanceToStage2() {
    this.stage = 'STAGE_2';
    this.activeStageTab = 2;
    clearTimeout(this.stageTimeoutTimer);

    // Build Anonymized Dossier
    let candidateDossier = '';
    this.selectedCardIds.forEach(cardId => {
      const candidate = this.candidateMap.get(cardId);
      const resp = this.stage1Data.get(cardId)?.text || '(No response provided)';
      candidateDossier += `\n### [${candidate.codename}]\n${resp}\n\n---\n`;
    });

    const peerPrompt = `You are a distinguished member of an elite scientific review council.
Below are anonymized candidate answers from your peers to the query:
"""
${this.userQuery}
"""

CANDIDATE DOSSIER:
${candidateDossier}

MISSION:
1. Critically examine each candidate's response. Point out strengths, logical leaps, inaccuracies, or unique insights.
2. Formulate a definitive ranking of all candidates from best to worst (e.g., 1st: Candidate Alpha, 2nd: Candidate Beta...).
3. Justify your top choice concisely.`;

    this.stage2Data.clear();
    this.selectedCardIds.forEach(cardId => {
      this.stage2Data.set(cardId, {
        text: '',
        thinkingText: '',
        isThinking: false,
        isStreaming: true,
        isFinished: false
      });
    });

    this.updateTimelineUI();
    this.renderStage2UI();

    // Dispatch peer evaluations to all models
    this.selectedCardIds.forEach(cardId => {
      this.dispatchToCard(cardId, peerPrompt, 'stage2');
    });

    // Fallback timer for Stage 2
    this.stageTimeoutTimer = setTimeout(() => {
      if (this.stage === 'STAGE_2' && this.btnProceedStage3) {
        this.btnProceedStage3.style.display = 'inline-flex';
      }
    }, 55000);
  }

  // ── Stage 3: Consensus Throne Synthesis ──
  advanceToStage3() {
    this.stage = 'STAGE_3';
    this.activeStageTab = 3;
    clearTimeout(this.stageTimeoutTimer);

    let synthesisBrief = `ORIGINAL USER QUERY:
"""
${this.userQuery}
"""

---
INITIAL CANDIDATE OPINIONS:
`;
    this.selectedCardIds.forEach(cardId => {
      const cand = this.candidateMap.get(cardId);
      const text = this.stage1Data.get(cardId)?.text || '';
      synthesisBrief += `\n[${cand.codename} (${cand.name})]:\n${text}\n`;
    });

    synthesisBrief += `\n---
PEER REVIEWS & CRITIQUES:
`;
    this.selectedCardIds.forEach(cardId => {
      const cand = this.candidateMap.get(cardId);
      const review = this.stage2Data.get(cardId)?.text || '';
      synthesisBrief += `\n[Evaluation by ${cand.name}]:\n${review}\n`;
    });

    const chairmanPrompt = `You are the designated Chairman of the LLM Council.
Below is the full dossier containing the original query, candidate answers, and all mutual peer reviews.

${synthesisBrief}

CHAIRMAN MANDATE:
Synthesize a single, definitive, authoritative, deeply nuanced master answer that resolves disagreements, adopts the best contributions from each model, fixes any identified mistakes, and produces the ultimate truth for the user.`;

    this.stage3Data = {
      text: '',
      thinkingText: '',
      isThinking: false,
      isStreaming: true,
      isFinished: false
    };

    this.updateTimelineUI();
    this.renderStage3UI();

    // Dispatch exclusively to Chairman model
    this.dispatchToCard(this.chairmanCardId, chairmanPrompt, 'stage3');
  }

  handleStreamChunk(data) {
    const { cardId, text, html, isThinking, thinkingText, isFinished } = data;
    if (!cardId || !this.selectedCardIds.includes(cardId)) return;

    if (this.stage === 'STAGE_1') {
      const entry = this.stage1Data.get(cardId);
      if (entry) {
        if (text) entry.text = text;
        if (thinkingText) entry.thinkingText = thinkingText;
        if (isThinking !== undefined) entry.isThinking = isThinking;
        if (isFinished) entry.isFinished = true;
        this.updateStage1CardDOM(cardId);
      }

      // Check if all Stage 1 models completed
      const allDone = Array.from(this.stage1Data.values()).every(e => e.isFinished || (e.text && e.text.length > 50));
      if (allDone && this.btnProceedStage2) {
        this.btnProceedStage2.style.display = 'inline-flex';
      }
    } else if (this.stage === 'STAGE_2') {
      const entry = this.stage2Data.get(cardId);
      if (entry) {
        if (text) entry.text = text;
        if (thinkingText) entry.thinkingText = thinkingText;
        if (isThinking !== undefined) entry.isThinking = isThinking;
        if (isFinished) entry.isFinished = true;
        this.updateStage2CardDOM(cardId);
      }

      const allDone = Array.from(this.stage2Data.values()).every(e => e.isFinished || (e.text && e.text.length > 50));
      if (allDone && this.btnProceedStage3) {
        this.btnProceedStage3.style.display = 'inline-flex';
      }
    } else if (this.stage === 'STAGE_3' && cardId === this.chairmanCardId) {
      if (text) this.stage3Data.text = text;
      if (thinkingText) this.stage3Data.thinkingText = thinkingText;
      if (isThinking !== undefined) this.stage3Data.isThinking = isThinking;
      if (isFinished) {
        this.stage3Data.isFinished = true;
        this.stage = 'COMPLETED';
        this.updateTimelineUI();
      }
      this.updateStage3DOM();
    }
  }

  // ── UI Renderers ──

  updateTimelineUI() {
    this.timelineSteps?.forEach(step => {
      const stepNum = parseInt(step.dataset.stage, 10);
      step.classList.toggle('active', stepNum === this.activeStageTab);
      const isPast = (this.stage === 'STAGE_2' && stepNum < 2) ||
                     (this.stage === 'STAGE_3' && stepNum < 3) ||
                     (this.stage === 'COMPLETED');
      step.classList.toggle('completed', isPast);
    });
  }

  switchStageTab(tabNum) {
    this.activeStageTab = tabNum;
    this.updateTimelineUI();

    if (this.stage1Container) this.stage1Container.style.display = tabNum === 1 ? 'grid' : 'none';
    if (this.stage2Container) this.stage2Container.style.display = tabNum === 2 ? 'flex' : 'none';
    if (this.stage3Container) this.stage3Container.style.display = tabNum === 3 ? 'flex' : 'none';
  }

  renderStage1UI() {
    if (!this.stage1Container) return;
    this.stage1Container.innerHTML = '';
    this.switchStageTab(1);

    this.selectedCardIds.forEach(id => {
      const candidate = this.candidateMap.get(id);
      const isChairman = id === this.chairmanCardId;

      const card = document.createElement('div');
      card.className = 'opinion-candidate-card';
      card.id = `stage1-card-${id}`;
      card.style.setProperty('--candidate-color', candidate.color);

      card.innerHTML = `
        <div class="opinion-card-header">
          <div class="candidate-identity">
            <span class="model-pearl-dot" style="background: ${candidate.color};"></span>
            <span>${this.escapeHtml(candidate.name)}</span>
            ${isChairman ? '<span style="color: #fbbf24; font-size: 10px;">👑 Chairman</span>' : ''}
          </div>
          <span class="candidate-anonymized-tag">${candidate.codename}</span>
        </div>
        <div class="opinion-card-body" dir="auto">
          <div class="mirror-streaming-pulse"><span></span><span></span><span></span></div>
        </div>
      `;
      this.stage1Container.appendChild(card);
    });
  }

  updateStage1CardDOM(cardId) {
    const cardEl = document.getElementById(`stage1-card-${cardId}`);
    if (!cardEl) return;
    const body = cardEl.querySelector('.opinion-card-body');
    const data = this.stage1Data.get(cardId);
    if (!body || !data) return;

    const dir = this.detectTextDirection(data.text);
    body.setAttribute('dir', dir);
    body.classList.toggle('is-rtl', dir === 'rtl');
    body.innerHTML = this.renderMarkdown(data.text || 'Generating initial opinion...');
  }

  renderStage2UI() {
    if (!this.stage2Container) return;
    this.stage2Container.innerHTML = '';
    this.switchStageTab(2);

    this.selectedCardIds.forEach(id => {
      const candidate = this.candidateMap.get(id);

      const card = document.createElement('div');
      card.className = 'review-evaluator-card';
      card.id = `stage2-card-${id}`;

      card.innerHTML = `
        <div class="evaluator-header">
          <div class="evaluator-title">
            <span class="model-pearl-dot" style="background: ${candidate.color};"></span>
            <span>Critique by ${this.escapeHtml(candidate.name)} (${candidate.codename})</span>
          </div>
          <span class="candidate-anonymized-tag">Peer Review</span>
        </div>
        <div class="evaluator-review-content" dir="auto">
          <div class="mirror-streaming-pulse"><span></span><span></span><span></span></div>
        </div>
      `;
      this.stage2Container.appendChild(card);
    });
  }

  updateStage2CardDOM(cardId) {
    const cardEl = document.getElementById(`stage2-card-${cardId}`);
    if (!cardEl) return;
    const body = cardEl.querySelector('.evaluator-review-content');
    const data = this.stage2Data.get(cardId);
    if (!body || !data) return;

    const dir = this.detectTextDirection(data.text);
    body.setAttribute('dir', dir);
    body.classList.toggle('is-rtl', dir === 'rtl');
    body.innerHTML = this.renderMarkdown(data.text || 'Reviewing peer candidates...');
  }

  renderStage3UI() {
    this.switchStageTab(3);
    const chairman = this.candidateMap.get(this.chairmanCardId);
    const chairmanLabel = document.getElementById('throne-chairman-name');
    if (chairmanLabel && chairman) {
      chairmanLabel.textContent = `By Council Chairman ${chairman.name}`;
    }
    this.updateStage3DOM();
  }

  updateStage3DOM() {
    const body = document.getElementById('throne-synthesis-body');
    if (!body) return;

    const dir = this.detectTextDirection(this.stage3Data.text);
    body.setAttribute('dir', dir);
    body.classList.toggle('is-rtl', dir === 'rtl');

    if (this.stage3Data.text) {
      body.innerHTML = this.renderMarkdown(this.stage3Data.text);
    } else {
      body.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #94a3b8;">
          <div class="mirror-streaming-pulse"><span></span><span></span><span></span></div>
          <p style="margin-top: 10px;">Chairman is analyzing all peer opinions and synthesizing the master consensus...</p>
        </div>
      `;
    }
  }

  resetToSetup() {
    this.stage = 'IDLE';
    this.activeStageTab = 1;
    this.stage1Data.clear();
    this.stage2Data.clear();
    this.stage3Data = { text: '', thinkingText: '', isThinking: false, isStreaming: false, isFinished: false };

    if (this.setupView) this.setupView.style.display = 'flex';
    if (this.stageView) this.stageView.style.display = 'none';
    if (this.btnProceedStage2) this.btnProceedStage2.style.display = 'none';
    if (this.btnProceedStage3) this.btnProceedStage3.style.display = 'none';

    this.updateTimelineUI();
    this.renderSetupView();
  }

  exportCouncilMarkdown() {
    const chairman = this.candidateMap.get(this.chairmanCardId);
    let md = `# 🏛️ The Celestial Council Briefing\n`;
    md += `**Query:** ${this.userQuery}\n`;
    md += `**Date:** ${new Date().toLocaleString()}\n`;
    md += `**Council Chairman:** ${chairman?.name || 'Designated Chairman'}\n\n`;

    md += `---\n\n## 👑 Final Synthesis by Council Chairman\n\n`;
    md += `${this.stage3Data.text || 'In progress...'}\n\n`;

    md += `---\n\n## 🔍 Stage 1: Individual Opinions\n\n`;
    this.selectedCardIds.forEach(id => {
      const c = this.candidateMap.get(id);
      const text = this.stage1Data.get(id)?.text || 'N/A';
      md += `### ${c.name} (${c.codename})\n\n${text}\n\n`;
    });

    md += `---\n\n## ⚖️ Stage 2: Mutual Peer Reviews & Rankings\n\n`;
    this.selectedCardIds.forEach(id => {
      const c = this.candidateMap.get(id);
      const review = this.stage2Data.get(id)?.text || 'N/A';
      md += `### Review by ${c.name}\n\n${review}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `council_briefing_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Helper Utilities ──

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  detectTextDirection(text) {
    if (!text || typeof text !== 'string') return 'ltr';
    const stripped = text.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]+`/g, ' ').trim();
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/g;
    const ltrRegex = /[A-Za-z\u00C0-\u024F]/g;
    const rtlMatches = stripped.match(rtlRegex) || [];
    const ltrMatches = stripped.match(ltrRegex) || [];
    if (rtlMatches.length === 0) return 'ltr';
    if (ltrMatches.length === 0) return 'rtl';
    return (rtlMatches.length >= ltrMatches.length * 0.25) ? 'rtl' : 'ltr';
  }

  renderMarkdown(raw) {
    if (!raw) return '<p></p>';
    let out = raw;
    const codeBlocks = [];

    out = out.replace(/```([a-zA-Z0-9_#-]*)[ \t]*\n?([\s\S]*?)```/g, (match, lang, code) => {
      const token = `%%COUNCIL_CODE_${codeBlocks.length}%%`;
      const language = (lang || 'code').trim().toLowerCase();
      const cleanCode = this.escapeHtml(code.replace(/^\n+|\n+$/g, ''));
      const html = `
        <div class="council-code-block" dir="ltr">
          <div class="council-code-header" dir="ltr">
            <span>${language}</span>
          </div>
          <pre class="council-code-body" dir="ltr"><code>${cleanCode}</code></pre>
        </div>
      `;
      codeBlocks.push({ token, html });
      return `\n\n${token}\n\n`;
    });

    out = out.replace(/`([^`\n]+)`/g, (m, c) => `<code class="inline-code" dir="ltr">${this.escapeHtml(c)}</code>`);
    out = out.replace(/^### (.*$)/gim, (m, h) => `<h5 style="margin:8px 0 4px;color:#ddd6fe;">${h}</h5>`);
    out = out.replace(/^## (.*$)/gim, (m, h) => `<h4 style="margin:10px 0 6px;color:#ddd6fe;">${h}</h4>`);
    out = out.replace(/^# (.*$)/gim, (m, h) => `<h3 style="margin:12px 0 6px;color:#ddd6fe;">${h}</h3>`);
    out = out.replace(/^\s*>\s+(.*$)/gim, (m, q) => `<blockquote>${q}</blockquote>`);
    out = out.replace(/^\s*[-*•]\s+(.*$)/gim, (m, item) => `<li>${item}</li>`);
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    const paragraphs = out.split(/\n\n+/).map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (codeBlocks.some(cb => cb.token === trimmed)) return trimmed;
      if (trimmed.startsWith('<h') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<li')) {
        return trimmed.replace(/\n/g, '<br/>');
      }
      const dir = this.detectTextDirection(trimmed);
      return `<p dir="${dir}" class="${dir === 'rtl' ? 'is-rtl' : 'is-ltr'}">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    }).filter(Boolean);

    let finalHtml = paragraphs.join('');
    codeBlocks.forEach(cb => {
      finalHtml = finalHtml.split(cb.token).join(cb.html);
    });
    return finalHtml;
  }
}
