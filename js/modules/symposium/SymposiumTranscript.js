/**
 * OmniAI Hub — The Silk Symposium Transcript & Bubble Engine
 * Renders dialogue turns, bidirectional Persian/English typography,
 * code blocks with copy utilities, and interactive argument chips (Challenge, Crown, Synthesize).
 */

export class SymposiumTranscript {
  constructor(viewportEl, callbacks = {}) {
    this.viewportEl = viewportEl;
    this.callbacks = {
      onChallenge: () => {},
      onCrownInsight: () => {},
      onSynthesize: () => {},
      ...callbacks
    };

    this.bindEvents();
  }

  bindEvents() {
    this.viewportEl?.addEventListener('click', (e) => {
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
        const codeBlock = copyBtn.closest('.symposium-code-box')?.querySelector('.symposium-code-body code');
        if (codeBlock) {
          navigator.clipboard.writeText(codeBlock.textContent || codeBlock.innerText);
          const orig = copyBtn.textContent;
          copyBtn.textContent = '✓ Copied';
          setTimeout(() => { copyBtn.textContent = orig; }, 1800);
        }
      }

      const foldTrigger = e.target.closest('.reasoning-fold-trigger');
      if (foldTrigger) {
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

  render(turns = []) {
    if (!this.viewportEl) return;

    if (!turns || turns.length === 0) {
      this.viewportEl.innerHTML = `
        <div class="symposium-empty-sanctuary">
          <div class="symposium-empty-orb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="5"/>
            </svg>
          </div>
          <h3>The Silk Symposium Agora</h3>
          <p>Convene a high-order cognitive roundtable. Enter an inquiry below or pass the baton to initiate deliberation.</p>
        </div>
      `;
      return;
    }

    this.viewportEl.innerHTML = '';
    turns.forEach(turn => {
      const row = this.createTurnElement(turn);
      this.viewportEl.appendChild(row);
    });

    this.scrollToBottom();
  }

  createTurnElement(turn) {
    const row = document.createElement('div');
    const isUser = turn.role === 'user';
    const isSeatedUser = Boolean(turn.isSeatedUser);

    row.className = `symposium-turn-row ${isUser ? 'user' : 'model'} ${isSeatedUser ? 'seated-user' : ''}`;
    row.id = `turn-${turn.id}`;

    const textDir = this.detectTextDirection(turn.text || '');
    const isRTL = textDir === 'rtl';

    if (isUser) {
      const speakerBadge = isSeatedUser ? `${turn.speakerName} (${turn.personaBadge || '👑 You'})` : 'Human Maestro (Observer)';
      row.innerHTML = `
        <div class="symposium-turn-meta">
          <span class="turn-speaker-badge" style="color: ${turn.color || '#f59e0b'}; font-weight: 600;">
            ${this.escapeHtml(speakerBadge)}
          </span>
          • <span>Round ${turn.round || 1}</span> • <span>${turn.timestamp || ''}</span>
        </div>
        <div class="symposium-bubble-card ${isRTL ? 'is-rtl' : 'is-ltr'}" dir="${textDir}">
          ${this.escapeHtml(turn.text)}
        </div>
      `;
    } else {
      const renderedMd = this.renderMarkdown(turn.text || '');
      const thinkingHtml = turn.thinkingText ? `
        <div class="mirror-reasoning-fold" style="margin-bottom: 8px;">
          <button type="button" class="reasoning-fold-trigger">
            <span>🧠 Thinking Process</span>
            <span>▼</span>
          </button>
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
          <span class="turn-round-tag">Round ${turn.round || 1}</span> • <span>${turn.timestamp || ''}</span>
        </div>

        <div class="symposium-bubble-card ${isRTL ? 'is-rtl' : 'is-ltr'}" dir="${textDir}" style="--model-color: ${turn.color};">
          ${thinkingHtml}
          <div class="symposium-markdown">${renderedMd}</div>
          ${pulseHtml}

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
      return `<p dir="${dir}" class="${dir === 'rtl' ? 'is-rtl' : 'is-ltr'}">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    }).filter(Boolean);

    let finalHtml = paragraphs.join('');
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