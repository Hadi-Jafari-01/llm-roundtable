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
      onSessionWaitingForMaestro: () => this.renderAll()
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
    this.btnImportBriefing = document.getElementById('btn-symposium-import-briefing');
    this.fileImportBriefing = document.getElementById('file-symposium-import');
    this.btnSanctumExportAll = document.getElementById('btn-sanctum-export-all');
    this.btnSanctumImportAll = document.getElementById('btn-sanctum-import-all');
    this.fileSanctumImport = document.getElementById('file-sanctum-import');
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

    // Zone 3: Dais Floor Plan & Complete Seat Configuration
    this.daisFloorCircle = document.getElementById('dais-interactive-floor-circle');
    this.daisSeatSelectorBar = document.getElementById('dais-seat-selector-bar');
    this.daisSeatEditorContainer = document.getElementById('dais-seat-editor-container');
    this.selectedDaisSeatIndex = 0;

    // Zone 4: Dialectic Engine & Templates
    this.topologySelect = document.getElementById('sanctum-topology-select');
    this.flowPresetsSelect = document.getElementById('sanctum-flow-presets-select');
    this.btnSaveCurrentFlowPreset = document.getElementById('btn-save-current-flow-preset');
    this.btnDelFlowPreset = document.getElementById('btn-del-flow-preset');
    this.flowDelayInput = document.getElementById('sanctum-flow-delay');

    this.promptTemplatePresetPicker = document.getElementById('sanctum-prompt-template-preset-select');
    this.btnSaveCurrentFormulaPreset = document.getElementById('btn-save-current-formula-preset');
    this.btnDelFormulaPreset = document.getElementById('btn-del-formula-preset');
    this.templateTextarea = document.getElementById('sanctum-template-textarea');
    this.btnClearFormula = document.getElementById('btn-clear-formula');
    this.btnCopyFormula = document.getElementById('btn-copy-formula');
    this.formulaStatsBadge = document.getElementById('formula-stats-badge');

    this.maxRoundsInput = document.getElementById('sanctum-max-rounds');
    this.distillSelect = document.getElementById('sanctum-distill-select');
    this.macroChipsContainer = document.getElementById('sanctum-macro-chips');

    this.sanctumGlobalDirectivePresetPicker = document.getElementById('sanctum-global-directive-preset-select');
    this.btnSaveCurrentGlobalDirectivePreset = document.getElementById('btn-save-current-global-directive-preset');
    this.btnDelGlobalDirectivePreset = document.getElementById('btn-del-global-directive-preset');
    this.sanctumGlobalDirectiveTextarea = document.getElementById('sanctum-global-directive');
    this.btnSaveProtocols = document.getElementById('btn-save-protocols');
  }

  initSubModules() {
    const daisContainer = document.getElementById('symposium-dais-container');
    const daisRibbon = document.getElementById('symposium-dais-ribbon');
    this.dais = new SymposiumDais(daisContainer, daisRibbon, {
      onPassBaton: (idx) => {
        const inputVal = (this.inputPrompt?.value || '').trim();
        if (inputVal) {
          if (!this.symposiumState.userCorePrompt) {
            this.symposiumState.userCorePrompt = inputVal;
          }
          this.symposiumState.addTurn({
            id: `turn_u_${Date.now()}`,
            role: 'user',
            isSeatedUser: false,
            speakerName: 'Human Maestro',
            color: '#f59e0b',
            text: inputVal,
            round: this.symposiumState.roundIndex,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
          this.inputPrompt.value = '';
          this.inputPrompt.style.height = 'auto';
        }
        const seat = this.symposiumState.seats[idx];
        if (seat?.isMuted) {
          this.symposiumState.setSeatMuted(idx, false);
        }
        this.turnSequencer.passBaton(idx);
        this.renderAll();
      },
      onOpenInspector: (idx, rect) => this.openSeatInspector(idx, rect),
      onConfigureSeat: (idx) => this.openSeatInspector(idx),
      onToggleMute: (idx) => this.handleToggleSeatMute(idx)
    });

    const transcriptViewport = document.getElementById('symposium-transcript-viewport');
    this.transcriptView = new SymposiumTranscript(transcriptViewport, {
      onChallenge: (turnId) => this.handleChallengeTurn(turnId),
      onCrownInsight: (turnId) => this.handleCrownInsight(turnId),
      onSynthesize: () => this.handleSynthesize(),
      onDeleteTurn: (turnId) => this.handleDeleteTurn(turnId)
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
      const scrollH = this.inputPrompt.scrollHeight;
      this.inputPrompt.style.height = Math.min(Math.max(32, scrollH), 180) + 'px';
    });

    // Auto text direction detection on custom directive textareas
    this.sanctumGlobalDirectiveTextarea?.addEventListener('input', () => {
      this.syncTextareaDirection(this.sanctumGlobalDirectiveTextarea);
    });

    // --- Flow / Topology Controls ---
    this.flowPresetsSelect?.addEventListener('change', () => {
      const key = this.flowPresetsSelect.value;
      if (this.btnDelFlowPreset) {
        this.btnDelFlowPreset.style.display = key ? 'inline' : 'none';
      }
      if (key) {
        this.symposiumState.applyTopology(key);
        this.loadProtocolsIntoEditor();
        this.updateHeaderStats();
        this.showToast('الگوی جریان بارگذاری شد ✓');
      }
    });

    this.btnSaveCurrentFlowPreset?.addEventListener('click', () => {
      const title = prompt('عنوان الگوی جریان مذاکره جدید:');
      if (!title) return;
      const flowType = this.topologySelect?.value || 'manual';
      const delay = parseInt(this.flowDelayInput?.value, 10) || 2400;
      const rounds = parseInt(this.maxRoundsInput?.value, 10) || 10;
      const distill = this.distillSelect?.value || 'digest';

      const saved = this.symposiumState.saveCustomTopology({
        title,
        flowType,
        autoAdvanceDelayMs: delay,
        maxRounds: rounds,
        contextDistillation: distill
      });

      if (saved) {
        this.renderFlowPresetsDropdown();
        this.showToast(`الگوی جریان "${saved.title}" ذخیره شد ✓`);
      }
    });

    this.btnDelFlowPreset?.addEventListener('click', () => {
      const key = this.flowPresetsSelect?.value;
      if (!key) return;
      if (confirm('آیا از حذف این الگوی جریان مذاکره اطمینان دارید؟')) {
        this.symposiumState.deleteCustomTopology(key);
        this.renderFlowPresetsDropdown();
        this.showToast('الگوی جریان حذف شد.');
      }
    });

    // --- Prompt Injection Formula Controls ---
    this.promptTemplatePresetPicker?.addEventListener('change', () => {
      const key = this.promptTemplatePresetPicker.value;
      if (this.btnDelFormulaPreset) {
        this.btnDelFormulaPreset.style.display = key ? 'inline' : 'none';
      }
      if (key) {
        const tpls = this.symposiumState.getPromptTemplates();
        if (tpls[key] && this.templateTextarea) {
          this.templateTextarea.value = tpls[key].template;
          this.syncTextareaDirection(this.templateTextarea);
          this.updateFormulaStats();
          this.symposiumState.applyPromptTemplate(key);
          this.showToast(`الگوی پرومپت "${tpls[key].title}" بارگذاری شد ✓`);
        }
      }
    });

    this.btnSaveCurrentFormulaPreset?.addEventListener('click', () => {
      const title = prompt('عنوان الگوی پرومپت جدید:');
      if (!title) return;
      const template = this.templateTextarea?.value || '';

      const saved = this.symposiumState.saveCustomPromptTemplate({
        title,
        template
      });

      if (saved) {
        this.renderPromptTemplatesDropdown();
        this.showToast(`الگوی پرومپت "${saved.title}" ذخیره شد ✓`);
      }
    });

    this.btnDelFormulaPreset?.addEventListener('click', () => {
      const key = this.promptTemplatePresetPicker?.value;
      if (!key) return;
      if (confirm('آیا از حذف این الگوی پرومپت اطمینان دارید؟')) {
        this.symposiumState.deleteCustomPromptTemplate(key);
        this.renderPromptTemplatesDropdown();
        this.showToast('الگوی پرومپت حذف شد.');
      }
    });

    this.btnClearFormula?.addEventListener('click', () => {
      if (this.templateTextarea) {
        this.templateTextarea.value = '';
        this.updateFormulaStats();
        this.templateTextarea.focus();
      }
    });

    this.btnCopyFormula?.addEventListener('click', () => {
      if (this.templateTextarea?.value) {
        navigator.clipboard.writeText(this.templateTextarea.value);
        this.showToast('فرمول در کلیپ‌بورد کپی شد 📋');
      }
    });

    // --- Global Directive Controls ---
    this.sanctumGlobalDirectivePresetPicker?.addEventListener('change', () => {
      const key = this.sanctumGlobalDirectivePresetPicker.value;
      if (this.btnDelGlobalDirectivePreset) {
        this.btnDelGlobalDirectivePreset.style.display = key ? 'inline' : 'none';
      }
      if (key) {
        const dirs = this.symposiumState.getGlobalDirectivePresets();
        if (dirs[key] && this.sanctumGlobalDirectiveTextarea) {
          this.sanctumGlobalDirectiveTextarea.value = dirs[key].directive;
          this.syncTextareaDirection(this.sanctumGlobalDirectiveTextarea);
          this.symposiumState.applyGlobalDirectivePreset(key);
          this.showToast(`دستور مشترک "${dirs[key].title}" بارگذاری شد ✓`);
        }
      }
    });

    this.btnSaveCurrentGlobalDirectivePreset?.addEventListener('click', () => {
      const title = prompt('عنوان الگوی دستورالعمل مشترک جدید:');
      if (!title) return;
      const directive = this.sanctumGlobalDirectiveTextarea?.value || '';

      const saved = this.symposiumState.saveCustomGlobalDirective({
        title,
        directive
      });

      if (saved) {
        this.renderGlobalDirectivesDropdown();
        this.showToast(`دستور مشترک "${saved.title}" ذخیره شد ✓`);
      }
    });

    this.btnDelGlobalDirectivePreset?.addEventListener('click', () => {
      const key = this.sanctumGlobalDirectivePresetPicker?.value;
      if (!key) return;
      if (confirm('آیا از حذف این الگوی دستورالعمل مشترک اطمینان دارید؟')) {
        this.symposiumState.deleteCustomGlobalDirective(key);
        this.renderGlobalDirectivesDropdown();
        this.showToast('الگوی دستورالعمل مشترک حذف شد.');
      }
    });

    this.topologySelect?.addEventListener('change', () => {
      this.symposiumState.debateMode = this.topologySelect.value;
      this.updateHeaderStats();
    });

    // Formula Textarea live input monitoring
    this.templateTextarea?.addEventListener('input', () => {
      this.syncTextareaDirection(this.templateTextarea);
      this.updateFormulaStats();
    });

    // Instant Distillation and Max Rounds updates
    this.distillSelect?.addEventListener('change', () => {
      this.symposiumState.config.contextDistillation = this.distillSelect.value;
      this.symposiumState.persistConfig();
      this.showToast('مدیریت حجم تاریخچه به‌روز شد ✓');
    });

    this.maxRoundsInput?.addEventListener('change', () => {
      this.symposiumState.config.maxRounds = parseInt(this.maxRoundsInput.value, 10) || 10;
      this.symposiumState.persistConfig();
    });

    // Save protocols
    this.btnSaveProtocols?.addEventListener('click', () => {
      this.saveProtocolsConfig();
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
      const inputVal = (this.inputPrompt?.value || '').trim();
      if (inputVal) {
        if (!this.symposiumState.userCorePrompt) {
          this.symposiumState.userCorePrompt = inputVal;
        }
        this.symposiumState.addTurn({
          id: `turn_u_${Date.now()}`,
          role: 'user',
          isSeatedUser: false,
          speakerName: 'Human Maestro',
          color: '#f59e0b',
          text: inputVal,
          round: this.symposiumState.roundIndex,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        this.inputPrompt.value = '';
        this.inputPrompt.style.height = 'auto';
      }
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

    // Import Symposium Session JSON
    this.btnImportBriefing?.addEventListener('click', () => {
      this.fileImportBriefing?.click();
    });

    this.fileImportBriefing?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const res = this.symposiumState.importSymposiumData(text, true);
      if (res.success) {
        this.renderAll();
        this.showToast('جلسه و تاریخچه میزگرد بازیابی شد ✓');
      } else {
        alert(`خطا در بازیابی جلسه: ${res.error}`);
      }
      this.fileImportBriefing.value = '';
    });

    // Sanctum Drawer Full Export & Import
    this.btnSanctumExportAll?.addEventListener('click', () => {
      const json = this.symposiumState.exportSymposiumData(true);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `symposium_sanctum_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('تمام سناریوها و الگوهای آتلیه استخراج شدند ✓');
    });

    this.btnSanctumImportAll?.addEventListener('click', () => {
      this.fileSanctumImport?.click();
    });

    this.fileSanctumImport?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const res = this.symposiumState.importSymposiumData(text, false);
      if (res.success) {
        this.renderScenariosGrid();
        this.renderPersonasGrid();
        this.renderPromptTemplatesDropdown();
        this.renderGlobalDirectivesDropdown();
        this.renderFlowPresetsDropdown();
        this.showToast(`سناریوها و پرسوناها با موفقیت درون‌ریزی شدند ✓`);
      } else {
        alert(`خطا: ${res.error}`);
      }
      this.fileSanctumImport.value = '';
    });

    this.macroChipsContainer?.addEventListener('click', (e) => {
      const chip = e.target.closest('.macro-chip-btn');
      if (chip && this.templateTextarea) {
        const macro = chip.dataset.macro;
        const pos = this.templateTextarea.selectionStart ?? this.templateTextarea.value.length;
        const val = this.templateTextarea.value;
        this.templateTextarea.value = val.slice(0, pos) + macro + val.slice(pos);
        this.templateTextarea.focus();
        this.templateTextarea.setSelectionRange(pos + macro.length, pos + macro.length);
        this.updateFormulaStats();
        this.showToast(`متغیر ${macro} درج شد ✓`);
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
    this.renderFlowPresetsDropdown();
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
    this.renderAll();
    this.showToast(`${seat.name} ${nextMuted ? 'بی‌صدا شد 🔇' : 'فعال شد 🔊'}`);
  }

  renderAll() {
    const isSpeaking = Boolean(this.symposiumState.isSpeakerStreaming && this.symposiumState.sessionStatus === 'ACTIVE');
    const waitingForUser = this.symposiumState.sessionStatus === 'WAITING_FOR_USER';
    const waitingForMaestro = this.symposiumState.sessionStatus === 'WAITING_FOR_MAESTRO';

    this.dais.render(
      this.symposiumState.seats,
      isSpeaking ? this.symposiumState.activeSpeakerIndex : -1,
      waitingForUser,
      waitingForMaestro ? this.symposiumState.recommendedNextSpeakerIndex : -1,
      waitingForMaestro,
      isSpeaking
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
        random: 'Dynamic Random',
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

    this.btnNextTurn?.classList.toggle('ready-to-dispatch', sessionStatus === 'WAITING_FOR_MAESTRO');

    if (sessionStatus === 'WAITING_FOR_USER') {
      this.composerSpeakerName.textContent = 'نوبت شما در شورا فرا رسیده است (Your Turn) 👑';
      this.composerBox?.classList.add('user-turn-active');
    } else if (isSpeakerStreaming && activeSeat) {
      this.composerSpeakerName.textContent = `در حال تفکر و پاسخ: ${activeSeat.name} (${activeSeat.personaBadge || ''}) ⚡`;
      this.composerBox?.classList.remove('user-turn-active');
    } else if (sessionStatus === 'WAITING_FOR_MAESTRO' && recSeat) {
      this.composerSpeakerName.textContent = `نوبت بعد با عصا: ${recSeat.name} (${recSeat.personaBadge || ''}) 🪄 (کلیک روی عصا یا صندلی برای شروع)`;
      this.composerBox?.classList.remove('user-turn-active');
    } else if (sessionStatus === 'IDLE') {
      this.composerSpeakerName.textContent = 'میزگرد آماده آغاز است • پیامی بنویسید یا روی صندلی یک مدل کلیک کنید';
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

    // در حالت نوبت دستی، پس از ارسال پیام انسانی هیچ مدلی درجا جواب نمی‌دهد
    if (this.symposiumState.debateMode === 'manual') {
      clearTimeout(this.turnSequencer.autoAdvanceTimer);
      clearTimeout(this.turnSequencer.safetyTimer);
      this.symposiumState.sessionStatus = 'WAITING_FOR_MAESTRO';
      this.symposiumState.recommendedNextSpeakerIndex = this.symposiumState.calculateRecommendedNextSpeaker();
      this.renderAll();
      const recSeat = this.symposiumState.seats[this.symposiumState.recommendedNextSpeakerIndex];
      const recName = recSeat ? recSeat.name : 'مدل بعدی';
      this.showToast(`پیام ثبت شد 💬. نوبت را با عصا (🪄) یا کلیک روی صندلی به ${recName} بسپارید.`);
      return;
    }

    this.renderAll();

    if (this.symposiumState.sessionStatus !== 'ACTIVE') {
      const recIdx = this.symposiumState.recommendedNextSpeakerIndex || 0;
      this.turnSequencer.start(text, recIdx);
    } else {
      this.turnSequencer.advanceNext();
    }
  }

  handleUserTurnPrompted({ seat, seatIndex }) {
    this.dais.render(this.symposiumState.seats, seatIndex, true, -1, false, false);
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
    this.dais.highlightActiveSeat(seatIndex, false, -1, false, true);
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
      : (this.symposiumState.config.promptTemplate || DEFAULT_DIALECTIC_TEMPLATE);

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

    const seats = this.symposiumState.seats;
    const currentIdx = typeof turn.seatIndex === 'number' ? turn.seatIndex : this.symposiumState.activeSpeakerIndex;
    let targetIdx = (currentIdx + 1) % seats.length;
    let checked = 0;
    while (seats[targetIdx]?.isMuted && checked < seats.length) {
      targetIdx = (targetIdx + 1) % seats.length;
      checked++;
    }

    const directive = `CRITICAL CHALLENGE to ${turn.speakerName}: Falsify and challenge this specific proposition: "${turn.text.slice(0, 180)}..."`;
    this.turnSequencer.dispatchTurn(targetIdx, directive);
  }

  handleSynthesize() {
    const seats = this.symposiumState.seats;
    let targetIdx = this.symposiumState.activeSpeakerIndex >= 0 ? this.symposiumState.activeSpeakerIndex : 0;
    if (seats[targetIdx]?.isMuted) {
      targetIdx = seats.findIndex(s => !s.isMuted);
      if (targetIdx < 0) targetIdx = 0;
    }
    const directive = 'MILESTONE CONSENSUS MANDATE: Reconcile all current positions and synthesize a master framework.';
    this.turnSequencer.dispatchTurn(targetIdx, directive);
  }

  handleDeleteTurn(turnId) {
    const turn = this.symposiumState.transcript.find(t => t.id === turnId);
    if (!turn) return;

    const speaker = turn.speakerName || (turn.role === 'user' ? 'کاربر' : 'مدل');
    if (!confirm(`آیا از حذف این پیام («${speaker}») از گفتگوی میزگرد اطمینان دارید؟ با حذف این پیام، هیچ اثری از آن در ادامه بحث و کانتکست هوش‌ها باقی نخواهد ماند.`)) {
      return;
    }

    const wasStreaming = turn.isStreaming;
    const removed = this.symposiumState.removeTurn(turnId);
    if (removed) {
      if (wasStreaming) {
        clearTimeout(this.turnSequencer.safetyTimer);
        clearTimeout(this.turnSequencer.autoAdvanceTimer);
        this.symposiumState.sessionStatus = 'WAITING_FOR_MAESTRO';
        this.symposiumState.recommendedNextSpeakerIndex = this.symposiumState.calculateRecommendedNextSpeaker();
      }

      this.renderAll();
      this.showToast(`پیام ${speaker} با موفقیت از میزگرد حذف شد 🗑️`);
    }
  }

  // ── 1. Contextual Inline Seat Inspector Engine (Zero Context-Switch) ──

  openSeatInspector(seatIndex, anchorRect = null) {
    const seat = this.symposiumState.seats[seatIndex];
    if (!seat || !this.seatInspector) return;

    this.activeInspectorSeatIndex = seatIndex;

    // Anchor positioning immediately adjacent to left rail seat pod
    if (anchorRect) {
      const top = Math.max(56, Math.min(anchorRect.top - 10, window.innerHeight - 380));
      const targetLeft = Math.min(anchorRect.right + 12, window.innerWidth - 410);
      this.seatInspector.style.top = `${top}px`;
      this.seatInspector.style.left = `${Math.max(16, targetLeft)}px`;
    } else {
      const isRailExpanded = this.leftRail?.classList.contains('expanded');
      this.seatInspector.style.top = '70px';
      this.seatInspector.style.left = isRailExpanded ? '236px' : '82px';
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
      emptySpan.style.cssText = 'font-size:10.5px;color:#94a3b8;padding:4px 6px;';
      emptySpan.textContent = 'هنوز پرسونایی تعریف نشده است (می‌توانید مستقیم در کادر زیر بنویسید یا الگو بسازید).';
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
          this.renderAll();
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
      this.renderAll();
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
    this.renderAll();
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

    // If active selected index is out of bounds, reset to 0
    if (this.selectedDaisSeatIndex >= this.symposiumState.seats.length) {
      this.selectedDaisSeatIndex = 0;
    }

    // 1. Render Amphitheater Visual Nodes
    this.symposiumState.seats.forEach((seat, idx) => {
      const isSelected = idx === this.selectedDaisSeatIndex;
      const node = document.createElement('div');
      node.className = `dais-floor-chair-node ${isSelected ? 'active' : ''} ${seat.isUser ? 'user-node' : ''}`;
      node.title = `انتخاب و ویرایش تنظیمات ${seat.name}`;
      node.innerHTML = `
        <span class="chair-dot" style="background:${seat.color || '#c084fc'};color:${seat.color || '#c084fc'};"></span>
        <span>${this.escapeHtml(seat.name)}</span>
        <span style="font-size:9.5px;color:#94a3b8;">(${seat.personaBadge || (seat.isUser ? '👑' : 'AI')})</span>
      `;

      node.addEventListener('click', () => {
        this.selectedDaisSeatIndex = idx;
        this.renderDaisFloorPlan();
      });

      this.daisFloorCircle.appendChild(node);
    });

    // 2. Render Seat Selector Ribbon Pills
    this.renderDaisSeatSelectorBar();

    // 3. Render the Seat Editor Card for selected seat
    this.renderDaisSeatEditor(this.selectedDaisSeatIndex);
  }

  renderDaisSeatSelectorBar() {
    if (!this.daisSeatSelectorBar) return;
    this.daisSeatSelectorBar.innerHTML = '';

    this.symposiumState.seats.forEach((seat, idx) => {
      const isSelected = idx === this.selectedDaisSeatIndex;
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `dais-seat-tab ${isSelected ? 'active' : ''} ${seat.isUser ? 'user-tab' : ''}`;
      pill.innerHTML = `
        <span class="seat-dot" style="background:${seat.color || '#c084fc'};"></span>
        <span>${this.escapeHtml(seat.name)}</span>
        <span style="font-size:9px;opacity:0.75;">${seat.personaBadge || ''}</span>
      `;
      pill.addEventListener('click', () => {
        this.selectedDaisSeatIndex = idx;
        this.renderDaisFloorPlan();
      });
      this.daisSeatSelectorBar.appendChild(pill);
    });
  }

  renderDaisSeatEditor(seatIndex) {
    if (!this.daisSeatEditorContainer) return;
    const seat = this.symposiumState.seats[seatIndex];
    if (!seat) {
      this.daisSeatEditorContainer.innerHTML = `<div style="color:#94a3b8;font-size:11px;">صندلی یافت نشد.</div>`;
      return;
    }

    const isUser = Boolean(seat.isUser);
    const allPersonas = this.symposiumState.getAllPersonas();
    const personaKeys = Object.keys(allPersonas);

    // Build persona dropdown options
    let personaOptionsHtml = `<option value="">-- انتخاب از کتابخانه پرسوناها --</option>`;
    personaKeys.forEach(k => {
      const p = allPersonas[k];
      const isCur = seat.personaKey === k;
      personaOptionsHtml += `<option value="${k}" ${isCur ? 'selected' : ''}>${p.badge || '🎭'} ${p.title}</option>`;
    });

    if (isUser) {
      // Configuration Card for Human User
      this.daisSeatEditorContainer.innerHTML = `
        <div class="driver-field-top" style="margin-bottom: 8px;">
          <label class="driver-field-label" style="color:#fde68a;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/></svg>
            <span>تنظیمات جایگاه کاربر انسانی (Human Maestro Seat)</span>
          </label>
          <span class="driver-field-badge" style="background: rgba(245, 158, 11, 0.2); color: #fde68a;">کاربر انسان</span>
        </div>

        <label class="toggle-row" for="sanctum-user-seated-check" style="margin-bottom: 10px;">
          <div class="toggle-info">
            <span class="toggle-title">حضور رسمی با صندلی در حلقه مناظره (Seated Participant)</span>
            <span class="toggle-sub">کاربر نوبت رسمی می‌گیرد و هوش‌ها مستقیماً با او به عنوان همتا بحث می‌کنند</span>
          </div>
          <input type="checkbox" id="sanctum-user-seated-check" class="silk-switch" ${this.symposiumState.userParticipant.isSeated ? 'checked' : ''} />
        </label>

        <div class="driver-sub-grid">
          <div>
            <label class="driver-sub-label">نام نمایشی کاربر در میزگرد</label>
            <input type="text" id="seat-edit-name" class="driver-text-input" value="${this.escapeHtml(seat.name)}" placeholder="Human Maestro" />
          </div>
          <div>
            <label class="driver-sub-label">وزن نفوذ و رأی کاربر (Weight)</label>
            <div class="driver-input-row">
              <input type="number" id="seat-edit-weight" class="driver-text-input" min="10" max="300" step="10" value="${seat.weight || 120}" />
              <span class="unit-tag">%</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 8px;">
          <label class="driver-sub-label">انتساب پرسونا به کاربر (اختیاری - از کتابخانه پرسوناهای بالا):</label>
          <select id="seat-edit-persona-select" class="driver-select-input">
            ${personaOptionsHtml}
          </select>
        </div>

        <div style="margin-top: 8px;">
          <label class="driver-sub-label">دستورالعمل سیستمی و مأموریت فکری کاربر در میزگرد:</label>
          <textarea id="seat-edit-directive" class="driver-text-input sanctum-directive-editor" placeholder="تعریف مأموریت فکری خودتان در این مناظره..." dir="auto">${this.escapeHtml(seat.personaDirective || '')}</textarea>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;">
          <button type="button" id="btn-save-current-seat" class="btn-save-driver-master" style="width: auto; padding: 0 18px;">
            <span>ذخیره و تثبیت صندلی کاربر 👑</span>
          </button>
        </div>
      `;
    } else {
      // Configuration Card for AI Model
      this.daisSeatEditorContainer.innerHTML = `
        <div class="driver-field-top" style="margin-bottom: 8px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="seat-dot" style="width:10px;height:10px;border-radius:50%;background:${seat.color || '#c084fc'};box-shadow:0 0 8px ${seat.color || '#c084fc'};"></span>
            <label class="driver-field-label" style="font-size:13px;color:#ffffff;">
              <span>پیکربندی هوش مصنوعی: <strong>${this.escapeHtml(seat.name)}</strong></span>
            </label>
          </div>
          <span class="driver-field-badge" style="background: rgba(192, 132, 252, 0.2); color: #e9d5ff;">صندلی هوش</span>
        </div>

        <div class="driver-sub-grid">
          <div>
            <label class="driver-sub-label">عنوان نمایشی صندلی</label>
            <input type="text" id="seat-edit-name" class="driver-text-input" value="${this.escapeHtml(seat.name)}" />
          </div>
          <div>
            <label class="driver-sub-label">وزن نفوذ رأی (Influence Weight)</label>
            <div class="driver-input-row">
              <input type="number" id="seat-edit-weight" class="driver-text-input" min="10" max="300" step="10" value="${seat.weight || 100}" />
              <span class="unit-tag">%</span>
            </div>
          </div>
        </div>

        <div class="driver-sub-grid" style="margin-top: 8px;">
          <div>
            <label class="driver-sub-label">انتساب پرسونا از کتابخانه:</label>
            <select id="seat-edit-persona-select" class="driver-select-input">
              ${personaOptionsHtml}
            </select>
          </div>
          <div>
            <label class="driver-sub-label">وضعیت صدا و مشارکت:</label>
            <button type="button" id="btn-toggle-seat-mute-sanctum" class="btn-utility-ghost" style="width:100%;height:36px;justify-content:center;color:${seat.isMuted ? '#f87171' : '#34d399'};">
              <span>${seat.isMuted ? '🔇 بی‌صدا (Muted)' : '🔊 فعال و حاضر در بحث'}</span>
            </button>
          </div>
        </div>

        <div style="margin-top: 8px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <label class="driver-sub-label" style="margin:0;">دستورالعمل اختصاصی این هوش مصنوعی (System Directive):</label>
            <button type="button" id="btn-apply-persona-all-sanctum" class="btn-custom-bot-link" style="font-size:10.5px;">اعمال این پرسونا به همه مدل‌ها 🌐</button>
          </div>
          <textarea id="seat-edit-directive" class="driver-text-input sanctum-directive-editor" placeholder="تعریف وظیفه فکری، تخصص و زاویه دید اختصاصی این صندلی..." dir="auto">${this.escapeHtml(seat.personaDirective || '')}</textarea>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;">
          <button type="button" id="btn-save-current-seat" class="btn-save-driver-master" style="width: auto; padding: 0 18px;">
            <span>ذخیره تنظیمات ${this.escapeHtml(seat.name)} ✓</span>
          </button>
        </div>
      `;

      // Mute Toggle in Sanctum
      this.daisSeatEditorContainer.querySelector('#btn-toggle-seat-mute-sanctum')?.addEventListener('click', () => {
        this.handleToggleSeatMute(seatIndex);
        this.renderDaisSeatEditor(seatIndex);
      });

      // Apply to all models
      this.daisSeatEditorContainer.querySelector('#btn-apply-persona-all-sanctum')?.addEventListener('click', () => {
        this.applySeatToAll(seatIndex);
      });
    }

    // Dynamic auto-direction for directive textarea
    const directiveEl = this.daisSeatEditorContainer.querySelector('#seat-edit-directive');
    directiveEl?.addEventListener('input', () => {
      this.syncTextareaDirection(directiveEl);
    });
    if (directiveEl) this.syncTextareaDirection(directiveEl);

    // Persona Selection Handler with instant directive filling & direction syncing
    this.daisSeatEditorContainer.querySelector('#seat-edit-persona-select')?.addEventListener('change', (e) => {
      const pKey = e.target.value;
      if (pKey && allPersonas[pKey]) {
        const p = allPersonas[pKey];
        if (directiveEl) {
          directiveEl.value = p.directive;
          this.syncTextareaDirection(directiveEl);
        }
        const nameInput = this.daisSeatEditorContainer.querySelector('#seat-edit-name');
        if (nameInput && !isUser && !nameInput.value) {
          nameInput.value = p.title.split('(')[0].trim();
        }
      }
    });

    // Save Seat Handler
    this.daisSeatEditorContainer.querySelector('#btn-save-current-seat')?.addEventListener('click', () => {
      const nameInput = this.daisSeatEditorContainer.querySelector('#seat-edit-name');
      const weightInput = this.daisSeatEditorContainer.querySelector('#seat-edit-weight');
      const personaSelect = this.daisSeatEditorContainer.querySelector('#seat-edit-persona-select');
      const userCheck = this.daisSeatEditorContainer.querySelector('#sanctum-user-seated-check');

      const name = nameInput?.value?.trim() || seat.name;
      const weight = parseInt(weightInput?.value, 10) || 100;
      const directive = directiveEl?.value?.trim() || '';
      const personaKey = personaSelect?.value || seat.personaKey;
      const persona = allPersonas[personaKey];

      if (isUser) {
        const isSeated = Boolean(userCheck?.checked);
        this.symposiumState.setUserParticipation(isSeated, {
          name,
          personaKey,
          weight
        });
        if (directive) {
          this.symposiumState.userParticipant.personaDirective = directive;
          const uSeat = this.symposiumState.seats.find(s => s.isUser);
          if (uSeat) uSeat.personaDirective = directive;
        }
        this.symposiumState.persistConfig();
        this.syncSeats();
        this.renderAll();
        this.renderDaisFloorPlan();
        this.showToast('تنظیمات جایگاه کاربر ذخیره شد ✓');
      } else {
        this.symposiumState.updateSeat(seatIndex, {
          name,
          weight,
          personaKey,
          personaTitle: persona ? persona.title : seat.personaTitle,
          personaBadge: persona ? persona.badge : seat.personaBadge,
          personaDirective: directive,
          isCustomized: true
        });
        this.symposiumState.persistConfig();
        this.renderAll();
        this.renderDaisFloorPlan();
        this.showToast(`تنظیمات ${name} ذخیره و اعمال شد ✓`);
      }
    });
  }

  renderFlowPresetsDropdown() {
    if (!this.flowPresetsSelect) return;
    const flows = this.symposiumState.getTopologies();
    const flowKeys = Object.keys(flows);
    this.flowPresetsSelect.innerHTML = '<option value="">-- الگوهای سفارشی ذخیره‌شده جریان مذاکره --</option>';

    flowKeys.forEach(key => {
      const f = flows[key];
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${f.badge || '🔄'} ${f.title}`;
      this.flowPresetsSelect.appendChild(opt);
    });

    if (this.btnDelFlowPreset) {
      this.btnDelFlowPreset.style.display = 'none';
    }
  }

  renderPromptTemplatesDropdown() {
    if (!this.promptTemplatePresetPicker) return;
    const templates = this.symposiumState.getPromptTemplates();
    const tplKeys = Object.keys(templates);
    this.promptTemplatePresetPicker.innerHTML = '<option value="">-- هیچ الگوی پرومپتی ذخیره نشده است (آزادانه در کادر زیر بنویسید) --</option>';

    tplKeys.forEach(key => {
      const t = templates[key];
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${t.title}`;
      if (key === this.symposiumState.config.activeTemplateKey) opt.selected = true;
      this.promptTemplatePresetPicker.appendChild(opt);
    });

    if (this.btnDelFormulaPreset) {
      this.btnDelFormulaPreset.style.display = 'none';
    }
  }

  renderGlobalDirectivesDropdown() {
    if (!this.sanctumGlobalDirectivePresetPicker) return;
    const directives = this.symposiumState.getGlobalDirectivePresets();
    const dirKeys = Object.keys(directives);
    this.sanctumGlobalDirectivePresetPicker.innerHTML = '<option value="">-- الگوهای ذخیره‌شده دستورالعمل مشترک (می‌توانید مستقیم بنویسید) --</option>';

    dirKeys.forEach(key => {
      const d = directives[key];
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = d.title;
      if (key === this.symposiumState.config.activeGlobalDirectiveKey) opt.selected = true;
      this.sanctumGlobalDirectivePresetPicker.appendChild(opt);
    });

    if (this.btnDelGlobalDirectivePreset) {
      this.btnDelGlobalDirectivePreset.style.display = 'none';
    }
  }

  updateFormulaStats() {
    if (!this.formulaStatsBadge || !this.templateTextarea) return;
    const text = this.templateTextarea.value || '';
    const charCount = text.length;
    const lineCount = text ? text.split('\n').length : 0;
    this.formulaStatsBadge.textContent = `${charCount} نویسه • ${lineCount} سطر`;
  }

  loadProtocolsIntoEditor() {
    if (this.topologySelect) this.topologySelect.value = this.symposiumState.debateMode;
    if (this.flowDelayInput) this.flowDelayInput.value = this.symposiumState.config.autoAdvanceDelayMs || 2400;
    if (this.maxRoundsInput) this.maxRoundsInput.value = this.symposiumState.config.maxRounds;
    if (this.distillSelect) this.distillSelect.value = this.symposiumState.config.contextDistillation;
    if (this.templateTextarea) {
      this.templateTextarea.value = this.symposiumState.config.promptTemplate || DEFAULT_DIALECTIC_TEMPLATE;
      this.syncTextareaDirection(this.templateTextarea);
      this.updateFormulaStats();
    }
    if (this.sanctumGlobalDirectiveTextarea) {
      this.sanctumGlobalDirectiveTextarea.value = this.symposiumState.config.globalDirective || '';
      this.syncTextareaDirection(this.sanctumGlobalDirectiveTextarea);
    }
    this.renderFlowPresetsDropdown();
    this.renderPromptTemplatesDropdown();
    this.renderGlobalDirectivesDropdown();
  }

  saveProtocolsConfig() {
    if (this.topologySelect) this.symposiumState.debateMode = this.topologySelect.value;
    if (this.flowDelayInput) this.symposiumState.config.autoAdvanceDelayMs = parseInt(this.flowDelayInput.value, 10) || 2400;
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

  syncTextareaDirection(el) {
    if (!el) return;
    const val = el.value || '';
    if (!val.trim()) {
      const ph = el.getAttribute('placeholder') || '';
      const dir = ph ? this.detectTextDirection(ph) : 'rtl';
      el.setAttribute('dir', dir);
      el.classList.toggle('is-rtl', dir === 'rtl');
      return;
    }
    const dir = this.detectTextDirection(val);
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
