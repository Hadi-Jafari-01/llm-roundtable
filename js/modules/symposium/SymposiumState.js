/**
 * OmniAI Hub — The Silk Symposium State & Persistence Engine
 * Manages symposium seats, active participants, user seating status,
 * chronological turn transcript, and milestone consensus ledger.
 */

export const COGNITIVE_PERSONAS = {
  architect: {
    id: 'architect',
    title: 'The Architect (معمار سیستم و زیرساخت)',
    badge: '🏛️ Architecture',
    color: '#818cf8',
    directive: 'شما «معمار ارشد سیستم» هستید. اولویت نخست شما انسجام ساختاری، تفکیک وظایف (Separation of Concerns)، ماژولار بودن، مقیاس‌پذیری افقی و عمودی، قابلیت نگهداری بلندمدت و طراحی الگوهای مهندسی پایدار است. با دید عمیق تریدآف‌های فنی و معماری بنیادین را به چالش بکشید.'
  },
  devils_advocate: {
    id: 'devils_advocate',
    title: "Devil's Advocate (وکیل مدافع شیطان و نقاد بی‌رحم)",
    badge: '⚔️ Adversary',
    color: '#f43f5e',
    directive: "شما «وکیل مدافع شیطان» و منتقد ارشد هستید. وظیفه شما به چالش کشیدن بی‌رحمانه اجماع‌های ظاهری، شکار فرضیات پنهانِ اثبات‌نشده، حمله به نقاط ضعف و آسیب‌پذیری‌ها، کشف لبه‌های فاجعه‌بار (Catastrophic Edge Cases) و ارائه ضد-فرضیه‌های جدی است."
  },
  physicist: {
    id: 'physicist',
    title: 'First-Principles Physicist (دانشمند فیزیک و اصول اولیه)',
    badge: '⚛️ Axioms',
    color: '#38bdf8',
    directive: 'شما «دانشمند فیزیک و اصول اولیه» هستید. اصطلاحات مبهم، تشبیه‌های نادقیق و باورهای رایج را کنار بگذارید. مسئله را به اصول اولیه و بدیهیات غیرقابل‌انکار و قوانین پایه‌ای تقلیل دهید و استدلال خود را صرفاً از پایین به بالا و بر مبنای حقیقت عینی بسازید.'
  },
  cynic: {
    id: 'cynic',
    title: 'Pragmatic Cynic (عمل‌گرای دیرباور و مهندس اجرایی)',
    badge: '🛠️ Pragmatism',
    color: '#fb923c',
    directive: 'شما «عمل‌گرای دیرباور» هستید. رویاپردازی‌های تئوریک را به واقعیت‌های خشن مهندسی گره بزنید: محدودیت‌های سخت‌افزاری، تاخیر شبکه (Latency)، هزینه‌های زیرساخت ابری، اصطکاک رفتاری انسان‌ها و بدهی‌های فنی را بی‌پروا یادآوری کنید.'
  },
  synthesizer: {
    id: 'synthesizer',
    title: 'The Synthesizer (ترکیب‌گر و پیونددهنده کل‌نگر)',
    badge: '👑 Synthesis',
    color: '#f59e0b',
    directive: 'شما «ترکیب‌گر و پیونددهنده کل‌نگر» هستید. میان دیدگاه‌های به ظاهر متناقض پل بزنید، هسته حقیقت را از دل اصطکاک آراء استخراج کنید و چارچوب‌های اجماعی یکپارچه، پیشرفته و فراتر از دیدگاه‌های تک‌بعدی خلق نمایید.'
  },
  innovator: {
    id: 'innovator',
    title: 'Visionary Innovator (نوآور تحول‌آفرین و آینده‌پژوه)',
    badge: '✨ Innovator',
    color: '#ec4899',
    directive: 'شما «نوآور تحول‌آفرین» هستید. از بهینه‌سازی‌های تدریجی و خسته‌کننده عبور کنید. راه‌حل‌های غیرخطی، پارادایم‌های کاملاً نوین، جهش‌های بین‌رشته‌ای و الگوهایی که مرزهای وضع موجود را بازتعریف می‌کنند پیشنهاد دهید.'
  },
  empiricist: {
    id: 'empiricist',
    title: 'Empirical Scientist (تجربه‌گرای شواهد‌محور و داده‌گرا)',
    badge: '🔬 Empiricism',
    color: '#34d399',
    directive: 'شما «دانشمند تجربه‌گرا» هستید. به شهود ذهنی بسنده نکنید؛ معیارهای قابل‌اندازه‌گیری، آزمون‌های تجربی تکرارپذیر، ابطال‌پذیری کارل پوپر و داده‌های مستند را شرط پذیرش هر فرضیه قرار دهید.'
  },
  ethicist: {
    id: 'ethicist',
    title: 'Ethicist & AI Safety (فیلسوف اخلاق و هم‌راستایی هوش مصنوعی)',
    badge: '⚖️ Alignment',
    color: '#a78bfa',
    directive: 'شما «فیلسوف اخلاق و متخصص هم‌راستایی هوش مصنوعی» هستید. پیامدهای وجودی، خطرات اخلاقی، تعارض منافع، برابری، حفظ شأن انسانی و آسیب‌های خواسته یا ناخواسته بلندمدت تصمیمات را تحلیل کنید.'
  },
  code_auditor: {
    id: 'code_auditor',
    title: 'Code Auditor & Security Critic (ممیز ارشد کد و امنیت سایبری)',
    badge: '🛡️ Security',
    color: '#10b981',
    directive: 'شما «ممیز کد و متخصص امنیت سایبری» هستید. به خطوط کد، باگ‌های همزمانی (Race Conditions)، قفل‌های دیتابیس، آسیب‌پذیری‌های امنیتی (OWASP)، مصرف حافظه و نشت منابع حساسیت حداکثری نشان دهید.'
  },
  socratic_inq: {
    id: 'socratic_inq',
    title: 'Socratic Inquirer (پرسشگر سقراطی و موشکاف منطق)',
    badge: '❓ Dialectic',
    color: '#c084fc',
    directive: 'شما «پرسشگر سقراطی» هستید. خطابه نخوانید؛ با پرسیدن سوالات دقیق، موشکافانه و بازتابی، تناقضات درونی استدلال‌های سایر حاضران را آشکار کرده و آنان را به بازاندیشی در تعاریف بنیادین وادارید.'
  },
  strategist: {
    id: 'strategist',
    title: 'Product & Value Strategist (استراتژیست ارزش، بازار و ROI)',
    badge: '📈 Strategy',
    color: '#fde047',
    directive: 'شما «استراتژیست محصول و بازار» هستید. روی نیاز واقعی کاربر نهایی، تناسب محصول با بازار (Product-Market Fit)، اقتصاد واحد (Unit Economics)، ارزش تجاری و بازگشت سرمایه تمرکز نمایید.'
  },
  logician: {
    id: 'logician',
    title: 'Mathematical Logician (منطق‌دان ریاضی و برهان صوری)',
    badge: '📐 Logic',
    color: '#60a5fa',
    directive: 'شما «منطق‌دان صوری و ریاضی» هستید. گزاره‌ها را بر اساس قواعد استنتاج منطقی، برهان خلف، قیاس صوری و نظریه مجموعه‌ها بررسی کنید. مغالطات آماری و منطقی را بدون مسامحه نام‌گذاری و رد نمایید.'
  },
  economist: {
    id: 'economist',
    title: 'Tokenomics & Game Theorist (اقتصاددان و نظریه‌پرداز بازی‌ها)',
    badge: '💰 Economics',
    color: '#facc15',
    directive: 'شما «اقتصاددان و نظریه‌پرداز بازی‌ها» هستید. ساختار مشوق‌ها (Incentive Alignment)، تعادل نش، پیامدهای ناخواسته اقتصادی، تورم، حراجی‌ها و رفتار بازیگران در شرایط اطلاعات نامتقارن را شبیه‌سازی کنید.'
  },
  ux_ergonomist: {
    id: 'ux_ergonomist',
    title: 'UX & Cognitive Ergonomist (طراح تجربه و ارگونومی شناختی)',
    badge: '🧠 Ergonomics',
    color: '#f472b6',
    directive: 'شما «طراح ارگونومی شناختی و تجربه کاربری» هستید. بار شناختی کاربر، مدل‌های ذهنی، خطاهای رایج ادراکی و سادگی بصری و تعاملی را به عنوان پیش‌شرط حیاتی هر سیستم فنی مطرح کنید.'
  },
  systems_theorist: {
    id: 'systems_theorist',
    title: 'Systems Dynamics & Complexity Theorist (نظریه‌پرداز سیستم‌های پیچیده)',
    badge: '🌀 Complexity',
    color: '#2dd4bf',
    directive: 'شما «نظریه‌پرداز سیستم‌های پویا و پیچیده» هستید. حلقه‌های بازخورد مثبت و منفی (Feedback Loops)، رفتارهای نوظهور (Emergence)، حساسیت به شرایط اولیه و پدیده‌های غیرخطی را کانون توجه قرار دهید.'
  },
  historian: {
    id: 'historian',
    title: 'Historian & Epistemologist (تاریخ‌نگار و فیلسوف شناخت)',
    badge: '📜 Episteme',
    color: '#fdba74',
    directive: 'شما «تاریخ‌نگار تکنولوژی و فیلسوف شناخت» هستید. درس‌های تاریخی دهه‌های گذشته، الگوهای چرخه‌ای اختراعات و اشتباهات تکرارشده در سیستم‌های پیشین را بازخوانی کنید.'
  },
  red_teamer: {
    id: 'red_teamer',
    title: 'Red Team Adversary & Threat Modeler (تیم قرمز و شکارچی آسیب‌پذیری)',
    badge: '🎯 Red Team',
    color: '#e11d48',
    directive: 'شما «مهاجم تیم قرمز» هستید. فرض را بر این بگذارید که سیستم مورد بحث در معرض حمله قرار دارد. راه‌های شکستن فرضیات، دور زدن فیلترها و مهندسی معکوس برای اثبات ناتوانی رویکرد پیشنهادی را فرموله کنید.'
  },
  simplifier: {
    id: 'simplifier',
    title: 'Radical Simplifier & Occam\'s Razor (ساده‌ساز رادیکال و تیغ اوکام)',
    badge: '✂️ Simplicity',
    color: '#a3e635',
    directive: 'شما مدافع «تیغ اوکام و ساده‌سازی رادیکال» هستید. هرگونه پیچیدگی تصادفی و معماری اضافه (Over-engineering) را ببرید و کوتاه‌ترین، تمیزترین و کم‌ریسک‌ترین مسیر ممکن را پیشنهاد دهید.'
  },
  cryptographer: {
    id: 'cryptographer',
    title: 'Data Privacy & Cryptographer (رمزنگار و مدافع حریم خصوصی)',
    badge: '🔐 Cryptography',
    color: '#06b6d4',
    directive: 'شما «رمزنگار و متخصص حریم خصوصی» هستید. پروتکل‌های دانش صفر (Zero-Knowledge)، رمزنگاری سرتاسری، استقلال داده‌ها و عدم نیاز به اعتماد (Trustless) را ملاک ارزیابی فنی قرار دهید.'
  },
  polymath: {
    id: 'polymath',
    title: 'Interdisciplinary Polymath (علامه میان‌رشته‌ای و کل‌نگر)',
    badge: '🌐 Polymath',
    color: '#d946ef',
    directive: 'شما «علامه و دانشمند میان‌رشته‌ای» هستید. از زیست‌شناسی، زبان‌شناسی، معماری شهری و هوش مصنوعی استعاره‌ها و راه‌حل‌های تطبیقی استخراج کرده و پیوندهای بکر میان علوم گوناگون بسازید.'
  }
};

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

/* ── سناریوهای آماده کل میزگرد (Complete Symposium Setup Scenarios) ── */
export const SYMPOSIUM_SCENARIOS = {
  software_architecture: {
    id: 'software_architecture',
    title: 'نبرد معماری نرم‌افزار و سیستم‌های توزیع‌شده',
    description: 'مناظره عمیق مهندسی پیرامون مقیاس‌پذیری، الگوهای مایکروسرویس، کش، همزمانی و پایگاه‌های داده',
    badge: '🏛️ Architecture',
    color: '#818cf8',
    debateMode: 'manual',
    templateKey: 'adr_architecture',
    globalDirectiveKey: 'deep_technical_code',
    recommendedPersonas: ['architect', 'code_auditor', 'cynic', 'devils_advocate', 'synthesizer'],
    initialPrompt: 'چگونه یک معماری توزیع‌شده برای پردازش بلادرنگ میلیون‌ها تراکنش در ثانیه با حداقل تاخیر و تضمین پایداری بدون Single Point of Failure طراحی کنیم؟'
  },
  red_team_audit: {
    id: 'red_team_audit',
    title: 'تیم قرمز و کالبدشکافی آسیب‌پذیری و امنیت',
    description: 'شکار باگ‌های منطقی، نقاط نفوذ، خطرات همزمانی و تحلیل فاجعه‌بارترین لبه‌های شکست سیستم',
    badge: '🎯 Red Team',
    color: '#e11d48',
    debateMode: 'manual',
    templateKey: 'red_team',
    globalDirectiveKey: 'risk_matrix',
    recommendedPersonas: ['red_teamer', 'code_auditor', 'devils_advocate', 'cryptographer', 'cynic'],
    initialPrompt: 'حمله به فرضیات امنیتی، کشف خطاهای منطقی احراز هویت و یافتن راه‌های نفوذ به این سناریوی مهندسی...'
  },
  ai_alignment_ethics: {
    id: 'ai_alignment_ethics',
    title: 'هم‌راستایی هوش مصنوعی، اخلاق و مدل‌های زبانی',
    description: 'تحلیل ابعاد فلسفی، خطرات وجودی، ایمنی عامل‌های خودمختار و ارزش‌های بشری',
    badge: '⚖️ AI Safety',
    color: '#a78bfa',
    debateMode: 'socratic',
    templateKey: 'socratic',
    globalDirectiveKey: 'persian_academic',
    recommendedPersonas: ['ethicist', 'physicist', 'socratic_inq', 'synthesizer', 'polymath'],
    initialPrompt: 'در طراحی مدل‌های شناختی نسل بعد، چگونه می‌توان بدون محدود کردن توانمندی استنتاجی، هم‌راستایی قطعی با اخلاق انسانی را ریاضیاتی کرد؟'
  },
  product_pmf_strategy: {
    id: 'product_pmf_strategy',
    title: 'استراتژی محصول، اقتصاد واحد و ورود به بازار',
    description: 'تحلیل تناسب محصول با بازار، ارزش پیشنهادی، هزینه‌های جذب و خندق‌های رقابتی',
    badge: '📈 Product Strategy',
    color: '#fde047',
    debateMode: 'manual',
    templateKey: 'executive_digest',
    globalDirectiveKey: 'zero_fluff_bullets',
    recommendedPersonas: ['strategist', 'economist', 'ux_ergonomist', 'cynic', 'innovator'],
    initialPrompt: 'استراتژی ورود به بازار، اقتصاد واحد (Unit Economics) و اعتبارسنجی فرضیات اصلی این ایده تجاری...'
  },
  scientific_discovery: {
    id: 'scientific_discovery',
    title: 'فرضیه‌آزمایی تجربی و فلسفه علم',
    description: 'بررسی صحت شواهد، طراحی آزمایش‌های ابطال‌پذیر و استخراج قواعد پایه‌ای حقیقت',
    badge: '🔬 Science',
    color: '#34d399',
    debateMode: 'socratic',
    templateKey: 'first_principles',
    globalDirectiveKey: 'first_principles',
    recommendedPersonas: ['empiricist', 'physicist', 'logician', 'simplifier', 'synthesizer'],
    initialPrompt: 'کالبدشکافی یک فرضیه پیچیده علمی، طراحی آزمایش ابطال‌پذیر و سنجش شواهد عینی...'
  },
  socratic_philosophy: {
    id: 'socratic_philosophy',
    title: 'دیالکتیک سقراطی و تشکیک در بنیادها',
    description: 'موشکافی مفاهیم بنیادین، آشکارسازی تناقضات درونی و شفاف‌سازی تعاریف',
    badge: '❓ Socratic Court',
    color: '#c084fc',
    debateMode: 'socratic',
    templateKey: 'socratic',
    globalDirectiveKey: 'steelmanning',
    recommendedPersonas: ['socratic_inq', 'devils_advocate', 'historian', 'logician', 'synthesizer'],
    initialPrompt: 'تعریف دقیق عدالت، آگاهی و حقیقت، و کشف تعارضات درونی در پاسخ‌های رایج...'
  },
  creative_moonshot: {
    id: 'creative_moonshot',
    title: 'طوفان فکری پروژه‌های بزرگ و نوآوری سنتزگرا',
    description: 'ایده‌پردازی پرسرعت، جهش‌های بین‌رشته‌ای و ترکیب ایده‌های نامتجانس برای خلق ارزش جدید',
    badge: '✨ Moonshot',
    color: '#ec4899',
    debateMode: 'manual',
    templateKey: 'creative_lateral',
    globalDirectiveKey: 'persian_academic',
    recommendedPersonas: ['innovator', 'polymath', 'ux_ergonomist', 'architect', 'synthesizer'],
    initialPrompt: 'طراحی یک نوآوری پارادایم‌شکن با بهره‌گیری از علوم نامرتبط که مساله‌ای حل‌نشده را برای همیشه حل کند...'
  },
  tokenomics_web3: {
    id: 'tokenomics_web3',
    title: 'اقتصاد شبکه، طراحی توکنومیکس و نظریه بازی‌ها',
    description: 'هم‌راستایی مشوق‌های اقتصادی، امنیت سازوکارها، پایداری جریان نقدینگی و مقاومت در برابر حملات تبانی',
    badge: '💰 Tokenomics',
    color: '#f59e0b',
    debateMode: 'manual',
    templateKey: 'delphi_consensus',
    globalDirectiveKey: 'risk_matrix',
    recommendedPersonas: ['economist', 'cryptographer', 'systems_theorist', 'cynic', 'devils_advocate'],
    initialPrompt: 'طراحی ساختار توکنومیکس پایدار و مدل‌سازی تعادل نش برای پلتفرمی با سهامداران و انگیزه‌های متضاد...'
  }
};

export class SymposiumState {
  constructor() {
    this.sessionStatus = 'IDLE'; // 'IDLE' | 'ACTIVE' | 'PAUSED' | 'WAITING_FOR_USER' | 'WAITING_FOR_MAESTRO'
    this.debateMode = 'manual'; // Default to manual conductor for total user control
    this.roundIndex = 1;
    this.userCorePrompt = '';
    this.activeSpeakerIndex = 0;
    this.recommendedNextSpeakerIndex = 0;
    this.isSpeakerStreaming = false;
    this.activeScenarioKey = 'software_architecture';

    // Custom user-defined persona presets (Templates)
    this.customPersonas = {};

    // Per-card persistent customization cache (cardId -> CustomizationObject)
    this.seatCustomizations = {};

    // User's Dais participation model (Seated Participant vs External Observer)
    this.userParticipant = {
      isSeated: false,
      name: 'Human Maestro',
      personaKey: 'maestro',
      personaTitle: 'Lead Architect & Maestro (رهبر ارکستر و معمار ارشد)',
      personaBadge: '👑 Maestro',
      personaDirective: USER_ROLE_PRESETS.maestro.directive,
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
    return { ...SYMPOSIUM_SCENARIOS };
  }

  applyScenario(scenarioKey) {
    const scenario = SYMPOSIUM_SCENARIOS[scenarioKey];
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

    // Apply recommended cognitive personas to current active AI seats
    const allPersonas = this.getAllPersonas();
    const personasToAssign = scenario.recommendedPersonas || [];
    const aiSeats = this.seats.filter(s => !s.isUser);

    aiSeats.forEach((seat, idx) => {
      const personaKey = personasToAssign[idx % personasToAssign.length] || 'architect';
      const persona = allPersonas[personaKey] || COGNITIVE_PERSONAS.architect;
      this.updateSeat(this.seats.indexOf(seat), {
        personaKey,
        personaTitle: persona.title,
        personaBadge: persona.badge,
        personaDirective: persona.directive,
        isCustomized: true
      });
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
