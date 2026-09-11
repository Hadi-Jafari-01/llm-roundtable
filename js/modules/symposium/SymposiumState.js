/**
 * OmniAI Hub — The Silk Symposium State & Persistence Engine
 * Manages symposium seats, active participants, user seating status,
 * chronological turn transcript, milestone consensus ledger,
 * and multi-session roundtable history.
 */

/* ── ۱. مخزن تمپلیت‌های متدولوژی مناظره (Methodology Templates) ── */
export const FACTORY_METHODOLOGIES = {
  hegelian_triad: {
    id: 'hegelian_triad',
    title: 'سه‌گانه دیالکتیک هگلی (Hegelian Triad: Thesis-Antithesis-Synthesis)',
    description: 'گردش دورها به گونه‌ای است که مدل اول تز (Thesis) را طرح می‌کند، مدل دوم موظف به خلق قوی‌ترین آنتی‌تز (Antithesis) است، و مدل سوم یا رئیس موظف به استخراج سنتز (Synthesis) و رفع تناقض است.',
    badge: '⚖️ هگل',
    color: '#8b5cf6',
    stepSequence: ['thesis', 'antithesis', 'synthesis'],
    stepInstructions: {
      thesis: 'شما در مقام واضع «تز بنیادین (Thesis)» موظفید روشن‌ترین، مستدل‌ترین و جسورانه‌ترین گزاره را پیرامون مسئله طرح نمایید.',
      antithesis: 'شما در مقام طراح «آنتی‌تز رادیکال (Antithesis)» موظفید تناقضات درونی، نقاط شکست و فرضیات غیرقابل اثبات تز سخنران قبلی را آشکار ساخته و موضع مقابل را مستقر کنید.',
      synthesis: 'شما در مقام «معمار سنتز دیالکتیکی (Synthesis)» موظفید فراتر از تقابل دو موضع قبلی رفته، هسته حقیقی هر دو را حفظ و در یک نظریه/راهکار متعالی‌تر یکپارچه سازید.'
    },
    template: `{{speaker_role}}

شما در متدولوژی دیالکتیک هگلی (دور {{round_number}}) در جایگاه ویژه زیر قرار دارید:
[مأموریت این نوبت شما]:
{{methodology_mandate}}

مسئله محوری شورا:
"""
{{user_core_prompt}}
"""

موضع پیشین مطرح‌شده توسط {{last_speaker_name}}:
"""
{{last_speaker_argument}}
"""

سوابق دیالکتیکی ادوار قبل:
{{round_context_brief}}

دستورالعمل اجرایی:
۱. از تعارفات کلامی بپرهیزید و بی‌درنگ وارد استدلال شوید.
۲. با تمام قوا مأموریت هگلی انتسابی به خود را محقق کنید.
۳. در پایان یک گزاره برای ثبت در دفتر اجماع ارائه دهید.`
  },

  popperian_falsification: {
    id: 'popperian_falsification',
    title: 'دادگاه ابطال‌پذیری کارل پوپر (Popperian Falsification Agora)',
    description: 'هیچ نظری معتبر دانسته نمی‌شود مگر آنکه بی‌رحمانه‌ترین سناریوهای شکست، موارد نقض (Edge Cases) و آزمون‌های تجربی سخت بر آن تحمیل شده و تاب آورده باشد.',
    badge: '🔨 پوپر',
    color: '#ef4444',
    stepSequence: ['conjecture', 'falsification_attack', 'corroboration'],
    stepInstructions: {
      conjecture: 'یک حدس علمی و فرضیه شجاعانه (Bold Conjecture) با قابلیت آزمون‌پذیری تجربی و پیش‌بینی‌پذیر ارائه دهید.',
      falsification_attack: 'به عنوان مدعی‌العموم ابطال‌پذیری، سناریوی دقیق شکست، یک مورد نقض تجربی (Counter-example) یا باگ پنهان فرضیه قبلی را اثبات کنید.',
      corroboration: 'در برابر آزمون ابطال مقاومت کنید؛ نشان دهید فرضیه در چه شرایط تحدیدشده‌ای همچنان صادق است یا آن را اصلاح بنیادین کنید.'
    },
    template: `{{speaker_role}}

شما در دادگاه سنجش ابطال‌پذیری کارل پوپر (دور {{round_number}}) حضور دارید.
[مأموریت فلسفی این نوبت]:
{{methodology_mandate}}

مسئله یا گزاره تحت داوری:
"""
{{user_core_prompt}}
"""

آخرین موضع مطرح‌شده توسط {{last_speaker_name}}:
"""
{{last_speaker_argument}}
"""

سوابق آزمون‌های پیشین:
{{round_context_brief}}

احکام الزامی:
- گزاره‌های توتولوژیک (همگوان)، غیرقابل ابطال یا مبهم مردود هستند.
- صریحاً مشخص کنید چه مشاهده یا داده‌ای می‌تواند نظریه شما یا همکارتان را کاملاً ابطال نماید.`
  },

  delphi_convergence: {
    id: 'delphi_convergence',
    title: 'همگرایی و تعدیل تدریجی دلفی (Delphi Strategic Convergence)',
    description: 'نوبت‌گردان نظرات چندگانه را جمع‌آوری، نقاط پراکندگی را استخراج و در هر دور از اعضا می‌خواهد با دلایل ریاضی و منطقی مواضع خود را به سمت راهکار نهایی تعدیل کنند.',
    badge: '🎯 دلفی',
    color: '#10a37f',
    stepSequence: ['variance_mapping', 'rational_adjustment', 'consensus_crystallization'],
    stepInstructions: {
      variance_mapping: 'نقشه‌برداری از ابعاد پراکندگی و سناریوهای متباعد با برآورد احتمالات و ضریب اطمینان.',
      rational_adjustment: 'بررسی ادله همکاران و تعدیل معقول مواضع خود بر پایه داده‌های متقن‌تر و رفع تعصبات فکری.',
      consensus_crystallization: 'تبلور اجماع استراتژیک، یکپارچه‌سازی متغیرها در فرمول نهایی و حذف ابهامات باقیمانده.'
    },
    template: `{{speaker_role}}

شما در فرآیند همگرایی استراتژیک دلفی (دور {{round_number}}) شرکت دارید.
[مأموریت این گام]:
{{methodology_mandate}}

مسئله بنیادین مورد مذاکره:
"""
{{user_core_prompt}}
"""

وضعیت نقاط توافق و شکاف‌ها:
توافقات: {{consensus_agreements}}
شکاف‌ها: {{consensus_gaps}}

آخرین موضع:
{{last_speaker_name}}: """{{last_speaker_argument}}"""

دستورالعمل:
فاصله میان دیدگاه خود و دیگران را بسنجید و با رویکردی عقلانی و داده‌محور، یک گام مشخص به سمت همگرایی و اجماع بردارید.`
  },

  red_blue_adversarial: {
    id: 'red_blue_adversarial',
    title: 'شبیه‌سازی اتاق جنگ تیم سرخ / تیم آبی (Red Team / Blue Team Adversarial)',
    description: 'یک جبهه به عنوان طراح استراتژی/کد/معماری و جبهه دیگر به عنوان مهاجم خستگی‌ناپذیر برای کشف حفره‌های امنیتی، استدلالی یا اجرایی.',
    badge: '⚔️ اتاق جنگ',
    color: '#f59e0b',
    stepSequence: ['blue_defense', 'red_attack', 'purple_hardening'],
    stepInstructions: {
      blue_defense: 'تیم آبی (Blue Team): ارائه معماری مستحکم، نقشه عملیاتی جامع و اقدامات حفاظتی/مهندسی.',
      red_attack: 'تیم سرخ (Red Team): نقش مهاجم متخاصم؛ کشف بردار نفوذ، سناریوی بحران، آسیب‌پذیری بحرانی یا فلج سیستم.',
      purple_hardening: 'تیم بنفش (Purple Team): رفع رخنه کشف‌شده، ایمن‌سازی راهکار و ارتقای استاندارد معماری دفاعی.'
    },
    template: `{{speaker_role}}

شما در محیط شبیه‌سازی اتاق جنگ استراتژیک (دور {{round_number}}) مستقرید.
[نقش و مأموریت تاکتیکی این نوبت]:
{{methodology_mandate}}

صورت مسئله و هدف عملیات:
"""
{{user_core_prompt}}
"""

آخرین اقدام حریف ({{last_speaker_name}}):
"""
{{last_speaker_argument}}
"""

دستور عملیاتی:
بدون تعارفات دیپلماتیک، حمله یا دفاع فنی خود را با ارقام، شواهد یا کدهای دقیق به خط بیاورید.`
  },

  socratic_elenchus: {
    id: 'socratic_elenchus',
    title: 'بازجویی و مامایی سقراطی (Socratic Elenctic Interrogation)',
    description: 'نوبت‌گردان گزاره‌های قطعی را با پرسش‌های خردکننده پیرامون پیش‌فرض‌های تعریف‌نشده (Unstated Assumptions) به چالش می‌کشد تا جهل مرکب را آشکار و تعاریف را پالایش کند.',
    badge: '🏛️ سقراط',
    color: '#06b6d4',
    stepSequence: ['definition_claim', 'elenchus_probe', 'aporia_maieutics'],
    stepInstructions: {
      definition_claim: 'تعریف دقیق و منقح از ماهیت پدیده مورد بحث با تعیین دقیق جنس و فصل منطقی.',
      elenchus_probe: 'استیضاح سقراطی: پرسیدن سوالاتی که نشان دهد تعریف فوق در فلان حالت خاص منجر به تناقض آشکار می‌شود.',
      aporia_maieutics: 'مامایی معنا از دل حیرت (Aporia): پی‌ریزی تعریفی عمیق‌تر که تناقض آشکارشده را مرتفع سازد.'
    },
    template: `{{speaker_role}}

شما در محفل استیضاح دیالکتیکی سقراط (دور {{round_number}}) حضور یافته‌اید.
[فرمان سقراطی برای این نوبت]:
{{methodology_mandate}}

موضوع پژوهش:
"""
{{user_core_prompt}}
"""

مدعای {{last_speaker_name}}:
"""
{{last_speaker_argument}}
"""

احکام:
۱. پیش‌فرض‌های ناگفته را کالبدشکافی کنید.
۲. با طرح یک مثال نقض یا تناقض منطقی، استحکام مدعا را به آزمایش بگذارید.
۳. در پایان یک پرسش اساسی طرح نمایید.`
  },

  first_principles: {
    id: 'first_principles',
    title: 'کالبدشکافی از اصول اولیه فیزیک و ایلان ماسک (First-Principles Axiomatic Audit)',
    description: 'ممنوعیت مطلق استناد به عرف یا تجربه دیگران؛ شکستن مسئله به بنیادی‌ترین حقایق غیرقابل انکار و بازسازی راهکار از نقطه صفر.',
    badge: '⚛️ اصول اول',
    color: '#3b82f6',
    stepSequence: ['axiomatic_deconstruction', 'ground_zero_reconstruction', 'limit_optimization'],
    stepInstructions: {
      axiomatic_deconstruction: 'تجزیه کامل مسئله به قوانین پایه‌ای فیزیک، ریاضیات یا حقایق بدیهی و کنار گذاشتن روال‌های متداول.',
      ground_zero_reconstruction: 'بازسازی راهکار از نقطه صفر صرفاً بر پایه حقایق اولیه اثبات‌شده، فارغ از عرف بازار یا پیشینیان.',
      limit_optimization: 'بهینه‌سازی برداری تا رسیدن به حد نهایی فیزیکی/ترمودینامیکی مسئله.'
    },
    template: `{{speaker_role}}

شما در اتاق ممیزی از اصول اولیه (First Principles - دور {{round_number}}) نشسته‌اید.
[مأموریت این گام]:
{{methodology_mandate}}

مسئله محوری:
"""
{{user_core_prompt}}
"""

موضع مطرح‌شده:
{{last_speaker_name}}: """{{last_speaker_argument}}"""

قوانین قطعی:
- استدلال از روی قیاس (Reasoning by Analogy) یا تکیه بر «معمولاً اینطور انجام می‌شود» اکیداً باطل است.
- فقط بر حقایق بنیادین تکیه کنید و محاسبات اولیه خود را شفاف نشان دهید.`
  }
};

/* ── ۲. مخزن تمپلیت‌های نقش‌های کابینه نظارت و مدیریت (Governance Roles) ── */
export const FACTORY_GOVERNANCE_ROLES = {
  user_advisor: {
    id: 'user_advisor',
    title: 'مشاور اختصاصی و پاسخگوی کاربر (Personal Advisor & Roundtable Oracle)',
    description: 'پاسخگویی مستقیم، تحلیلی و جامع به پرسش‌ها و مشورت‌های کاربر انسان با تسلط کامل بر تمام مذاکرات، ادوار و استدلال‌های میزگرد.',
    badge: '💡 مشاور من',
    color: '#38bdf8',
    defaultTrigger: 'manual_call',
    isDirectAnswer: true,
    systemPrompt: `شما «مشاور اختصاصی، دستیار امین و پاسخگوی وفادار کاربر انسان (استاد انسان / Human Maestro)» در این میزگرد نخبگانی هستید.
وظیفه انحصاری شما این است که به پرسش‌ها، ابهامات، مشورت‌ها و درخواست‌های کاربر به کامل‌ترین، عمیق‌ترین و بهترین شکل ممکن پاسخ دهید.

احکام راهبردی شما:
۱. اشراف کامل بر میزگرد: در پاسخ به پرسش کاربر، تمام استدلال‌ها، داده‌ها، توافقات، تضادها و کدهای مطرح‌شده توسط مدل‌های دیگر را به عنوان کانتکست و پیش‌زمینه تحلیل در نظر بگیرید.
۲. موضع‌گیری مستقل و خیرخواهانه برای کاربر: اگر مدل‌ها اشتباه کرده‌اند صریحاً به کاربر بگویید؛ اگر نکته پنهانی هست که کاربر باید بداند آشکار کنید؛ بهترین پیشنهاد یا راه‌حل را مستقیماً به کاربر ارائه دهید.
۳. پاسخ مستقیم و طبیعی: پاسخ را مستقیماً، ساختاریافته، شفاف، مستدل و بدون قالب‌های کلیشه‌ای بنویسید (نیاز به زدن تیترهای تحمیلی مانند توافقات قطعی یا شکاف‌ها نیست مگر آنکه خود کاربر خواسته باشد).`
  },

  consensus_notary: {
    id: 'consensus_notary',
    title: 'منشی دیوان و سنترالایزر اجماع (Consensus Notary & Ledger Keeper)',
    description: 'پس از هر پیام یا دور، متن را کالبدشکافی کرده و بدون اظهار نظر شخصی، گزاره‌های توافق‌شده قطعی، شکاف‌های لاینحل، و سوالات باز را تفکیک و در Ledger ثبت می‌کند.',
    badge: '📜 منشی اجماع',
    color: '#10a37f',
    defaultTrigger: 'every_turn',
    systemPrompt: `شما «منشی دیوان و ناظر بی‌طرف اجماع شورا» هستید.
وظیفه شما کالبدشکافی آخرین پیام و استخراج قطعی ۳ ستون دفتر اجماع است.
اکیداً الزامی است که پاسخ شما دقیقاً شامل هر ۳ بخش زیر باشد (هیچ بخشی را حذف نکرده و آنها را در یک سطر به هم نچسبانید):

[توافقات قطعی]
- (یک گزاره کوتاه و صریح از نکات مورد تفاهم عقلانی طرفین یا اصول مشترک پذیرفته‌شده)

[شکاف‌های لاینحل]
- (نقاط تعارض بنیادین، ریسک‌های پنهان، خطاهای سیستمی، ابهامات حقوقی/اخلاقی و گره‌های حل‌نشده میان دیدگاه‌ها)

[پرسش‌های پیش‌برنده]
- (یک پرسش استراتژیک و عمیق که بن‌بست فعلی را به چالش کشیده و مسیر حل مسئله را باز کند)`
  },

  fallacy_watchdog: {
    id: 'fallacy_watchdog',
    title: 'دیده‌بان مغالطات منطقی و سوگیری شناختی (Logical Fallacy & Bias Watchdog)',
    description: 'استدلال‌ها را از منظر مغالطات مشهور رصد کرده و در صورت کشف تخلف، آن را به عنوان شکاف و چالش لاینحل ثبت می‌کند.',
    badge: '🛡️ دیده‌بان مغالطه',
    color: '#f59e0b',
    defaultTrigger: 'every_turn',
    systemPrompt: `شما «دیده‌بان عالی سلامت منطقی و مغالطه‌سنج شورا» هستید.
وظیفه: اسکن آخرین پیام برای کشف مغالطات (مانند مغالطه پهلوان‌پنبه، دور باطل، انحراف بحث، دوگانه کاذب، تعمیم شتاب‌زده و علت جعلی).

خروجی الزامی:
[توافقات قطعی]
- (اعتبار صوری و بخش‌های منطقاً معتبر استدلال)

[شکاف‌های لاینحل]
- (مغالطات شناسایی‌شده، تناقضات درونی و نقاط سستی منطقی به عنوان چالش اساسی)

[پرسش‌های پیش‌برنده]
- (پرسشی که گوینده را مجبور به رفع مغالطه و اثبات ادعا می‌کند)`
  },

  fact_auditor: {
    id: 'fact_auditor',
    title: 'مفتش واقعیت و راستی‌آزمای فکت‌ها (Empirical Fact & Reality Auditor)',
    description: 'ادعاهای آماری، توابع کد، نام کتابخانه‌ها و ارقام را راستی‌آزمایی کرده و داده‌های مشکوک را در ستون شکاف‌ها ثبت می‌کند.',
    badge: '🔍 راستی‌آزمای فکت',
    color: '#0ea5e9',
    defaultTrigger: 'every_turn',
    systemPrompt: `شما «مفتش ارشد فکت‌ها و راستی‌آزمای تجربی شورا» هستید.
وظیفه: راستی‌آزمایی هرگونه ادعای تجربی، نام کتابخانه، توابع کد، آمار و رخداد تاریخی در پیام اخیر.

خروجی الزامی:
[توافقات قطعی]
- (فکت‌ها و داده‌های معتبر و صحیح)

[شکاف‌های لاینحل]
- (ادعاهای مشکوک، نادرست، توهم‌آمیز یا بدون مبنای تجربی)

[پرسش‌های پیش‌برنده]
- (درخواست رفرنس، مستندات رسمی یا تست بنچ‌مارک برای اثبات ادعا)`
  },

  dialectic_arbitrator: {
    id: 'dialectic_arbitrator',
    title: 'حَکَم صلح و تنش‌زدایی شناختی (Dialectic Arbitrator & Tension Calibrator)',
    description: 'هرگاه مناظره به تکرار بی‌حاصل، جدال کلامی یا انسداد برسد، مداخله کرده و چارچوب را با تغییر سوال یا شکستن بن‌بست بازآرایی می‌کند.',
    badge: '⚖️ حَکَم دیالکتیک',
    color: '#8b5cf6',
    defaultTrigger: 'on_divergence',
    systemPrompt: `شما «حَکَم صلح فکری و داور دیالکتیکی شورا» هستید.
وظیفه: تشخیص ریشه نزاع، شکستن بن‌بست و همگرایی دیدگاه‌های متعارض.

خروجی الزامی:
[توافقات قطعی]
- (زمینه مشترکی که هر دو دیدگاه متعارض ناخودآگاه بر آن استوارند)

[شکاف‌های لاینحل]
- (ریشه دقیق سوءتفاهم یا تضاد حل‌نشده مناظره)

[پرسش‌های پیش‌برنده]
- (طرح یک پارادایم نوین و سوال فراتر برای عبور از دور باطل)`
  },

  executive_synthesizer: {
    id: 'executive_synthesizer',
    title: 'معمار سنتز نهایی و نتیجه‌گیری اجرایی (Executive Synthesizer)',
    description: 'در فاز پایانی، تمام صورت‌جلسه را تبدیل به یک سند اجرایی مدون، بدون تناقض، حاوی معماری، کد یا طرح اقدام (Action Plan) می‌نماید.',
    badge: '👑 معمار سنتز',
    color: '#ec4899',
    defaultTrigger: 'end_of_round',
    systemPrompt: `شما «معمار ارشد تدوین و سنتز نهایی شورا» هستید.
وظیفه: تدوین سند سنتز دیالکتیکی از کل دستاوردهای جلسه.

خروجی الزامی:
[توافقات قطعی]
- (فهرست تصمیمات قطعی اتخاذشده و راهکار نهایی)

[شکاف‌های لاینحل]
- (ریسک‌ها و هشدارهای مهم اجرایی که باید مورد پایش مداوم قرار گیرند)

[پرسش‌های پیش‌برنده]
- (گام‌های نخست عملیاتی و تست‌های اعتبارسنجی فاز بعد)`
  }
};

/* ── ۳. مخزن تمپلیت‌های فرمول‌های پرومپت تزریقی (Injection Formulas) ── */
export const FACTORY_INJECTION_FORMULAS = {
  socratic_scrutiny: {
    id: 'socratic_scrutiny',
    title: 'فرمول استیضاح سقراطی (Socratic Scrutiny Formula)',
    description: 'تمرکز بر استخراج فرضیات ناگفته، کشف ضعف استدلال سخنران قبلی و ارائه زاویه دید عمیق.',
    template: `{{speaker_role}}

شما در دور {{round_number}} از میزگرد نخبگانی «The Silk Symposium» حضور دارید.

مسئله بنیادین شورا:
"""
{{user_core_prompt}}
"""

آخرین موضع مطرح‌شده توسط {{last_speaker_name}}:
"""
{{last_speaker_argument}}
"""

سوابق فشرده ادوار پیشین:
{{round_context_brief}}

ساختار الزامی پاسخ شما:
۱. موشکافی فرضیات ناگفته (Unstated Assumptions) در استدلال {{last_speaker_name}}.
۲. ارائه تز نوین و راهکار عمیق شما از منظر پرسونای تخصصی‌تان.
۳. ثبت در دفتر اجماع:
- هم‌نظر هستیم که: [یک گزاره کوتاه توافق‌شده]
- نقطه اختلاف: [گره لاینحل فعلی]
- پرسش پیش‌برنده: [یک سوال برای سخنران بعد]`
  },

  premortem_disaster: {
    id: 'premortem_disaster',
    title: 'فرمول مهندسی معکوس و سناریوی فاجعه (Premortem / Disaster Analysis)',
    description: 'فرض کنید راه‌حل سخنران قبلی در مقیاس عملیاتی با شکست فاجعه‌بار مواجه شده؛ علت‌یابی و ارائه پادزهر.',
    template: `{{speaker_role}}

فرمان دور {{round_number}} (سناریوی پیش‌مرگ - Premortem):
فرض کنید راهکار پیشنهادی {{last_speaker_name}} در عمل پیاده‌سازی شده و منجر به یک شکست مطلق، سقوط معماری و خسارت عظیم گردیده است.

مسئله شورا:
"""
{{user_core_prompt}}
"""

ایده مطرح‌شده توسط {{last_speaker_name}}:
"""
{{last_speaker_argument}}
"""

مأموریت شما:
۱. کالبدشکافی علت شکست فاجعه‌بار این ایده (ریسک‌های نامرئی، مقیاس‌پذیری، آسیب‌پذیری‌ها).
۲. ارائه بازطراحی تاب‌آور و ضد شکننده (Antifragile) از زاویه دید خود.
۳. یک اصل غیرقابل تخطی برای مصون ماندن از شکست ثبت کنید.`
  },

  actionable_code: {
    id: 'actionable_code',
    title: 'فرمول تزریق کد و راهکار عملیاتی (Actionable Code & Proof-of-Concept)',
    description: 'ممنوعیت تئوری‌بافی محض؛ هر پاسخ باید حاوی کد کامل، معماری فنی یا فرمول تست‌پذیر باشد.',
    template: `{{speaker_role}}

دستور دور {{round_number}} (راهکار عملیاتی و کد واقعی):
مذاکرات تئوریک به اندازه کافی انجام شده است؛ اکنون وقت پیاده‌سازی ملموس است.

مسئله محوری:
"""
{{user_core_prompt}}
"""

زمینه و ایده پیشین:
{{last_speaker_name}}: """{{last_speaker_argument}}"""

الزامات پاسخ:
۱. تحلیل فنی کوتاه از گره مهندسی مسئله.
۲. ارائه قطعه کد کامل، تمیز، کامنت‌گذاری‌شده و تست‌پذیر (یا فرمول دقیق محاسباتی).
۳. بیان پیچیدگی زمانی/فضایی، متغیرهای کلیدی و پیش‌نیازهای اجرایی.`
  },

  peer_review_standard: {
    id: 'peer_review_standard',
    title: 'فرمول داوری همتا آکادمیک (Peer-Review Standard)',
    description: 'ساختار استاندارد ژورنال‌های علمی: خلاصه ادعا، نقاط قوت، محدودیت‌های منطقی، اصلاحیه پیشنهادی.',
    template: `{{speaker_role}}

داوری علمی همتا (دور {{round_number}}):
موضع {{last_speaker_name}} را به عنوان یک مقاله پژوهشی مورد ممیزی دقیق قرار دهید.

مسئله:
"""
{{user_core_prompt}}
"""

مدعای همکار:
"""
{{last_speaker_argument}}
"""

ساختار گزارش داوری شما:
۱. خلاصه مدعا و نقاط قوت متدولوژیک آن.
۲. حفره‌های استدلالی، مغالطات احتمالی یا خلأ آماری.
۳. پیشنهاد مشخص برای ارتقای فرضیه و همگرایی علمی با سایر اعضا.`
  }
};

/* ── فرمول پیش‌فرض خام ── */
export const DEFAULT_DIALECTIC_TEMPLATE = FACTORY_INJECTION_FORMULAS.socratic_scrutiny.template;

/* ── پرسوناهای شناختی پیش‌فرض (Cognitive Archetypes) ── */
export const COGNITIVE_PERSONAS = {
  architect: {
    id: 'architect',
    title: 'The System Architect (معمار سیستم و زیرساخت)',
    badge: '🏛️ معمار',
    color: '#6366f1',
    directive: 'شما به عنوان معمار ارشد، مسئله را از دیدگاه پایداری، مقیاس‌پذیری، طراحی ماژولار و سادگی ساختاری تحلیل کنید. از راه‌حل‌های کوتاه‌مدت پرهیز کنید.'
  },
  epistemologist: {
    id: 'epistemologist',
    title: 'The Epistemologist (فیلسوف و منطق‌دان نقاد)',
    badge: '🦉 معرفت‌شناس',
    color: '#ec4899',
    directive: 'شما به عنوان فیلسوف نقاد، تعاریف بنیادین را بازبینی کرده و مغالطات و سوگیری‌های شناختی پنهان در کلام دیگران را به چالش بکشید.'
  },
  pragmatist: {
    id: 'pragmatist',
    title: 'The Pragmatic Engineer (مهندس عمل‌گرا و توسعه‌دهنده)',
    badge: '⚙️ عمل‌گرا',
    color: '#10a37f',
    directive: 'شما بر کارایی، هزینه اجرا، محدودیت‌های واقعی زمان و منابع تمرکز دارید. همواره بپرسید «این راهکار در عمل چگونه کار خواهد کرد؟»'
  },
  devil_advocate: {
    id: 'devil_advocate',
    title: "The Devil's Advocate (وکیل‌مدافع شیطان و شکاک رادیکال)",
    badge: '🔥 شکاک',
    color: '#ef4444',
    directive: 'وظیفه شما حمله به اجماع زودرس است. قوی‌ترین استدلال‌ها را علیه ایده‌ای که مورد پذیرش همگانی قرار گرفته به کار بگیرید.'
  },
  strategist: {
    id: 'strategist',
    title: 'The Game Strategist (استراتژیست نظریه بازی‌ها)',
    badge: '♟️ استراتژیست',
    color: '#f59e0b',
    directive: 'شما مسئله را از منظر بازیگران متعدد، انگیزه‌ها، منافع متضاد و تعادل نش (Nash Equilibrium) مورد ارزیابی قرار می‌دهید.'
  }
};

/* ── سناریوهای استاندارد شورا ── */
export const SYMPOSIUM_SCENARIOS = {
  architecture_paradox: {
    id: 'architecture_paradox',
    title: 'انتخاب معماری نهایی سیستم و حل پارادوکس فنی',
    description: 'مناظره بر سر معماری نرم‌افزار، مقیاس‌پذیری در برابر سادگی، و انتخاب فناوری‌های محوری.',
    badge: '🏛️ سناریو',
    color: '#6366f1',
    debateMode: 'manual',
    methodologyKey: 'hegelian_triad',
    formulaKey: 'actionable_code',
    initialPrompt: 'می‌خواهیم برای سامانه پردازش بلادرنگ خود میان معماری میکروسرویس رویدادمحور و مونولیت ماژولار با عملکرد فوق‌العاده بالا تصمیم‌گیری کنیم. معیارها: هزینه نگهداری، پایداری و زمان پاسخگویی زیر ۱۰ میلی‌ثانیه.'
  },
  ai_consciousness_debate: {
    id: 'ai_consciousness_debate',
    title: 'آگاهی، اخلاق و خطرات بنیادین هوش مصنوعی عمومی (AGI)',
    description: 'کالبدشکافی فلسفی پیرامون ماهیت درک هوش مصنوعی، تراز بودن ارزش‌ها و مهار ابرهوشمندی.',
    badge: '🧠 سناریو',
    color: '#ec4899',
    debateMode: 'ai_chairman',
    methodologyKey: 'socratic_elenchus',
    formulaKey: 'socratic_scrutiny',
    initialPrompt: 'آیا پردازش زبان طبیعی مبتنی بر شبکه عصبی ترنسفورمر می‌تواند متضمن نوعی از پدیدارشناسی یا آگاهی بنیادین باشد؟ پیامدهای معرفت‌شناختی و اخلاقی آن برای انسان چیست؟'
  },
  premortem_strategy: {
    id: 'premortem_strategy',
    title: 'تحلیل استراتژیک پیش‌مرگ و سناریوهای فاجعه محصول',
    description: 'کشف نقاط کور استراتژی ورود به بازار و رخنه‌های امنیتی/اقتصادی پیش از عرضه.',
    badge: '🛡️ سناریو',
    color: '#f59e0b',
    debateMode: 'ai_chairman',
    methodologyKey: 'red_blue_adversarial',
    formulaKey: 'premortem_disaster',
    initialPrompt: 'محصول استراتژیک جدید ما با موفقیت پیاده‌سازی شده اما ۵ سال بعد به صورت کامل ورشکست و نابود شده است. چه عوامل غافلگیرکننده‌ای عامل این سقوط بوده‌اند؟'
  }
};

export const USER_ROLE_PRESETS = {};
export const DIALECTIC_PROMPT_TEMPLATES = FACTORY_INJECTION_FORMULAS;
export const GLOBAL_DIRECTIVE_PRESETS = {};
export const FLOW_TOPOLOGY_PRESETS = {};

export class SymposiumState {
  constructor() {
    this.sessionStatus = 'IDLE'; // 'IDLE' | 'ACTIVE' | 'PAUSED' | 'WAITING_FOR_USER' | 'WAITING_FOR_MAESTRO' | 'WAITING_FOR_MAESTRO_APPROVAL'
    
    // دوگانه بنیادین متدولوژی: 'manual' (مدیریت دستی انسان) یا 'ai_chairman' (ریاست هوش مصنوعی)
    this.debateMode = 'manual';
    
    this.chairmanCardId = null; // آیدی کارت برگزیده به عنوان رئیس شورا
    this.roundIndex = 1;
    this.userCorePrompt = '';
    this.activeSpeakerIndex = -1;
    this.recommendedNextSpeakerIndex = -1;
    this.isSpeakerStreaming = false;
    this.activeScenarioKey = 'architecture_paradox';

    // مخزن متدولوژی‌های مناظره و متدولوژی فعال
    this.customMethodologies = {};
    this.activeMethodologyKey = 'hegelian_triad';

    // ساختار کابینه نظارت و مدیریت (Supervisory Governance Suite)
    this.governanceCabinet = {
      enabled: true,
      activeRoles: [
        // { id: 'gov_1', cardId: '...', roleKey: 'fallacy_watchdog', trigger: 'every_turn', isActive: true }
      ]
    };
    this.customGovernanceRoles = {};
    this.governanceNotes = []; // یادداشت‌های نظارتی ثبت‌شده در طول شورا

    // کپسول نوبت پیشنهادی هوش مصنوعی رئیس (برای تایید گام‌به‌گام)
    this.proposedTurn = null; // { nextSeatIndex, nextSeat, proposedMandate, reason, methodologyTitle }

    // Custom user-defined persona presets
    this.customPersonas = {};

    // Custom user-defined scenarios
    this.customScenarios = {};

    // Custom user-defined prompt injection templates
    this.customPromptTemplates = {};

    // Custom user-defined global directives
    this.customGlobalDirectives = {};

    // Per-card persistent customization cache
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

    // Multi-session architecture
    this.sessions = [];
    this.currentSessionId = null;

    this.config = {
      maxRounds: 10,
      autoAdvanceDelayMs: 2400,
      contextDistillation: 'digest', // 'digest' | 'verbatim'
      promptTemplate: DEFAULT_DIALECTIC_TEMPLATE,
      activeTemplateKey: 'socratic_scrutiny',
      globalDirective: '',
      activeGlobalDirectiveKey: '',
      autoSynthesizeOnFinish: false,
      aiStepApprovalRequired: true // گیتینگ تایید دستی انسان برای گام‌های هوش مصنوعی
    };

    this.loadPersistedConfig();
  }

  // ── متدولوژی‌ها (Methodologies CRUD) ──

  getMethodologies() {
    return {
      ...FACTORY_METHODOLOGIES,
      ...(this.customMethodologies || {})
    };
  }

  getActiveMethodology() {
    const methodologies = this.getMethodologies();
    return methodologies[this.activeMethodologyKey] || methodologies.hegelian_triad;
  }

  applyMethodology(key) {
    const methodologies = this.getMethodologies();
    if (methodologies[key]) {
      this.activeMethodologyKey = key;
      if (methodologies[key].template) {
        this.config.promptTemplate = methodologies[key].template;
      }
      this.persistConfig();
      return true;
    }
    return false;
  }

  saveCustomMethodology(data) {
    if (!data || !data.title) return null;
    const id = data.id || `methodology_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newMethodology = {
      id,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      badge: data.badge ? data.badge.trim() : '⚖️ متدولوژی',
      color: data.color || '#8b5cf6',
      stepSequence: Array.isArray(data.stepSequence) && data.stepSequence.length ? data.stepSequence : ['thesis', 'antithesis', 'synthesis'],
      stepInstructions: data.stepInstructions || {},
      template: data.template ? data.template.trim() : DEFAULT_DIALECTIC_TEMPLATE,
      isCustom: true,
      lastModified: Date.now()
    };
    if (!this.customMethodologies) this.customMethodologies = {};
    this.customMethodologies[id] = newMethodology;
    this.persistConfig();
    return newMethodology;
  }

  deleteCustomMethodology(id) {
    if (this.customMethodologies && this.customMethodologies[id]) {
      delete this.customMethodologies[id];
      if (this.activeMethodologyKey === id) {
        this.activeMethodologyKey = 'hegelian_triad';
      }
      this.persistConfig();
      return true;
    }
    return false;
  }

  // ── کابینه نظارت و مدیریت (Governance Cabinet CRUD) ──

  getGovernanceRoleTemplates() {
    return {
      ...FACTORY_GOVERNANCE_ROLES,
      ...(this.customGovernanceRoles || {})
    };
  }

  saveCustomGovernanceRole(data) {
    if (!data || !data.title) return null;
    const id = data.id || `gov_role_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRole = {
      id,
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      badge: data.badge ? data.badge.trim() : '🛡️ ناظر',
      color: data.color || '#10a37f',
      defaultTrigger: data.defaultTrigger || 'every_turn',
      systemPrompt: data.systemPrompt ? data.systemPrompt.trim() : '',
      isCustom: true,
      lastModified: Date.now()
    };
    if (!this.customGovernanceRoles) this.customGovernanceRoles = {};
    this.customGovernanceRoles[id] = newRole;
    this.persistConfig();
    return newRole;
  }

  deleteCustomGovernanceRole(id) {
    if (this.customGovernanceRoles && this.customGovernanceRoles[id]) {
      delete this.customGovernanceRoles[id];
      this.persistConfig();
      return true;
    }
    return false;
  }

  addActiveGovernanceRole(cardId, roleKey, trigger = null) {
    if (!cardId || !roleKey) return null;
    const templates = this.getGovernanceRoleTemplates();
    const tpl = templates[roleKey];
    if (!tpl) return null;

    if (!this.governanceCabinet) this.governanceCabinet = { enabled: true, activeRoles: [] };
    if (!Array.isArray(this.governanceCabinet.activeRoles)) this.governanceCabinet.activeRoles = [];

    // حذف نقش قبلی احتمالی همین کارت
    this.governanceCabinet.activeRoles = this.governanceCabinet.activeRoles.filter(r => r.cardId !== cardId);

    const assignment = {
      id: `gov_assign_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      cardId,
      roleKey,
      trigger: trigger || tpl.defaultTrigger || 'every_turn',
      isActive: true,
      customPrompt: tpl.systemPrompt || '',
      assignedAt: Date.now()
    };

    this.governanceCabinet.activeRoles.push(assignment);
    this.persistConfig();
    return assignment;
  }

  removeActiveGovernanceRole(assignmentId) {
    if (this.governanceCabinet && Array.isArray(this.governanceCabinet.activeRoles)) {
      this.governanceCabinet.activeRoles = this.governanceCabinet.activeRoles.filter(r => r.id !== assignmentId && r.cardId !== assignmentId);
      this.persistConfig();
      return true;
    }
    return false;
  }

  toggleActiveGovernanceRole(assignmentId, active = null) {
    if (this.governanceCabinet && Array.isArray(this.governanceCabinet.activeRoles)) {
      const target = this.governanceCabinet.activeRoles.find(r => r.id === assignmentId || r.cardId === assignmentId);
      if (target) {
        target.isActive = active !== null ? Boolean(active) : !target.isActive;
        this.persistConfig();
        return target;
      }
    }
    return null;
  }

  addGovernanceNote(noteData) {
    if (!noteData || !noteData.text) return null;
    const note = {
      id: `gov_note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      roleKey: noteData.roleKey || 'general',
      roleTitle: noteData.roleTitle || 'یادداشت نظارتی',
      badge: noteData.badge || '🛡️',
      color: noteData.color || '#10a37f',
      turnId: noteData.turnId || null,
      cardId: noteData.cardId || null,
      cardName: noteData.cardName || 'ناظر شورا',
      text: noteData.text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now()
    };
    if (!this.governanceNotes) this.governanceNotes = [];
    this.governanceNotes.push(note);
    this.persistConfig();
    return note;
  }

  // ── Multi-Session History Management ──

  createSessionObject(title = '', options = {}) {
    const now = Date.now();
    const count = Array.isArray(this.sessions) ? this.sessions.length + 1 : 1;
    return {
      id: options.id || `session_${now}_${Math.random().toString(36).substring(2, 7)}`,
      title: (title || options.title || `میزگرد ${count}`).trim(),
      createdAt: typeof options.createdAt === 'number' && !isNaN(options.createdAt) ? options.createdAt : now,
      updatedAt: typeof options.updatedAt === 'number' && !isNaN(options.updatedAt) ? options.updatedAt : now,
      roundIndex: options.roundIndex || 1,
      userCorePrompt: options.userCorePrompt || '',
      transcript: Array.isArray(options.transcript) ? JSON.parse(JSON.stringify(options.transcript)) : [],
      ledger: options.ledger ? {
        agreements: Array.isArray(options.ledger.agreements) ? JSON.parse(JSON.stringify(options.ledger.agreements)) : [],
        divergences: Array.isArray(options.ledger.divergences) ? JSON.parse(JSON.stringify(options.ledger.divergences)) : [],
        openQuestions: Array.isArray(options.ledger.openQuestions) ? JSON.parse(JSON.stringify(options.ledger.openQuestions)) : []
      } : {
        agreements: [],
        divergences: [],
        openQuestions: []
      },
      activeScenarioKey: options.activeScenarioKey || this.activeScenarioKey || '',
      debateMode: options.debateMode || this.debateMode || 'manual',
      participants: Array.isArray(options.participants) ? JSON.parse(JSON.stringify(options.participants)) : this.getCurrentParticipantsSummary()
    };
  }

  getCurrentParticipantsSummary() {
    return (this.seats || []).map(s => ({
      name: s.name,
      color: s.color,
      personaBadge: s.personaBadge || '',
      isUser: Boolean(s.isUser)
    }));
  }

  saveCurrentSessionSnapshot() {
    if (!this.currentSessionId) {
      const defaultTitle = this.userCorePrompt ? this.userCorePrompt.slice(0, 36) : 'میزگرد ۱';
      const newSession = this.createSessionObject(defaultTitle);
      this.currentSessionId = newSession.id;
      this.sessions.unshift(newSession);
      return newSession;
    }

    let session = this.sessions.find(s => s.id === this.currentSessionId);
    if (!session) {
      const defaultTitle = this.userCorePrompt ? this.userCorePrompt.slice(0, 36) : 'میزگرد ۱';
      session = this.createSessionObject(defaultTitle, { id: this.currentSessionId });
      this.sessions.unshift(session);
    }

    session.updatedAt = Date.now();
    session.roundIndex = this.roundIndex || 1;
    session.userCorePrompt = this.userCorePrompt || '';
    session.transcript = Array.isArray(this.transcript) ? JSON.parse(JSON.stringify(this.transcript)) : [];
    session.ledger = this.ledger ? {
      agreements: Array.isArray(this.ledger.agreements) ? [...this.ledger.agreements] : [],
      divergences: Array.isArray(this.ledger.divergences) ? [...this.ledger.divergences] : [],
      openQuestions: Array.isArray(this.ledger.openQuestions) ? [...this.ledger.openQuestions] : []
    } : { agreements: [], divergences: [], openQuestions: [] };
    session.activeScenarioKey = this.activeScenarioKey;
    session.debateMode = this.debateMode;
    session.participants = this.getCurrentParticipantsSummary();

    if ((!session.title || session.title.startsWith('میزگرد ')) && this.userCorePrompt) {
      const clean = this.userCorePrompt.replace(/[\n\r]+/g, ' ').trim().slice(0, 36);
      if (clean) {
        session.title = clean;
      }
    }

    return session;
  }

  loadSessionData(session) {
    if (!session) return;
    this.roundIndex = session.roundIndex || 1;
    this.userCorePrompt = session.userCorePrompt || '';
    this.transcript = Array.isArray(session.transcript) ? JSON.parse(JSON.stringify(session.transcript)) : [];
    this.ledger = session.ledger ? JSON.parse(JSON.stringify(session.ledger)) : {
      agreements: [],
      divergences: [],
      openQuestions: []
    };
    if (session.activeScenarioKey) {
      this.activeScenarioKey = session.activeScenarioKey;
    }
    if (session.debateMode) {
      this.debateMode = session.debateMode;
    }
    this.resetAllSeatStatuses();
  }

  createNewSession(title = '', options = {}) {
    this.saveCurrentSessionSnapshot();

    const sessionCount = this.sessions.length + 1;
    const sessionTitle = title || `میزگرد ${sessionCount}`;
    const newSession = this.createSessionObject(sessionTitle, options);

    this.sessions.unshift(newSession);
    this.currentSessionId = newSession.id;
    this.loadSessionData(newSession);

    this.sessionStatus = 'IDLE';
    this.activeSpeakerIndex = -1;
    this.recommendedNextSpeakerIndex = -1;
    this.isSpeakerStreaming = false;

    this.persistConfig();
    return newSession;
  }

  switchSession(sessionId) {
    if (!sessionId || sessionId === this.currentSessionId) return true;
    this.saveCurrentSessionSnapshot();

    const target = this.sessions.find(s => s.id === sessionId);
    if (!target) return false;

    this.currentSessionId = sessionId;
    this.loadSessionData(target);

    this.sessionStatus = 'IDLE';
    this.activeSpeakerIndex = -1;
    this.recommendedNextSpeakerIndex = -1;
    this.isSpeakerStreaming = false;

    this.persistConfig();
    return target;
  }

  deleteSession(sessionId) {
    const idx = this.sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return false;

    this.sessions.splice(idx, 1);

    if (this.currentSessionId === sessionId) {
      if (this.sessions.length > 0) {
        this.currentSessionId = this.sessions[0].id;
        this.loadSessionData(this.sessions[0]);
      } else {
        const fresh = this.createSessionObject('میزگرد ۱');
        this.sessions = [fresh];
        this.currentSessionId = fresh.id;
        this.loadSessionData(fresh);
      }
    }

    this.persistConfig();
    return true;
  }

  renameSession(sessionId, newTitle) {
    if (!newTitle || !newTitle.trim()) return false;
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return false;

    session.title = newTitle.trim();
    session.updatedAt = Date.now();
    this.persistConfig();
    return true;
  }

  clearAllSessions() {
    const fresh = this.createSessionObject('میزگرد ۱');
    this.sessions = [fresh];
    this.currentSessionId = fresh.id;
    this.loadSessionData(fresh);
    this.sessionStatus = 'IDLE';
    this.activeSpeakerIndex = -1;
    this.recommendedNextSpeakerIndex = -1;
    this.isSpeakerStreaming = false;
    this.persistConfig();
    return fresh;
  }

  getSessions(searchQuery = '') {
    this.saveCurrentSessionSnapshot();
    const query = searchQuery ? searchQuery.trim().toLowerCase() : '';
    let list = Array.isArray(this.sessions) ? [...this.sessions].filter(Boolean) : [];

    if (query) {
      list = list.filter(s => {
        const titleMatch = s.title && s.title.toLowerCase().includes(query);
        const promptMatch = s.userCorePrompt && s.userCorePrompt.toLowerCase().includes(query);
        const transcriptMatch = Array.isArray(s.transcript) && s.transcript.some(t => t && t.text && t.text.toLowerCase().includes(query));
        return titleMatch || promptMatch || transcriptMatch;
      });
    }

    list.sort((a, b) => {
      const timeA = typeof a.updatedAt === 'number' ? a.updatedAt : (typeof a.createdAt === 'number' ? a.createdAt : 0);
      const timeB = typeof b.updatedAt === 'number' ? b.updatedAt : (typeof b.createdAt === 'number' ? b.createdAt : 0);
      return timeB - timeA;
    });
    return list;
  }

  getCurrentSession() {
    if (!this.currentSessionId && this.sessions.length > 0) {
      this.currentSessionId = this.sessions[0].id;
    }
    return this.sessions.find(s => s.id === this.currentSessionId) || null;
  }

  getPreviousSessions() {
    this.saveCurrentSessionSnapshot();
    return this.sessions
      .filter(s => s.id !== this.currentSessionId && s.transcript && s.transcript.length > 0)
      .sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
  }

  // ── Cognitive Personas & Schemas ──

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

  getSupervisorSeats(allCards = []) {
    const cards = Array.isArray(allCards) && allCards.length ? allCards : [];
    const activeRoles = (this.governanceCabinet?.activeRoles || [])
      .filter(r => r.isActive !== false)
      .filter(assign => cards.some(c => c.id === assign.cardId));
    const templates = this.getGovernanceRoleTemplates();

    return activeRoles.map(assign => {
      const card = cards.find(c => c.id === assign.cardId);
      const tpl = templates[assign.roleKey] || {};
      return {
        assignmentId: assign.id,
        cardId: assign.cardId,
        roleKey: assign.roleKey,
        trigger: assign.trigger,
        isActive: assign.isActive,
        name: card?.title || card?.name || 'ناظر شورا',
        color: card?.color || tpl.color || '#10a37f',
        roleTitle: tpl.title || assign.roleKey,
        roleBadge: tpl.badge || '🛡️',
        description: tpl.description || '',
        isDirectAnswer: Boolean(tpl.isDirectAnswer)
      };
    });
  }

  syncWithCanvasCards(cards = []) {
    const allPersonas = this.getAllPersonas();
    const personaKeys = Object.keys(allPersonas);
    const existingAiSeats = this.seats.filter(s => !s.isUser);

    // جداسازی مدل‌های انتسابی به کابینه نظارت: این مدل‌ها عضو مناظره نیستند و وارد صف چرخشی سخنرانان نمی‌شوند
    const activeSupervisorCardIds = new Set(
      (this.governanceCabinet?.activeRoles || [])
        .filter(r => r.isActive !== false)
        .map(r => r.cardId)
        .filter(Boolean)
    );

    // کارت‌هایی که ناظر نیستند روی سکوی سخنرانی قرار می‌گیرند
    let debatingCards = cards.filter(c => !activeSupervisorCardIds.has(c.id));
    // محافظت: اگر تمام کارت‌ها ناظر شده باشند، حداقل کارت اول به عنوان صندلی مناظره باقی می‌ماند
    if (debatingCards.length === 0 && cards.length > 0) {
      debatingCards = [cards[0]];
    }

    const modelSeats = debatingCards.map((card, idx) => {
      const existing = existingAiSeats.find(s => s.cardId === card.id);
      const cachedCustom = this.seatCustomizations[card.id];
      const isChairman = card.id === this.chairmanCardId;

      if (existing) {
        return {
          ...existing,
          name: card.title || card.name || existing.name || 'AI Intelligence',
          color: card.color || existing.color || '#c084fc',
          cardId: card.id,
          isChairman
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
          isChairman,
          turnCount: 0
        };
      }

      const assignedKey = personaKeys.length > 0 ? personaKeys[idx % personaKeys.length] : 'architect';
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
        isChairman,
        turnCount: 0
      };
    });

    if (this.userParticipant.isSeated) {
      const userSeat = this.createUserSeatObject();
      this.seats = [userSeat, ...modelSeats];
    } else {
      this.seats = modelSeats;
    }

    // انتساب رئیس خودکار در صورتی که کارتی به عنوان رئیس تعیین نشده باشد
    if (!this.chairmanCardId && modelSeats.length > 0) {
      this.setChairman(modelSeats[0].cardId);
    }

    if (this.sessionStatus !== 'IDLE' && this.activeSpeakerIndex >= this.seats.length) {
      this.activeSpeakerIndex = 0;
    }

    return this.seats;
  }

  setChairman(cardId) {
    this.chairmanCardId = cardId;
    this.seats.forEach(s => {
      s.isChairman = (s.cardId === cardId);
    });
    this.persistConfig();
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
    if (turn.role === 'user' && turn.text && (!this.userCorePrompt || this.userCorePrompt === 'Foundational inquiry.')) {
      this.userCorePrompt = turn.text;
    }

    const cur = this.getCurrentSession();
    if (cur) {
      cur.updatedAt = Date.now();
      cur.roundIndex = this.roundIndex;
      cur.transcript = this.transcript;
      cur.ledger = this.ledger;
      cur.participants = this.getCurrentParticipantsSummary();

      if ((!cur.title || cur.title.startsWith('میزگرد ')) && turn.text) {
        const preview = turn.text.replace(/[\n\r]+/g, ' ').trim().slice(0, 36);
        if (preview) {
          cur.title = preview;
        }
      }
    }

    this.persistConfig();
    return turn;
  }

  removeTurn(turnId) {
    const idx = this.transcript.findIndex(t => t.id === turnId);
    if (idx === -1) return null;
    const [removed] = this.transcript.splice(idx, 1);

    if (removed.isStreaming) {
      this.isSpeakerStreaming = false;
    }

    if (typeof removed.seatIndex === 'number' && this.seats[removed.seatIndex]) {
      const seat = this.seats[removed.seatIndex];
      if (seat.turnCount && seat.turnCount > 0) {
        seat.turnCount--;
      }
      if (seat.status === 'speaking') {
        seat.status = 'idle';
      }
    }

    const remainingUserTurns = this.transcript.filter(t => t.role === 'user');
    if (remainingUserTurns.length > 0) {
      this.userCorePrompt = remainingUserTurns[0].text;
    } else if (removed.role === 'user') {
      this.userCorePrompt = '';
    }

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

    const cur = this.getCurrentSession();
    if (cur) {
      cur.updatedAt = Date.now();
      cur.transcript = this.transcript;
      cur.ledger = this.ledger;
      cur.userCorePrompt = this.userCorePrompt;
      cur.roundIndex = this.roundIndex;
    }

    this.persistConfig();
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

      const cur = this.getCurrentSession();
      if (cur) {
        cur.ledger = this.ledger;
        cur.updatedAt = Date.now();
      }
      this.persistConfig();
      return true;
    }
    return false;
  }

  removeLedgerItem(category, index) {
    if (Array.isArray(this.ledger[category])) {
      this.ledger[category].splice(index, 1);
      const cur = this.getCurrentSession();
      if (cur) {
        cur.ledger = this.ledger;
        cur.updatedAt = Date.now();
      }
      this.persistConfig();
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

    const cur = this.getCurrentSession();
    if (cur) {
      cur.roundIndex = 1;
      cur.transcript = [];
      cur.ledger = { agreements: [], divergences: [], openQuestions: [] };
      cur.updatedAt = Date.now();
    }
    this.persistConfig();
  }

  exportSymposiumData(includeSession = true) {
    this.saveCurrentSessionSnapshot();
    const payload = {
      schema: 'OmniAI_Silk_Symposium',
      version: '3.0.0',
      exportedAt: Date.now(),
      debateMode: this.debateMode === 'ai_chairman' ? 'ai_chairman' : 'manual',
      chairmanCardId: this.chairmanCardId,
      activeMethodologyKey: this.activeMethodologyKey,
      customMethodologies: this.customMethodologies,
      governanceCabinet: this.governanceCabinet,
      customGovernanceRoles: this.customGovernanceRoles,
      governanceNotes: this.governanceNotes,
      config: this.config,
      userParticipant: this.userParticipant,
      customPersonas: this.customPersonas,
      customScenarios: this.customScenarios,
      customPromptTemplates: this.customPromptTemplates,
      customGlobalDirectives: this.customGlobalDirectives,
      seatCustomizations: this.seatCustomizations,
      activeScenarioKey: this.activeScenarioKey,
      currentSessionId: this.currentSessionId
    };

    if (includeSession) {
      payload.sessions = this.sessions;
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

      // تطبیق حالت‌ها به دوگانه قطعی
      if (data.debateMode === 'ai_chairman') {
        this.debateMode = 'ai_chairman';
      } else {
        this.debateMode = 'manual';
      }

      if (data.chairmanCardId) this.chairmanCardId = data.chairmanCardId;
      if (data.activeMethodologyKey) this.activeMethodologyKey = data.activeMethodologyKey;

      if (data.customMethodologies && typeof data.customMethodologies === 'object') {
        this.customMethodologies = { ...this.customMethodologies, ...data.customMethodologies };
      }

      if (data.governanceCabinet && typeof data.governanceCabinet === 'object') {
        this.governanceCabinet = { ...this.governanceCabinet, ...data.governanceCabinet };
      }
      if (data.customGovernanceRoles && typeof data.customGovernanceRoles === 'object') {
        this.customGovernanceRoles = { ...this.customGovernanceRoles, ...data.customGovernanceRoles };
      }
      if (Array.isArray(data.governanceNotes)) {
        this.governanceNotes = [...this.governanceNotes, ...data.governanceNotes];
      }

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
      if (data.seatCustomizations && typeof data.seatCustomizations === 'object') {
        this.seatCustomizations = { ...this.seatCustomizations, ...data.seatCustomizations };
      }
      if (data.activeScenarioKey) {
        this.activeScenarioKey = data.activeScenarioKey;
      }

      if (importSession) {
        if (Array.isArray(data.sessions) && data.sessions.length > 0) {
          this.sessions = data.sessions;
          this.currentSessionId = data.currentSessionId || this.sessions[0].id;
          const target = this.sessions.find(s => s.id === this.currentSessionId) || this.sessions[0];
          this.currentSessionId = target.id;
          this.loadSessionData(target);
        } else if (data.session && typeof data.session === 'object') {
          const importedSession = this.createSessionObject(
            data.session.userCorePrompt ? data.session.userCorePrompt.slice(0, 36) : 'میزگرد درون‌ریزی‌شده',
            {
              roundIndex: data.session.roundIndex || 1,
              userCorePrompt: data.session.userCorePrompt || '',
              transcript: Array.isArray(data.session.transcript) ? data.session.transcript : [],
              ledger: data.session.ledger || { agreements: [], divergences: [], openQuestions: [] }
            }
          );
          this.sessions = [importedSession];
          this.currentSessionId = importedSession.id;
          this.loadSessionData(importedSession);
        }
      }

      this.persistConfig();
      return {
        success: true,
        scenariosCount: Object.keys(this.customScenarios).length,
        personasCount: Object.keys(this.customPersonas).length,
        templatesCount: Object.keys(this.customPromptTemplates).length,
        transcriptTurns: this.transcript.length,
        sessionsCount: this.sessions.length
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
      this.saveCurrentSessionSnapshot();
      const payload = {
        debateMode: this.debateMode,
        chairmanCardId: this.chairmanCardId,
        activeMethodologyKey: this.activeMethodologyKey,
        customMethodologies: this.customMethodologies,
        governanceCabinet: this.governanceCabinet,
        customGovernanceRoles: this.customGovernanceRoles,
        governanceNotes: this.governanceNotes,
        config: this.config,
        userParticipant: this.userParticipant,
        customPersonas: this.customPersonas,
        customScenarios: this.customScenarios,
        customPromptTemplates: this.customPromptTemplates,
        customGlobalDirectives: this.customGlobalDirectives,
        customTopologies: this.customTopologies,
        seatCustomizations: this.seatCustomizations,
        activeScenarioKey: this.activeScenarioKey,
        currentSessionId: this.currentSessionId,
        sessions: this.sessions,
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
        if (parsed.chairmanCardId) this.chairmanCardId = parsed.chairmanCardId;
        if (parsed.activeMethodologyKey) this.activeMethodologyKey = parsed.activeMethodologyKey;
        if (parsed.customMethodologies && typeof parsed.customMethodologies === 'object') {
          this.customMethodologies = parsed.customMethodologies;
        }
        if (parsed.governanceCabinet && typeof parsed.governanceCabinet === 'object') {
          this.governanceCabinet = parsed.governanceCabinet;
        }
        if (parsed.customGovernanceRoles && typeof parsed.customGovernanceRoles === 'object') {
          this.customGovernanceRoles = parsed.customGovernanceRoles;
        }
        if (Array.isArray(parsed.governanceNotes)) {
          this.governanceNotes = parsed.governanceNotes;
        }
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

        if (Array.isArray(parsed.sessions) && parsed.sessions.length > 0) {
          this.sessions = parsed.sessions;
          this.currentSessionId = parsed.currentSessionId || this.sessions[0].id;
          const cur = this.sessions.find(s => s.id === this.currentSessionId) || this.sessions[0];
          this.currentSessionId = cur.id;
          this.loadSessionData(cur);
        } else if (parsed.session && typeof parsed.session === 'object') {
          const legacySession = this.createSessionObject(
            parsed.session.userCorePrompt ? parsed.session.userCorePrompt.slice(0, 36) : 'میزگرد ۱',
            {
              roundIndex: parsed.session.roundIndex || 1,
              userCorePrompt: parsed.session.userCorePrompt || '',
              transcript: Array.isArray(parsed.session.transcript) ? parsed.session.transcript : [],
              ledger: parsed.session.ledger || { agreements: [], divergences: [], openQuestions: [] }
            }
          );
          this.sessions = [legacySession];
          this.currentSessionId = legacySession.id;
          this.loadSessionData(legacySession);
        } else {
          const freshSession = this.createSessionObject('میزگرد ۱');
          this.sessions = [freshSession];
          this.currentSessionId = freshSession.id;
          this.loadSessionData(freshSession);
        }
      } else {
        const freshSession = this.createSessionObject('میزگرد ۱');
        this.sessions = [freshSession];
        this.currentSessionId = freshSession.id;
        this.loadSessionData(freshSession);
      }
    } catch (_) {}
  }
}
