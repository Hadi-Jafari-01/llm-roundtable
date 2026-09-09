/**
 * OmniAI Hub — The Amphitheater Dais (The Celestial Chairs)
 * Pure UI component responsible for rendering the floating crystal seats,
 * real-time thinking pulses, active speaker highlights, and baton controls.
 */

export class SymposiumDais {
  constructor(containerEl, ribbonEl, callbacks = {}) {
    this.containerEl = containerEl;
    this.ribbonEl = ribbonEl;
    this.callbacks = {
      onPassBaton: () => {},
      onConfigureSeat: () => {},
      onToggleMute: () => {},
      ...callbacks
    };
  }

  render(seats = [], activeIndex = 0, waitingForUser = false) {
    if (!this.ribbonEl) return;
    this.ribbonEl.innerHTML = '';

    if (!seats || seats.length === 0) {
      this.ribbonEl.innerHTML = `
        <div style="font-size: 11.5px; color: #94a3b8; padding: 10px 14px;">
          No active intelligence seats on canvas. Open models on workspace to convene.
        </div>
      `;
      return;
    }

    seats.forEach((seat, idx) => {
      const isCurrentSpeaker = idx === activeIndex;
      const isUserSeat = Boolean(seat.isUser);

      const seatCard = document.createElement('div');
      seatCard.className = `symposium-seat-card ${seat.status || 'idle'} ${seat.isMuted ? 'muted' : ''} ${isUserSeat ? 'user-seat' : ''} ${isCurrentSpeaker ? 'active-speaker' : ''}`;
      if (isUserSeat && waitingForUser) {
        seatCard.classList.add('your-turn');
      }

      seatCard.dataset.seatIndex = idx;
      seatCard.style.setProperty('--model-color', seat.color || '#c084fc');

      const statusLabel = isUserSeat && waitingForUser
        ? 'YOUR TURN'
        : (isCurrentSpeaker ? 'SPEAKING' : (seat.status || 'IDLE').toUpperCase());

      seatCard.innerHTML = `
        <div class="seat-top-row">
          <div class="seat-identity">
            <span class="seat-status-dot" style="background: ${seat.color}; color: ${seat.color};"></span>
            <span class="seat-name-text" title="${this.escapeHtml(seat.name)}">
              ${this.escapeHtml(seat.name)}
            </span>
          </div>
          <div class="seat-top-actions">
            ${!isUserSeat ? `
              <button type="button" class="seat-action-btn btn-seat-mute ${seat.isMuted ? 'muted' : ''}" title="${seat.isMuted ? 'فعال‌سازی مجدد مدل (Unmute)' : 'بی‌صدا کردن این مدل (Mute)'}">
                ${seat.isMuted ? '🔇' : '🔊'}
              </button>
            ` : ''}
            <button type="button" class="seat-action-btn btn-seat-edit" title="تنظیم آزادانه شخصیت، دستور سیستمی و پرومپت این مدل">
              ⚙️
            </button>
            <span class="seat-status-pill">${statusLabel}</span>
          </div>
        </div>

        <div class="seat-persona-badge" title="${this.escapeHtml(seat.personaDirective || seat.personaTitle)}">
          <span class="persona-icon">${seat.personaBadge || '🏛️'}</span>
          <span class="persona-text">${this.escapeHtml(seat.personaTitle.split('(')[0].trim())}</span>
          ${seat.isCustomized ? '<span class="seat-custom-indicator" title="شخصیت و دستورات سفارشی‌سازی شده">✦</span>' : ''}
        </div>

        <div class="seat-bottom-row">
          <button type="button" class="btn-pass-baton" title="Pass the speaking baton directly to this seat">
            <span>Pass Baton 🪄</span>
          </button>
          <span class="seat-weight-tag">${seat.weight || 100}% weight</span>
        </div>
      `;

      // Edit persona and directives button click
      seatCard.querySelector('.btn-seat-edit')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.callbacks.onConfigureSeat(idx);
      });

      // Mute / Unmute quick toggle
      seatCard.querySelector('.btn-seat-mute')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.callbacks.onToggleMute(idx);
      });

      // Pass baton button click
      seatCard.querySelector('.btn-pass-baton')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.callbacks.onPassBaton(idx);
      });

      // Configure seat by clicking seat card
      seatCard.addEventListener('click', () => {
        this.callbacks.onConfigureSeat(idx);
      });

      this.ribbonEl.appendChild(seatCard);
    });
  }

  highlightActiveSeat(activeIndex, waitingForUser = false) {
    if (!this.ribbonEl) return;
    this.ribbonEl.querySelectorAll('.symposium-seat-card').forEach((card, idx) => {
      const isTarget = idx === activeIndex;
      card.classList.toggle('active-speaker', isTarget);
      if (card.classList.contains('user-seat')) {
        card.classList.toggle('your-turn', isTarget && waitingForUser);
      }
      const pill = card.querySelector('.seat-status-pill');
      if (pill) {
        pill.textContent = isTarget ? (card.classList.contains('user-seat') && waitingForUser ? 'YOUR TURN' : 'SPEAKING') : 'IDLE';
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
