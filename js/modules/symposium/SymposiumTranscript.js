/**
 * OmniAI Hub — The Silk Symposium Transcript & Bubble Engine
 * Renders dialogue turns with modern ChatGPT aesthetics:
 *   - Centered column within reading measure (max-width: 780px)
 *   - Subtle right-aligned user floating capsules
 *   - Model responses flowing naturally without heavy artificial card boxes
 *   - Bidirectional Persian/English typography (Vazirmatn font-family, direction auto/rtl)
 *   - Isolated LTR code blocks with header language tags and copy button
 *   - Reasoning fold integration (🧠 Thinking Process)
 */

export class SymposiumTranscript {
  constructor(viewportEl, callbacks = {}) {
    this.viewportEl = viewportEl;
    this.callbacks = {
      onChallenge: () => {},
      onCrownInsight: () => {},
      onSynthesize: () => {},
      onDeleteTurn: () => {},
      onContinueSession: () => {},
      onOpenHistory: () => {},
      onNewSession: () => {},
      ...callbacks
    };

    this.bindEvents();
  }

  bindEvents() {
    this.viewportEl?.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.btn-delete-turn-chip, .btn-turn-meta-del');
      if (deleteBtn) {
        this.callbacks.onDeleteTurn(deleteBtn.dataset.turnId);
        return;
      }

      const challengeBtn = e.target.closest('.btn-challenge-chip');
      if (challengeBtn) {
        this.callbacks.onChallenge(challengeBtn.dataset.turnId);
        return;
      }

      const crownBtn = e.target.closest('.btn-crown-chip');
      if (crownBtn) {
        this.callbacks.onCrownInsight(crownBtn.dataset.turnId);
        return;
      }

      const synthBtn = e.target.closest('.btn-synth-chip');
      if (synthBtn) {
        this.callbacks.onSynthesize(synthBtn.dataset.turnId);
        return;
      }

      const copyBtn = e.target.closest('.btn-copy-code');
      if (copyBtn) {
        const codeBlock = copyBtn.closest('.symposium-code-box')?.querySelector('.symposium-code-body code') ||
                          copyBtn.closest('.symposium-code-box')?.querySelector('.symposium-code-body');
        if (codeBlock) {
          navigator.clipboard.writeText(codeBlock.textContent || codeBlock.innerText);
          const orig = copyBtn.textContent;
          copyBtn.textContent = '✓ Copied';
          setTimeout(() => { copyBtn.textContent = orig; }, 1800);
        }
        return;
      }

      const foldTrigger = e.target.closest('.reasoning-fold-trigger');
      if (foldTrigger) {
        const foldWrap = foldTrigger.closest('.mirror-reasoning-fold');
        if (foldWrap) foldWrap.dataset.userToggled = 'true';
        const foldBody = foldTrigger.parentElement?.querySelector('.reasoning-fold-body');
        if (foldBody) {
          const isClosed = foldBody.style.display === 'none';
          foldBody.style.display = isClosed ? 'block' : 'none';
          const arrow = foldTrigger.querySelector('span:last-child');
          if (arrow) arrow.textContent = isClosed ? '▲' : '▼';
        }
      }
    });
  }

  render(turns = [], previousSessions = [], onContinueSession = null, onOpenHistory = null, onNewSession = null) {
    if (!this.viewportEl) return;

    if (onContinueSession) this.callbacks.onContinueSession = onContinueSession;
    if (onOpenHistory) this.callbacks.onOpenHistory = onOpenHistory;
    if (onNewSession) this.callbacks.onNewSession = onNewSession;

    if (!turns || turns.length === 0) {
      let previousSessionsHtml = '';
      if (previousSessions && previousSessions.length > 0) {
        const otherSessions = previousSessions.slice(0, 3);
        const chipsHtml = otherSessions.map(s => `
          <button type="button" class="btn-quick-resume-chip" data-session-id="${s.id}">
            <span class="chip-dot"></span>
            <span class="chip-title">${this.escapeHtml(s.title || 'میزگرد قبلی')}</span>
            <span class="chip-round">دور ${s.roundIndex || 1} • ${(s.transcript && s.transcript.length) || 0} پیام</span>
          </button>
        `).join('');

        previousSessionsHtml = `
          <div class="symposium-quick-history-box">
            <span class="quick-history-title">یا ادامه یکی از میزگردهای پیشین:</span>
            <div class="quick-history-chips">
              ${chipsHtml}
            </div>
            <button type="button" class="btn-open-all-history-link" id="btn-empty-open-history">
              مشاهده تمام سوابق (${previousSessions.length} جلسه) 📜
            </button>
          </div>
        `;
      }

      this.viewportEl.innerHTML = `
        <div class="chat-centered-container">
          <div class="symposium-empty-sanctuary">
            <div class="symposium-empty-orb">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="5"/>
              </svg>
            </div>
            <h3>The Silk Symposium Agora</h3>
            <p>میزگرد نخبگانی جدید آماده آغاز است. پرسش یا مسئله بنیادین خود را در کادر زیر وارد کنید یا نوبت را با عصای نوبت (🪄) به یکی از صندلی‌ها بسپارید.</p>
            ${previousSessionsHtml}
          </div>
        </div>
      `;

      // Bind quick history resumption chips
      this.viewportEl.querySelectorAll('.btn-quick-resume-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          if (this.callbacks.onContinueSession) {
            this.callbacks.onContinueSession(chip.dataset.sessionId);
          }
        });
      });

      this.viewportEl.querySelector('#btn-empty-open-history')?.addEventListener('click', () => {
        if (this.callbacks.onOpenHistory) {
          this.callbacks.onOpenHistory();
        }
      });

      return;
    }

    this.viewportEl.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'chat-centered-container';

    turns.forEach(turn => {
      const row = this.createTurnElement(turn);
      container.appendChild(row);
    });

    this.viewportEl.appendChild(container);
    this.scrollToBottom();
  }

  createTurnElement(turn) {
    const row = document.createElement('div');
    const isUser = turn.role === 'user';
    const isGovernance = turn.role === 'governance' || turn.role === 'supervisor';
    const isSeatedUser = Boolean(turn.isSeatedUser);

    row.className = `symposium-turn-row ${isGovernance ? 'governance' : (isUser ? 'user' : 'model')} ${isSeatedUser ? 'seated-user' : ''}`;
    row.id = `turn-${turn.id}`;

    const textDir = this.detectTextDirection(turn.text || '');
    const isRTL = textDir === 'rtl';

    // نشانگر ممیزی نظارتی بدون تکرار متن کامل
    const governanceNotes = Array.isArray(turn.governanceNotes) ? turn.governanceNotes : [];
    const govNotesHtml = governanceNotes.length > 0 ? `
      <div class="turn-governance-pill" style="--gov-color: ${governanceNotes[0].color || '#10a37f'}; padding: 4px 10px; font-size: 10px; opacity: 0.85;" dir="auto">
        <span class="gov-pill-badge">${governanceNotes[0].badge || '🛡️'} ممیزی‌شده توسط ${this.escapeHtml(governanceNotes[0].roleTitle || 'کابینه نظارت')}</span>
      </div>
    ` : '';

    if (isGovernance) {
      const isQAAdvisor = turn.roleKey === 'user_advisor';
      const renderedMd = this.renderMarkdown(turn.text || '');
      const isStillThinking = Boolean(turn.isStreaming && (!turn.text || !turn.text.trim()));
      const thinkingDir = this.detectTextDirection(turn.thinkingText || '');
      const thinkingHtml = turn.thinkingText ? `
        <div class="mirror-reasoning-fold" style="margin-bottom: 8px;">
          <button type="button" class="reasoning-fold-trigger">
            <span>🧠 Thinking Process</span>
            <span>${isStillThinking ? '▲' : '▼'}</span>
          </button>
          <div class="reasoning-fold-body" dir="${thinkingDir}" style="display: ${isStillThinking ? 'block' : 'none'};">${this.escapeHtml(turn.thinkingText)}</div>
        </div>
      ` : '';
      const pulseHtml = turn.isStreaming ? `
        <div class="mirror-streaming-pulse"><span></span><span></span><span></span></div>
      ` : '';

      const bannerText = isQAAdvisor
        ? `پاسخ مشاور اختصاصی (${this.escapeHtml(turn.speakerName)}) با توجه به مذاکرات میزگرد`
        : `ممیزی نظارتی مستقل پیرامون کلام ${this.escapeHtml(turn.targetSpeakerName || 'شورا')}`;
      const bannerIcon = isQAAdvisor ? '💡' : (turn.badge || '🛡️');
      const bannerColor = isQAAdvisor ? '#38bdf8' : (turn.color || '#10a37f');
      const placeholderLoading = isQAAdvisor
        ? 'مشاور در حال تحلیل میزگرد و تدوین پاسخ به سوال شماست...'
        : 'در حال نگارش ممیزی نظارتی...';

      row.innerHTML = `
        <div class="symposium-turn-meta governance-meta">
          <span class="turn-avatar-badge gov-badge" style="background: ${bannerColor};">
            ${bannerIcon}
          </span>
          <span class="turn-speaker-badge" style="color: ${bannerColor};">
            ${isQAAdvisor ? `مشاور اختصاصی: ${this.escapeHtml(turn.speakerName)}` : this.escapeHtml(turn.roleTitle || 'کابینه نظارت شورا')}
          </span>
          <span class="turn-persona-tag gov-tag">${isQAAdvisor ? 'پاسخگوی کاربر' : `مجری: ${this.escapeHtml(turn.speakerName)}`}</span>
          <span class="turn-round-tag">Round ${turn.round || 1} • ${turn.timestamp || ''}</span>
          <button type="button" class="btn-turn-meta-del btn-delete-turn-chip" data-turn-id="${turn.id}" title="حذف این پاسخ">✕</button>
        </div>

        <div class="symposium-bubble-card governance-bubble ${isRTL ? 'is-rtl' : 'is-ltr'}" dir="${textDir}" style="--model-color: ${bannerColor};">
          <div class="governance-card-banner" style="color: ${bannerColor};">
            <span class="gov-banner-icon">${bannerIcon}</span>
            <span class="gov-banner-text">${bannerText}</span>
          </div>
          ${thinkingHtml}
          <div class="symposium-markdown ${isRTL ? 'is-rtl' : 'is-ltr'}">${renderedMd || (turn.isStreaming ? `<p style="color:#9ca3af;font-style:italic;">${placeholderLoading}</p>` : '<p></p>')}</div>
          ${pulseHtml}

          <div class="symposium-bubble-actions">
            <button type="button" class="btn-bubble-chip crown-chip btn-crown-chip" data-turn-id="${turn.id}" title="ثبت نکات این نظر در دفتر اجماع">
              <span>💎 Crown to Ledger</span>
            </button>
            <button type="button" class="btn-bubble-chip delete-chip btn-delete-turn-chip" data-turn-id="${turn.id}" title="حذف">
              <span>🗑️ Delete</span>
            </button>
          </div>
        </div>
      `;
    } else if (isUser) {
      const speakerBadge = isSeatedUser
        ? `${turn.speakerName} (${turn.personaBadge || '👑 You'})`
        : 'Human Maestro (Observer)';

      row.innerHTML = `
        <div class="symposium-turn-meta">
          <button type="button" class="btn-turn-meta-del btn-delete-turn-chip" data-turn-id="${turn.id}" title="حذف این پیام از میزگرد">✕</button>
          <span class="turn-round-tag">Round ${turn.round || 1} • ${turn.timestamp || ''}</span>
          <span class="turn-speaker-badge">${this.escapeHtml(speakerBadge)}</span>
          <span class="turn-avatar-badge" style="background: ${turn.color || '#f59e0b'};">
            ${isSeatedUser ? '👑' : '👤'}
          </span>
        </div>
        <div class="symposium-bubble-card ${isRTL ? 'is-rtl' : 'is-ltr'}" dir="${textDir}">
          <div>${this.escapeHtml(turn.text)}</div>
          ${govNotesHtml}
          <div class="symposium-bubble-actions user-actions">
            <button type="button" class="btn-bubble-chip delete-chip btn-delete-turn-chip" data-turn-id="${turn.id}" title="حذف این پیام از تاریخچه میزگرد">
              <span>🗑️ Delete</span>
            </button>
          </div>
        </div>
      `;
    } else {
      const renderedMd = this.renderMarkdown(turn.text || '');
      const isStillThinking = Boolean(turn.isStreaming && (!turn.text || !turn.text.trim()));
      const thinkingDir = this.detectTextDirection(turn.thinkingText || '');
      const thinkingHtml = turn.thinkingText ? `
        <div class="mirror-reasoning-fold" style="margin-bottom: 8px;">
          <button type="button" class="reasoning-fold-trigger">
            <span>🧠 Thinking Process</span>
            <span>${isStillThinking ? '▲' : '▼'}</span>
          </button>
          <div class="reasoning-fold-body" dir="${thinkingDir}" style="display: ${isStillThinking ? 'block' : 'none'};">${this.escapeHtml(turn.thinkingText)}</div>
        </div>
      ` : '';

      const pulseHtml = turn.isStreaming ? `
        <div class="mirror-streaming-pulse"><span></span><span></span><span></span></div>
      ` : '';

      const avatarBadgeSymbol = turn.personaBadge?.slice(0, 2) || '🤖';

      row.innerHTML = `
        <div class="symposium-turn-meta">
          <span class="turn-avatar-badge" style="background: ${turn.color || '#c084fc'};">
            ${avatarBadgeSymbol}
          </span>
          <span class="turn-speaker-badge" style="color: ${turn.color || '#f1f5f9'};">
            ${this.escapeHtml(turn.speakerName)}
          </span>
          <span class="turn-persona-tag">${this.escapeHtml(turn.personaBadge || 'Chair')}</span>
          <span class="turn-round-tag">Round ${turn.round || 1} • ${turn.timestamp || ''}</span>
          <button type="button" class="btn-turn-meta-del btn-delete-turn-chip" data-turn-id="${turn.id}" title="حذف این پیام از میزگرد">✕</button>
        </div>

        <div class="symposium-bubble-card ${isRTL ? 'is-rtl' : 'is-ltr'}" dir="${textDir}" style="--model-color: ${turn.color};">
          ${thinkingHtml}
          <div class="symposium-markdown ${isRTL ? 'is-rtl' : 'is-ltr'}">${renderedMd}</div>
          ${pulseHtml}
          ${govNotesHtml}

          <div class="symposium-bubble-actions">
            <button type="button" class="btn-bubble-chip btn-challenge-chip" data-turn-id="${turn.id}" title="Prompt next speaker to counter or scrutinize this claim">
              <span>🎯 Challenge</span>
            </button>
            <button type="button" class="btn-bubble-chip crown-chip btn-crown-chip" data-turn-id="${turn.id}" title="Crown as Confirmed Agreement in Ledger">
              <span>💎 Crown Insight</span>
            </button>
            <button type="button" class="btn-bubble-chip btn-synth-chip" data-turn-id="${turn.id}" title="Request Synthesizer to formulate a milestone consensus">
              <span>👑 Synthesize</span>
            </button>
            <button type="button" class="btn-bubble-chip delete-chip btn-delete-turn-chip" data-turn-id="${turn.id}" title="حذف این پیام از تاریخچه میزگرد">
              <span>🗑️ Delete</span>
            </button>
          </div>
        </div>
      `;
    }

    return row;
  }

  updateStreamingTurn(turn) {
    if (!turn) return;
    const row = document.getElementById(`turn-${turn.id}`);
    if (!row) return;

    const bubble = row.querySelector('.symposium-bubble-card');
    const mdContainer = row.querySelector('.symposium-markdown');
    const textDir = this.detectTextDirection(turn.text || '');

    if (bubble) {
      bubble.setAttribute('dir', textDir);
      bubble.classList.toggle('is-rtl', textDir === 'rtl');
      bubble.classList.toggle('is-ltr', textDir === 'ltr');
    }
    if (mdContainer) {
      mdContainer.innerHTML = this.renderMarkdown(turn.text || '');
      mdContainer.setAttribute('dir', textDir);
      mdContainer.classList.toggle('is-rtl', textDir === 'rtl');
      mdContainer.classList.toggle('is-ltr', textDir === 'ltr');
    }

    if (turn.thinkingText && bubble) {
      let reasoningFold = bubble.querySelector('.mirror-reasoning-fold');
      const thinkingDir = this.detectTextDirection(turn.thinkingText || '');
      const isThinkingFinished = !turn.isStreaming || Boolean(turn.text && turn.text.trim().length > 0);

      if (!reasoningFold) {
        reasoningFold = document.createElement('div');
        reasoningFold.className = 'mirror-reasoning-fold';
        reasoningFold.style.marginBottom = '8px';
        reasoningFold.innerHTML = `
          <button type="button" class="reasoning-fold-trigger">
            <span>🧠 Thinking Process</span>
            <span>${isThinkingFinished ? '▼' : '▲'}</span>
          </button>
          <div class="reasoning-fold-body" dir="${thinkingDir}" style="display: ${isThinkingFinished ? 'none' : 'block'};"></div>
        `;
        bubble.prepend(reasoningFold);
      }

      const foldBody = reasoningFold.querySelector('.reasoning-fold-body');
      const foldArrow = reasoningFold.querySelector('.reasoning-fold-trigger span:last-child');
      if (foldBody) {
        foldBody.textContent = turn.thinkingText;
        foldBody.setAttribute('dir', thinkingDir);
        foldBody.classList.toggle('is-rtl', thinkingDir === 'rtl');

        if (!reasoningFold.dataset.userToggled) {
          if (isThinkingFinished) {
            foldBody.style.display = 'none';
            if (foldArrow) foldArrow.textContent = '▼';
          } else {
            foldBody.style.display = 'block';
            if (foldArrow) foldArrow.textContent = '▲';
          }
        }
      }
    }

    if (!turn.isStreaming) {
      row.querySelector('.mirror-streaming-pulse')?.remove();
    }

    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.viewportEl) {
      this.viewportEl.scrollTop = this.viewportEl.scrollHeight;
    }
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

    // 1. Line endings normalization
    out = out.replace(/\r\n?/g, '\n');

    // 2. Pre-processing pass: Unglue consensus headers attached to sentences without newlines
    const consensusTagsPattern = /(\*{0,2}(?:[۰-۹\d]+[\.\-]\s*)?\[\s*(?:توافقات قطعی|توافقات|نقاط اشتراک|نقطه اشتراک|هم‌نظر هستیم که|هم‌نظریم که|اشتراکات|شکاف‌های لاینحل|شکاف‌ها|نقاط اختلاف|نقطه اختلاف|اختلافات|مواضع متعارض|مخالفت اساسی|نقاط چالش|چالش با|موارد اختلاف|تضادها|معضلات|مغالطه|دیده‌بان مغالطه|خطای منطقی|تحلیل مغالطه|پرسش‌های پیش‌برنده|پرسش پیش‌برنده|پرسش‌های بی‌پاسخ|پرسش بی‌پاسخ|پرسش‌های باز|پرسش باز|سوالات پیش‌برنده|سوال پیش‌برنده|سوالات بی‌پاسخ|سوال بی‌پاسخ|فرضیه مطرح|سوال کلیدی|پرسش کلیدی|consensus|agreements?|confirmed agreements?|we agree that|divergences?|points? of contention|disagreements?|unresolved gaps?|critical divergences?|open questions?|unresolved questions?|hypotheses|open hypotheses)\s*\]\*{0,2})/gi;

    out = out.replace(new RegExp(`([^\\n\\s])\\s*${consensusTagsPattern.source}`, 'gi'), '$1\n\n$2\n');
    out = out.replace(new RegExp(`${consensusTagsPattern.source}\\s*([:：]?)\\s*([^\\n\\s])`, 'gi'), '$1$2\n$3');

    // Detach numbered items attached to punctuation (e.g., "است.۱. گزینه اول")
    out = out.replace(/([.!?؛:])\s*([۰-۹\d]+[\.\-]\s+)/g, '$1\n\n$2');

    // Detach bullet items attached to sentences
    out = out.replace(/([.!?؛:])\s+([•\-*]\s+[^\n])/g, '$1\n\n$2');

    const codeBlocks = [];

    // 3. Convert any existing HTML <pre><code> to markdown code fences
    out = out.replace(/<pre[^>]*><code(?:\s+class="([^"]*)")?[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (m, cls, code) => {
      const langMatch = (cls || '').match(/(?:language|lang)-([a-zA-Z0-9_-]+)/i);
      const lang = langMatch ? langMatch[1] : '';
      return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
    });

    // 4. Isolate code blocks into protected tokens
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

    // 5. Inline code
    out = out.replace(/`([^`\n]+)`/g, (m, c) => `<code class="inline-code" dir="ltr">${this.escapeHtml(c)}</code>`);

    // 6. Headings with directional typography
    out = out.replace(/^### (.*$)/gim, (m, h) => {
      const dir = this.detectTextDirection(h);
      return `<h5 dir="${dir}" class="${dir === 'rtl' ? 'is-rtl' : 'is-ltr'}" style="margin:8px 0 4px;color:#ddd6fe;">${h}</h5>`;
    });
    out = out.replace(/^## (.*$)/gim, (m, h) => {
      const dir = this.detectTextDirection(h);
      return `<h4 dir="${dir}" class="${dir === 'rtl' ? 'is-rtl' : 'is-ltr'}" style="margin:10px 0 6px;color:#ddd6fe;">${h}</h4>`;
    });
    out = out.replace(/^# (.*$)/gim, (m, h) => {
      const dir = this.detectTextDirection(h);
      return `<h3 dir="${dir}" class="${dir === 'rtl' ? 'is-rtl' : 'is-ltr'}" style="margin:12px 0 6px;color:#ddd6fe;">${h}</h3>`;
    });

    // 7. Blockquotes
    out = out.replace(/^\s*>\s+(.*$)/gim, (m, q) => {
      const dir = this.detectTextDirection(q);
      return `<blockquote dir="${dir}" class="${dir === 'rtl' ? 'is-rtl' : 'is-ltr'}">${q}</blockquote>`;
    });

    // 8. List items
    out = out.replace(/^\s*[-*•]\s+(.*$)/gim, (m, item) => {
      const dir = this.detectTextDirection(item);
      return `<li dir="${dir}" class="${dir === 'rtl' ? 'is-rtl' : 'is-ltr'}">${item}</li>`;
    });

    // 9. Bold and Italic formatting
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 10. Robust Paragraph and List Grouping
    const rawBlocks = out.split(/\n\n+/);
    const processedBlocks = rawBlocks.map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';

      if (codeBlocks.some(cb => cb.token === trimmed)) return trimmed;

      if (trimmed.includes('<li')) {
        const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
        const allListOrHeader = lines.every(l => l.startsWith('<li') || l.startsWith('<h') || l.startsWith('<blockquote'));
        if (allListOrHeader) {
          const listDir = this.detectTextDirection(trimmed);
          return `<ul dir="${listDir}" class="${listDir === 'rtl' ? 'is-rtl' : 'is-ltr'}">${trimmed.replace(/\n/g, '')}</ul>`;
        }
      }

      if (trimmed.startsWith('<h') || trimmed.startsWith('<blockquote')) {
        return trimmed.replace(/\n/g, '<br/>');
      }

      const dir = this.detectTextDirection(trimmed);
      return `<p dir="${dir}" class="${dir === 'rtl' ? 'is-rtl' : 'is-ltr'}">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    }).filter(Boolean);

    let finalHtml = processedBlocks.join('');
    codeBlocks.forEach(cb => {
      finalHtml = finalHtml.split(cb.token).join(cb.html);
    });
    return finalHtml;
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
}
