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
      ...callbacks
    };
  }

  render(seats = [], activeIndex = 0, waitingForUser = false, recommendedNextIndex = -1, waitingForMaestro = false) {
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
      const isCurrentSpeaker = idx === activeIndex && !waitingForMaestro;
      const isRecommendedNext = idx === recommendedNextIndex && waitingForMaestro;
      const isUserSeat = Boolean(seat.isUser);

      const seatCard = document.createElement('div');
      seatCard.className = `symposium-seat-card ${seat.status || 'idle'} ${seat.isMuted ? 'muted' : ''} ${isUserSeat ? 'user-seat' : ''} ${isCurrentSpeaker ? 'active-speaker' : ''} ${isRecommendedNext ? 'recommended-next' : ''}`;
      if (isUserSeat && waitingForUser) {
        seatCard.classList.add('your-turn');
      }

      seatCard.dataset.seatIndex = idx;
      seatCard.style.setProperty('--model-color', seat.color || '#c084fc');

      let avatarSymbol = seat.personaBadge?.trim().slice(0, 2) || (isUserSeat ? '👑' : '🤖');
      if (avatarSymbol.length > 2 && !avatarSymbol.startsWith('&#')) {
        avatarSymbol = avatarSymbol.slice(0, 2);
      }

      seatCard.innerHTML = `
        <div class="seat-jewel-avatar" style="--model-color: ${seat.color || '#c084fc'};" title="${this.escapeHtml(seat.name)}">
          <span>${avatarSymbol}</span>
        </div>
        <div class="seat-details-expandable">
          <div class="seat-name-row">
            <span class="seat-name-text" title="${this.escapeHtml(seat.name)}">${this.escapeHtml(seat.name)}</span>
            ${seat.isCustomized ? '<span class="seat-custom-indicator" title="Customized Persona">✦</span>' : ''}
          </div>
          <span class="seat-persona-subtext" title="${this.escapeHtml(seat.personaTitle)}">
            ${this.escapeHtml(seat.personaTitle ? seat.personaTitle.split('(')[0].trim() : 'AI Chair')}
          </span>
        </div>
        <div class="seat-hover-actions">
          <button type="button" class="btn-seat-quick-action btn-seat-edit" title="بازرسی و تنظیم سریع پرسونا (Inline Inspector)">⚙️</button>
          ${!isUserSeat ? `
            <button type="button" class="btn-seat-quick-action btn-seat-mute ${seat.isMuted ? 'muted' : ''}" title="${seat.isMuted ? 'Unmute' : 'Mute'}">
              ${seat.isMuted ? '🔇' : '🔊'}
            </button>
          ` : ''}
          <button type="button" class="btn-seat-quick-action btn-pass-baton-icon" title="Pass Speaking Baton (🪄)">🪄</button>
        </div>
      `;

      // 1. Contextual Inline Inspector trigger via Gear
      seatCard.querySelector('.btn-seat-edit')?.addEventListener('click', (e) => {
        e.stopPropagation();
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
        this.callbacks.onToggleMute(idx);
      });

      // 3. Pass Baton Icon
      seatCard.querySelector('.btn-pass-baton-icon')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.callbacks.onPassBaton(idx);
      });

      // 4. Clicking the avatar or pod opens the quick inline inspector if not dragging
      seatCard.querySelector('.seat-jewel-avatar')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = seatCard.getBoundingClientRect();
        if (typeof this.callbacks.onOpenInspector === 'function') {
          this.callbacks.onOpenInspector(idx, rect);
        } else {
          this.callbacks.onConfigureSeat(idx);
        }
      });

      seatCard.addEventListener('click', () => {
        this.callbacks.onPassBaton(idx);
      });

      this.ribbonEl.appendChild(seatCard);
    });
  }

  highlightActiveSeat(activeIndex, waitingForUser = false, recommendedNextIndex = -1, waitingForMaestro = false) {
    if (!this.ribbonEl) return;
    this.ribbonEl.querySelectorAll('.symposium-seat-card').forEach((card, idx) => {
      const isCurrentSpeaker = idx === activeIndex && !waitingForMaestro;
      const isRecommendedNext = idx === recommendedNextIndex && waitingForMaestro;

      card.classList.toggle('active-speaker', isCurrentSpeaker);
      card.classList.toggle('recommended-next', isRecommendedNext);

      if (card.classList.contains('user-seat')) {
        card.classList.toggle('your-turn', isCurrentSpeaker && waitingForUser);
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
