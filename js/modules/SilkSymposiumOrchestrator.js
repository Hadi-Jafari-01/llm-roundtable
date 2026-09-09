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

/**
 * OmniAI Hub — The Silk Symposium Orchestrator (تالار هم‌اندیشی و میزگرد زنده انسان و هوش مصنوعی‌ها)
 * Lean Master Coordinator & Event Gateway
 * Wires together SymposiumState, TurnSequencer, SymposiumDais, SymposiumTranscript, and ConsensusLedger.
 */

import { SymposiumState, COGNITIVE_PERSONAS } from './symposium/SymposiumState.js';
import { TurnSequencer } from './symposium/TurnSequencer.js';
import { SymposiumDais } from './symposium/SymposiumDais.js';
import { SymposiumTranscript } from './symposium/SymposiumTranscript.js';
import { ConsensusLedger } from './symposium/ConsensusLedger.js';
import { domDriverRegistry } from './DomDriverRegistry.js';
import { globalBus } from './EventBus.js';

export class SilkSymposiumOrchestrator {
  constructor(stateStore) {
    this.stateStore = stateStore;
    this.isOpen = false;

    // Micro-Module Initialization
    this.symposiumState = new SymposiumState();
    this.turnSequencer = new TurnSequencer(this.symposiumState, {
      onSeatDispatched: (data) => this.handleSeatDispatched(data),
      onUserTurnPrompted: (data) => this.handleUserTurnPrompted(data),
      onTurnFinished: (data) => this.handleTurnFinished(data),
      onRoundAdvanced: () => this.updateHeaderStats(),
      onSessionPaused: () => this.updateHeaderStats(),
      onSessionResumed: () => this.updateHeaderStats(),
      onSessionCompleted: () => this.handleSessionCompleted()
    });

    this.activeSanctumSeatIndex = 0;
    this.currentSanctumTab = 'personas';

    this.initElements();
    this.initSubModules();
    this.bindEvents();
  }

  initElements() {
    this.overlayEl = document.getElementById('silk-symposium-chamber');
    this.btnClose = document.getElementById('btn-close-symposium-chamber');
    this.btnToggleDais = document.getElementById('btn-symposium-toggle-dais');
    this.btnToggleLedger = document.getElementById('btn-symposium-toggle-ledger');
    this.btnToggleUserSeat = document.getElementById('btn-symposium-toggle-user-seat');
    this.btnOpenSanctum = document.getElementById('btn-symposium-open-sanctum');
    this.btnOpenPersonas = document.getElementById('btn-symposium-open-personas');
    this.btnExportBriefing = document.getElementById('btn-symposium-export-briefing');
    this.topologyBadge = document.getElementById('symposium-topology-badge');
    this.roundCounter = document.getElementById('symposium-round-counter');

    this.dockContainer = document.querySelector('.symposium-maestro-dock');
    this.inputPrompt = document.getElementById('symposium-prompt-input');
    this.inputBox = document.querySelector('.symposium-input-box');
    this.btnSendMaestro = document.getElementById('btn-symposium-send-maestro');
    this.btnAutoplayToggle = document.getElementById('btn-symposium-autoplay-toggle');
    this.batonSelect = document.getElementById('symposium-baton-select');

    // Logic Sanctum Drawer & Tabs
    this.sanctumDrawer = document.getElementById('logic-sanctum-drawer');
    this.sanctumBackdrop = document.getElementById('sanctum-backdrop');
    this.btnCloseSanctum = document.getElementById('btn-close-sanctum');
    this.sanctumTabBtns = document.querySelectorAll('.sanctum-tab-btn');
    this.sanctumSections = {
      personas: document.getElementById('sanctum-section-personas'),
      presets: document.getElementById('sanctum-section-presets'),
      protocols: document.getElementById('sanctum-section-protocols'),
      userRole: document.getElementById('sanctum-section-user')
    };

    // Tab 1: Model Personas & Directives Form Fields
    this.sanctumSeatPicker = document.getElementById('sanctum-seat-picker-select');
    this.sanctumPresetPicker = document.getElementById('sanctum-persona-preset-select');
    this.sanctumSeatTitleInput = document.getElementById('sanctum-seat-title');
    this.sanctumSeatBadgeInput = document.getElementById('sanctum-seat-badge');
    this.sanctumSeatDirectiveTextarea = document.getElementById('sanctum-seat-directive');
    this.sanctumSeatWeightInput = document.getElementById('sanctum-seat-weight');
    this.sanctumSeatMuteCheck = document.getElementById('sanctum-seat-mute-check');
    this.sanctumSeatCustomTemplateTextarea = document.getElementById('sanctum-seat-custom-template');
    this.sanctumGlobalDirectiveTextarea = document.getElementById('sanctum-global-directive');

    this.btnSaveSeatSettings = document.getElementById('btn-save-seat-settings');
    this.btnApplySeatToAll = document.getElementById('btn-apply-seat-to-all');
    this.btnSaveAsNewPreset = document.getElementById('btn-save-as-new-preset');

    // Tab 2: Presets Library
    this.presetsListContainer = document.getElementById('sanctum-presets-list');
    this.btnCreateNewPreset = document.getElementById('btn-create-new-preset');
    this.btnResetFactoryPresets = document.getElementById('btn-reset-factory-presets');

    // Tab 3: Protocols
    this.topologySelect = document.getElementById('sanctum-topology-select');
    this.maxRoundsInput = document.getElementById('sanctum-max-rounds');
    this.distillSelect = document.getElementById('sanctum-distill-select');
    this.templateTextarea = document.getElementById('sanctum-template-textarea');
    this.macroChipsContainer = document.getElementById('sanctum-macro-chips');
    this.btnSaveProtocols = document.getElementById('btn-save-protocols');

    // Tab 4: User Seat Sanctum Inputs
    this.sanctumUserSeatedCheck = document.getElementById('sanctum-user-seated-check');
    this.sanctumUserNameInput = document.getElementById('sanctum-user-name');
    this.sanctumUserPersonaSelect = document.getElementById('sanctum-user-persona-select');
    this.sanctumUserWeightInput = document.getElementById('sanctum-user-weight');
    this.sanctumUserDirectiveTextarea = document.getElementById('sanctum-user-directive');
    this.btnSaveUserRole = document.getElementById('btn-save-user-role');
  }

  initSubModules() {
    const daisContainer = document.getElementById('symposium-dais-container');
    const daisRibbon = document.getElementById('symposium-dais-ribbon');
    this.dais = new SymposiumDais(daisContainer, daisRibbon, {
      onPassBaton: (idx) => this.turnSequencer.passBaton(idx),
      onConfigureSeat: (idx) => this.openSanctum('personas', idx),
      onToggleMute: (idx) => this.handleToggleSeatMute(idx)
    });

    const transcriptViewport = document.getElementById('symposium-transcript-viewport');
    this.transcriptView = new SymposiumTranscript(transcriptViewport, {
      onChallenge: (turnId) => this.handleChallengeTurn(turnId),
      onCrownInsight: (turnId) => this.handleCrownInsight(turnId),
      onSynthesize: () => this.handleSynthesize()
    });

    const ledgerTray = document.getElementById('symposium-ledger-tray');
    this.ledgerView = new ConsensusLedger(ledgerTray, {
      onItemDeleted: (cat, idx) => {
        this.symposiumState.removeLedgerItem(cat, idx);
        this.ledgerView.render(this.symposiumState.ledger);
      }
    });
  }

  bindEvents() {
    this.btnClose?.addEventListener('click', () => this.close());
    this.btnToggleDais?.addEventListener('click', () => {
      const isCollapsed = document.getElementById('symposium-dais-container')?.classList.toggle('collapsed');
      this.btnToggleDais.classList.toggle('active', !isCollapsed);
    });

    this.btnToggleLedger?.addEventListener('click', () => {
      const isCollapsed = document.getElementById('symposium-ledger-tray')?.classList.toggle('collapsed');
      this.btnToggleLedger.classList.toggle('active', !isCollapsed);
    });

    // Toggle user sitting directly on the Dais
    this.btnToggleUserSeat?.addEventListener('click', () => {
      const nextSeated = !this.symposiumState.userParticipant.isSeated;
      this.symposiumState.setUserParticipation(nextSeated);
      this.syncSeats();
      this.renderAll();
    });

    this.btnOpenSanctum?.addEventListener('click', () => this.openSanctum('protocols'));
    this.btnOpenPersonas?.addEventListener('click', () => this.openSanctum('personas'));
    this.btnCloseSanctum?.addEventListener('click', () => this.closeSanctum());
    this.sanctumBackdrop?.addEventListener('click', () => this.closeSanctum());

    // Tab switcher in Sanctum
    this.sanctumTabBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchSanctumTab(tab);
      });
    });

    // Seat picker dropdown change
    this.sanctumSeatPicker?.addEventListener('change', () => {
      const idx = parseInt(this.sanctumSeatPicker.value, 10);
      if (!isNaN(idx)) {
        this.loadSeatIntoEditor(idx);
      }
    });

    // Preset selector change -> auto-fills editor with chosen preset
    this.sanctumPresetPicker?.addEventListener('change', () => {
      const presetKey = this.sanctumPresetPicker.value;
      if (!presetKey) return;
      const persona = this.symposiumState.getPersona(presetKey);
      if (persona) {
        if (this.sanctumSeatTitleInput) this.sanctumSeatTitleInput.value = persona.title || '';
        if (this.sanctumSeatBadgeInput) this.sanctumSeatBadgeInput.value = persona.badge || '';
        if (this.sanctumSeatDirectiveTextarea) {
          this.sanctumSeatDirectiveTextarea.value = persona.directive || '';
          this.syncTextareaDirection(this.sanctumSeatDirectiveTextarea);
        }
      }
    });

    // Auto text direction detection on custom directive textareas
    this.sanctumSeatDirectiveTextarea?.addEventListener('input', () => {
      this.syncTextareaDirection(this.sanctumSeatDirectiveTextarea);
    });
    this.sanctumGlobalDirectiveTextarea?.addEventListener('input', () => {
      this.syncTextareaDirection(this.sanctumGlobalDirectiveTextarea);
    });
    this.sanctumUserDirectiveTextarea?.addEventListener('input', () => {
      this.syncTextareaDirection(this.sanctumUserDirectiveTextarea);
    });

    // Save active seat configuration
    this.btnSaveSeatSettings?.addEventListener('click', () => {
      this.saveActiveSeatFromEditor();
    });

    // Apply active seat's persona and directive to all models
    this.btnApplySeatToAll?.addEventListener('click', () => {
      this.applyActiveSeatToAllModels();
    });

    // Save active seat's settings as a new reusable preset template
    this.btnSaveAsNewPreset?.addEventListener('click', () => {
      this.saveActiveSeatAsNewPreset();
    });

    // Create a new preset template directly from library tab
    this.btnCreateNewPreset?.addEventListener('click', () => {
      this.promptCreateNewPreset();
    });

    // Reset factory presets
    this.btnResetFactoryPresets?.addEventListener('click', () => {
      if (confirm('آیا مایلید تمام الگوهای سفارشی حذف و الگوهای پیش‌فرض کارخانه بازنشانی شوند؟')) {
        this.symposiumState.resetPersonaPresets();
        this.renderPresetsDropdown();
        this.renderPresetsLibrary();
        this.showToast('الگوهای پیش‌فرض کارخانه بازنشانی شدند ✓');
      }
    });

    // Save protocols
    this.btnSaveProtocols?.addEventListener('click', () => {
      this.saveProtocolsConfig();
    });

    // Save user role
    this.btnSaveUserRole?.addEventListener('click', () => {
      this.saveUserRoleConfig();
    });

    this.btnSendMaestro?.addEventListener('click', () => this.handleUserInputSubmit());
    this.inputPrompt?.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        this.handleUserInputSubmit();
      }
    });

    this.btnAutoplayToggle?.addEventListener('click', () => {
      if (this.symposiumState.sessionStatus === 'ACTIVE') {
        this.turnSequencer.pause();
      } else {
        this.turnSequencer.resume();
      }
    });

    this.batonSelect?.addEventListener('change', () => {
      const selected = parseInt(this.batonSelect.value, 10);
      if (!isNaN(selected)) this.turnSequencer.passBaton(selected);
    });

    this.btnExportBriefing?.addEventListener('click', () => this.exportMarkdown());

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

    // Live frame response chunks listener
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
    this.syncSeats();
    this.renderAll();
    this.renderPresetsDropdown();
    this.renderPresetsLibrary();
    requestAnimationFrame(() => this.inputPrompt?.focus());
    globalBus.emit('SILK_SYMPOSIUM_OPENED');
  }

  close() {
    this.isOpen = false;
    this.turnSequencer.pause();
    this.overlayEl?.classList.remove('open');
    this.closeSanctum();
    globalBus.emit('SILK_SYMPOSIUM_CLOSED');
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  syncSeats() {
    const cards = this.stateStore?.getCards() || [];
    this.symposiumState.syncWithCanvasCards(cards);
    this.updateBatonSelector();
    this.updateSanctumSeatSelector();
    this.updateUserSeatButtonUI();
  }

  updateSanctumSeatSelector() {
    if (!this.sanctumSeatPicker) return;
    this.sanctumSeatPicker.innerHTML = '';
    this.symposiumState.seats.forEach((seat, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${seat.isUser ? '👑 [User]' : '🤖'} ${seat.name} — ${seat.personaTitle}`;
      if (idx === this.activeSanctumSeatIndex) opt.selected = true;
      this.sanctumSeatPicker.appendChild(opt);
    });
  }

  handleToggleSeatMute(seatIndex) {
    const seat = this.symposiumState.seats[seatIndex];
    if (!seat) return;
    const nextMuted = !seat.isMuted;
    this.symposiumState.setSeatMuted(seatIndex, nextMuted);
    this.dais.render(this.symposiumState.seats, this.symposiumState.activeSpeakerIndex, this.symposiumState.sessionStatus === 'WAITING_FOR_USER');
    this.showToast(`${seat.name} ${nextMuted ? 'بی‌صدا شد 🔇' : 'فعال شد 🔊'}`);
  }

  renderAll() {
    const waitingForUser = this.symposiumState.sessionStatus === 'WAITING_FOR_USER';
    this.dais.render(this.symposiumState.seats, this.symposiumState.activeSpeakerIndex, waitingForUser);
    this.transcriptView.render(this.symposiumState.transcript);
    this.ledgerView.render(this.symposiumState.ledger);
    this.updateHeaderStats();
  }

  updateBatonSelector() {
    if (!this.batonSelect) return;
    this.batonSelect.innerHTML = '';
    this.symposiumState.seats.forEach((seat, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${seat.name} (${seat.personaBadge || ''})`;
      if (idx === this.symposiumState.activeSpeakerIndex) opt.selected = true;
      this.batonSelect.appendChild(opt);
    });
  }

  updateUserSeatButtonUI() {
    if (!this.btnToggleUserSeat) return;
    const isSeated = this.symposiumState.userParticipant.isSeated;
    this.btnToggleUserSeat.classList.toggle('active', isSeated);
    this.btnToggleUserSeat.innerHTML = isSeated
      ? '<span>👑 Seated on Dais</span>'
      : '<span>🪑 Seat Yourself</span>';
  }

  updateHeaderStats() {
    if (this.roundCounter) {
      this.roundCounter.textContent = `R${this.symposiumState.roundIndex}`;
    }
    if (this.topologyBadge) {
      const labels = {
        manual: 'Manual Conductor',
        round_robin: 'Orderly Round-Robin',
        socratic: 'Socratic Dialectic',
        delphi: 'Delphi Convergence',
        autonomous: 'Autonomous Agora'
      };
      this.topologyBadge.innerHTML = `<span class="dot"></span> ${labels[this.symposiumState.debateMode] || this.symposiumState.debateMode}`;
    }
    if (this.btnAutoplayToggle) {
      const isActive = this.symposiumState.sessionStatus === 'ACTIVE';
      this.btnAutoplayToggle.textContent = isActive ? '⏸️ Pause Flow' : '▶️ Resume Flow';
      this.btnAutoplayToggle.classList.toggle('active', isActive);
    }
  }

  handleUserInputSubmit() {
    const text = (this.inputPrompt?.value || '').trim();
    if (!text) return;

    // Check if user is speaking as a seated participant answering their turn
    if (this.symposiumState.sessionStatus === 'WAITING_FOR_USER') {
      this.symposiumState.addTurn({
        id: `turn_u_${Date.now()}`,
        role: 'user',
        isSeatedUser: true,
        speakerName: this.symposiumState.userParticipant.name,
        color: this.symposiumState.userParticipant.color,
        personaBadge: this.symposiumState.userParticipant.personaBadge,
        text,
        round: this.symposiumState.roundIndex,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      this.inputPrompt.value = '';
      this.clearUserTurnHighlight();
      this.renderAll();
      this.turnSequencer.completeTurn(text, true);
      return;
    }

    // Otherwise, this is a Maestro interjection / prompt opening
    if (!this.symposiumState.userCorePrompt) {
      this.symposiumState.userCorePrompt = text;
    }

    this.symposiumState.addTurn({
      id: `turn_u_${Date.now()}`,
      role: 'user',
      isSeatedUser: false,
      speakerName: 'Human Maestro',
      color: '#f59e0b',
      text,
      round: this.symposiumState.roundIndex,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    this.inputPrompt.value = '';
    this.renderAll();

    if (this.symposiumState.sessionStatus !== 'ACTIVE') {
      const targetIdx = parseInt(this.batonSelect?.value, 10) || 0;
      this.turnSequencer.start();
      this.turnSequencer.passBaton(targetIdx);
    } else {
      this.turnSequencer.advanceNext();
    }
  }

  handleUserTurnPrompted({ seat, seatIndex }) {
    this.dais.render(this.symposiumState.seats, seatIndex, true);
    this.inputBox?.classList.add('user-turn-active');
    if (this.inputPrompt) {
      this.inputPrompt.placeholder = `🌟 Your turn to address the Dais as ${seat.personaTitle}... (⌘↵ to speak)`;
      this.inputPrompt.focus();
    }
  }

  clearUserTurnHighlight() {
    this.inputBox?.classList.remove('user-turn-active');
    if (this.inputPrompt) {
      this.inputPrompt.placeholder = 'Interject into the symposium, challenge a premise, or steer the debate... (⌘↵ to send)';
    }
  }

  handleSeatDispatched({ seat, seatIndex, immediateContext }) {
    this.clearUserTurnHighlight();
    this.dais.highlightActiveSeat(seatIndex, false);

    const promptToSend = this.composeSeatPrompt(seat, immediateContext);

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
      round: this.symposiumState.roundIndex,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.symposiumState.addTurn(placeholderTurn);
    this.transcriptView.render(this.symposiumState.transcript);

    this.dispatchToCard(seat.cardId, promptToSend);
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
      } catch (_) {}
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
    if (!this.isOpen || !this.symposiumState.isSpeakerStreaming) return;
    const activeSeat = this.symposiumState.seats[this.symposiumState.activeSpeakerIndex];
    if (!activeSeat || data.cardId !== activeSeat.cardId) return;

    const { text, isThinking, thinkingText, isFinished } = data;

    this.symposiumState.updateStreamingTurn({
      text: text !== undefined ? text : undefined,
      isThinking: isThinking !== undefined ? isThinking : undefined,
      thinkingText: thinkingText !== undefined ? thinkingText : undefined
    });

    const lastTurn = this.symposiumState.transcript[this.symposiumState.transcript.length - 1];
    this.transcriptView.updateStreamingTurn(lastTurn);

    if (isFinished) {
      this.turnSequencer.completeTurn(text || thinkingText || '', true);
    }
  }

  handleTurnFinished({ seat, text }) {
    // Extract automated consensus/divergence markers into Ledger
    const signals = this.ledgerView.extractSignalsFromText(text, seat.name);
    if (signals) {
      if (signals.agreement) this.symposiumState.addLedgerItem('agreements', signals.agreement);
      if (signals.divergence) this.symposiumState.addLedgerItem('divergences', signals.divergence);
      if (signals.question) this.symposiumState.addLedgerItem('openQuestions', signals.question);
    }

    this.renderAll();
  }

  handleSessionCompleted() {
    this.updateHeaderStats();
    this.clearUserTurnHighlight();
  }

  composeSeatPrompt(seat, immediateContext = '') {
    // Custom prompt template per seat, or global template
    const template = (seat.customPromptTemplate && seat.customPromptTemplate.trim())
      ? seat.customPromptTemplate.trim()
      : this.symposiumState.config.promptTemplate;

    const turns = this.symposiumState.transcript.filter(t => !t.isStreaming);
    const lastTurn = turns[turns.length - 1];

    let contextBrief = '';
    if (this.symposiumState.config.contextDistillation === 'digest') {
      const recent = turns.slice(-3);
      contextBrief = 'RECENT DELIBERATION HIGHLIGHTS:\n' +
        recent.map(t => `[${t.speakerName} (${t.personaTitle || 'Chair'})]: ${t.text.slice(0, 320)}...`).join('\n\n');
    } else {
      contextBrief = 'CHRONOLOGICAL TRANSCRIPT (VERBATIM):\n' +
        turns.slice(-5).map(t => `[${t.speakerName}]: ${t.text}`).join('\n\n');
    }

    if (immediateContext) {
      contextBrief += `\n\nDIRECT INJECTION / DIRECTIVE:\n"${immediateContext}"`;
    }

    // Incorporate individual directive and optional global directive
    let directive = seat.personaDirective || '';
    if (this.symposiumState.config.globalDirective && this.symposiumState.config.globalDirective.trim()) {
      directive = `[GLOBAL SYMPOSIUM MANDATE]:\n${this.symposiumState.config.globalDirective.trim()}\n\n[YOUR SPECIFIC ARCHETYPE & DIRECTIVE]:\n${directive}`;
    }

    const agreementsText = this.symposiumState.ledger.agreements.length > 0
      ? this.symposiumState.ledger.agreements.map((a, i) => `${i + 1}. ${a}`).join('\n')
      : 'None confirmed yet.';

    const divergencesText = this.symposiumState.ledger.divergences.length > 0
      ? this.symposiumState.ledger.divergences.map((d, i) => `${i + 1}. ${d}`).join('\n')
      : 'None logged yet.';

    return template
      .replace(/{{speaker_role}}/g, directive)
      .replace(/{{speaker_name}}/g, seat.name)
      .replace(/{{user_core_prompt}}/g, this.symposiumState.userCorePrompt || 'Foundational inquiry.')
      .replace(/{{round_context_brief}}/g, contextBrief)
      .replace(/{{last_speaker_name}}/g, lastTurn?.speakerName || 'Peer')
      .replace(/{{last_speaker_argument}}/g, lastTurn?.text?.slice(0, 280) || 'Opening argument.')
      .replace(/{{consensus_agreements}}/g, agreementsText)
      .replace(/{{consensus_gaps}}/g, divergencesText)
      .replace(/{{round_number}}/g, String(this.symposiumState.roundIndex));
  }

  handleChallengeTurn(turnId) {
    const turn = this.symposiumState.transcript.find(t => t.id === turnId);
    if (!turn) return;

    const adversaryIdx = this.symposiumState.seats.findIndex(s => s.personaKey === 'devils_advocate' && !s.isMuted);
    const targetIdx = adversaryIdx >= 0 ? adversaryIdx : (this.symposiumState.activeSpeakerIndex + 1) % this.symposiumState.seats.length;

    const directive = `CRITICAL CHALLENGE to ${turn.speakerName}: Falsify and challenge this specific proposition: "${turn.text.slice(0, 180)}..."`;
    this.turnSequencer.dispatchTurn(targetIdx, directive);
  }

  handleCrownInsight(turnId) {
    const turn = this.symposiumState.transcript.find(t => t.id === turnId);
    if (!turn) return;
    const summary = `${turn.speakerName}: "${turn.text.slice(0, 150)}..."`;
    this.symposiumState.addLedgerItem('agreements', summary);
    this.ledgerView.render(this.symposiumState.ledger);
  }

  handleSynthesize() {
    const synthIdx = this.symposiumState.seats.findIndex(s => s.personaKey === 'synthesizer' && !s.isMuted);
    const targetIdx = synthIdx >= 0 ? synthIdx : 0;
    const directive = 'MILESTONE CONSENSUS MANDATE: Reconcile all current positions and synthesize a master framework.';
    this.turnSequencer.dispatchTurn(targetIdx, directive);
  }

  // ── Logic Sanctum & Persona Customizer Engine ──

  openSanctum(tab = 'personas', seatIndex = null) {
    this.sanctumDrawer?.classList.add('open');
    this.sanctumBackdrop?.classList.add('open');

    this.updateSanctumSeatSelector();
    this.renderPresetsDropdown();
    this.renderPresetsLibrary();

    if (typeof seatIndex === 'number' && this.symposiumState.seats[seatIndex]) {
      this.activeSanctumSeatIndex = seatIndex;
      if (this.sanctumSeatPicker) this.sanctumSeatPicker.value = seatIndex;
    }

    this.loadSeatIntoEditor(this.activeSanctumSeatIndex);
    this.loadProtocolsIntoEditor();
    this.loadUserRoleIntoEditor();

    this.switchSanctumTab(tab);
  }

  closeSanctum() {
    this.sanctumDrawer?.classList.remove('open');
    this.sanctumBackdrop?.classList.remove('open');
  }

  switchSanctumTab(tabKey) {
    this.currentSanctumTab = tabKey;
    this.sanctumTabBtns?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    if (this.sanctumSections.personas) this.sanctumSections.personas.style.display = tabKey === 'personas' ? 'flex' : 'none';
    if (this.sanctumSections.presets) this.sanctumSections.presets.style.display = tabKey === 'presets' ? 'flex' : 'none';
    if (this.sanctumSections.protocols) this.sanctumSections.protocols.style.display = tabKey === 'protocols' ? 'flex' : 'none';
    if (this.sanctumSections.userRole) this.sanctumSections.userRole.style.display = tabKey === 'user-role' ? 'flex' : 'none';
  }

  renderPresetsDropdown() {
    if (!this.sanctumPresetPicker) return;
    const allPersonas = this.symposiumState.getAllPersonas();
    this.sanctumPresetPicker.innerHTML = '<option value="">-- انتخاب از الگوهای آماده (Preset Templates) --</option>';

    Object.keys(allPersonas).forEach(key => {
      const p = allPersonas[key];
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${p.badge || '🎭'} ${p.title} ${p.isCustom ? '★ (سفارشی)' : ''}`;
      this.sanctumPresetPicker.appendChild(opt);
    });
  }

  renderPresetsLibrary() {
    if (!this.presetsListContainer) return;
    const allPersonas = this.symposiumState.getAllPersonas();
    this.presetsListContainer.innerHTML = '';

    Object.keys(allPersonas).forEach(key => {
      const p = allPersonas[key];
      const card = document.createElement('div');
      card.className = `persona-preset-card ${p.isCustom ? 'is-custom' : ''}`;
      card.innerHTML = `
        <div class="preset-card-top">
          <div class="preset-identity">
            <span class="preset-badge">${p.badge || '🎭'}</span>
            <span class="preset-title">${this.escapeHtml(p.title)}</span>
          </div>
          <div class="preset-card-actions">
            <button type="button" class="btn-preset-use" data-preset-key="${key}" title="اعمال این الگو برای مدل انتخاب‌شده">
              استفاده ⚡
            </button>
            ${p.isCustom ? `
              <button type="button" class="btn-preset-del" data-preset-key="${key}" title="حذف این الگوی سفارشی">✕</button>
            ` : ''}
          </div>
        </div>
        <div class="preset-directive-preview" dir="auto">
          ${this.escapeHtml(p.directive || '')}
        </div>
      `;

      card.querySelector('.btn-preset-use')?.addEventListener('click', () => {
        this.applyPresetToActiveEditor(key);
        this.switchSanctumTab('personas');
      });

      card.querySelector('.btn-preset-del')?.addEventListener('click', () => {
        if (confirm(`آیا از حذف الگوی "${p.title}" اطمینان دارید؟`)) {
          this.symposiumState.deleteCustomPersona(key);
          this.renderPresetsDropdown();
          this.renderPresetsLibrary();
          this.showToast('الگوی سفارشی حذف شد ✓');
        }
      });

      this.presetsListContainer.appendChild(card);
    });
  }

  applyPresetToActiveEditor(presetKey) {
    const p = this.symposiumState.getPersona(presetKey);
    if (!p) return;

    if (this.sanctumSeatTitleInput) this.sanctumSeatTitleInput.value = p.title || '';
    if (this.sanctumSeatBadgeInput) this.sanctumSeatBadgeInput.value = p.badge || '';
    if (this.sanctumSeatDirectiveTextarea) {
      this.sanctumSeatDirectiveTextarea.value = p.directive || '';
      this.syncTextareaDirection(this.sanctumSeatDirectiveTextarea);
    }
    if (this.sanctumPresetPicker) this.sanctumPresetPicker.value = presetKey;
    this.showToast(`الگوی "${p.title}" در ویرایشگر بارگذاری شد ✓`);
  }

  loadSeatIntoEditor(seatIndex) {
    this.activeSanctumSeatIndex = seatIndex;
    const seat = this.symposiumState.seats[seatIndex];
    if (!seat) return;

    if (this.sanctumSeatTitleInput) this.sanctumSeatTitleInput.value = seat.personaTitle || '';
    if (this.sanctumSeatBadgeInput) this.sanctumSeatBadgeInput.value = seat.personaBadge || '';
    if (this.sanctumSeatDirectiveTextarea) {
      this.sanctumSeatDirectiveTextarea.value = seat.personaDirective || '';
      this.syncTextareaDirection(this.sanctumSeatDirectiveTextarea);
    }
    if (this.sanctumSeatWeightInput) this.sanctumSeatWeightInput.value = seat.weight ?? 100;
    if (this.sanctumSeatMuteCheck) this.sanctumSeatMuteCheck.checked = Boolean(seat.isMuted);
    if (this.sanctumSeatCustomTemplateTextarea) this.sanctumSeatCustomTemplateTextarea.value = seat.customPromptTemplate || '';
    if (this.sanctumGlobalDirectiveTextarea) {
      this.sanctumGlobalDirectiveTextarea.value = this.symposiumState.config.globalDirective || '';
      this.syncTextareaDirection(this.sanctumGlobalDirectiveTextarea);
    }

    if (this.sanctumPresetPicker) {
      this.sanctumPresetPicker.value = seat.personaKey || '';
    }
  }

  saveActiveSeatFromEditor() {
    const seatIndex = this.activeSanctumSeatIndex;
    const seat = this.symposiumState.seats[seatIndex];
    if (!seat) return;

    const title = this.sanctumSeatTitleInput?.value?.trim() || seat.personaTitle || 'AI Chair';
    const badge = this.sanctumSeatBadgeInput?.value?.trim() || seat.personaBadge || '🎭 Custom';
    const directive = this.sanctumSeatDirectiveTextarea?.value?.trim() || '';
    const weight = parseInt(this.sanctumSeatWeightInput?.value, 10) || 100;
    const isMuted = Boolean(this.sanctumSeatMuteCheck?.checked);
    const customPromptTemplate = this.sanctumSeatCustomTemplateTextarea?.value?.trim() || '';

    // Save global directive if modified
    if (this.sanctumGlobalDirectiveTextarea) {
      this.symposiumState.config.globalDirective = this.sanctumGlobalDirectiveTextarea.value.trim();
    }

    this.symposiumState.updateSeat(seatIndex, {
      personaTitle: title,
      personaBadge: badge,
      personaDirective: directive,
      weight,
      isMuted,
      customPromptTemplate,
      isCustomized: true
    });

    this.symposiumState.persistConfig();
    this.dais.render(this.symposiumState.seats, this.symposiumState.activeSpeakerIndex, this.symposiumState.sessionStatus === 'WAITING_FOR_USER');
    this.updateBatonSelector();
    this.updateSanctumSeatSelector();
    this.showToast(`تنظیمات و پرومپت "${seat.name}" با موفقیت ذخیره شد ✓`);
  }

  applyActiveSeatToAllModels() {
    const seatIndex = this.activeSanctumSeatIndex;
    const seat = this.symposiumState.seats[seatIndex];
    if (!seat) return;

    const title = this.sanctumSeatTitleInput?.value?.trim() || seat.personaTitle;
    const badge = this.sanctumSeatBadgeInput?.value?.trim() || seat.personaBadge;
    const directive = this.sanctumSeatDirectiveTextarea?.value?.trim() || seat.personaDirective;
    const customPromptTemplate = this.sanctumSeatCustomTemplateTextarea?.value?.trim() || '';

    if (!confirm('آیا مایلید این شخصیت و دستورات سیستمی به تمام مدل‌های هوش مصنوعی در میزگرد اعمال شود؟')) return;

    this.symposiumState.seats.forEach((s, idx) => {
      if (!s.isUser) {
        this.symposiumState.updateSeat(idx, {
          personaTitle: title,
          personaBadge: badge,
          personaDirective: directive,
          customPromptTemplate,
          isCustomized: true
        });
      }
    });

    this.symposiumState.persistConfig();
    this.dais.render(this.symposiumState.seats, this.symposiumState.activeSpeakerIndex, this.symposiumState.sessionStatus === 'WAITING_FOR_USER');
    this.updateBatonSelector();
    this.showToast('شخصیت و دستورات به تمام مدل‌های میزگرد اعمال شد ✓');
  }

  saveActiveSeatAsNewPreset() {
    const title = this.sanctumSeatTitleInput?.value?.trim();
    const badge = this.sanctumSeatBadgeInput?.value?.trim() || '🎭 Custom';
    const directive = this.sanctumSeatDirectiveTextarea?.value?.trim();

    if (!title || !directive) {
      alert('لطفاً عنوان شخصیت و متن پرومپت سیستمی را پر کنید.');
      return;
    }

    const newPreset = this.symposiumState.saveCustomPersona({
      title,
      badge,
      directive
    });

    if (newPreset) {
      this.renderPresetsDropdown();
      this.renderPresetsLibrary();
      if (this.sanctumPresetPicker) this.sanctumPresetPicker.value = newPreset.id;
      this.showToast(`الگوی آماده "${newPreset.title}" با موفقیت ایجاد و ذخیره شد ✓`);
    }
  }

  promptCreateNewPreset() {
    const title = prompt('عنوان الگوی جدید (مثلاً: "منتقد ارشد امنیتی"):');
    if (!title) return;
    const badge = prompt('آیکون یا نشان کوتاه (مثلاً: "🛡️ Security"):') || '🎭 Template';
    const directive = prompt('دستورالعمل سیستمی و پرومپت الگو:') || '';

    const newPreset = this.symposiumState.saveCustomPersona({
      title,
      badge,
      directive
    });

    if (newPreset) {
      this.renderPresetsDropdown();
      this.renderPresetsLibrary();
      this.showToast(`الگوی "${newPreset.title}" اضافه شد ✓`);
    }
  }

  loadProtocolsIntoEditor() {
    if (this.topologySelect) this.topologySelect.value = this.symposiumState.debateMode;
    if (this.maxRoundsInput) this.maxRoundsInput.value = this.symposiumState.config.maxRounds;
    if (this.distillSelect) this.distillSelect.value = this.symposiumState.config.contextDistillation;
    if (this.templateTextarea) this.templateTextarea.value = this.symposiumState.config.promptTemplate;
  }

  saveProtocolsConfig() {
    if (this.topologySelect) this.symposiumState.debateMode = this.topologySelect.value;
    if (this.maxRoundsInput) this.symposiumState.config.maxRounds = parseInt(this.maxRoundsInput.value, 10) || 10;
    if (this.distillSelect) this.symposiumState.config.contextDistillation = this.distillSelect.value;
    if (this.templateTextarea) this.symposiumState.config.promptTemplate = this.templateTextarea.value.trim() || DEFAULT_DIALECTIC_TEMPLATE;

    this.symposiumState.persistConfig();
    this.updateHeaderStats();
    this.showToast('تنظیمات پروتکل و نوبت‌دهی ذخیره شد ✓');
  }

  loadUserRoleIntoEditor() {
    const u = this.symposiumState.userParticipant;
    if (this.sanctumUserSeatedCheck) this.sanctumUserSeatedCheck.checked = Boolean(u.isSeated);
    if (this.sanctumUserNameInput) this.sanctumUserNameInput.value = u.name || 'Human Maestro';
    if (this.sanctumUserWeightInput) this.sanctumUserWeightInput.value = u.weight || 120;
    if (this.sanctumUserDirectiveTextarea) {
      this.sanctumUserDirectiveTextarea.value = u.personaDirective || '';
      this.syncTextareaDirection(this.sanctumUserDirectiveTextarea);
    }

    if (this.sanctumUserPersonaSelect) {
      this.sanctumUserPersonaSelect.innerHTML = '';
      const allPersonas = this.symposiumState.getAllPersonas();
      Object.keys(allPersonas).forEach(key => {
        const p = allPersonas[key];
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = `${p.badge || '👑'} ${p.title}`;
        if (key === u.personaKey) opt.selected = true;
        this.sanctumUserPersonaSelect.appendChild(opt);
      });
    }
  }

  saveUserRoleConfig() {
    const isSeated = Boolean(this.sanctumUserSeatedCheck?.checked);
    const name = this.sanctumUserNameInput?.value?.trim() || 'Human Maestro';
    const personaKey = this.sanctumUserPersonaSelect?.value || 'innovator';
    const weight = parseInt(this.sanctumUserWeightInput?.value, 10) || 120;
    const directive = this.sanctumUserDirectiveTextarea?.value?.trim();

    this.symposiumState.setUserParticipation(isSeated, {
      name,
      personaKey,
      weight
    });

    if (directive) {
      this.symposiumState.userParticipant.personaDirective = directive;
      const userSeat = this.symposiumState.seats.find(s => s.isUser);
      if (userSeat) {
        userSeat.personaDirective = directive;
      }
    }

    this.symposiumState.persistConfig();
    this.syncSeats();
    this.renderAll();
    this.showToast('جایگاه و شخصیت کاربر به‌روزرسانی شد ✓');
  }

  syncTextareaDirection(el) {
    if (!el) return;
    const dir = this.detectTextDirection(el.value || '');
    el.setAttribute('dir', dir);
    el.classList.toggle('is-rtl', dir === 'rtl');
  }

  showToast(msg) {
    let toast = document.getElementById('symposium-live-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'symposium-live-toast';
      toast.className = 'symposium-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  }

  exportMarkdown() {
    const { userCorePrompt, debateMode, roundIndex, transcript, ledger } = this.symposiumState;
    let md = `# 🏛️ The Silk Symposium Briefing & Consensus Dossier\n`;
    md += `**Inquiry:** ${userCorePrompt || 'Multi-Model Cognitive Dialectic'}\n`;
    md += `**Topology:** ${debateMode}\n`;
    md += `**Rounds Completed:** ${roundIndex}\n`;
    md += `**Timestamp:** ${new Date().toLocaleString()}\n\n`;

    md += `---\n\n## 💎 Milestone Consensus Ledger\n\n`;
    md += `### Confirmed Agreements (اجماع‌های تأییدشده)\n`;
    md += ledger.agreements.length ? ledger.agreements.map(a => `- ${a}`).join('\n') : '- None formally confirmed.\n';

    md += `\n### Critical Divergences (نقاط تمایز و چالش)\n`;
    md += ledger.divergences.length ? ledger.divergences.map(d => `- ${d}`).join('\n') : '- No active disputes logged.\n';

    md += `\n---\n\n## 📜 Chronological Deliberation Transcript\n\n`;
    transcript.forEach(t => {
      md += `### ${t.speakerName} [${t.role.toUpperCase()} • Round ${t.round || 1} • ${t.timestamp}]\n\n${t.text}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silk_symposium_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
