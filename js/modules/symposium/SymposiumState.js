/**
 * OmniAI Hub — The Silk Symposium State & Persistence Engine
 * Manages symposium seats, active participants, user seating status,
 * chronological turn transcript, and milestone consensus ledger.
 */

/* ── نقش‌های کاربر (User Role Presets - خالی، تماماً قابل ساخت توسط کاربر) ── */
export const USER_ROLE_PRESETS = {};

/* ── پرسوناهای شناختی (Cognitive Archetypes - خالی، تماماً قابل ساخت توسط کاربر) ── */
export const COGNITIVE_PERSONAS = {};

/* ── الگوهای فرمول‌های پرومپت (Dialectic Templates - خالی، تماماً قابل ساخت توسط کاربر) ── */
export const DIALECTIC_PROMPT_TEMPLATES = {};

/* ── فرمول خام و پایه‌ای برای زمان عدم وجود الگو ── */
export const DEFAULT_DIALECTIC_TEMPLATE = `{{speaker_role}}

{{user_core_prompt}}

{{round_context_brief}}`;

/* ── الگوهای آماده برای دستور کلی شورا (خالی، تماماً قابل ساخت توسط کاربر) ── */
export const GLOBAL_DIRECTIVE_PRESETS = {};

/* ── مخزن سناریوهای جامع (خالی، تماماً قابل ساخت توسط کاربر) ── */
export const SYMPOSIUM_SCENARIOS = {};

/* ── الگوهای جریان مذاکره و متدولوژی نوبت‌دهی (خالی، تماماً قابل ساخت توسط کاربر) ── */
export const FLOW_TOPOLOGY_PRESETS = {};

export class SymposiumState {
  constructor() {
    this.sessionStatus = 'IDLE'; // 'IDLE' | 'ACTIVE' | 'PAUSED' | 'WAITING_FOR_USER' | 'WAITING_FOR_MAESTRO'
    this.debateMode = 'manual'; // Default to manual conductor for total user control
    this.roundIndex = 1;
    this.userCorePrompt = '';
    this.activeSpeakerIndex = -1;
    this.recommendedNextSpeakerIndex = -1;
    this.isSpeakerStreaming = false;
    this.activeScenarioKey = '';

    // Custom user-defined persona presets (Templates)
    this.customPersonas = {};

    // Custom user-defined scenarios
    this.customScenarios = {};

    // Custom user-defined prompt injection templates
    this.customPromptTemplates = {};

    // Custom user-defined global directives
    this.customGlobalDirectives = {};

    // Custom user-defined flow/topology presets
    this.customTopologies = {};

    // Per-card persistent customization cache (cardId -> CustomizationObject)
    this.seatCustomizations = {};

    // User's Dais participation model (Seated Participant vs External Observer)
    this.userParticipant = {
      isSeated: false,
      name: 'Human Maestro',
      personaKey: 'user',
      personaTitle: 'Human Participant',
      personaBadge: '👑 User',
      personaDirective: '',
      color: '#f59e0b',
      weight: 120
    };

    this.seats = []; // Array of participant seat objects (Models + User if seated)
    this.transcript = []; // Chronological list of turns
    this.ledger = {
      agreements: [],
      divergences: [],
      openQuestions: []
    };

    this.config = {
      maxRounds: 10,
      autoAdvanceDelayMs: 2400,
      contextDistillation: 'digest', // 'digest' | 'verbatim'
      promptTemplate: DEFAULT_DIALECTIC_TEMPLATE,
      activeTemplateKey: '',
      globalDirective: '',
      activeGlobalDirectiveKey: '',
      autoSynthesizeOnFinish: false
    };

    this.loadPersistedConfig();
  }

  getAllPersonas() {
    return {
      ...COGNITIVE_PERSONAS,
      ...(this.customPersonas || {})
    };
  }

  getPromptTemplates() {
    return {
      ...DIALECTIC_PROMPT_TEMPLATES,
      ...(this.customPromptTemplates || {})
    };
  }

  saveCustomPromptTemplate(data) {
    if (!data || !data.title) return null;
    const id = data.id || `prompt_tpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTpl = {
      id,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      template: data.template ? data.template.trim() : DEFAULT_DIALECTIC_TEMPLATE,
      isCustom: true,
      lastModified: Date.now()
    };
    if (!this.customPromptTemplates) this.customPromptTemplates = {};
    this.customPromptTemplates[id] = newTpl;
    this.persistConfig();
    return newTpl;
  }

  deleteCustomPromptTemplate(id) {
    if (this.customPromptTemplates && this.customPromptTemplates[id]) {
      delete this.customPromptTemplates[id];
      if (this.config.activeTemplateKey === id) {
        this.config.activeTemplateKey = '';
      }
      this.persistConfig();
      return true;
    }
    return false;
  }

  getGlobalDirectivePresets() {
    return {
      ...GLOBAL_DIRECTIVE_PRESETS,
      ...(this.customGlobalDirectives || {})
    };
  }

  saveCustomGlobalDirective(data) {
    if (!data || !data.title) return null;
    const id = data.id || `g_dir_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newDir = {
      id,
      title: data.title.trim(),
      directive: data.directive ? data.directive.trim() : '',
      isCustom: true,
      lastModified: Date.now()
    };
    if (!this.customGlobalDirectives) this.customGlobalDirectives = {};
    this.customGlobalDirectives[id] = newDir;
    this.persistConfig();
    return newDir;
  }

  deleteCustomGlobalDirective(id) {
    if (this.customGlobalDirectives && this.customGlobalDirectives[id]) {
      delete this.customGlobalDirectives[id];
      if (this.config.activeGlobalDirectiveKey === id) {
        this.config.activeGlobalDirectiveKey = '';
      }
      this.persistConfig();
      return true;
    }
    return false;
  }

  getTopologies() {
    return {
      ...FLOW_TOPOLOGY_PRESETS,
      ...(this.customTopologies || {})
    };
  }

  saveCustomTopology(data) {
    if (!data || !data.title) return null;
    const id = data.id || `flow_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newFlow = {
      id,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      badge: data.badge ? data.badge.trim() : '🔄 جریان',
      flowType: data.flowType || 'manual',
      autoAdvanceDelayMs: data.autoAdvanceDelayMs ?? 2400,
      maxRounds: data.maxRounds ?? 10,
      contextDistillation: data.contextDistillation || 'digest',
      isCustom: true,
      lastModified: Date.now()
    };
    if (!this.customTopologies) this.customTopologies = {};
    this.customTopologies[id] = newFlow;
    this.persistConfig();
    return newFlow;
  }

  deleteCustomTopology(id) {
    if (this.customTopologies && this.customTopologies[id]) {
      delete this.customTopologies[id];
      this.persistConfig();
      return true;
    }
    return false;
  }

  applyTopology(topologyKey) {
    const topologies = this.getTopologies();
    const flow = topologies[topologyKey];
    if (!flow) return false;
    this.debateMode = flow.flowType || 'manual';
    if (flow.autoAdvanceDelayMs) this.config.autoAdvanceDelayMs = flow.autoAdvanceDelayMs;
    if (flow.maxRounds) this.config.maxRounds = flow.maxRounds;
    if (flow.contextDistillation) this.config.contextDistillation = flow.contextDistillation;
    this.persistConfig();
    return true;
  }

  getScenarios() {
    return {
      ...SYMPOSIUM_SCENARIOS,
      ...(this.customScenarios || {})
    };
  }

  saveCustomScenario(scenarioData) {
    if (!scenarioData || !scenarioData.title) return null;
    const id = scenarioData.id || `scenario_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newScenario = {
      id,
      title: scenarioData.title.trim(),
      description: scenarioData.description ? scenarioData.description.trim() : '',
      badge: scenarioData.badge ? scenarioData.badge.trim() : '🏛️ سناریو',
      color: scenarioData.color || '#f59e0b',
      debateMode: scenarioData.debateMode || 'manual',
      templateKey: scenarioData.templateKey || 'manual_conductor',
      globalDirectiveKey: scenarioData.globalDirectiveKey || '',
      initialPrompt: scenarioData.initialPrompt ? scenarioData.initialPrompt.trim() : '',
      recommendedPersonas: scenarioData.recommendedPersonas || [],
      isCustom: true,
      lastModified: Date.now()
    };

    if (!this.customScenarios) this.customScenarios = {};
    this.customScenarios[id] = newScenario;
    this.persistConfig();
    return newScenario;
  }

  deleteCustomScenario(id) {
    if (this.customScenarios && this.customScenarios[id]) {
      delete this.customScenarios[id];
      if (this.activeScenarioKey === id) {
        this.activeScenarioKey = '';
      }
      this.persistConfig();
      return true;
    }
    return false;
  }

  applyScenario(scenarioKey) {
    const scenarios = this.getScenarios();
    const scenario = scenarios[scenarioKey];
    if (!scenario) return false;

    this.activeScenarioKey = scenarioKey;
    this.debateMode = scenario.debateMode || 'manual';

    if (scenario.templateKey) {
      const tpls = this.getPromptTemplates();
      if (tpls[scenario.templateKey]) {
        this.config.promptTemplate = tpls[scenario.templateKey].template;
        this.config.activeTemplateKey = scenario.templateKey;
      }
    }

    if (scenario.globalDirectiveKey) {
      const dirs = this.getGlobalDirectivePresets();
      if (dirs[scenario.globalDirectiveKey]) {
        this.config.globalDirective = dirs[scenario.globalDirectiveKey].directive;
        this.config.activeGlobalDirectiveKey = scenario.globalDirectiveKey;
      }
    }

    if (scenario.initialPrompt && !this.userCorePrompt) {
      this.userCorePrompt = scenario.initialPrompt;
    }

    // Apply recommended cognitive personas if available
    const allPersonas = this.getAllPersonas();
    const personasToAssign = scenario.recommendedPersonas || [];
    const aiSeats = this.seats.filter(s => !s.isUser);

    aiSeats.forEach((seat, idx) => {
      if (personasToAssign.length > 0) {
        const personaKey = personasToAssign[idx % personasToAssign.length];
        const persona = allPersonas[personaKey];
        if (persona) {
          this.updateSeat(this.seats.indexOf(seat), {
            personaKey,
            personaTitle: persona.title,
            personaBadge: persona.badge,
            personaDirective: persona.directive,
            isCustomized: true
          });
        }
      }
    });

    this.persistConfig();
    return true;
  }

  applyPromptTemplate(templateKey) {
    const tpls = this.getPromptTemplates();
    const tpl = tpls[templateKey];
    if (!tpl) return false;
    this.config.promptTemplate = tpl.template;
    this.config.activeTemplateKey = templateKey;
    this.persistConfig();
    return true;
  }

  applyGlobalDirectivePreset(presetKey) {
    const dirs = this.getGlobalDirectivePresets();
    const preset = dirs[presetKey];
    if (!preset) return false;
    this.config.globalDirective = preset.directive;
    this.config.activeGlobalDirectiveKey = presetKey;
    this.persistConfig();
    return true;
  }

  calculateRecommendedNextSpeaker() {
    const { seats, activeSpeakerIndex } = this;
    const count = seats.length;
    if (count === 0) return 0;

    let next = (activeSpeakerIndex + 1) % count;
    let checked = 0;
    while (seats[next]?.isMuted && checked < count) {
      next = (next + 1) % count;
      checked++;
    }
    return next >= 0 ? next : 0;
  }

  getPersona(key) {
    if (!key) return null;
    return this.getAllPersonas()[key] || null;
  }

  saveCustomPersona(personaData) {
    if (!personaData || !personaData.title) return null;
    const id = personaData.id || `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPersona = {
      id,
      title: personaData.title.trim(),
      badge: personaData.badge ? personaData.badge.trim() : '🎭 Custom',
      color: personaData.color || '#c084fc',
      directive: personaData.directive ? personaData.directive.trim() : '',
      isCustom: true,
      lastModified: Date.now()
    };

    this.customPersonas[id] = newPersona;
    this.persistConfig();
    return newPersona;
  }

  deleteCustomPersona(id) {
    if (this.customPersonas[id]) {
      delete this.customPersonas[id];
      this.persistConfig();
      return true;
    }
    return false;
  }

  resetPersonaPresets() {
    this.customPersonas = {};
    this.persistConfig();
  }

  syncWithCanvasCards(cards = []) {
    const allPersonas = this.getAllPersonas();
    const personaKeys = Object.keys(allPersonas);
    const existingAiSeats = this.seats.filter(s => !s.isUser);

    const modelSeats = cards.map((card, idx) => {
      const existing = existingAiSeats.find(s => s.cardId === card.id);
      const cachedCustom = this.seatCustomizations[card.id];

      if (existing) {
        return {
          ...existing,
          name: card.title || card.name || existing.name || 'AI Intelligence',
          color: card.color || existing.color || '#c084fc',
          cardId: card.id
        };
      }

      if (cachedCustom) {
        return {
          id: `seat_ai_${card.id}`,
          isUser: false,
          cardId: card.id,
          name: card.title || card.name || 'AI Intelligence',
          color: card.color || '#c084fc',
          personaKey: cachedCustom.personaKey || 'architect',
          personaTitle: cachedCustom.personaTitle || 'AI Architect',
          personaBadge: cachedCustom.personaBadge || '🏛️ Custom',
          personaDirective: cachedCustom.personaDirective || '',
          customPromptTemplate: cachedCustom.customPromptTemplate || '',
          isCustomized: Boolean(cachedCustom.isCustomized),
          weight: cachedCustom.weight ?? 100,
          status: 'idle',
          isMuted: Boolean(cachedCustom.isMuted),
          turnCount: 0
        };
      }

      const assignedKey = personaKeys.length > 0 ? personaKeys[idx % personaKeys.length] : 'custom';
      const persona = allPersonas[assignedKey];

      return {
        id: `seat_ai_${card.id}`,
        isUser: false,
        cardId: card.id,
        name: card.title || card.name || 'AI Intelligence',
        color: card.color || '#c084fc',
        personaKey: assignedKey,
        personaTitle: persona?.title || (card.title || card.name || 'AI Intelligence'),
        personaBadge: persona?.badge || '🤖 AI',
        personaDirective: persona?.directive || '',
        customPromptTemplate: '',
        isCustomized: false,
        weight: 100,
        status: 'idle',
        isMuted: false,
        turnCount: 0
      };
    });

    if (this.userParticipant.isSeated) {
      const userSeat = this.createUserSeatObject();
      this.seats = [userSeat, ...modelSeats];
    } else {
      this.seats = modelSeats;
    }

    if (this.sessionStatus !== 'IDLE' && this.activeSpeakerIndex >= this.seats.length) {
      this.activeSpeakerIndex = 0;
    }

    return this.seats;
  }

  createUserSeatObject() {
    const allPersonas = this.getAllPersonas();
    const persona = allPersonas[this.userParticipant.personaKey];
    return {
      id: 'seat_user_maestro',
      isUser: true,
      cardId: null,
      name: this.userParticipant.name || 'You',
      color: this.userParticipant.color || '#f59e0b',
      personaKey: this.userParticipant.personaKey,
      personaTitle: this.userParticipant.personaTitle || persona?.title || 'Human Maestro',
      personaBadge: this.userParticipant.personaBadge || persona?.badge || '👑 You',
      personaDirective: this.userParticipant.personaDirective || persona?.directive || '',
      weight: this.userParticipant.weight || 120,
      status: 'idle',
      isMuted: false,
      turnCount: 0
    };
  }

  setUserParticipation(isSeated, customMeta = {}) {
    this.userParticipant.isSeated = Boolean(isSeated);
    if (customMeta.name) this.userParticipant.name = customMeta.name;
    const allPersonas = this.getAllPersonas();
    if (customMeta.personaKey && allPersonas[customMeta.personaKey]) {
      this.userParticipant.personaKey = customMeta.personaKey;
      this.userParticipant.personaTitle = allPersonas[customMeta.personaKey].title;
      this.userParticipant.personaDirective = allPersonas[customMeta.personaKey].directive;
    }
    if (customMeta.weight) this.userParticipant.weight = customMeta.weight;

    const currentCards = this.seats.filter(s => !s.isUser).map(s => ({
      id: s.cardId,
      title: s.name,
      color: s.color
    }));

    this.syncWithCanvasCards(currentCards);
    this.persistConfig();
  }

  addTurn(turn) {
    this.transcript.push(turn);
    return turn;
  }

  removeTurn(turnId) {
    const idx = this.transcript.findIndex(t => t.id === turnId);
    if (idx === -1) return null;
    const [removed] = this.transcript.splice(idx, 1);

    // If turn was actively streaming, halt streaming flag
    if (removed.isStreaming) {
      this.isSpeakerStreaming = false;
    }

    // If this turn came from a seat, decrement that seat's turnCount if > 0
    if (typeof removed.seatIndex === 'number' && this.seats[removed.seatIndex]) {
      const seat = this.seats[removed.seatIndex];
      if (seat.turnCount && seat.turnCount > 0) {
        seat.turnCount--;
      }
      if (seat.status === 'speaking') {
        seat.status = 'idle';
      }
    }

    // Clean up userCorePrompt if the removed turn was the opening user turn
    const remainingUserTurns = this.transcript.filter(t => t.role === 'user');
    if (remainingUserTurns.length > 0) {
      this.userCorePrompt = remainingUserTurns[0].text;
    } else if (removed.role === 'user') {
      this.userCorePrompt = '';
    }

    // Purge any ledger items extracted directly from this turn
    if (removed.speakerName && removed.text) {
      ['agreements', 'divergences', 'openQuestions'].forEach(cat => {
        if (Array.isArray(this.ledger[cat])) {
          this.ledger[cat] = this.ledger[cat].filter(item => {
            if (item.startsWith(`${removed.speakerName}:`)) {
              const snippet = item.replace(`${removed.speakerName}:`, '').trim();
              if (snippet && removed.text.includes(snippet.slice(0, 25))) {
                return false;
              }
            }
            return true;
          });
        }
      });
    }

    return removed;
  }

  updateStreamingTurn(partial) {
    const lastTurn = this.transcript[this.transcript.length - 1];
    if (lastTurn && lastTurn.isStreaming) {
      Object.assign(lastTurn, partial);
    }
  }

  concludeStreamingTurn() {
    const lastTurn = this.transcript[this.transcript.length - 1];
    if (lastTurn && lastTurn.isStreaming) {
      lastTurn.isStreaming = false;
      if (!lastTurn.text && lastTurn.thinkingText) {
        lastTurn.text = lastTurn.thinkingText;
      }
    }
    this.isSpeakerStreaming = false;
  }

  setSeatStatus(seatIndex, status) {
    if (this.seats[seatIndex]) {
      this.seats[seatIndex].status = status;
    }
  }

  resetAllSeatStatuses(exceptIndex = -1) {
    this.seats.forEach((seat, i) => {
      if (i !== exceptIndex && seat.status !== 'muted') {
        seat.status = 'idle';
      }
    });
  }

  updateSeat(seatIndex, partial) {
    if (this.seats[seatIndex]) {
      Object.assign(this.seats[seatIndex], partial);
      const seat = this.seats[seatIndex];
      if (!seat.isUser && seat.cardId) {
        this.seatCustomizations[seat.cardId] = {
          personaKey: seat.personaKey,
          personaTitle: seat.personaTitle,
          personaBadge: seat.personaBadge,
          personaDirective: seat.personaDirective,
          customPromptTemplate: seat.customPromptTemplate || '',
          isCustomized: Boolean(seat.isCustomized),
          weight: seat.weight,
          isMuted: seat.isMuted
        };
        this.persistConfig();
      }
    }
  }

  applySeatPersonaToAll(sourceSeatIndex) {
    const source = this.seats[sourceSeatIndex];
    if (!source) return;

    this.seats.forEach((seat, idx) => {
      if (!seat.isUser) {
        this.updateSeat(idx, {
          personaKey: source.personaKey,
          personaTitle: source.personaTitle,
          personaBadge: source.personaBadge,
          personaDirective: source.personaDirective,
          customPromptTemplate: source.customPromptTemplate || '',
          isCustomized: true
        });
      }
    });
    this.persistConfig();
  }

  applyDirectiveToAll(directiveText) {
    if (typeof directiveText !== 'string') return;
    const clean = directiveText.trim();
    this.seats.forEach((seat, idx) => {
      if (!seat.isUser) {
        this.updateSeat(idx, {
          personaDirective: clean,
          isCustomized: true
        });
      }
    });
    this.persistConfig();
  }

  setSeatMuted(seatIndex, isMuted) {
    this.updateSeat(seatIndex, { isMuted: Boolean(isMuted) });
  }

  addLedgerItem(category, text) {
    if (!text || typeof text !== 'string') return false;
    const clean = text.trim();
    if (!clean || clean.length < 5) return false;

    const list = this.ledger[category];
    if (Array.isArray(list) && !list.includes(clean)) {
      list.push(clean);
      return true;
    }
    return false;
  }

  removeLedgerItem(category, index) {
    if (Array.isArray(this.ledger[category])) {
      this.ledger[category].splice(index, 1);
    }
  }

  resetSession() {
    this.sessionStatus = 'IDLE';
    this.roundIndex = 1;
    this.activeSpeakerIndex = -1;
    this.recommendedNextSpeakerIndex = -1;
    this.isSpeakerStreaming = false;
    this.transcript = [];
    this.ledger = {
      agreements: [],
      divergences: [],
      openQuestions: []
    };
    this.resetAllSeatStatuses();
  }

  exportSymposiumData(includeSession = true) {
    const payload = {
      schema: 'OmniAI_Silk_Symposium',
      version: '2.0.0',
      exportedAt: Date.now(),
      debateMode: this.debateMode,
      config: this.config,
      userParticipant: this.userParticipant,
      customPersonas: this.customPersonas,
      customScenarios: this.customScenarios,
      customPromptTemplates: this.customPromptTemplates,
      customGlobalDirectives: this.customGlobalDirectives,
      customTopologies: this.customTopologies,
      seatCustomizations: this.seatCustomizations,
      activeScenarioKey: this.activeScenarioKey
    };

    if (includeSession) {
      payload.session = {
        sessionStatus: this.sessionStatus,
        roundIndex: this.roundIndex,
        userCorePrompt: this.userCorePrompt,
        transcript: this.transcript,
        ledger: this.ledger
      };
    }

    return JSON.stringify(payload, null, 2);
  }

  importSymposiumData(jsonInput, importSession = true) {
    try {
      const parsed = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
      const data = parsed.data?.symposium || parsed.symposium || parsed;
      if (!data || typeof data !== 'object') {
        throw new Error('داده‌های فایل پشتیبان تالار هم‌اندیشی نامعتبر است.');
      }

      if (data.debateMode) this.debateMode = data.debateMode;
      if (data.config && typeof data.config === 'object') Object.assign(this.config, data.config);
      if (data.userParticipant && typeof data.userParticipant === 'object') Object.assign(this.userParticipant, data.userParticipant);

      if (data.customPersonas && typeof data.customPersonas === 'object') {
        this.customPersonas = { ...this.customPersonas, ...data.customPersonas };
      }
      if (data.customScenarios && typeof data.customScenarios === 'object') {
        this.customScenarios = { ...this.customScenarios, ...data.customScenarios };
      }
      if (data.customPromptTemplates && typeof data.customPromptTemplates === 'object') {
        this.customPromptTemplates = { ...this.customPromptTemplates, ...data.customPromptTemplates };
      }
      if (data.customGlobalDirectives && typeof data.customGlobalDirectives === 'object') {
        this.customGlobalDirectives = { ...this.customGlobalDirectives, ...data.customGlobalDirectives };
      }
      if (data.customTopologies && typeof data.customTopologies === 'object') {
        this.customTopologies = { ...this.customTopologies, ...data.customTopologies };
      }
      if (data.seatCustomizations && typeof data.seatCustomizations === 'object') {
        this.seatCustomizations = { ...this.seatCustomizations, ...data.seatCustomizations };
      }
      if (data.activeScenarioKey) {
        this.activeScenarioKey = data.activeScenarioKey;
      }

      if (importSession && data.session && typeof data.session === 'object') {
        if (data.session.roundIndex) this.roundIndex = data.session.roundIndex;
        if (data.session.userCorePrompt) this.userCorePrompt = data.session.userCorePrompt;
        if (Array.isArray(data.session.transcript)) this.transcript = data.session.transcript;
        if (data.session.ledger && typeof data.session.ledger === 'object') {
          this.ledger = {
            agreements: Array.isArray(data.session.ledger.agreements) ? data.session.ledger.agreements : [],
            divergences: Array.isArray(data.session.ledger.divergences) ? data.session.ledger.divergences : [],
            openQuestions: Array.isArray(data.session.ledger.openQuestions) ? data.session.ledger.openQuestions : []
          };
        }
      }

      this.persistConfig();
      return {
        success: true,
        scenariosCount: Object.keys(this.customScenarios).length,
        personasCount: Object.keys(this.customPersonas).length,
        templatesCount: Object.keys(this.customPromptTemplates).length,
        transcriptTurns: this.transcript.length
      };
    } catch (err) {
      console.error('[SymposiumState] Import failed:', err);
      return { success: false, error: err.message };
    }
  }

  exportCategory(category) {
    let data = {};
    if (category === 'scenarios') data = this.customScenarios;
    else if (category === 'personas') data = this.customPersonas;
    else if (category === 'templates') data = this.customPromptTemplates;
    else if (category === 'directives') data = this.customGlobalDirectives;
    else if (category === 'topologies') data = this.customTopologies;
    return JSON.stringify({ category, data, exportedAt: Date.now() }, null, 2);
  }

  importCategory(category, jsonInput) {
    try {
      const parsed = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
      const data = parsed.data || parsed;
      if (category === 'scenarios' && typeof data === 'object') {
        this.customScenarios = { ...this.customScenarios, ...data };
      } else if (category === 'personas' && typeof data === 'object') {
        this.customPersonas = { ...this.customPersonas, ...data };
      } else if (category === 'templates' && typeof data === 'object') {
        this.customPromptTemplates = { ...this.customPromptTemplates, ...data };
      } else if (category === 'directives' && typeof data === 'object') {
        this.customGlobalDirectives = { ...this.customGlobalDirectives, ...data };
      } else if (category === 'topologies' && typeof data === 'object') {
        this.customTopologies = { ...this.customTopologies, ...data };
      }
      this.persistConfig();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  persistConfig() {
    try {
      const payload = {
        debateMode: this.debateMode,
        config: this.config,
        userParticipant: this.userParticipant,
        customPersonas: this.customPersonas,
        customScenarios: this.customScenarios,
        customPromptTemplates: this.customPromptTemplates,
        customGlobalDirectives: this.customGlobalDirectives,
        customTopologies: this.customTopologies,
        seatCustomizations: this.seatCustomizations,
        activeScenarioKey: this.activeScenarioKey,
        session: {
          roundIndex: this.roundIndex,
          userCorePrompt: this.userCorePrompt,
          transcript: this.transcript,
          ledger: this.ledger
        }
      };
      localStorage.setItem('omni_symposium_state_v2', JSON.stringify(payload));
    } catch (_) {}
  }

  loadPersistedConfig() {
    try {
      const raw = localStorage.getItem('omni_symposium_state_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.debateMode) this.debateMode = parsed.debateMode;
        if (parsed.config) Object.assign(this.config, parsed.config);
        if (parsed.userParticipant) Object.assign(this.userParticipant, parsed.userParticipant);
        if (parsed.customPersonas && typeof parsed.customPersonas === 'object') {
          this.customPersonas = parsed.customPersonas;
        }
        if (parsed.customScenarios && typeof parsed.customScenarios === 'object') {
          this.customScenarios = parsed.customScenarios;
        }
        if (parsed.customPromptTemplates && typeof parsed.customPromptTemplates === 'object') {
          this.customPromptTemplates = parsed.customPromptTemplates;
        }
        if (parsed.customGlobalDirectives && typeof parsed.customGlobalDirectives === 'object') {
          this.customGlobalDirectives = parsed.customGlobalDirectives;
        }
        if (parsed.customTopologies && typeof parsed.customTopologies === 'object') {
          this.customTopologies = parsed.customTopologies;
        }
        if (parsed.activeScenarioKey) {
          this.activeScenarioKey = parsed.activeScenarioKey;
        }
        if (parsed.seatCustomizations && typeof parsed.seatCustomizations === 'object') {
          this.seatCustomizations = parsed.seatCustomizations;
        }
        if (parsed.session && typeof parsed.session === 'object') {
          if (parsed.session.roundIndex) this.roundIndex = parsed.session.roundIndex;
          if (parsed.session.userCorePrompt) this.userCorePrompt = parsed.session.userCorePrompt;
          if (Array.isArray(parsed.session.transcript)) this.transcript = parsed.session.transcript;
          if (parsed.session.ledger && typeof parsed.session.ledger === 'object') {
            this.ledger = {
              agreements: Array.isArray(parsed.session.ledger.agreements) ? parsed.session.ledger.agreements : [],
              divergences: Array.isArray(parsed.session.ledger.divergences) ? parsed.session.ledger.divergences : [],
              openQuestions: Array.isArray(parsed.session.ledger.openQuestions) ? parsed.session.ledger.openQuestions : []
            };
          }
        }
      }
    } catch (_) {}
  }
}
