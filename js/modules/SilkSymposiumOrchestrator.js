/**
 * OmniAI Hub — The Silk Symposium Orchestrator (تالار هم‌اندیشی و میزگرد زنده انسان و هوش مصنوعی‌ها)
 * Haute Digital Spatial Architecture: VisionOS Frosted Glass & Obsidian Rose
 *
 * Implements an infinite, multi-turn, multi-model cognitive dialectic agora:
 *   - Visual Amphitheater Dais (The Celestial Chairs)
 *   - Dialectic Engine Topologies: Socratic, Delphi, Red Team vs. Blue Team, Autonomous, Maestro
 *   - The Logic Sanctum: Custom Macro Formulas & Context Distillation
 *   - Milestone Consensus Ledger: Agreements, Divergences, Open Hypotheses
 *   - Strictly Client-Side & Zero-API via iframe postMessage & MutationObserver scraping
 */

import { domDriverRegistry } from './DomDriverRegistry.js';
import { globalBus } from './EventBus.js';

export const COGNITIVE_PERSONAS = {
  architect: {
    id: 'architect',
    title: 'The Architect (معمار سیستم)',
    badge: '🏛️ Architecture',
    color: '#818cf8',
    directive: 'You are The Architect. Prioritize structural integrity, modularity, abstraction boundaries, scalability, and long-term maintainability. Scrutinize foundational architectural trade-offs.'
  },
  devils_advocate: {
    id: 'devils_advocate',
    title: "Devil's Advocate (وکیل مدافع شیطان)",
    badge: '⚔️ Adversary',
    color: '#f43f5e',
    directive: "You are the Devil's Advocate. Ruthlessly challenge consensus, hunt for hidden assumptions, point out failure modes, attack vulnerabilities, and propose catastrophic edge cases."
  },
  physicist: {
    id: 'physicist',
    title: 'First-Principles Physicist (دانشمند اصول اولیه)',
    badge: '⚛️ Axioms',
    color: '#38bdf8',
    directive: 'You are the First-Principles Physicist. Strip away all analogies and convention. Break every problem down into fundamental axioms and build upwards strictly from verifiable truths.'
  },
  cynic: {
    id: 'cynic',
    title: 'Pragmatic Cynic (عمل‌گرای دیرباور)',
    badge: '🛠️ Pragmatism',
    color: '#fb923c',
    directive: 'You are the Pragmatic Cynic. Ground intellectual theory in gritty implementation realities, cost constraints, latency limits, user irrationality, and real-world frictions.'
  },
  synthesizer: {
    id: 'synthesizer',
    title: 'The Synthesizer (ترکیب‌گر و پیونددهنده)',
    badge: '👑 Synthesis',
    color: '#f59e0b',
    directive: 'You are The Synthesizer. Reconcile diametrically opposed perspectives. Extract core truths from conflicting arguments and forge higher-order consensus frameworks.'
  },
  innovator: {
    id: 'innovator',
    title: 'Visionary Innovator (نوآور تحول‌آفرین)',
    badge: '✨ Innovator',
    color: '#ec4899',
    directive: 'You are the Visionary Innovator. Challenge incremental solutions with radical, paradigm-shifting, out-of-the-box leaps and novel combinations.'
  },
  empiricist: {
    id: 'empiricist',
    title: 'Empirical Scientist (تجربه‌گرای شواهد‌محور)',
    badge: '🔬 Empiricism',
    color: '#34d399',
    directive: 'You are the Empirical Scientist. Demand testable hypotheses, falsifiability, quantitative metrics, and concrete proof over intuitive speculation.'
  },
  ethicist: {
    id: 'ethicist',
    title: 'Ethicist & Humanist (فیلسوف اخلاق و انسان‌محور)',
    badge: '⚖️ Alignment',
    color: '#a78bfa',
    directive: 'You are the Ethicist. Evaluate the safety, alignment, societal fallout, human dignity, and long-term existential implications of the propositions.'
  }
};

export const DEFAULT_DIALECTIC_TEMPLATE = `You are a seated member in an intellectual roundtable debate with peer AI models and a human maestro.
YOUR COGNITIVE PERSONA & ROLE:
{{speaker_role}}

THE CORE INQUIRY / CHALLENGE:
"""
{{user_core_prompt}}
"""

{{round_context_brief}}

MANDATE FOR THIS TURN:
- Directly address the arguments, critiques, or premises presented before you.
- Stay strictly faithful to your assigned cognitive archetype.
- Be razor-sharp, dense, analytical, and constructive. Propose concrete answers or pointed counter-theses.
- Do not repeat polite conversational filler. Speak as an elite intellect.`;

export class SilkSymposiumOrchestrator {
  constructor(stateStore) {
    this.stateStore = stateStore;
    this.isOpen = false;
    this.roundIndex = 1;
    this.sessionStatus = 'IDLE'; // 'IDLE' | 'ACTIVE' | 'PAUSED'
    this.debateMode = 'socratic'; // 'socratic' | 'delphi' | 'red_blue' | 'autonomous' | 'maestro'

    this.userCorePrompt = '';
    this.seats = []; // Array of participant seat objects
    this.activeSpeakerIndex = 0;
    this.isSpeakerStreaming = false;

    // Transcript history: Array of turns { id, role: 'user'|'model', seatIndex, speakerName, color, persona, text, thinkingText, round, timestamp }
    this.transcript = [];

    // Milestone Consensus Ledger
    this.ledger = {
      agreements: [],
      divergences: [],
      openQuestions: []
    };

    // Logic Sanctum Configurations
    this.config = {
      maxRounds: 10,
      autoAdvanceDelayMs: 2500,
      contextDistillation: 'digest', // 'verbatim' | 'digest'
      promptTemplate: DEFAULT_DIALECTIC_TEMPLATE,
      redBlueAssignments: {} // seatIndex -> 'red' | 'blue'
    };

    this.currentStreamingTurn = null;
    this.autoAdvanceTimer = null;
    this.safetyTimeoutTimer = null;

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.overlayEl = document.getElementById('silk-symposium-chamber');
    this.btnClose = document.getElementById('btn-close-symposium-chamber');
    this.daisContainer = document.getElementById('symposium-dais-container');
    this.daisRibbon = document.getElementById('symposium-dais-ribbon');
    this.transcriptViewport = document.getElementById('symposium-transcript-viewport');
    this.ledgerTray = document.getElementById('symposium-ledger-tray');

    // Header buttons
    this.btnToggleDais = document.getElementById('btn-symposium-toggle-dais');
    this.btnToggleLedger = document.getElementById('btn-symposium-toggle-ledger');
    this.btnOpenSanctum = document.getElementById('btn-symposium-open-sanctum');
    this.btnExportBriefing = document.getElementById('btn-symposium-export-briefing');
    this.topologyBadge = document.getElementById('symposium-topology-badge');
    this.roundCounter = document.getElementById('symposium-round-counter');

    // Dock controls
    this.inputPrompt = document.getElementById('symposium-prompt-input');
    this.btnSendMaestro = document.getElementById('btn-symposium-send-maestro');
    this.btnAutoplayToggle = document.getElementById('btn-symposium-autoplay-toggle');
    this.batonSelect = document.getElementById('symposium-baton-select');

    // Logic Sanctum Drawer
    this.sanctumDrawer = document.getElementById('logic-sanctum-drawer');
    this.sanctumBackdrop = document.getElementById('sanctum-backdrop');
    this.btnCloseSanctum = document.getElementById('btn-close-sanctum');
    this.topologySelect = document.getElementById('sanctum-topology-select');
    this.maxRoundsInput = document.getElementById('sanctum-max-rounds');
    this.distillSelect = document.getElementById('sanctum-distill-select');
    this.templateTextarea = document.getElementById('sanctum-template-textarea');
    this.macroChipsContainer = document.getElementById('sanctum-macro-chips');
    this.btnSaveSanctum = document.getElementById('btn-save-sanctum');
  }

  bindEvents() {
    this.btnClose?.addEventListener('click', () => this.close());

    // Toggle Amphitheater Dais
    this.btnToggleDais?.addEventListener('click', () => {
      const isCollapsed = this.daisContainer?.classList.toggle('collapsed');
      this.btnToggleDais.classList.toggle('active', !isCollapsed);
    });

    // Toggle Consensus Ledger Side Tray
    this.btnToggleLedger?.addEventListener('click', () => {
      const isCollapsed = this.ledgerTray?.classList.toggle('collapsed');
      this.btnToggleLedger.classList.toggle('active', !isCollapsed);
    });

    // Logic Sanctum Drawer
    this.btnOpenSanctum?.addEventListener('click', () => this.openSanctum());
    this.btnCloseSanctum?.addEventListener('click', () => this.closeSanctum());
    this.sanctumBackdrop?.addEventListener('click', () => this.closeSanctum());

    this.btnSaveSanctum?.addEventListener('click', () => {
      this.saveSanctumConfig();
      this.closeSanctum();
    });

    // Macro insertion chips in Sanctum
    this.macroChipsContainer?.addEventListener('click', (e) => {
      const chip = e.target.closest('.macro-chip-btn');
      if (chip && this.templateTextarea) {
        const macro = chip.dataset.macro;
        const pos = this.templateTextarea.selectionStart || this.templateTextarea.value.length;
        const val = this.templateTextarea.value;
        this.templateTextarea.value = val.slice(0, pos) + macro + val.slice(pos);
        this.templateTextarea.focus();
      }
    });

    // Send Interjection / Prompt from Maestro
    this.btnSendMaestro?.addEventListener('click', () => this.handleMaestroSubmit());
    this.inputPrompt?.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        this.handleMaestroSubmit();
      }
    });

    // Input auto-growth & RTL detection
    this.inputPrompt?.addEventListener('input', () => {
      const val = this.inputPrompt.value;
      const dir = this.detectTextDirection(val);
      this.inputPrompt.setAttribute('dir', dir);
      this.inputPrompt.classList.toggle('is-rtl', dir === 'rtl');
      this.inputPrompt.style.height = 'auto';
      this.inputPrompt.style.height = Math.min(this.inputPrompt.scrollHeight, 160) + 'px';
    });

    // Autoplay Pause / Resume
    this.btnAutoplayToggle?.addEventListener('click', () => {
      if (this.sessionStatus === 'ACTIVE') {
        this.pauseSession();
      } else {
        this.resumeSession();
      }
    });

    // Baton selector change
    this.batonSelect?.addEventListener('change', () => {
      const selectedIndex = parseInt(this.batonSelect.value, 10);
      if (!isNaN(selectedIndex) && this.seats[selectedIndex]) {
        this.passBatonTo(selectedIndex);
      }
    });

    // Export briefing
    this.btnExportBriefing?.addEventListener('click', () => this.exportMarkdown());

    // In-bubble action chips listener
    this.transcriptViewport?.addEventListener('click', (e) => {
      const challengeBtn = e.target.closest('.btn-challenge-chip');
      if (challengeBtn) {
        const turnId = challengeBtn.dataset.turnId;
        this.challengeArgument(turnId);
        return;
      }

      const crownBtn = e.target.closest('.btn-crown-chip');
      if (crownBtn) {
        const turnId = crownBtn.dataset.turnId;
        this.crownInsight(turnId);
        return;
      }

      const synthBtn = e.target.closest('.btn-synth-chip');
      if (synthBtn) {
        this.synthesizeMilestone();
        return;
      }

      const copyCodeBtn = e.target.closest('.btn-copy-code');
      if (copyCodeBtn) {
        const codeBlock = copyCodeBtn.closest('.symposium-code-box')?.querySelector('.symposium-code-body code');
        if (codeBlock) {
          navigator.clipboard.writeText(codeBlock.textContent || codeBlock.innerText);
          const orig = copyCodeBtn.textContent;
          copyCodeBtn.textContent = '✓ Copied';
          setTimeout(() => { copyCodeBtn.textContent = orig; }, 1800);
        }
      }
    });

    // Live scraper stream chunk listener
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

    // Populate seats from active canvas cards if first time or changed
    this.syncSeatsWithCanvas();
    this.renderDais();
    this.renderTranscript();
    this.renderLedger();
    this.updateHeaderStats();

    requestAnimationFrame(() => this.inputPrompt?.focus());
    globalBus.emit('SILK_SYMPOSIUM_OPENED');
  }

  close() {
    this.isOpen = false;
    this.pauseSession();
    this.overlayEl?.classList.remove('open');
    this.closeSanctum();
    globalBus.emit('SILK_SYMPOSIUM_CLOSED');
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  // ── Seats & Dais Topology ──
  syncSeatsWithCanvas() {
    const cards = this.stateStore?.getCards() || [];
    if (cards.length === 0) return;

    const personaKeys = Object.keys(COGNITIVE_PERSONAS);

    // Reconcile seats with cards while preserving assigned personas and weights
    this.seats = cards.map((card, idx) => {
      const existing = this.seats.find(s => s.cardId === card.id);
      if (existing) {
        return {
          ...existing,
          name: card.title || card.name || 'AI Intelligence',
          color: card.color || '#c084fc',
          cardId: card.id
        };
      }

      const assignedPersonaKey = personaKeys[idx % personaKeys.length];
      const persona = COGNITIVE_PERSONAS[assignedPersonaKey];

      return {
        seatIndex: idx,
        cardId: card.id,
        name: card.title || card.name || 'AI Intelligence',
        color: card.color || '#c084fc',
        personaKey: assignedPersonaKey,
        personaTitle: persona.title,
        personaBadge: persona.badge,
        personaDirective: persona.directive,
        weight: 100,
        status: 'idle', // 'idle' | 'reflecting' | 'speaking' | 'challenged' | 'muted'
        isMuted: false,
        turnCount: 0
      };
    });

    this.updateBatonSelector();
  }

  renderDais() {
    if (!this.daisRibbon) return;
    this.daisRibbon.innerHTML = '';

    if (this.seats.length === 0) {
      this.daisRibbon.innerHTML = `<span style="font-size:12px;color:#94a3b8;padding:8px;">No active canvas intelligences available. Open models on canvas to participate.</span>`;
      return;
    }

    this.seats.forEach((seat, idx) => {
      const card = document.createElement('div');
      card.className = `symposium-seat-card ${seat.status} ${seat.isMuted ? 'muted' : ''}`;
      card.dataset.seatIndex = idx;
      card.style.setProperty('--model-color', seat.color);

      card.innerHTML = `
        <div class="seat-top-row">
          <div class="seat-identity">
            <span class="seat-status-dot" style="background:${seat.color}; color:${seat.color};"></span>
            <span class="seat-name-text" title="${this.escapeHtml(seat.name)}">${this.escapeHtml(seat.name)}</span>
          </div>
          <span class="seat-status-pill">${seat.status.toUpperCase()}</span>
        </div>

        <div class="seat-persona-badge" title="Click to mutate persona in Logic Sanctum">
          <span>${seat.personaBadge}</span>
          <span>${this.escapeHtml(seat.personaTitle.split('(')[0].trim())}</span>
        </div>

        <div class="seat-bottom-row">
          <button type="button" class="btn-pass-baton" data-seat="${idx}" title="Pass Speaking Silk Baton to this seat">
            <span>Pass Baton 🪄</span>
          </button>
          <span class="seat-weight-tag">${seat.weight}% weight</span>
        </div>
      `;

      card.querySelector('.btn-pass-baton')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.passBatonTo(idx);
      });

      card.addEventListener('click', () => {
        this.openSanctum();
      });

      this.daisRibbon.appendChild(card);
    });
  }

  updateBatonSelector() {
    if (!this.batonSelect) return;
    this.batonSelect.innerHTML = '';
    this.seats.forEach((seat, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${seat.name} (${seat.personaBadge})`;
      if (idx === this.activeSpeakerIndex) opt.selected = true;
      this.batonSelect.appendChild(opt);
    });
  }

  // ── Deliberation Engine & Turn Sequencing ──
  handleMaestroSubmit() {
    const text = (this.inputPrompt?.value || '').trim();
    if (!text || this.isSpeakerStreaming) return;

    if (!this.userCorePrompt) {
      this.userCorePrompt = text;
    }

    // Append User Turn to transcript
    const turn = {
      id: `turn_u_${Date.now()}`,
      role: 'user',
      speakerName: 'Human Maestro',
      color: '#f59e0b',
      text,
      round: this.roundIndex,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.transcript.push(turn);
    this.renderTranscript();

    // Reset input
    this.inputPrompt.value = '';
    this.inputPrompt.style.height = 'auto';

    // Start or advance deliberation turn
    this.sessionStatus = 'ACTIVE';
    this.updateHeaderStats();

    const targetSeatIndex = parseInt(this.batonSelect?.value, 10) || this.activeSpeakerIndex || 0;
    this.executeTurn(targetSeatIndex, text);
  }

  executeTurn(seatIndex, immediateContext = '') {
    if (this.isSpeakerStreaming) return;
    const seat = this.seats[seatIndex];
    if (!seat || seat.isMuted) {
      this.advanceToNextEligibleSpeaker();
      return;
    }

    this.activeSpeakerIndex = seatIndex;
    this.isSpeakerStreaming = true;

    // Update Seat Status
    this.seats.forEach(s => { s.status = 'idle'; });
    seat.status = 'speaking';
    this.renderDais();
    this.updateBatonSelector();

    // Compose tailored prompt using the Logic Sanctum Macro Engine
    const promptToSend = this.composePromptForSeat(seat, immediateContext);

    // Create placeholder turn in transcript
    const placeholderTurn = {
      id: `turn_m_${Date.now()}_${seat.cardId}`,
      role: 'model',
      seatIndex,
      speakerName: seat.name,
      color: seat.color,
      personaBadge: seat.personaBadge,
      personaTitle: seat.personaTitle,
      text: '',
      thinkingText: '',
      isThinking: false,
      isStreaming: true,
      round: this.roundIndex,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.transcript.push(placeholderTurn);
    this.currentStreamingTurn = placeholderTurn;
    this.renderTranscript();

    // Dispatch to model iframe via zero-API postMessage
    this.dispatchToCard(seat.cardId, promptToSend);

    // Safety timeout: prevent UI lock if model takes over 45s without streaming
    clearTimeout(this.safetyTimeoutTimer);
    this.safetyTimeoutTimer = setTimeout(() => {
      if (this.isSpeakerStreaming && this.currentStreamingTurn) {
        this.concludeTurn();
      }
    }, 45000);
  }

  dispatchToCard(cardId, promptText) {
    const card = this.stateStore.getCard(cardId);
    if (!card) return;

    const iframe = document.getElementById(`iframe-${cardId}`) ||
      document.querySelector(`iframe[name="${cardId}"]`) ||
      document.querySelector(`iframe[data-card-id="${cardId}"]`) ||
      document.querySelector(`[data-card-id="${cardId}"] iframe`);

    const driver = card.url ? domDriverRegistry.getDriverForUrl(card.url) : domDriverRegistry.getDrivers().generic;
    const messageId = `symposium_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

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
        console.warn('[SilkSymposium] Direct postMessage failed:', e);
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

  handleStreamChunk(data) {
    if (!this.isOpen || !this.isSpeakerStreaming) return;
    const activeSeat = this.seats[this.activeSpeakerIndex];
    if (!activeSeat || data.cardId !== activeSeat.cardId) return;

    const { text, isThinking, thinkingText, isFinished } = data;

    if (this.currentStreamingTurn) {
      if (text !== undefined && text !== '') this.currentStreamingTurn.text = text;
      if (isThinking !== undefined) this.currentStreamingTurn.isThinking = isThinking;
      if (thinkingText !== undefined && thinkingText !== '') this.currentStreamingTurn.thinkingText = thinkingText;

      this.updateStreamingTurnDOM();
    }

    if (isFinished) {
      this.concludeTurn();
    }
  }

  concludeTurn() {
    clearTimeout(this.safetyTimeoutTimer);
    this.isSpeakerStreaming = false;

    if (this.currentStreamingTurn) {
      this.currentStreamingTurn.isStreaming = false;
      if (!this.currentStreamingTurn.text && this.currentStreamingTurn.thinkingText) {
        this.currentStreamingTurn.text = this.currentStreamingTurn.thinkingText;
      }
      this.autoExtractConsensusSignals(this.currentStreamingTurn.text);
    }
    this.currentStreamingTurn = null;

    const activeSeat = this.seats[this.activeSpeakerIndex];
    if (activeSeat) {
      activeSeat.turnCount++;
      activeSeat.status = 'idle';
    }
    this.renderDais();
    this.renderTranscript();

    // Check Auto-Progression according to Debate Topology
    if (this.sessionStatus === 'ACTIVE') {
      if (this.debateMode === 'autonomous' || this.debateMode === 'socratic' || this.debateMode === 'delphi') {
        clearTimeout(this.autoAdvanceTimer);
        this.autoAdvanceTimer = setTimeout(() => {
          this.advanceToNextEligibleSpeaker();
        }, this.config.autoAdvanceDelayMs || 2500);
      }
    }
  }

  advanceToNextEligibleSpeaker() {
    if (this.sessionStatus !== 'ACTIVE' || this.seats.length === 0) return;

    let nextIdx = (this.activeSpeakerIndex + 1) % this.seats.length;
    let attempts = 0;
    while (this.seats[nextIdx]?.isMuted && attempts < this.seats.length) {
      nextIdx = (nextIdx + 1) % this.seats.length;
      attempts++;
    }

    if (nextIdx === 0) {
      this.roundIndex++;
      this.updateHeaderStats();
      if (this.config.maxRounds > 0 && this.roundIndex > this.config.maxRounds) {
        this.pauseSession();
        this.synthesizeMilestone();
        return;
      }
    }

    this.executeTurn(nextIdx);
  }

  passBatonTo(seatIndex) {
    if (this.isSpeakerStreaming) {
      alert('A speaker is currently reflecting or streaming. Please wait a moment.');
      return;
    }
    this.sessionStatus = 'ACTIVE';
    this.updateHeaderStats();
    this.executeTurn(seatIndex);
  }

  pauseSession() {
    this.sessionStatus = 'PAUSED';
    clearTimeout(this.autoAdvanceTimer);
    clearTimeout(this.safetyTimeoutTimer);
    this.updateHeaderStats();
  }

  resumeSession() {
    this.sessionStatus = 'ACTIVE';
    this.updateHeaderStats();
    this.advanceToNextEligibleSpeaker();
  }

  // ── Prompt Composer with Macro Engine ──
  composePromptForSeat(seat, immediateInterjection = '') {
    const template = this.config.promptTemplate || DEFAULT_DIALECTIC_TEMPLATE;
    const previousModelTurn = [...this.transcript].reverse().find(t => t.role === 'model' && !t.isStreaming);

    let roundContextBrief = '';
    if (this.config.contextDistillation === 'digest') {
      const lastThreeTurns = this.transcript.slice(-4).filter(t => !t.isStreaming);
      roundContextBrief = 'RECENT DELIBERATION HIGHLIGHTS:\n' +
        lastThreeTurns.map(t => `[${t.speakerName} (${t.personaTitle || 'Speaker'})]: ${t.text.slice(0, 320)}...`).join('\n\n');
    } else {
      const turns = this.transcript.slice(-6).filter(t => !t.isStreaming);
      roundContextBrief = 'ROUND DOSSIER (VERBATIM):\n' +
        turns.map(t => `[${t.speakerName}]: ${t.text}`).join('\n\n');
    }

    if (immediateInterjection) {
      roundContextBrief += `\n\nIMMEDIATE DIRECTIVE / COUNTERPOINT BY HUMAN MAESTRO:\n"${immediateInterjection}"`;
    }

    const agreementsText = this.ledger.agreements.length > 0
      ? this.ledger.agreements.map((a, i) => `${i + 1}. ${a}`).join('\n')
      : 'None formally confirmed yet.';

    const divergencesText = this.ledger.divergences.length > 0
      ? this.ledger.divergences.map((d, i) => `${i + 1}. ${d}`).join('\n')
      : 'No open disputes registered.';

    return template
      .replace(/{{speaker_role}}/g, seat.personaDirective)
      .replace(/{{speaker_name}}/g, seat.name)
      .replace(/{{user_core_prompt}}/g, this.userCorePrompt || 'General intellectual symposium.')
      .replace(/{{round_context_brief}}/g, roundContextBrief)
      .replace(/{{last_speaker_name}}/g, previousModelTurn?.speakerName || 'Previous Speaker')
      .replace(/{{last_speaker_argument}}/g, previousModelTurn?.text || 'Foundational question introduced.')
      .replace(/{{consensus_agreements}}/g, agreementsText)
      .replace(/{{consensus_gaps}}/g, divergencesText)
      .replace(/{{round_number}}/g, String(this.roundIndex));
  }

  // ── In-Bubble Micro Action Handlers ──
  challengeArgument(turnId) {
    const targetTurn = this.transcript.find(t => t.id === turnId);
    if (!targetTurn) return;

    const challengerSeat = this.seats.find(s => s.personaKey === 'devils_advocate') ||
                           this.seats[(this.activeSpeakerIndex + 1) % this.seats.length];

    targetTurn.isChallenged = true;
    const interjection = `Targeted Challenge to ${targetTurn.speakerName}: Dissect and falsify this specific claim: "${targetTurn.text.slice(0, 220)}..."`;
    this.executeTurn(challengerSeat.seatIndex, interjection);
  }

  crownInsight(turnId) {
    const targetTurn = this.transcript.find(t => t.id === turnId);
    if (!targetTurn) return;

    const summary = `${targetTurn.speakerName}: "${targetTurn.text.slice(0, 140)}..."`;
    if (!this.ledger.agreements.includes(summary)) {
      this.ledger.agreements.push(summary);
      this.renderLedger();
    }
  }

  synthesizeMilestone() {
    const synthSeat = this.seats.find(s => s.personaKey === 'synthesizer') || this.seats[0];
    const directive = 'MILESTONE SYNTHESIS DIRECTIVE: Consolidate all confirmed agreements, map out the irreconcilable differences, and produce a unified consensus framework reflecting all seated models.';
    this.executeTurn(synthSeat.seatIndex, directive);
  }

  autoExtractConsensusSignals(text) {
    if (!text || text.length < 50) return;
    // Simple heuristic parser for explicit agreement or divergence markers
    if (/we agree that|consensus points?:|نقطه اشتراک|توافق حاصل شد/i.test(text)) {
      const match = text.match(/(?:we agree that|consensus points?:|نقطه اشتراک|توافق حاصل شد)([\s\S]{10,180}?)(?:\n|\.|$)/i);
      if (match && match[1]) {
        const item = match[1].trim();
        if (item.length > 8 && !this.ledger.agreements.includes(item)) {
          this.ledger.agreements.push(item);
          this.renderLedger();
        }
      }
    }
  }

  // ── Renderers & UI Updaters ──
  renderTranscript() {
    if (!this.transcriptViewport) return;

    if (this.transcript.length === 0) {
      this.transcriptViewport.innerHTML = `
        <div class="symposium-empty-sanctuary">
          <div class="symposium-empty-orb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="5"/>
            </svg>
          </div>
          <h3>The Silk Symposium Agora</h3>
          <p>Convene a high-order cognitive roundtable. Type a foundational inquiry below or click <strong>Pass Baton</strong> to let an AI Chair initiate the debate.</p>
        </div>
      `;
      return;
    }

    this.transcriptViewport.innerHTML = '';
    this.transcript.forEach(turn => {
      const row = document.createElement('div');
      row.className = `symposium-turn-row ${turn.role}`;
      row.id = `turn-${turn.id}`;

      const textDir = this.detectTextDirection(turn.text || '');
      const isRTL = textDir === 'rtl';

      if (turn.role === 'user') {
        row.innerHTML = `
          <div class="symposium-turn-meta">
            <span>Human Maestro</span> • <span>${turn.timestamp}</span>
          </div>
          <div class="symposium-bubble-card ${isRTL ? 'is-rtl' : ''}" dir="${textDir}">
            ${this.escapeHtml(turn.text)}
          </div>
        `;
      } else {
        const renderedMd = this.renderMarkdown(turn.text || '');
        const thinkingHtml = turn.thinkingText ? `
          <div class="mirror-reasoning-fold" style="margin-bottom: 8px;">
            <button type="button" class="reasoning-fold-trigger"><span>🧠 Reasoning</span><span>▼</span></button>
            <div class="reasoning-fold-body" dir="${this.detectTextDirection(turn.thinkingText)}">${this.escapeHtml(turn.thinkingText)}</div>
          </div>
        ` : '';

        const pulseHtml = turn.isStreaming ? `
          <div class="mirror-streaming-pulse"><span></span><span></span><span></span></div>
        ` : '';

        row.innerHTML = `
          <div class="symposium-turn-meta">
            <span class="turn-speaker-badge" style="color: ${turn.color};">
              <span style="width:7px;height:7px;border-radius:50%;background:currentColor;"></span>
              ${this.escapeHtml(turn.speakerName)}
            </span>
            <span class="turn-persona-tag">${this.escapeHtml(turn.personaBadge || 'Chair')}</span>
            <span class="turn-round-tag">Round ${turn.round}</span> • <span>${turn.timestamp}</span>
          </div>
          <div class="symposium-bubble-card ${isRTL ? 'is-rtl' : ''}" dir="${textDir}" style="--model-color: ${turn.color};">
            ${thinkingHtml}
            <div class="symposium-markdown">${renderedMd}</div>
            ${pulseHtml}
            <div class="symposium-bubble-actions">
              <button type="button" class="btn-bubble-chip btn-challenge-chip" data-turn-id="${turn.id}" title="Direct next speaker to challenge this premise">
                <span>🎯 Challenge</span>
              </button>
              <button type="button" class="btn-bubble-chip crown-chip btn-crown-chip" data-turn-id="${turn.id}" title="Crown as Confirmed Agreement in Ledger">
                <span>💎 Crown Insight</span>
              </button>
              <button type="button" class="btn-bubble-chip btn-synth-chip" title="Call upon Chairman to synthesize up to here">
                <span>👑 Synthesize</span>
              </button>
            </div>
          </div>
        `;
      }

      this.transcriptViewport.appendChild(row);
    });

    this.scrollToBottom();
  }

  updateStreamingTurnDOM() {
    if (!this.currentStreamingTurn) return;
    const row = document.getElementById(`turn-${this.currentStreamingTurn.id}`);
    if (!row) {
      this.renderTranscript();
      return;
    }

    const bubble = row.querySelector('.symposium-bubble-card');
    const mdContainer = row.querySelector('.symposium-markdown');
    const textDir = this.detectTextDirection(this.currentStreamingTurn.text || '');

    if (bubble) {
      bubble.setAttribute('dir', textDir);
      bubble.classList.toggle('is-rtl', textDir === 'rtl');
    }
    if (mdContainer) {
      mdContainer.innerHTML = this.renderMarkdown(this.currentStreamingTurn.text || '');
    }

    this.scrollToBottom();
  }

  renderLedger() {
    if (!this.ledgerTray) return;

    const renderList = (items, cls) => {
      if (!items.length) return `<span style="font-size:11px;color:#64748b;font-style:italic;">No entries registered</span>`;
      return items.map(item => `
        <div class="ledger-item-card ${cls}">
          ${this.escapeHtml(item)}
        </div>
      `).join('');
    };

    const agreementsEl = document.getElementById('ledger-agreements-list');
    const divergencesEl = document.getElementById('ledger-divergences-list');
    const questionsEl = document.getElementById('ledger-questions-list');

    if (agreementsEl) agreementsEl.innerHTML = renderList(this.ledger.agreements, 'agreement');
    if (divergencesEl) divergencesEl.innerHTML = renderList(this.ledger.divergences, 'divergence');
    if (questionsEl) questionsEl.innerHTML = renderList(this.ledger.openQuestions, 'open-question');
  }

  updateHeaderStats() {
    if (this.roundCounter) {
      this.roundCounter.textContent = `R${this.roundIndex}`;
    }
    if (this.topologyBadge) {
      const labels = {
        socratic: 'Socratic Dialectic',
        delphi: 'Delphi Consensus',
        red_blue: 'Red vs Blue',
        autonomous: 'Autonomous Agora',
        maestro: 'Human Maestro'
      };
      this.topologyBadge.innerHTML = `<span class="dot"></span> ${labels[this.debateMode] || this.debateMode}`;
    }
    if (this.btnAutoplayToggle) {
      this.btnAutoplayToggle.textContent = this.sessionStatus === 'ACTIVE' ? '⏸️ Pause Flow' : '▶️ Resume Flow';
      this.btnAutoplayToggle.classList.toggle('active', this.sessionStatus === 'ACTIVE');
    }
  }

  scrollToBottom() {
    if (this.transcriptViewport) {
      this.transcriptViewport.scrollTop = this.transcriptViewport.scrollHeight;
    }
  }

  // ── Logic Sanctum Drawer Management ──
  openSanctum() {
    this.sanctumDrawer?.classList.add('open');
    this.sanctumBackdrop?.classList.add('open');

    if (this.topologySelect) this.topologySelect.value = this.debateMode;
    if (this.maxRoundsInput) this.maxRoundsInput.value = this.config.maxRounds;
    if (this.distillSelect) this.distillSelect.value = this.config.contextDistillation;
    if (this.templateTextarea) this.templateTextarea.value = this.config.promptTemplate;
  }

  closeSanctum() {
    this.sanctumDrawer?.classList.remove('open');
    this.sanctumBackdrop?.classList.remove('open');
  }

  saveSanctumConfig() {
    if (this.topologySelect) this.debateMode = this.topologySelect.value;
    if (this.maxRoundsInput) this.config.maxRounds = parseInt(this.maxRoundsInput.value, 10) || 10;
    if (this.distillSelect) this.config.contextDistillation = this.distillSelect.value;
    if (this.templateTextarea) this.config.promptTemplate = this.templateTextarea.value.trim() || DEFAULT_DIALECTIC_TEMPLATE;

    this.updateHeaderStats();
  }

  exportMarkdown() {
    let md = `# 🏛️ The Silk Symposium Briefing & Consensus Dossier\n`;
    md += `**Topic:** ${this.userCorePrompt || 'Multi-Model Intellectual Dialectic'}\n`;
    md += `**Debate Topology:** ${this.debateMode}\n`;
    md += `**Rounds Completed:** ${this.roundIndex}\n`;
    md += `**Timestamp:** ${new Date().toLocaleString()}\n\n`;

    md += `---\n\n## 💎 Milestone Consensus Ledger\n\n`;
    md += `### Confirmed Agreements (اجماع‌های تأییدشده)\n`;
    md += this.ledger.agreements.length ? this.ledger.agreements.map(a => `- ${a}`).join('\n') : '- None formally confirmed.\n';

    md += `\n### Critical Divergences & Debates (نقاط تمایز و چالش)\n`;
    md += this.ledger.divergences.length ? this.ledger.divergences.map(d => `- ${d}`).join('\n') : '- No active disputes logged.\n';

    md += `\n---\n\n## 📜 Chronological Deliberation Transcript\n\n`;
    this.transcript.forEach(t => {
      md += `### ${t.speakerName} [${t.role.toUpperCase()} • Round ${t.round} • ${t.timestamp}]\n\n${t.text}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silk_symposium_${Date.now()}.md`;
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
    const stripped = text
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`]+`/g, ' ')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .trim();

    if (!stripped) return 'ltr';
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/g;
    const ltrRegex = /[A-Za-z\u00C0-\u024F]/g;
    const rtlMatches = stripped.match(rtlRegex) || [];
    const ltrMatches = stripped.match(ltrRegex) || [];

    if (rtlMatches.length === 0) return 'ltr';
    if (ltrMatches.length === 0) return 'rtl';
    return (rtlMatches.length >= ltrMatches.length * 0.25 || rtlMatches.length >= ltrMatches.length) ? 'rtl' : 'ltr';
  }

  renderMarkdown(raw) {
    if (!raw) return '<p></p>';
    let out = raw;
    const codeBlocks = [];

    out = out.replace(/```([a-zA-Z0-9_#-]*)[ \t]*\n?([\s\S]*?)```/g, (match, lang, code) => {
      const token = `%%SYMPOSIUM_CODE_${codeBlocks.length}%%`;
      const language = (lang || 'code').trim().toLowerCase();
      const cleanCode = this.escapeHtml(code.replace(/^\n+|\n+$/g, ''));
      const html = `
        <div class="symposium-code-box" dir="ltr">
          <div class="symposium-code-header" dir="ltr">
            <span>${language}</span>
            <button type="button" class="btn-copy-code">Copy</button>
          </div>
          <pre class="symposium-code-body" dir="ltr"><code>${cleanCode}</code></pre>
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
      return `<p dir="${dir}" class="${dir === 'rtl' ? 'is-rtl' : ''}">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    }).filter(Boolean);

    let finalHtml = paragraphs.join('');
    codeBlocks.forEach(cb => {
      finalHtml = finalHtml.split(cb.token).join(cb.html);
    });
    return finalHtml;
  }
}