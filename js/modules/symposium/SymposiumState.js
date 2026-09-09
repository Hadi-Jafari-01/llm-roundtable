/**
 * OmniAI Hub — The Silk Symposium State & Persistence Engine
 * Manages symposium seats, active participants, user seating status,
 * chronological turn transcript, and milestone consensus ledger.
 */

export const COGNITIVE_PERSONAS = {};

/* ── الگوهای متنوع و کامل فرمول‌های پرومپت (Turn-Injection Dialectic Templates) ── */
export const DIALECTIC_PROMPT_TEMPLATES = {
  classic: {
    id: 'classic',
    title: 'الگوی جامع و کلاسیک میزگرد (Standard Silk Dialectic)',
    description: 'قالب رسمی و متوازن برای گفتگوی فنی، ارزیابی نقادانه و حل مسئله',
    template: `شما یکی از اندیشمندان و نخبگان حاضر در میزگرد فکری و هم‌اندیشی زنده با سایر مدل‌های هوش مصنوعی و انسان استاد (Human Maestro) هستید.

هویت و آرکی‌تایپ فکری موظف شما:
{{speaker_role}}

پرسش بنیادین یا چالش اصلی مطرح‌شده:
"""
{{user_core_prompt}}
"""

{{round_context_brief}}

دستورالعمل برای این نوبت گفتگو:
۱. مستقیماً به استدلال یا ادعای سخنران قبلی ({{last_speaker_name}}) و سایر حاضران واکنش نشان داده و آن را بسنجید، تکمیل کرده یا نقد نمایید.
۲. شخصیت فکری خود را با غنای فکری، ادبیات دقیق و استدلال تحلیلی محکم به تصویر بکشید.
۳. راه‌حل‌های ملموس، نقدهای مستدل و چارچوب‌های عملی ارائه دهید.
۴. از هرگونه تعارفات، جملات تشریفاتی و مقدمه‌چینی پرهیز کرده و مستقیماً وارد تحلیل مغز مطلب شوید.`
  },
  socratic: {
    id: 'socratic',
    title: 'دیالکتیک سقراطی و تشکیک در بنیادها (Socratic Dialectic Formula)',
    description: 'تمرکز بر پرسشگری موشکافانه، کشف تناقضات و پالایش تعاریف',
    template: `شما در جایگاه کاوشگر سقراطی میزگرد قرار دارید.
شخصیت و نقش شناختی شما:
{{speaker_role}}

مسئله محوری:
"""
{{user_core_prompt}}
"""

خلاصه روند مناظره تا این لحظه:
{{round_context_brief}}

فرمان اختصاصی این نوبت (دیالکتیک سقراطی):
- ادعای اخیر سخنران قبلی ({{last_speaker_name}}) را کالبدشکافی کرده و فرضیه زیربناییِ پنهان در کلام او را استخراج کنید.
- با ۱ الی ۳ سوال اساسی و برهان خلف، تعاریف مبهم یا تناقضات گزاره‌های مطرح‌شده را به چالش بکشید.
- اگر نظریه جایگزینی دارید، آن را در قالب پرسش‌های هدایت‌کننده مطرح کنید.`
  },
  red_team: {
    id: 'red_team',
    title: 'نقد تهاجمی و کالبدشکافی باگ‌ها (Adversarial Red-Team Formula)',
    description: 'حمله صریح به سناریوهای شکست، آسیب‌پذیری‌ها و نقاط ضعف طرح',
    template: `شما عضو ارشد تیم قرمز و ممیز منتقد این جلسه هستید.
نقش و تخصص شما:
{{speaker_role}}

چالش پیش رو:
"""
{{user_core_prompt}}
"""

آخرین سخنان همتایان شما:
{{round_context_brief}}

ماموریت تهاجمی این نوبت:
۱. بدترین سناریوهای ممکن (Worst-Case Scenarios) و نقاط تکین شکست (Single Points of Failure) در پیشنهادهای قبلی را بیابید.
۲. نشان دهید در مقیاس بزرگ، تحت فشار بارهای ترافیکی یا شرایط غیرعادی، کجای این ایده فرو می‌ریزد.
۳. پادزهر و راه‌حل مقاوم‌سازی اختصاصی خود را ارائه دهید.`
  },
  adr_architecture: {
    id: 'adr_architecture',
    title: 'تصمیم‌گیری مهندسی و معماری (Architectural Decision Record - ADR)',
    description: 'قالب‌بندی استاندارد مهندسی شامل زمینه‌ها، تریدآف‌ها، پیامدها و تصمیم نهایی',
    template: `شما مهندس و معمار ارشد حاضر در جلسه تدوین ADR (Architectural Decision Record) هستید.
هویت فکری شما:
{{speaker_role}}

چالش معماری:
"""
{{user_core_prompt}}
"""

{{round_context_brief}}

فرمت خروجی مورد انتظار برای این نوبت:
- **تحلیل تریدآف (Trade-offs)**: ارزیابی سرعت vs حافظه، سادگی vs انعطاف‌پذیری.
- **نقد رویکرد قبلی**: ارزیابی صریح نظر {{last_speaker_name}}.
- **پیشنهاد فنی ملموس**: همراه با شبه‌کد، ساختار داده یا الگوهای طراحی مشخص.
- **اجماع پیشنهادی**: یک خط جمع‌بندی قاطع برای ورود به توافقات شورا.`
  },
  delphi_consensus: {
    id: 'delphi_consensus',
    title: 'همگرایی تدریجی دلفی و امتیازدهی (Delphi Consensus & Scoring)',
    description: 'ارزیابی احتمال موفقیت، امتیازدهی به ادعاها و نزدیک شدن به اجماع نهایی',
    template: `شما در یک پنل همگرایی روش دلفی (Delphi Method) شرکت دارید.
نقش تخصصی شما:
{{speaker_role}}

موضوع شورا:
"""
{{user_core_prompt}}
"""

سوابق نظرات:
{{round_context_brief}}

دستورالعمل دلفی برای این دور:
۱. به نظرات قبلی از ۰ تا ۱۰۰ یک امتیاز انطباق فنی بدهید و دلیل امتیاز خود را در یک جمله بگویید.
۲. مواردی را که حاضران روی آن توافق دارند تایید کنید.
۳. مهم‌ترین گره باقیمانده را نام ببرید و پیشنهاد مشخص خود را برای حل آن مطرح کنید.`
  },
  executive_digest: {
    id: 'executive_digest',
    title: 'چکیده اجرایی فشرده و بدون گزافه‌گویی (Concise Executive Digest)',
    description: 'حداکثر ۳ تا ۴ نکته ملموس و سریع، مناسب تصمیم‌گیری‌های پرسرعت',
    template: `شما مشاور ارشد اجرایی هستید. وقت شورا بسیار ارزشمند است.
هویت شما: {{speaker_role}}
چالش: """{{user_core_prompt}}"""
سابقه: {{round_context_brief}}

دستور این نوبت:
- در حداکثر ۳ یا ۴ بند کوتاه و نقطه‌ای (Bullet points) پاسخ دهید.
- هیچ‌گونه مقدمه، تشکر یا جمله کلیشه‌ای ننویسید.
- روی اقدام عملی فوری (Actionable Next Steps) تمرکز کنید.`
  },
  first_principles: {
    id: 'first_principles',
    title: 'استدلال صوری و اثبات از اصول اولیه (First-Principles Deduction)',
    description: 'تفکیک به اصول غیرقابل انکار ریاضی/فیزیکی و استنتاج گام‌به‌گام',
    template: `شما فیلسوف علم و دانشمند اصول اولیه هستید.
دیدگاه شما: {{speaker_role}}
مسئله: """{{user_core_prompt}}"""
تاریخچه: {{round_context_brief}}

وظیفه این دور:
۱. ادعاهای قبلی را به اصول پایه فیزیکی، ریاضی یا منطقی تجزیه کنید.
۲. نشان دهید کدام بخش از ادعاها بر پایه عادت یا فرض بدون اثبات است.
۳. قضیه خود را گام‌به‌گام از یک اصل موضوعه متیقن اثبات نمایید.`
  },
  manual_conductor: {
    id: 'manual_conductor',
    title: 'استنطاق دستی زیر نظر استاد (Manual Maestro Inquest)',
    description: 'تنظیم‌شده اختصاصی برای نوبت‌دهی دستی و پاسخگویی به اراده و سوالات دقیق کاربر',
    template: `شما در جلسه محاکات و هم‌اندیشی دستی به ریاست استاد انسان (Human Maestro) حضور دارید. هم‌اکنون عصای نوبت (Baton) به شما واگذار شده است.

هویت و تخصص شما:
{{speaker_role}}

موضوع محوری میزگرد:
"""
{{user_core_prompt}}
"""

وضعیت مذاکرات تا این لحظه:
{{round_context_brief}}

فرمان استاد برای این نوبت:
- با تکیه بر تخصص خود، دقیق‌ترین و مستدل‌ترین پاسخ را به پرسش یا نوبت داده‌شده ارائه نمایید.
- سخنان سخنرانان قبلی را بررسی و بر اساس اصول خود تایید یا رد کنید.
- پایان سخن خود را با یک پیشنهاد مشخص برای نوبت بعدی همراه نمایید.`
  }
};

export const DEFAULT_DIALECTIC_TEMPLATE = DIALECTIC_PROMPT_TEMPLATES.classic.template;

/* ── الگوهای آماده برای دستور کلی شورا (Global Directive Presets) ── */
export const GLOBAL_DIRECTIVE_PRESETS = {
  persian_academic: {
    id: 'persian_academic',
    title: 'فارسی فاخر، آکادمیک و دقیق',
    directive: 'کلیه پاسخ‌ها را به زبان فارسی فصیح، ادبیات تخصصی و دانشگاهی، کاملاً ساختاریافته و با پرهیز کامل از تعارفات یا اصطلاحات کوچه بازاری ارائه نمایید.'
  },
  deep_technical_code: {
    id: 'deep_technical_code',
    title: 'مهندسی فنی عمیق همراه با کد و تحلیل پیچیدگی',
    directive: 'هر فرضیه را با ارائه تکه کدهای اجرایی، تحلیل پیچیدگی زمانی/فضایی (Big-O)، معماری داده‌ها و ارزیابی تریدآف‌های واقعی مهندسی پشتیبانی کنید.'
  },
  step_by_step_cot: {
    id: 'step_by_step_cot',
    title: 'استدلال زنجیره‌ای گام‌به‌گام (Chain of Thought)',
    directive: 'پاسخ‌های خود را مرحله‌به‌مرحله و استدلالی تدوین کنید. ارتباط علّی و معلولی میان هر بخش را شفاف سازید و از پرش‌های منطقی پرهیز کنید.'
  },
  first_principles: {
    id: 'first_principles',
    title: 'اصول اولیه و دوری از تشبیه‌های گمراه‌کننده',
    directive: 'تنها از اصول موضوعه اثبات‌شده و قوانین تخطی‌ناپذیر منطقی، فیزیکی و ریاضی حرکت کنید. تشبیهات سطحی و عرف‌های بی‌پایه را نادیده بگیرید.'
  },
  steelmanning: {
    id: 'steelmanning',
    title: 'بازتعریف منصفانه استدلال همتا (Steelmanning)',
    directive: 'پیش از هرگونه نقد، ابتدا قوی‌ترین، عادلانه‌ترین و هوشمندانه‌ترین نسخه از استدلال سخنران قبلی را بازگویی کنید؛ سپس نقطه ضعف قطعی آن را نشان دهید.'
  },
  zero_fluff_bullets: {
    id: 'zero_fluff_bullets',
    title: 'پاسخ‌های فوق‌فشرده و گلوله‌نقطه‌ای بدون تشریفات',
    directive: 'پاسخ‌ها را در قالب حداکثر ۳ الی ۵ بند گلوله‌نقطه‌ای فشرده و کوبنده بیان کنید. هیچ‌گونه کلمه حاشیه‌ای یا تکرار مکررات پذیرفته نیست.'
  },
  risk_matrix: {
    id: 'risk_matrix',
    title: 'ماتریس تحلیل ریسک و نقاط شکست منفرد',
    directive: 'در هر ادعا، یک جدول یا ماتریس ذهنی شامل شدت ریسک، احتمال وقوع، اثرات جانبی و راهکار کاهش ریسک (Mitigation) را ارزیابی و گزارش نمایید.'
  }
};

/* ── الگوهای نقش و جایگاه کاربر (User Maestro Role Presets) ── */
export const USER_ROLE_PRESETS = {
  maestro: {
    id: 'maestro',
    title: 'رهبر ارکستر و معمار ارشد (Lead Architect & Maestro)',
    badge: '👑 Maestro',
    directive: 'شما رهبر ارکستر فکری و معمار ارشد این جلسه هستید. وظیفه شما هدایت کلان، جمع‌بندی تریدآف‌ها، وارد کردن خرد انسانی و تعیین اولویت‌های استراتژیک است.'
  },
  magistrate: {
    id: 'magistrate',
    title: 'داور بی‌طرف و قاضی شورا (Chief Magistrate)',
    badge: '⚖️ Judge',
    directive: 'شما داور بی‌طرف شورا هستید. مستندات طرفین را بی‌طرفانه وزن‌کشی می‌کنید، مغالطات را اخطار می‌دهید و رأی نهایی را صادر می‌نمایید.'
  },
  inquisitor: {
    id: 'inquisitor',
    title: 'بازپرس منتقد و به چالش‌کشنده (Chief Inquisitor)',
    badge: '⚔️ Inquisitor',
    directive: 'شما پرسشگر منتقد جلسه هستید. سخنان هر مدل را با سناریوهای دشوار می‌سنجید و به هیچ پاسخ آسان یا کلیشه‌ای رضایت نمی‌دهید.'
  },
  product_owner: {
    id: 'product_owner',
    title: 'نماینده کاربر نهایی و بازار (Product Owner)',
    badge: '🎯 Product',
    directive: 'شما وکیل و نماینده مشتری نهایی هستید. پیچیدگی‌های فنی را با فیلتر سادگی، تجربه واقعی کاربر و ارزش عملیاتی می‌سنجید.'
  },
  angel_investor: {
    id: 'angel_investor',
    title: 'سرمایه‌گذار ریسک‌پذیر و تحلیل‌گر ارزش (Venture Capitalist)',
    badge: '💼 Investor',
    directive: 'شما سرمایه‌گذار ریسک‌پذیر هستید. روی اندازه بازار، خندق دفاعی (Moat)، بازگشت سرمایه و امکان‌پذیری مقیاس‌گیری تمرکز دارید.'
  },
  silent_conductor: {
    id: 'silent_conductor',
    title: 'ناظر بالینی و نوبت‌دهنده آرام (Silent Conductor)',
    badge: '🪄 Conductor',
    directive: 'شما ناظر بی‌طرف جلسه هستید و صرفاً با نوبت‌دهی دستی و انتقال عصای گفتگو، جریان دیالکتیک میان هوش‌ها را تنظیم می‌کنید.'
  }
};

/* ── مخزن سناریوهای جامع (ایجاد و مدیریت توسط خود کاربر) ── */
export const SYMPOSIUM_SCENARIOS = {};

export class SymposiumState {
  constructor() {
    this.sessionStatus = 'IDLE'; // 'IDLE' | 'ACTIVE' | 'PAUSED' | 'WAITING_FOR_USER' | 'WAITING_FOR_MAESTRO'
    this.debateMode = 'manual'; // Default to manual conductor for total user control
    this.roundIndex = 1;
    this.userCorePrompt = '';
    this.activeSpeakerIndex = 0;
    this.recommendedNextSpeakerIndex = 0;
    this.isSpeakerStreaming = false;
    this.activeScenarioKey = '';

    // Custom user-defined persona presets (Templates)
    this.customPersonas = {};

    // Custom user-defined scenarios
    this.customScenarios = {};

    // Per-card persistent customization cache (cardId -> CustomizationObject)
    this.seatCustomizations = {};

    // User's Dais participation model (Seated Participant vs External Observer)
    this.userParticipant = {
      isSeated: false,
      name: 'Human Maestro',
      personaKey: 'maestro',
      personaTitle: 'Lead Architect & Maestro (رهبر ارکستر و معمار ارشد)',
      personaBadge: '👑 Maestro',
      personaDirective: USER_ROLE_PRESETS.maestro ? USER_ROLE_PRESETS.maestro.directive : '',
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
      promptTemplate: DIALECTIC_PROMPT_TEMPLATES.manual_conductor.template,
      activeTemplateKey: 'manual_conductor',
      globalDirective: GLOBAL_DIRECTIVE_PRESETS.persian_academic.directive,
      activeGlobalDirectiveKey: 'persian_academic',
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

  getPromptTemplates() {
    return { ...DIALECTIC_PROMPT_TEMPLATES };
  }

  getGlobalDirectivePresets() {
    return { ...GLOBAL_DIRECTIVE_PRESETS };
  }

  getUserRolePresets() {
    return { ...USER_ROLE_PRESETS };
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

    if (scenario.templateKey && DIALECTIC_PROMPT_TEMPLATES[scenario.templateKey]) {
      this.config.promptTemplate = DIALECTIC_PROMPT_TEMPLATES[scenario.templateKey].template;
      this.config.activeTemplateKey = scenario.templateKey;
    }

    if (scenario.globalDirectiveKey && GLOBAL_DIRECTIVE_PRESETS[scenario.globalDirectiveKey]) {
      this.config.globalDirective = GLOBAL_DIRECTIVE_PRESETS[scenario.globalDirectiveKey].directive;
      this.config.activeGlobalDirectiveKey = scenario.globalDirectiveKey;
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
    const tpl = DIALECTIC_PROMPT_TEMPLATES[templateKey];
    if (!tpl) return false;
    this.config.promptTemplate = tpl.template;
    this.config.activeTemplateKey = templateKey;
    this.persistConfig();
    return true;
  }

  applyGlobalDirectivePreset(presetKey) {
    const preset = GLOBAL_DIRECTIVE_PRESETS[presetKey];
    if (!preset) return false;
    this.config.globalDirective = preset.directive;
    this.config.activeGlobalDirectiveKey = presetKey;
    this.persistConfig();
    return true;
  }

  applyUserRolePreset(roleKey) {
    const preset = USER_ROLE_PRESETS[roleKey];
    if (!preset) return false;
    this.userParticipant.personaKey = roleKey;
    this.userParticipant.personaTitle = preset.title;
    this.userParticipant.personaBadge = preset.badge;
    this.userParticipant.personaDirective = preset.directive;

    const userSeat = this.seats.find(s => s.isUser);
    if (userSeat) {
      userSeat.personaKey = roleKey;
      userSeat.personaTitle = preset.title;
      userSeat.personaBadge = preset.badge;
      userSeat.personaDirective = preset.directive;
    }

    this.persistConfig();
    return true;
  }

  calculateRecommendedNextSpeaker() {
    const { seats, activeSpeakerIndex, debateMode } = this;
    const count = seats.length;
    if (count === 0) return 0;

    switch (debateMode) {
      case 'socratic': {
        const lastSpeaker = seats[activeSpeakerIndex];
        let candidateIdx = -1;

        if (lastSpeaker?.personaKey === 'architect' || lastSpeaker?.personaKey === 'empiricist') {
          candidateIdx = seats.findIndex(s => s.personaKey === 'devils_advocate' && !s.isMuted);
        } else if (lastSpeaker?.personaKey === 'devils_advocate') {
          candidateIdx = seats.findIndex(s => s.personaKey === 'synthesizer' && !s.isMuted);
        } else if (lastSpeaker?.personaKey === 'innovator') {
          candidateIdx = seats.findIndex(s => s.personaKey === 'cynic' && !s.isMuted);
        } else if (lastSpeaker?.personaKey === 'cynic') {
          candidateIdx = seats.findIndex(s => s.personaKey === 'physicist' && !s.isMuted);
        }

        if (candidateIdx === -1 || candidateIdx === activeSpeakerIndex) {
          candidateIdx = (activeSpeakerIndex + 1) % count;
          while (seats[candidateIdx]?.isMuted && candidateIdx !== activeSpeakerIndex) {
            candidateIdx = (candidateIdx + 1) % count;
          }
        }
        return candidateIdx >= 0 ? candidateIdx : 0;
      }

      case 'round_robin':
      case 'delphi':
      case 'manual':
      case 'autonomous':
      default: {
        let next = (activeSpeakerIndex + 1) % count;
        let checked = 0;
        while (seats[next]?.isMuted && checked < count) {
          next = (next + 1) % count;
          checked++;
        }
        return next;
      }
    }
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

      const assignedKey = personaKeys.length > 0 ? personaKeys[idx % personaKeys.length] : null;
      const persona = assignedKey ? allPersonas[assignedKey] : null;

      return {
        id: `seat_ai_${card.id}`,
        isUser: false,
        cardId: card.id,
        name: card.title || card.name || 'AI Intelligence',
        color: card.color || '#c084fc',
        personaKey: assignedKey || 'custom',
        personaTitle: persona?.title || (card.title || card.name || 'AI Intelligence'),
        personaBadge: persona?.badge || '🤖 AI',
        personaDirective: persona?.directive || '',
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
        customScenarios: this.customScenarios,
        seatCustomizations: this.seatCustomizations,
        activeScenarioKey: this.activeScenarioKey
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
        if (parsed.activeScenarioKey) {
          this.activeScenarioKey = parsed.activeScenarioKey;
        }
        if (parsed.seatCustomizations && typeof parsed.seatCustomizations === 'object') {
          this.seatCustomizations = parsed.seatCustomizations;
        }
      }
    } catch (_) {}
  }
}
