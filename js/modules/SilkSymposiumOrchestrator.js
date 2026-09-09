/**
 * OmniAI Hub — The Silk Symposium Orchestrator (تالار هم‌اندیشی و میزگرد زنده انسان و هوش مصنوعی‌ها)
 * Lean Master Coordinator & Event Gateway (ChatGPT UI/UX Paradigm × Contextual Inline Inspector)
 * Wires together SymposiumState, TurnSequencer, SymposiumDais, SymposiumTranscript, and ConsensusLedger.
 */

import {
  SymposiumState,
  COGNITIVE_PERSONAS,
  DEFAULT_DIALECTIC_TEMPLATE,
  DIALECTIC_PROMPT_TEMPLATES,
  GLOBAL_DIRECTIVE_PRESETS,
  USER_ROLE_PRESETS,
  SYMPOSIUM_SCENARIOS
} from './symposium/SymposiumState.js';
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

    // Core State & Sequencer Initialization
    this.symposiumState = new SymposiumState();
    this.turnSequencer = new TurnSequencer(this.symposiumState, {
      onSeatDispatched: (data) => this.handleSeatDispatched(data),
      onUserTurnPrompted: (data) => this.handleUserTurnPrompted(data),
      onTurnFinished: (data) => this.handleTurnFinished(data),
      onRoundAdvanced: () => this.updateHeaderStats(),
      onSessionPaused: () => this.updateHeaderStats(),
      onSessionResumed: () => this.updateHeaderStats(),
      onSessionCompleted: () => this.handleSessionCompleted(),
      onSessionWaitingForMaestro: () => this.updateHeaderStats()
    });

    this.currentSanctumZone = 'scenarios';
    this.toastTimer = null;

    this.initElements();
    this.initSubModules();
    this.setupInspectorDebounce();
    this.bindEvents();
  }

  initElements() {
    this.overlayEl = document.getElementById('silk-symposium-chamber');
    this.btnClose = document.getElementById('btn-close-symposium-chamber');
    this.btnToggleDais = document.getElementById('btn-symposium-toggle-dais');
    this.btnToggleRail = document.getElementById('btn-symposium-toggle-rail');
    this.btnToggleLedger = document.getElementById('btn-symposium-toggle-ledger');
    this.btnToggleUserSeat = document.getElementById('btn-symposium-toggle-user-seat');
    this.btnOpenSanctum = document.getElementById('btn-symposium-open-sanctum');
    this.btnExportBriefing = document.getElementById('btn-symposium-export-briefing');
    this.btnSwitchScenarioPill = document.getElementById('btn-header-switch-scenario');
    this.activeScenarioTitle = document.getElementById('header-active-scenario-title');
    this.topologyBadge = document.getElementById('symposium-topology-badge');
    this.roundCounter = document.getElementById('symposium-round-counter');

    // Centered ChatGPT Floating Pill Composer Elements
    this.composerContainer = document.querySelector('.symposium-composer-container');
    this.composerBox = document.querySelector('.symposium-chatgpt-composer');
    this.composerSpeakerHint = document.getElementById('composer-speaker-hint');
    this.composerSpeakerName = document.getElementById('composer-speaker-name');
    this.inputPrompt = document.getElementById('symposium-prompt-input');
    this.btnSendMaestro = document.getElementById('btn-symposium-send-maestro');
    this.btnNextTurn = document.getElementById('btn-symposium-next-turn');
    this.btnAutoplayToggle = document.getElementById('btn-symposium-autoplay-toggle');

    // Left Rail Container
    this.leftRail = document.getElementById('symposium-dais-container');

    // ── Floating Contextual Inline Seat Inspector ──
    this.seatInspector = document.getElementById('seat-inline-inspector');
    this.inspectorAvatar = document.getElementById('inspector-model-avatar');
    this.inspectorModelName = document.getElementById('inspector-model-name');
    this.inspectorPersonaSubtitle = document.getElementById('inspector-persona-subtitle');
    this.inspectorSaveBadge = document.getElementById('inspector-autosave-badge');
    this.btnCloseInspector = document.getElementById('btn-close-seat-inspector');
    this.inspectorChipsCarousel = document.getElementById('inspector-chips-carousel');
    this.inspectorDirective = document.getElementById('inspector-directive-input');
    this.inspectorWeightSlider = document.getElementById('inspector-weight-slider');
    this.inspectorWeightDisplay = document.getElementById('inspector-weight-display');
    this.btnInspectorApplyAll = document.getElementById('btn-inspector-apply-all');
    this.btnInspectorSavePreset = document.getElementById('btn-inspector-save-preset');
    this.btnInspectorMute = document.getElementById('btn-inspector-mute');

    // ── Re-engineered 4-Zone Logic Sanctum ──
    this.sanctumDrawer = document.getElementById('logic-sanctum-drawer');
    this.sanctumBackdrop = document.getElementById('sanctum-backdrop');
    this.btnCloseSanctum = document.getElementById('btn-close-sanctum');
    this.sanctumZoneTabs = document.querySelectorAll('.sanctum-zone-tab');
    this.sanctumPanels = {
      scenarios: document.getElementById('sanctum-zone-scenarios'),
      personas: document.getElementById('sanctum-zone-personas'),
      daisFloor: document.getElementById('sanctum-zone-dais-floor'),
      engine: document.getElementById('sanctum-zone-engine')
    };

    // Zone 1: Scenarios Grid & Builder Form
    this.scenariosGrid = document.getElementById('sanctum-scenarios-grid');
    this.btnShowCreateScenario = document.getElementById('btn-show-create-scenario');
    this.scenarioFormCard = document.getElementById('sanctum-scenario-form-card');
    this.scenarioFormHeading = document.getElementById('scenario-form-heading');
    this.scenarioFormId = document.getElementById('scenario-form-id');
    this.scenarioFormTitle = document.getElementById('scenario-form-title');
    this.scenarioFormDesc = document.getElementById('scenario-form-desc');
    this.scenarioFormBadge = document.getElementById('scenario-form-badge');
    this.scenarioFormMode = document.getElementById('scenario-form-mode');
    this.scenarioFormColor = document.getElementById('scenario-form-color');
    this.scenarioFormPrompt = document.getElementById('scenario-form-prompt');
    this.btnSaveScenarioForm = document.getElementById('btn-save-scenario-form');
    this.btnCancelScenarioForm = document.getElementById('btn-cancel-scenario-form');
    this.btnDismissScenarioForm = document.getElementById('btn-dismiss-scenario-form');

    // Zone 2: Personas Library & Builder Form
    this.personasGrid = document.getElementById('sanctum-personas-grid');
    this.btnShowCreatePersona = document.getElementById('btn-show-create-persona');
    this.personaFormCard = document.getElementById('sanctum-persona-form-card');
    this.personaFormHeading = document.getElementById('persona-form-heading');
    this.personaFormId = document.getElementById('persona-form-id');
    this.personaFormTitle = document.getElementById('persona-form-title');
    this.personaFormBadge = document.getElementById('persona-form-badge');
    this.personaFormColor = document.getElementById('persona-form-color');
    this.personaFormDirective = document.getElementById('persona-form-directive');
    this.btnSavePersonaForm = document.getElementById('btn-save-persona-form');
    this.btnCancelPersonaForm = document.getElementById('btn-cancel-persona-form');
    this.btnDismissPersonaForm = document.getElementById('btn-dismiss-persona-form');

    // Zone 3: Dais Floor Plan & User Maestro Seat
    this.daisFloorCircle = document.getElementById('dais-interactive-floor-circle');
    this.sanctumUserSeatedCheck = document.getElementById('sanctum-user-seated-check');
    this.sanctumUserNameInput = document.getElementById('sanctum-user-name');
    this.sanctumUserRolePresetPicker = document.getElementById('sanctum-user-role-preset-select');
    this.sanctumUserPersonaSelect = document.getElementById('sanctum-user-persona-select');
    this.sanctumUserWeightInput = document.getElementById('sanctum-user-weight');
    this.sanctumUserDirectiveTextarea = document.getElementById('sanctum-user-directive');
    this.btnSaveUserRole = document.getElementById('btn-save-user-role');

    // Zone 4: Dialectic Engine & Templates
    this.topologySelect = document.getElementById('sanctum-topology-select');
    this.promptTemplatePresetPicker = document.getElementById('sanctum-prompt-template-preset-select');
    this.maxRoundsInput = document.getElementById('sanctum-max-rounds');
    this.distillSelect = document.getElementById('sanctum-distill-select');
    this.templateTextarea = document.getElementById('sanctum-template-textarea');
    this.macroChipsContainer = document.getElementById('sanctum-macro-chips');
    this.sanctumGlobalDirectivePresetPicker = document.getElementById('sanctum-global-directive-preset-select');
    this.sanctumGlobalDirectiveTextarea = document.getElementById('sanctum-global-directive');
    this.btnSaveProtocols = document.getElementById('btn-save-protocols');
  }

  initSubModules() {
    const daisContainer = document.getElementById('symposium-dais-container');
    const daisRibbon = document.getElementById('symposium-dais-ribbon');
    this.dais = new SymposiumDais(daisContainer, daisRibbon, {
      onPassBaton: (idx) => this.turnSequencer.passBaton(idx),
      onOpenInspector: (idx, rect) => this.openSeatInspector(idx, rect),
      onConfigureSeat: (idx) => this.openSeatInspector(idx),
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

  setupInspectorDebounce() {
    this.inspectorDebounceTimer = null;
    this.activeInspectorSeatIndex = null;
  }

  bindEvents() {
    this.btnClose?.addEventListener('click', () => this.close());

    // Left Rail collapse/expand toggles
    this.btnToggleRail?.addEventListener('click', () => {
      this.leftRail?.classList.toggle('expanded');
    });

    this.btnToggleDais?.addEventListener('click', () => {
      const isCollapsed = this.leftRail?.classList.toggle('collapsed');
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

    this.btnOpenSanctum?.addEventListener('click', () => this.openSanctum('scenarios'));
    this.btnSwitchScenarioPill?.addEventListener('click', () => this.openSanctum('scenarios'));
    this.btnCloseSanctum?.addEventListener('click', () => this.closeSanctum());
    this.sanctumBackdrop?.addEventListener('click', () => this.closeSanctum());

    // 4-Zone switcher in Sanctum
    this.sanctumZoneTabs?.forEach(btn => {
      btn.addEventListener('click', () => {
        const zone = btn.dataset.zone;
        this.switchSanctumZone(zone);
      });
    });

    // Inline Seat Inspector listeners
    this.btnCloseInspector?.addEventListener('click', () => this.closeSeatInspector());

    // Auto-save on typing in inspector directive
    this.inspectorDirective?.addEventListener('input', () => {
      this.syncTextareaDirection(this.inspectorDirective);
      this.triggerInspectorAutoSave();
    });

    // Auto-save on weight slider change
    this.inspectorWeightSlider?.addEventListener('input', () => {
      if (this.inspectorWeightDisplay) {
        this.inspectorWeightDisplay.textContent = `${this.inspectorWeightSlider.value}%`;
      }
      this.triggerInspectorAutoSave();
    });

    // Mute button in inspector
    this.btnInspectorMute?.addEventListener('click', () => {
      if (this.activeInspectorSeatIndex !== null) {
        this.handleToggleSeatMute(this.activeInspectorSeatIndex);
        this.updateInspectorMuteButton();
      }
    });

    // Apply to all models from inspector
    this.btnInspectorApplyAll?.addEventListener('click', () => {
      if (this.activeInspectorSeatIndex !== null) {
        this.applySeatToAll(this.activeInspectorSeatIndex);
      }
    });

    // Save as preset from inspector
    this.btnInspectorSavePreset?.addEventListener('click', () => {
      if (this.activeInspectorSeatIndex !== null) {
        this.saveCurrentInspectorAsPreset();
      }
    });

    // Dismiss inspector on click outside
    document.addEventListener('pointerdown', (e) => {
      if (!this.seatInspector?.classList.contains('open')) return;
      if (!e.target.closest('#seat-inline-inspector') && !e.target.closest('.symposium-seat-card')) {
        this.closeSeatInspector();
      }
    });

    // Auto-resizing and text-direction detection on inputPrompt
    this.inputPrompt?.addEventListener('input', () => {
      this.syncTextareaDirection(this.inputPrompt);
      this.inputPrompt.style.height = 'auto';
      this.inputPrompt.style.height = Math.min(this.inputPrompt.scrollHeight, 160) + 'px';
    });

    // Auto text direction detection on custom directive textareas
    this.sanctumGlobalDirectiveTextarea?.addEventListener('input', () => {
      this.syncTextareaDirection(this.sanctumGlobalDirectiveTextarea);
    });
    this.sanctumUserDirectiveTextarea?.addEventListener('input', () => {
      this.syncTextareaDirection(this.sanctumUserDirectiveTextarea);
    });

    // Preset choosers for global directive, user roles, and prompt templates
    this.sanctumGlobalDirectivePresetPicker?.addEventListener('change', () => {
      const key = this.sanctumGlobalDirectivePresetPicker.value;
      if (key && GLOBAL_DIRECTIVE_PRESETS[key]) {
        this.sanctumGlobalDirectiveTextarea.value = GLOBAL_DIRECTIVE_PRESETS[key].directive;
        this.syncTextareaDirection(this.sanctumGlobalDirectiveTextarea);
      }
    });

    this.promptTemplatePresetPicker?.addEventListener('change', () => {
      const key = this.promptTemplatePresetPicker.value;
      if (key && DIALECTIC_PROMPT_TEMPLATES[key]) {
        this.templateTextarea.value = DIALECTIC_PROMPT_TEMPLATES[key].template;
      }
    });

    this.sanctumUserRolePresetPicker?.addEventListener('change', () => {
      const key = this.sanctumUserRolePresetPicker.value;
      if (key && USER_ROLE_PRESETS[key]) {
        const p = USER_ROLE_PRESETS[key];
        if (this.sanctumUserDirectiveTextarea) {
          this.sanctumUserDirectiveTextarea.value = p.directive;
          this.syncTextareaDirection(this.sanctumUserDirectiveTextarea);
        }
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

    // Scenario Builder Form Toggles & Actions
    this.btnShowCreateScenario?.addEventListener('click', () => {
      this.openScenarioForm();
    });
    this.btnCancelScenarioForm?.addEventListener('click', () => {
      this.closeScenarioForm();
    });
    this.btnDismissScenarioForm?.addEventListener('click', () => {
      this.closeScenarioForm();
    });
    this.btnSaveScenarioForm?.addEventListener('click', () => {
      this.handleSaveScenarioForm();
    });

    // Persona Builder Form Toggles & Actions
    this.btnShowCreatePersona?.addEventListener('click', () => {
      this.openPersonaForm();
    });
    this.btnCancelPersonaForm?.addEventListener('click', () => {
      this.closePersonaForm();
    });
    this.btnDismissPersonaForm?.addEventListener('click', () => {
      this.closePersonaForm();
    });
    this.btnSavePersonaForm?.addEventListener('click', () => {
      this.handleSavePersonaForm();
    });

    // Send and Next Turn Baton Handlers
    this.btnSendMaestro?.addEventListener('click', () => this.handleUserInputSubmit());
    this.btnNextTurn?.addEventListener('click', () => {
      this.turnSequencer.advanceNext();
    });

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
    this.activeInspectorSeatIndex = null;
    this.syncSeats();
    this.renderAll();
    this.renderScenariosGrid();
    this.renderPersonasGrid();
    this.renderDaisFloorPlan();
    this.renderPromptTemplatesDropdown();
    this.renderGlobalDirectivesDropdown();
    this.renderUserRolesDropdown();
    this.updateScenarioHeaderBadge();
    requestAnimationFrame(() => this.inputPrompt?.focus());
    globalBus.emit('SILK_SYMPOSIUM_OPENED');
  }

  close() {
    this.isOpen = false;
    this.turnSequencer.pause();
    this.closeSeatInspector();
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
    this.updateUserSeatButtonUI();
    this.updateComposerSpeakerHint();
  }

  handleToggleSeatMute(seatIndex) {
    const seat = this.symposiumState.seats[seatIndex];
    if (!seat) return;
    const nextMuted = !seat.isMuted;
    this.symposiumState.setSeatMuted(seatIndex, nextMuted);
    this.dais.render(
      this.symposiumState.seats,
      this.symposiumState.activeSpeakerIndex,
      this.symposiumState.sessionStatus === 'WAITING_FOR_USER',
      this.symposiumState.recommendedNextSpeakerIndex,
      this.symposiumState.sessionStatus === 'WAITING_FOR_MAESTRO'
    );
    this.showToast(`${seat.name} ${nextMuted ? 'بی‌صدا شد 🔇' : 'فعال شد 🔊'}`);
  }

  renderAll() {
    const waitingForUser = this.symposiumState.sessionStatus === 'WAITING_FOR_USER';
    const waitingForMaestro = this.symposiumState.sessionStatus === 'WAITING_FOR_MAESTRO';

    this.dais.render(
      this.symposiumState.seats,
      this.symposiumState.activeSpeakerIndex,
      waitingForUser,
      this.symposiumState.recommendedNextSpeakerIndex,
      waitingForMaestro
    );
    this.transcriptView.render(this.symposiumState.transcript);
    this.ledgerView.render(this.symposiumState.ledger);
    this.updateHeaderStats();
    this.updateComposerSpeakerHint();
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
      this.btnAutoplayToggle.textContent = isActive ? '⏸️ توقف' : '▶️ خودکار';
      this.btnAutoplayToggle.classList.toggle('active', isActive);
    }
    this.updateScenarioHeaderBadge();
    this.updateComposerSpeakerHint();
  }

  updateScenarioHeaderBadge() {
    if (!this.activeScenarioTitle) return;
    const scenarios = this.symposiumState.getScenarios();
    const current = scenarios[this.symposiumState.activeScenarioKey];
    this.activeScenarioTitle.textContent = current ? current.title.split(' و ')[0].trim() : 'سناریوهای میزگرد';
  }

  updateComposerSpeakerHint() {
    if (!this.composerSpeakerName) return;

    const { sessionStatus, seats, activeSpeakerIndex, recommendedNextSpeakerIndex, isSpeakerStreaming } = this.symposiumState;
    const activeSeat = seats[activeSpeakerIndex];
    const recSeat = seats[recommendedNextSpeakerIndex];

    if (sessionStatus === 'WAITING_FOR_USER') {
      this.composerSpeakerName.textContent = 'نوبت شما در شورا فرا رسیده است (Your Turn) 👑';
      this.composerBox?.classList.add('user-turn-active');
    } else if (isSpeakerStreaming && activeSeat) {
      this.composerSpeakerName.textContent = `در حال تفکر و پاسخ: ${activeSeat.name} (${activeSeat.personaBadge || ''}) ⚡`;
      this.composerBox?.classList.remove('user-turn-active');
    } else if (sessionStatus === 'WAITING_FOR_MAESTRO' && recSeat) {
      this.composerSpeakerName.textContent = `نوبت بعد با عصا: ${recSeat.name} (${recSeat.personaBadge || ''}) 🪄`;
      this.composerBox?.classList.remove('user-turn-active');
    } else if (activeSeat) {
      this.composerSpeakerName.textContent = `سخنران بعدی: ${activeSeat.name} (${activeSeat.personaBadge || ''})`;
      this.composerBox?.classList.remove('user-turn-active');
    } else {
      this.composerSpeakerName.textContent = 'Auto Conductor';
      this.composerBox?.classList.remove('user-turn-active');
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
      this.inputPrompt.style.height = 'auto';
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
    this.inputPrompt.style.height = 'auto';
    this.renderAll();

    if (this.symposiumState.sessionStatus !== 'ACTIVE') {
      const recIdx = this.symposiumState.recommendedNextSpeakerIndex || 0;
      this.turnSequencer.start(text, recIdx);
    } else {
      this.turnSequencer.advanceNext();
    }
  }

  handleUserTurnPrompted({ seat, seatIndex }) {
    this.dais.render(this.symposiumState.seats, seatIndex, true);
    this.composerBox?.classList.add('user-turn-active');
    if (this.inputPrompt) {
      this.inputPrompt.placeholder = `🌟 Your turn to address the Dais as ${seat.personaTitle}... (⌘↵ to speak)`;
      this.inputPrompt.focus();
    }
    this.updateComposerSpeakerHint();
  }

  clearUserTurnHighlight() {
    this.composerBox?.classList.remove('user-turn-active');
    if (this.inputPrompt) {
      this.inputPrompt.placeholder = 'Message the symposium or pass the baton... (⌘↵ to send)';
    }
  }

  handleSeatDispatched({ seat, seatIndex, immediateContext }) {
    this.clearUserTurnHighlight();
    this.dais.highlightActiveSeat(seatIndex, false);
    this.updateComposerSpeakerHint();

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

  // ── 1. Contextual Inline Seat Inspector Engine (Zero Context-Switch) ──

  openSeatInspector(seatIndex, anchorRect = null) {
    const seat = this.symposiumState.seats[seatIndex];
    if (!seat || !this.seatInspector) return;

    this.activeInspectorSeatIndex = seatIndex;

    // Anchor positioning immediately adjacent to left rail seat pod
    if (anchorRect) {
      const top = Math.max(56, Math.min(anchorRect.top - 20, window.innerHeight - 380));
      this.seatInspector.style.top = `${top}px`;
      this.seatInspector.style.left = '76px';
    } else {
      this.seatInspector.style.top = '70px';
      this.seatInspector.style.left = '76px';
    }

    // Set model identity & color styling
    this.seatInspector.style.setProperty('--inspector-color', seat.color || '#c084fc');
    if (this.inspectorAvatar) {
      this.inspectorAvatar.textContent = seat.personaBadge?.slice(0, 2) || '🤖';
    }
    if (this.inspectorModelName) {
      this.inspectorModelName.textContent = seat.name;
    }
    if (this.inspectorPersonaSubtitle) {
      this.inspectorPersonaSubtitle.textContent = seat.personaTitle || 'AI Chair';
    }

    // Directive textarea
    if (this.inspectorDirective) {
      this.inspectorDirective.value = seat.personaDirective || '';
      this.syncTextareaDirection(this.inspectorDirective);
    }

    // Weight slider
    if (this.inspectorWeightSlider) {
      this.inspectorWeightSlider.value = seat.weight ?? 100;
    }
    if (this.inspectorWeightDisplay) {
      this.inspectorWeightDisplay.textContent = `${seat.weight ?? 100}%`;
    }

    this.updateInspectorMuteButton();
    this.renderInspectorPersonaChips(seat);

    this.seatInspector.classList.add('open');
    requestAnimationFrame(() => this.inspectorDirective?.focus());
  }

  closeSeatInspector() {
    this.seatInspector?.classList.remove('open');
    this.activeInspectorSeatIndex = null;
  }

  updateInspectorMuteButton() {
    if (!this.btnInspectorMute || this.activeInspectorSeatIndex === null) return;
    const seat = this.symposiumState.seats[this.activeInspectorSeatIndex];
    if (!seat) return;
    this.btnInspectorMute.textContent = seat.isMuted ? '🔇 Unmute' : '🔊 Mute';
  }

  renderInspectorPersonaChips(seat) {
    if (!this.inspectorChipsCarousel) return;
    this.inspectorChipsCarousel.innerHTML = '';

    const allPersonas = this.symposiumState.getAllPersonas();
    const personaKeys = Object.keys(allPersonas);

    if (personaKeys.length === 0) {
      const emptySpan = document.createElement('span');
      emptySpan.style.cssText = 'font-size:10.5px;color:#94a3b8;font-style:italic;padding:4px 6px;';
      emptySpan.textContent = 'هنوز پرسونایی تعریف نشده است.';
      this.inspectorChipsCarousel.appendChild(emptySpan);
    } else {
      personaKeys.forEach(key => {
        const p = allPersonas[key];
        const isSelected = seat.personaKey === key;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `persona-quick-chip ${isSelected ? 'active' : ''}`;
        chip.dataset.personaKey = key;
        chip.innerHTML = `<span>${p.badge || '🎭'}</span> <span>${p.title.split('(')[0].trim()}</span>`;

        chip.addEventListener('click', () => {
          this.inspectorChipsCarousel.querySelectorAll('.persona-quick-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');

          if (this.inspectorPersonaSubtitle) this.inspectorPersonaSubtitle.textContent = p.title;
          if (this.inspectorDirective) {
            this.inspectorDirective.value = p.directive;
            this.syncTextareaDirection(this.inspectorDirective);
          }

          // Apply immediately to seat
          this.symposiumState.updateSeat(this.activeInspectorSeatIndex, {
            personaKey: key,
            personaTitle: p.title,
            personaBadge: p.badge,
            personaDirective: p.directive,
            isCustomized: true
          });

          this.showInspectorSavedBadge();
          this.dais.render(
            this.symposiumState.seats,
            this.symposiumState.activeSpeakerIndex,
            this.symposiumState.sessionStatus === 'WAITING_FOR_USER',
            this.symposiumState.recommendedNextSpeakerIndex,
            this.symposiumState.sessionStatus === 'WAITING_FOR_MAESTRO'
          );
          this.updateComposerSpeakerHint();
        });

        this.inspectorChipsCarousel.appendChild(chip);
      });
    }

    // Add + New Persona button inside carousel
    const addPersonaBtn = document.createElement('button');
    addPersonaBtn.type = 'button';
    addPersonaBtn.className = 'persona-quick-chip';
    addPersonaBtn.style.borderStyle = 'dashed';
    addPersonaBtn.style.color = '#fde68a';
    addPersonaBtn.innerHTML = `<span>+ ساخت پرسونا</span>`;
    addPersonaBtn.addEventListener('click', () => {
      this.closeSeatInspector();
      this.openSanctum('personas');
      this.openPersonaForm();
    });
    this.inspectorChipsCarousel.appendChild(addPersonaBtn);
  }

  triggerInspectorAutoSave() {
    if (this.activeInspectorSeatIndex === null) return;
    const seatIndex = this.activeInspectorSeatIndex;

    if (this.inspectorSaveBadge) {
      this.inspectorSaveBadge.className = 'inspector-autosave-badge saving';
      this.inspectorSaveBadge.textContent = 'در حال ذخیره...';
    }

    clearTimeout(this.inspectorDebounceTimer);
    this.inspectorDebounceTimer = setTimeout(() => {
      const directive = this.inspectorDirective?.value?.trim() || '';
      const weight = parseInt(this.inspectorWeightSlider?.value, 10) || 100;

      this.symposiumState.updateSeat(seatIndex, {
        personaDirective: directive,
        weight,
        isCustomized: true
      });
      this.symposiumState.persistConfig();

      this.showInspectorSavedBadge();
      this.dais.render(
        this.symposiumState.seats,
        this.symposiumState.activeSpeakerIndex,
        this.symposiumState.sessionStatus === 'WAITING_FOR_USER',
        this.symposiumState.recommendedNextSpeakerIndex,
        this.symposiumState.sessionStatus === 'WAITING_FOR_MAESTRO'
      );
    }, 280);
  }

  showInspectorSavedBadge() {
    if (!this.inspectorSaveBadge) return;
    this.inspectorSaveBadge.className = 'inspector-autosave-badge saved';
    this.inspectorSaveBadge.textContent = 'ذخیره شد ✓';
    setTimeout(() => {
      if (this.inspectorSaveBadge && this.inspectorSaveBadge.classList.contains('saved')) {
        this.inspectorSaveBadge.style.opacity = '0';
      }
    }, 1600);
  }

  applySeatToAll(sourceIndex) {
    const source = this.symposiumState.seats[sourceIndex];
    if (!source) return;

    if (!confirm(`آیا مایلید پرسونا و پرومپت "${source.name}" به تمام صندلی‌های هوش مصنوعی اعمال شود؟`)) return;

    this.symposiumState.applySeatPersonaToAll(sourceIndex);
    this.dais.render(
      this.symposiumState.seats,
      this.symposiumState.activeSpeakerIndex,
      this.symposiumState.sessionStatus === 'WAITING_FOR_USER',
      this.symposiumState.recommendedNextSpeakerIndex,
      this.symposiumState.sessionStatus === 'WAITING_FOR_MAESTRO'
    );
    this.showToast('پرسونا و پرومپت به تمام صندلی‌های میزگرد اعمال شد ✓');
  }

  saveCurrentInspectorAsPreset() {
    if (this.activeInspectorSeatIndex === null) return;
    const seat = this.symposiumState.seats[this.activeInspectorSeatIndex];
    if (!seat) return;

    const title = prompt('عنوان الگوی جدید:', seat.personaTitle || seat.name);
    if (!title) return;

    const newPreset = this.symposiumState.saveCustomPersona({
      title,
      badge: seat.personaBadge || '🎭 Custom',
      directive: this.inspectorDirective?.value?.trim() || seat.personaDirective
    });

    if (newPreset) {
      this.showToast(`الگوی "${newPreset.title}" در کتابخانه ذخیره شد ✓`);
      this.renderInspectorPersonaChips(seat);
    }
  }

  // ── 2. The 4-Zone Logic Sanctum Atelier Engine ──

  openSanctum(zone = 'scenarios') {
    this.sanctumDrawer?.classList.add('open');
    this.sanctumBackdrop?.classList.add('open');
    this.closeSeatInspector();

    this.renderScenariosGrid();
    this.renderPersonasGrid();
    this.renderDaisFloorPlan();
    this.loadProtocolsIntoEditor();
    this.loadUserRoleIntoEditor();

    this.switchSanctumZone(zone);
  }

  closeSanctum() {
    this.sanctumDrawer?.classList.remove('open');
    this.sanctumBackdrop?.classList.remove('open');
  }

  switchSanctumZone(zoneKey) {
    this.currentSanctumZone = zoneKey;
    this.sanctumZoneTabs?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.zone === zoneKey);
    });

    if (this.sanctumPanels.scenarios) this.sanctumPanels.scenarios.style.display = zoneKey === 'scenarios' ? 'flex' : 'none';
    if (this.sanctumPanels.personas) this.sanctumPanels.personas.style.display = zoneKey === 'personas' ? 'flex' : 'none';
    if (this.sanctumPanels.daisFloor) this.sanctumPanels.daisFloor.style.display = zoneKey === 'dais-floor' ? 'flex' : 'none';
    if (this.sanctumPanels.engine) this.sanctumPanels.engine.style.display = zoneKey === 'engine' ? 'flex' : 'none';

    if (zoneKey === 'scenarios') {
      this.renderScenariosGrid();
    } else if (zoneKey === 'personas') {
      this.renderPersonasGrid();
    }
  }

  // ── Scenario Creation & Management ──

  openScenarioForm(scenario = null) {
    if (!this.scenarioFormCard) return;
    this.scenarioFormCard.style.display = 'flex';

    if (scenario) {
      if (this.scenarioFormHeading) this.scenarioFormHeading.textContent = 'ویرایش سناریو';
      if (this.scenarioFormId) this.scenarioFormId.value = scenario.id;
      if (this.scenarioFormTitle) this.scenarioFormTitle.value = scenario.title || '';
      if (this.scenarioFormDesc) this.scenarioFormDesc.value = scenario.description || '';
      if (this.scenarioFormBadge) this.scenarioFormBadge.value = scenario.badge || '🏛️ سناریو';
      if (this.scenarioFormMode) this.scenarioFormMode.value = scenario.debateMode || 'manual';
      if (this.scenarioFormColor) this.scenarioFormColor.value = scenario.color || '#f59e0b';
      if (this.scenarioFormPrompt) this.scenarioFormPrompt.value = scenario.initialPrompt || '';
    } else {
      if (this.scenarioFormHeading) this.scenarioFormHeading.textContent = 'ساخت سناریوی جدید';
      if (this.scenarioFormId) this.scenarioFormId.value = '';
      if (this.scenarioFormTitle) this.scenarioFormTitle.value = '';
      if (this.scenarioFormDesc) this.scenarioFormDesc.value = '';
      if (this.scenarioFormBadge) this.scenarioFormBadge.value = '🏛️ سناریو';
      if (this.scenarioFormMode) this.scenarioFormMode.value = 'manual';
      if (this.scenarioFormColor) this.scenarioFormColor.value = '#f59e0b';
      if (this.scenarioFormPrompt) this.scenarioFormPrompt.value = '';
    }

    requestAnimationFrame(() => this.scenarioFormTitle?.focus());
  }

  closeScenarioForm() {
    if (this.scenarioFormCard) {
      this.scenarioFormCard.style.display = 'none';
    }
  }

  handleSaveScenarioForm() {
    const title = this.scenarioFormTitle?.value?.trim();
    if (!title) {
      alert('لطفاً عنوان سناریو را وارد نمایید.');
      this.scenarioFormTitle?.focus();
      return;
    }

    const id = this.scenarioFormId?.value || undefined;
    const desc = this.scenarioFormDesc?.value?.trim() || '';
    const badge = this.scenarioFormBadge?.value?.trim() || '🏛️ سناریو';
    const mode = this.scenarioFormMode?.value || 'manual';
    const color = this.scenarioFormColor?.value || '#f59e0b';
    const prompt = this.scenarioFormPrompt?.value?.trim() || '';

    const saved = this.symposiumState.saveCustomScenario({
      id,
      title,
      description: desc,
      badge,
      debateMode: mode,
      color,
      initialPrompt: prompt
    });

    if (saved) {
      this.closeScenarioForm();
      this.renderScenariosGrid();
      this.showToast(`سناریوی "${saved.title}" ذخیره شد ✓`);
    }
  }

  renderScenariosGrid() {
    if (!this.scenariosGrid) return;
    const scenarios = this.symposiumState.getScenarios();
    const scenarioKeys = Object.keys(scenarios);
    this.scenariosGrid.innerHTML = '';

    if (scenarioKeys.length === 0) {
      this.scenariosGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 24px 16px; text-align: center; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.15);">
          <div style="font-size: 24px; margin-bottom: 6px;">🏛️</div>
          <div style="font-size: 12px; color: #f1f5f9; font-weight: 600;">هنوز هیچ سناریویی ساخته نشده است</div>
          <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 12px;">با کلیک روی دکمه «+ ساخت سناریوی جدید»، اولین سناریوی اختصاصی خود را طراحی کنید.</p>
          <button type="button" class="btn-load-scenario" style="width: auto; padding: 6px 16px; margin: 0 auto;" id="btn-empty-create-scenario">
            <span>+ ساخت سناریوی جدید</span>
          </button>
        </div>
      `;
      document.getElementById('btn-empty-create-scenario')?.addEventListener('click', () => {
        this.openScenarioForm();
      });
      return;
    }

    scenarioKeys.forEach(key => {
      const sc = scenarios[key];
      const card = document.createElement('div');
      card.className = `symposium-scenario-card ${this.symposiumState.activeScenarioKey === key ? 'active' : ''}`;
      card.innerHTML = `
        <div class="scenario-card-top">
          <span class="scenario-badge-pill" style="background:${sc.color || '#f59e0b'}25;color:${sc.color || '#f59e0b'};border:1px solid ${sc.color || '#f59e0b'}50;">
            ${sc.badge || '🏛️'}
          </span>
          <span style="font-size:10px;color:#94a3b8;text-transform:uppercase;">${sc.debateMode || 'manual'}</span>
        </div>
        <h4 class="scenario-card-title">${this.escapeHtml(sc.title)}</h4>
        <p class="scenario-card-desc">${this.escapeHtml(sc.description || 'سناریوی اختصاصی تعریف‌شده توسط کاربر')}</p>
        
        <div style="display:flex;align-items:center;gap:6px;margin-top:auto;padding-top:4px;">
          <button type="button" class="btn-load-scenario" style="flex:1;" data-scenario-key="${key}">
            <span>اجرا و بارگذاری ⚡</span>
          </button>
          <button type="button" class="btn-utility-ghost btn-edit-scenario" title="ویرایش سناریو">✏️</button>
          <button type="button" class="btn-utility-ghost btn-del-scenario" style="color:#f87171;" title="حذف سناریو">🗑️</button>
        </div>
      `;

      card.querySelector('.btn-load-scenario')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.symposiumState.applyScenario(key);
        this.syncSeats();
        this.renderAll();
        if (sc.initialPrompt && this.inputPrompt) {
          this.inputPrompt.value = sc.initialPrompt;
        }
        this.closeSanctum();
        this.showToast(`سناریوی "${sc.title}" فعال شد ✓`);
      });

      card.querySelector('.btn-edit-scenario')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openScenarioForm(sc);
      });

      card.querySelector('.btn-del-scenario')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`آیا از حذف سناریوی "${sc.title}" اطمینان دارید؟`)) {
          this.symposiumState.deleteCustomScenario(key);
          this.renderScenariosGrid();
          this.updateScenarioHeaderBadge();
          this.showToast(`سناریوی "${sc.title}" حذف شد.`);
        }
      });

      this.scenariosGrid.appendChild(card);
    });
  }

  // ── Persona Creation & Management ──

  openPersonaForm(persona = null) {
    if (!this.personaFormCard) return;
    this.personaFormCard.style.display = 'flex';

    if (persona) {
      if (this.personaFormHeading) this.personaFormHeading.textContent = 'ویرایش پرسونا';
      if (this.personaFormId) this.personaFormId.value = persona.id;
      if (this.personaFormTitle) this.personaFormTitle.value = persona.title || '';
      if (this.personaFormBadge) this.personaFormBadge.value = persona.badge || '🎭 پرسونا';
      if (this.personaFormColor) this.personaFormColor.value = persona.color || '#c084fc';
      if (this.personaFormDirective) {
        this.personaFormDirective.value = persona.directive || '';
        this.syncTextareaDirection(this.personaFormDirective);
      }
    } else {
      if (this.personaFormHeading) this.personaFormHeading.textContent = 'ساخت پرسونای جدید';
      if (this.personaFormId) this.personaFormId.value = '';
      if (this.personaFormTitle) this.personaFormTitle.value = '';
      if (this.personaFormBadge) this.personaFormBadge.value = '🎭 پرسونا';
      if (this.personaFormColor) this.personaFormColor.value = '#c084fc';
      if (this.personaFormDirective) this.personaFormDirective.value = '';
    }

    requestAnimationFrame(() => this.personaFormTitle?.focus());
  }

  closePersonaForm() {
    if (this.personaFormCard) {
      this.personaFormCard.style.display = 'none';
    }
  }

  handleSavePersonaForm() {
    const title = this.personaFormTitle?.value?.trim();
    if (!title) {
      alert('لطفاً عنوان پرسونا را وارد نمایید.');
      this.personaFormTitle?.focus();
      return;
    }

    const directive = this.personaFormDirective?.value?.trim();
    if (!directive) {
      alert('لطفاً دستورالعمل سیستمی پرسونا را وارد نمایید.');
      this.personaFormDirective?.focus();
      return;
    }

    const id = this.personaFormId?.value || undefined;
    const badge = this.personaFormBadge?.value?.trim() || '🎭 پرسونا';
    const color = this.personaFormColor?.value || '#c084fc';

    const saved = this.symposiumState.saveCustomPersona({
      id,
      title,
      badge,
      color,
      directive
    });

    if (saved) {
      this.closePersonaForm();
      this.renderPersonasGrid();
      this.showToast(`پرسونای "${saved.title}" در کتابخانه ذخیره شد ✓`);
    }
  }

  renderPersonasGrid() {
    if (!this.personasGrid) return;
    const allPersonas = this.symposiumState.getAllPersonas();
    const personaKeys = Object.keys(allPersonas);
    this.personasGrid.innerHTML = '';

    if (personaKeys.length === 0) {
      this.personasGrid.innerHTML = `
        <div style="padding: 24px 16px; text-align: center; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.15);">
          <div style="font-size: 24px; margin-bottom: 6px;">🎭</div>
          <div style="font-size: 12px; color: #f1f5f9; font-weight: 600;">هنوز هیچ پرسونایی تعریف نشده است</div>
          <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 12px;">پرسوناهای شناختی اختصاصی خود را با اهداف و دستورالعمل‌های دلخواه تعریف نمایید.</p>
          <button type="button" class="btn-load-scenario" style="width: auto; padding: 6px 16px; margin: 0 auto; background: rgba(192, 132, 252, 0.25); border-color: rgba(192, 132, 252, 0.6); color: #e9d5ff;" id="btn-empty-create-persona">
            <span>+ ساخت پرسونای جدید</span>
          </button>
        </div>
      `;
      document.getElementById('btn-empty-create-persona')?.addEventListener('click', () => {
        this.openPersonaForm();
      });
      return;
    }

    personaKeys.forEach(key => {
      const p = allPersonas[key];
      const card = document.createElement('div');
      card.className = 'persona-preset-card is-custom';
      card.innerHTML = `
        <div class="preset-card-top">
          <div class="preset-identity">
            <span class="preset-badge">${p.badge || '🎭'}</span>
            <span class="preset-title" style="color: ${p.color || '#ffffff'};">${this.escapeHtml(p.title)}</span>
          </div>
          <div class="preset-card-actions">
            <button type="button" class="btn-preset-use btn-edit-persona" title="ویرایش پرسونا">✏️ ویرایش</button>
            <button type="button" class="btn-preset-del btn-del-persona" title="حذف پرسونا">✕</button>
          </div>
        </div>
        <div class="preset-directive-preview" dir="auto">${this.escapeHtml(p.directive)}</div>
      `;

      card.querySelector('.btn-edit-persona')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openPersonaForm(p);
      });

      card.querySelector('.btn-del-persona')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`آیا از حذف پرسونای "${p.title}" اطمینان دارید؟`)) {
          this.symposiumState.deleteCustomPersona(key);
          this.renderPersonasGrid();
          this.showToast(`پرسونای "${p.title}" حذف شد.`);
        }
      });

      this.personasGrid.appendChild(card);
    });
  }

  renderDaisFloorPlan() {
    if (!this.daisFloorCircle) return;
    this.daisFloorCircle.innerHTML = '';

    this.symposiumState.seats.forEach((seat, idx) => {
      const node = document.createElement('div');
      node.className = 'dais-floor-chair-node';
      node.title = `کلیک برای بازرسی و ویرایش سریع ${seat.name}`;
      node.innerHTML = `
        <span class="chair-dot" style="background:${seat.color || '#c084fc'};color:${seat.color || '#c084fc'};"></span>
        <span>${this.escapeHtml(seat.name)}</span>
        <span style="font-size:9.5px;color:#94a3b8;">(${seat.personaBadge || 'Chair'})</span>
      `;

      node.addEventListener('click', () => {
        this.closeSanctum();
        this.openSeatInspector(idx);
      });

      this.daisFloorCircle.appendChild(node);
    });
  }

  renderPromptTemplatesDropdown() {
    if (!this.promptTemplatePresetPicker) return;
    const templates = this.symposiumState.getPromptTemplates();
    this.promptTemplatePresetPicker.innerHTML = '<option value="">-- انتخاب از الگوهای آماده فرمول پرومپت --</option>';

    Object.keys(templates).forEach(key => {
      const t = templates[key];
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${t.title}`;
      if (key === this.symposiumState.config.activeTemplateKey) opt.selected = true;
      this.promptTemplatePresetPicker.appendChild(opt);
    });
  }

  renderGlobalDirectivesDropdown() {
    if (!this.sanctumGlobalDirectivePresetPicker) return;
    const directives = this.symposiumState.getGlobalDirectivePresets();
    this.sanctumGlobalDirectivePresetPicker.innerHTML = '<option value="">-- انتخاب دستور کلی آماده شورا --</option>';

    Object.keys(directives).forEach(key => {
      const d = directives[key];
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = d.title;
      if (key === this.symposiumState.config.activeGlobalDirectiveKey) opt.selected = true;
      this.sanctumGlobalDirectivePresetPicker.appendChild(opt);
    });
  }

  renderUserRolesDropdown() {
    if (!this.sanctumUserRolePresetPicker) return;
    const roles = this.symposiumState.getUserRolePresets();
    this.sanctumUserRolePresetPicker.innerHTML = '<option value="">-- انتخاب از الگوهای آماده نقش کاربر --</option>';

    Object.keys(roles).forEach(key => {
      const r = roles[key];
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${r.badge} ${r.title}`;
      if (key === this.symposiumState.userParticipant.personaKey) opt.selected = true;
      this.sanctumUserRolePresetPicker.appendChild(opt);
    });
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

    if (this.sanctumGlobalDirectiveTextarea) {
      this.symposiumState.config.globalDirective = this.sanctumGlobalDirectiveTextarea.value.trim();
    }

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
      const personaKeys = Object.keys(allPersonas);

      if (personaKeys.length === 0) {
        const opt = document.createElement('option');
        opt.value = 'maestro';
        opt.textContent = '👑 Lead Maestro';
        opt.selected = true;
        this.sanctumUserPersonaSelect.appendChild(opt);
      } else {
        personaKeys.forEach(key => {
          const p = allPersonas[key];
          const opt = document.createElement('option');
          opt.value = key;
          opt.textContent = `${p.badge || '👑'} ${p.title}`;
          if (key === u.personaKey) opt.selected = true;
          this.sanctumUserPersonaSelect.appendChild(opt);
        });
      }
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
    return rtlMatches.length >= ltrMatches.length * 0.25 ? 'rtl' : 'ltr';
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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
