/**
 * OmniAI Hub — The Left-Rail Amphitheater Dais (Celestial Models Rail)
 * Pure UI component responsible for rendering the vertical jewel pods on the left rail,
 * avatar jewel badges, expandable persona details, status glows, and interactive baton tools.
 */

export class SymposiumDais {
  constructor(containerEl, ribbonEl, callbacks = {}) {
    this.containerEl = containerEl;
    this.ribbonEl = ribbonEl;
    this.callbacks = {
      onPassBaton: () => {},
      onConfigureSeat: () => {},
      onToggleMute: () => {},
      onCallSupervisor: () => {},
      ...callbacks
    };
  }

  render(seats = [], activeIndex = -1, waitingForUser = false, recommendedNextIndex = -1, waitingForMaestro = false, isSpeaking = false, supervisors = [], activeSupervisorCardIds = new Set()) {
    if (!this.ribbonEl) return;
    this.ribbonEl.innerHTML = '';

    if (!seats || seats.length === 0) {
      this.ribbonEl.innerHTML = `
        <div style="font-size: 10px; color: #94a3b8; padding: 12px 6px; text-align: center;">
          No active models on canvas.
        </div>
      `;
      return;
    }

    seats.forEach((seat, idx) => {
      const isCurrentSpeaker = Boolean(isSpeaking) && idx === activeIndex && !waitingForMaestro;
      const isRecommendedNext = idx === recommendedNextIndex && waitingForMaestro && !isSpeaking;
      const isUserSeat = Boolean(seat.isUser);

      const seatStatus = isCurrentSpeaker ? 'speaking' : (isRecommendedNext ? 'recommended' : (seat.isMuted ? 'muted' : 'idle'));

      const seatCard = document.createElement('div');
      seatCard.className = `symposium-seat-card ${seatStatus} ${seat.isMuted ? 'muted' : ''} ${isUserSeat ? 'user-seat' : ''} ${isCurrentSpeaker ? 'active-speaker' : ''} ${isRecommendedNext ? 'recommended-next' : ''}`;
      if (isUserSeat && waitingForUser) {
        seatCard.classList.add('your-turn');
      }

      seatCard.dataset.seatIndex = idx;
      seatCard.style.setProperty('--model-color', seat.color || '#c084fc');

      let avatarSymbol = seat.personaBadge?.trim().slice(0, 2) || (isUserSeat ? '👑' : '🤖');
      if (avatarSymbol.length > 2 && !avatarSymbol.startsWith('&#')) {
        avatarSymbol = avatarSymbol.slice(0, 2);
      }

      seatCard.setAttribute('role', 'button');
      seatCard.setAttribute('tabindex', '0');
      const personaLabel = seat.personaTitle ? seat.personaTitle.split('(')[0].trim() : (isUserSeat ? 'Human Maestro' : 'AI Chair');
      const statusDotClass = isCurrentSpeaker ? 'speaking' : (isRecommendedNext ? 'recommended' : (seat.isMuted ? 'muted' : 'idle'));
      const cardTooltip = `کلیک برای سپردن نوبت به ${seat.name}${isCurrentSpeaker ? ' (هم‌اکنون در حال سخن گفتن)' : ''}`;
      seatCard.title = cardTooltip;

      seatCard.innerHTML = `
        <div class="seat-card-main">
          <div class="seat-jewel-avatar" style="--model-color: ${seat.color || '#c084fc'};">
            <span class="avatar-symbol">${avatarSymbol}</span>
            <span class="seat-status-dot ${statusDotClass}"></span>
          </div>
          <div class="seat-details-expandable">
            <div class="seat-name-row">
              <span class="seat-name-text" title="${this.escapeHtml(seat.name)}">${this.escapeHtml(seat.name)}</span>
              ${seat.isCustomized ? '<span class="seat-custom-indicator" title="Customized Persona">✦</span>' : ''}
            </div>
            <span class="seat-persona-subtext" title="${this.escapeHtml(seat.personaTitle || '')}">
              ${this.escapeHtml(personaLabel)}
            </span>
          </div>
        </div>

        <div class="seat-tail-cluster">
          ${isCurrentSpeaker ? `
            <div class="seat-live-wave" title="در حال سخن گفتن">
              <span></span><span></span><span></span>
            </div>
          ` : `
            <span class="seat-run-hint" title="کلیک برای اجرا">
              <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
            </span>
          `}
          <div class="seat-hover-actions">
            <button type="button" class="btn-seat-quick-action btn-seat-edit" title="تنظیمات پرسونا و پرومپت">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
            </button>
            ${!isUserSeat ? `
              <button type="button" class="btn-seat-quick-action btn-seat-mute ${seat.isMuted ? 'muted' : ''}" title="${seat.isMuted ? 'فعال‌سازی صدا' : 'بی‌صدا کردن'}">
                ${seat.isMuted ? `
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                ` : `
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                `}
              </button>
            ` : ''}
          </div>
        </div>
      `;

      // 1. Contextual Inline Inspector trigger via Gear
      seatCard.querySelector('.btn-seat-edit')?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const rect = seatCard.getBoundingClientRect();
        if (typeof this.callbacks.onOpenInspector === 'function') {
          this.callbacks.onOpenInspector(idx, rect);
        } else {
          this.callbacks.onConfigureSeat(idx);
        }
      });

      // 2. Mute / Unmute
      seatCard.querySelector('.btn-seat-mute')?.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.callbacks.onToggleMute(idx);
      });

      // 3. Main Card Click - Executes Turn (Baton)
      seatCard.addEventListener('click', (e) => {
        if (e.target.closest('.btn-seat-edit') || e.target.closest('.btn-seat-mute')) {
          return;
        }
        this.callbacks.onPassBaton(idx);
      });

      // 4. Keyboard trigger
      seatCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target.closest('.btn-seat-edit') || e.target.closest('.btn-seat-mute')) return;
          e.preventDefault();
          this.callbacks.onPassBaton(idx);
        }
      });

      this.ribbonEl.appendChild(seatCard);
    });

    // ── بخش کابینه نظارت و ارکان مدیریتی در ریل چپ ──
    if (supervisors && supervisors.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'dais-supervisors-divider';
      divider.innerHTML = `
        <span class="supervisors-section-label">🛡️ کابینه نظارت (${supervisors.length})</span>
      `;
      this.ribbonEl.appendChild(divider);

      supervisors.forEach(sup => {
        const isEvaluating = activeSupervisorCardIds.has(sup.cardId);
        const isAdvisor = sup.roleKey === 'user_advisor' || Boolean(sup.isDirectAnswer);
        const pod = document.createElement('div');
        pod.className = `symposium-supervisor-pod ${isEvaluating ? 'evaluating' : ''} ${isAdvisor ? 'advisor-pod' : ''}`;
        pod.style.setProperty('--sup-color', sup.color || (isAdvisor ? '#38bdf8' : '#10a37f'));
        pod.title = isAdvisor
          ? `مشاور اختصاصی شما: ${sup.name} - پاسخگوی سوالات بر اساس میزگرد (کلیک برای پرسش)`
          : `ناظر شورا: ${sup.name} (${sup.roleTitle}) - کلیک برای فراخوانی آنی`;

        const callBtnTitle = isAdvisor
          ? 'پرسش از مشاور اختصاصی بر اساس مباحث میزگرد (💡)'
          : 'فراخوانی آنی این ناظر (⚡)';
        const callBtnText = isAdvisor ? 'پرسش' : 'فراخوانی';
        const callBtnIcon = isAdvisor ? '💡' : `<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;

        pod.innerHTML = `
          <div class="sup-pod-main">
            <div class="sup-jewel-avatar">
              <span class="avatar-symbol">${sup.roleBadge || (isAdvisor ? '💡' : '🛡️')}</span>
              <span class="sup-status-dot ${isEvaluating ? 'evaluating' : 'idle'}"></span>
            </div>
            <div class="seat-details-expandable">
              <div class="seat-name-row">
                <span class="seat-name-text" title="${this.escapeHtml(sup.name)}">${this.escapeHtml(sup.name)}</span>
              </div>
              <span class="seat-persona-subtext" title="${this.escapeHtml(sup.roleTitle)}">
                ${this.escapeHtml(sup.roleTitle.split('(')[0].trim())}
              </span>
            </div>
          </div>
          <div class="seat-tail-cluster">
            ${isEvaluating ? `
              <div class="seat-live-wave" title="${isAdvisor ? 'در حال پاسخگویی...' : 'در حال ممیزی...'}">
                <span></span><span></span><span></span>
              </div>
            ` : `
              <button type="button" class="btn-supervisor-call ${isAdvisor ? 'advisor-call' : ''}" title="${callBtnTitle}">
                ${isAdvisor ? '<span>💡</span>' : callBtnIcon}
                <span class="btn-call-text">${callBtnText}</span>
              </button>
            `}
          </div>
        `;

        pod.querySelector('.btn-supervisor-call')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.callbacks.onCallSupervisor?.(sup.assignmentId);
        });

        pod.addEventListener('click', (e) => {
          if (e.target.closest('.btn-supervisor-call')) return;
          this.callbacks.onCallSupervisor?.(sup.assignmentId);
        });

        this.ribbonEl.appendChild(pod);
      });
    }
  }

  highlightActiveSeat(activeIndex = -1, waitingForUser = false, recommendedNextIndex = -1, waitingForMaestro = false, isSpeaking = false) {
    if (!this.ribbonEl) return;
    this.ribbonEl.querySelectorAll('.symposium-seat-card').forEach((card, idx) => {
      const isCurrentSpeaker = Boolean(isSpeaking) && idx === activeIndex && !waitingForMaestro;
      const isRecommendedNext = idx === recommendedNextIndex && waitingForMaestro && !isSpeaking;

      card.classList.toggle('active-speaker', isCurrentSpeaker);
      card.classList.toggle('recommended-next', isRecommendedNext);

      if (card.classList.contains('user-seat')) {
        card.classList.toggle('your-turn', isCurrentSpeaker && waitingForUser);
      }

      // Update status dot
      const dot = card.querySelector('.seat-status-dot');
      if (dot) {
        dot.className = `seat-status-dot ${isCurrentSpeaker ? 'speaking' : (isRecommendedNext ? 'recommended' : 'idle')}`;
      }

      // Dynamically add/remove live equalizer wave
      let wave = card.querySelector('.seat-live-wave');
      const tail = card.querySelector('.seat-tail-cluster');
      const runHint = card.querySelector('.seat-run-hint');

      if (isCurrentSpeaker) {
        if (runHint) runHint.style.display = 'none';
        if (!wave && tail) {
          wave = document.createElement('div');
          wave.className = 'seat-live-wave';
          wave.title = 'در حال سخن گفتن';
          wave.innerHTML = '<span></span><span></span><span></span>';
          tail.prepend(wave);
        }
      } else {
        if (wave) wave.remove();
        if (runHint) runHint.style.display = '';
      }
    });
  }

  toggleVisibility(collapsed) {
    this.containerEl?.classList.toggle('collapsed', Boolean(collapsed));
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
