/**
 * OmniAI Hub — The Silk Symposium State & Persistence Engine
 * Manages symposium seats, active participants, user seating status,
 * chronological turn transcript, and milestone consensus ledger.
 */

export const COGNITIVE_PERSONAS = {
  architect: {
    id: 'architect',
    title: 'The Architect (معمار سیستم)',
    badge: '🏛️ Architecture',
    color: '#818cf8',
    directive: 'You are The Architect. Prioritize structural integrity, modularity, clean boundaries, scalability, and long-term maintainability. Scrutinize foundational architectural trade-offs.'
  },
  devils_advocate: {
    id: 'devils_advocate',
    title: "Devil's Advocate (وکیل مدافع شیطان)",
    badge: '⚔️ Adversary',
    color: '#f43f5e',
    directive: "You are the Devil's Advocate. Ruthlessly challenge consensus, hunt for hidden assumptions, attack vulnerabilities, expose fatal flaws, and propose catastrophic edge cases."
  },
  physicist: {
    id: 'physicist',
    title: 'First-Principles Physicist (دانشمند اصول اولیه)',
    badge: '⚛️ Axioms',
    color: '#38bdf8',
    directive: 'You are the First-Principles Physicist. Strip away conventions, buzzwords, and analogies. Break every premise down into immutable, fundamental axioms and build upwards strictly from verifiable truths.'
  },
  cynic: {
    id: 'cynic',
    title: 'Pragmatic Cynic (عمل‌گرای دیرباور)',
    badge: '🛠️ Pragmatism',
    color: '#fb923c',
    directive: 'You are the Pragmatic Cynic. Ground intellectual speculation in real-world engineering constraints, infrastructure costs, latency bounds, and human behavioral friction.'
  },
  synthesizer: {
    id: 'synthesizer',
    title: 'The Synthesizer (ترکیب‌گر و پیونددهنده)',
    badge: '👑 Synthesis',
    color: '#f59e0b',
    directive: 'You are The Synthesizer. Bridge diametrically opposed viewpoints, distill complementary insights from friction, and forge unified, higher-order consensus frameworks.'
  },
  innovator: {
    id: 'innovator',
    title: 'Visionary Innovator (نوآور تحول‌آفرین)',
    badge: '✨ Innovator',
    color: '#ec4899',
    directive: 'You are the Visionary Innovator. Transcend incremental improvements with bold, non-linear conceptual leaps, interdisciplinary lateral connections, and future-forward paradigms.'
  },
  empiricist: {
    id: 'empiricist',
    title: 'Empirical Scientist (تجربه‌گرای شواهد‌محور)',
    badge: '🔬 Empiricism',
    color: '#34d399',
    directive: 'You are the Empirical Scientist. Demand measurable criteria, reproducible validation, concrete test cases, and falsifiability over abstract theoretical intuition.'
  },
  ethicist: {
    id: 'ethicist',
    title: 'Ethicist & Humanist (فیلسوف اخلاق و انسان‌محور)',
    badge: '⚖️ Alignment',
    color: '#a78bfa',
    directive: 'You are the Ethicist. Rigorously examine human alignment, moral hazard, safety boundaries, societal impact, and long-term existential consequence.'
  },
  code_auditor: {
    id: 'code_auditor',
    title: 'Code Auditor & Security Critic (ممیز کد و امنیت)',
    badge: '🛡️ Security',
    color: '#10b981',
    directive: 'You are the Code Auditor & Security Critic. Scrutinize algorithm efficiency, concurrency locks, security exploits, memory leaks, and performance bottlenecks.'
  },
  socratic_inq: {
    id: 'socratic_inq',
    title: 'Socratic Inquirer (پرسشگر سقراطی)',
    badge: '❓ Dialectic',
    color: '#c084fc',
    directive: 'You are the Socratic Inquirer. Do not lecture; deconstruct peer claims by asking surgical, revelatory questions that expose underlying logical contradictions.'
  },
  strategist: {
    id: 'strategist',
    title: 'Product & Value Strategist (استراتژیست محصول)',
    badge: '📈 Strategy',
    color: '#fde047',
    directive: 'You are the Product Strategist. Focus on user adoption friction, product-market fit, unit economics, ROI, and real-world viability.'
  }
};

export const DEFAULT_DIALECTIC_TEMPLATE = `You are a seated intellectual chair in an ongoing symposium with fellow peer models and the human maestro.
YOUR ASSIGNED COGNITIVE ARCHETYPE:
{{speaker_role}}

THE CORE INQUIRY / CHALLENGE:
"""
{{user_core_prompt}}
"""

{{round_context_brief}}

MANDATE FOR THIS DELIBERATION TURN:
- Directly engage, stress-test, or build upon the specific points raised by peer participants before you.
- Embody your cognitive archetype with absolute intellectual density, eloquence, and analytical rigor.
- Formulate concrete solutions, precise counter-theses, or mathematical/logical justifications.
- Avoid pleasantries, polite conversational fillers, or boilerplate opening phrases.`;

export class SymposiumState {
  constructor() {
    this.sessionStatus = 'IDLE'; // 'IDLE' | 'ACTIVE' | 'PAUSED' | 'WAITING_FOR_USER'
    this.debateMode = 'socratic'; // 'manual' | 'round_robin' | 'socratic' | 'delphi' | 'autonomous'
    this.roundIndex = 1;
    this.userCorePrompt = '';
    this.activeSpeakerIndex = 0;
    this.isSpeakerStreaming = false;

    // Custom user-defined persona presets (Templates)
    this.customPersonas = {};

    // Per-card persistent customization cache (cardId -> CustomizationObject)
    this.seatCustomizations = {};

    // User's Dais participation model (Seated Participant vs External Observer)
    this.userParticipant = {
      isSeated: false,
      name: 'Human Maestro',
      personaKey: 'innovator',
      personaTitle: 'Visionary Architect (Human Maestro)',
      personaBadge: '👑 You',
      personaDirective: 'You are the Human Maestro and lead architect. Guide foundational direction, weigh competing arguments, and introduce human discernment.',
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
      globalDirective: '', // Global directive injected to all models
      autoSynthesizeOnFinish: true
    };

    this.loadPersistedConfig();
  }

  getAllPersonas() {
    return {
      ...COGNITIVE_PERSONAS,
      ...(this.customPersonas || {})
    };
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

      const assignedKey = personaKeys[idx % personaKeys.length] || 'architect';
      const persona = allPersonas[assignedKey] || COGNITIVE_PERSONAS.architect;

      return {
        id: `seat_ai_${card.id}`,
        isUser: false,
        cardId: card.id,
        name: card.title || card.name || 'AI Intelligence',
        color: card.color || '#c084fc',
        personaKey: assignedKey,
        personaTitle: persona.title,
        personaBadge: persona.badge,
        personaDirective: persona.directive,
        customPromptTemplate: '',
        isCustomized: false,
        weight: 100,
        status: 'idle', // 'idle' | 'speaking' | 'reflecting' | 'challenged' | 'muted'
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

    if (this.activeSpeakerIndex >= this.seats.length) {
      this.activeSpeakerIndex = 0;
    }

    return this.seats;
  }

  createUserSeatObject() {
    const persona = COGNITIVE_PERSONAS[this.userParticipant.personaKey] || COGNITIVE_PERSONAS.innovator;
    return {
      id: 'seat_user_maestro',
      isUser: true,
      cardId: null,
      name: this.userParticipant.name || 'You',
      color: this.userParticipant.color || '#f59e0b',
      personaKey: this.userParticipant.personaKey,
      personaTitle: this.userParticipant.personaTitle || persona.title,
      personaBadge: this.userParticipant.personaBadge || '👑 You',
      personaDirective: this.userParticipant.personaDirective || persona.directive,
      weight: this.userParticipant.weight || 120,
      status: 'idle',
      isMuted: false,
      turnCount: 0
    };
  }

  setUserParticipation(isSeated, customMeta = {}) {
    this.userParticipant.isSeated = Boolean(isSeated);
    if (customMeta.name) this.userParticipant.name = customMeta.name;
    if (customMeta.personaKey && COGNITIVE_PERSONAS[customMeta.personaKey]) {
      this.userParticipant.personaKey = customMeta.personaKey;
      this.userParticipant.personaTitle = COGNITIVE_PERSONAS[customMeta.personaKey].title;
      this.userParticipant.personaDirective = COGNITIVE_PERSONAS[customMeta.personaKey].directive;
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
    this.activeSpeakerIndex = 0;
    this.isSpeakerStreaming = false;
    this.transcript = [];
    this.ledger = {
      agreements: [],
      divergences: [],
      openQuestions: []
    };
    this.resetAllSeatStatuses();
  }

  persistConfig() {
    try {
      const payload = {
        debateMode: this.debateMode,
        config: this.config,
        userParticipant: this.userParticipant,
        customPersonas: this.customPersonas,
        seatCustomizations: this.seatCustomizations
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
        if (parsed.seatCustomizations && typeof parsed.seatCustomizations === 'object') {
          this.seatCustomizations = parsed.seatCustomizations;
        }
      }
    } catch (_) {}
  }
}
