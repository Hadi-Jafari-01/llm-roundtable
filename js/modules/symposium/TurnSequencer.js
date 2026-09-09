/**
 * OmniAI Hub — The Silk Symposium Turn-Sequencing Engine
 * Autonomous turn-taking coordinator implementing 5 distinct deliberation topologies:
 *   1. Manual Conductor (نوبت‌دهی دستی با عصای ابریشمی)
 *   2. Orderly Round-Robin (حلقه نوبتی ساختاریافته)
 *   3. Socratic Dialectic (مناظره سقراطی مبتنی بر تقابل پرسوناها)
 *   4. Delphi Convergence (همگرایی دلفی)
 *   5. Fully Autonomous Flow (جریان ارگانیک خودگردان)
 */

export class TurnSequencer {
  constructor(state, callbacks = {}) {
    this.state = state;
    this.callbacks = {
      onSeatDispatched: () => {},
      onUserTurnPrompted: () => {},
      onTurnFinished: () => {},
      onRoundAdvanced: () => {},
      onSessionPaused: () => {},
      onSessionResumed: () => {},
      onSessionCompleted: () => {},
      onSessionWaitingForMaestro: () => {},
      ...callbacks
    };

    this.autoAdvanceTimer = null;
    this.safetyTimer = null;
  }

  start(initialPrompt = '', targetSeatIndex = null) {
    if (initialPrompt) {
      this.state.userCorePrompt = initialPrompt;
    }

    this.state.sessionStatus = 'ACTIVE';
    this.callbacks.onSessionResumed();

    let targetIndex = targetSeatIndex;
    if (typeof targetIndex !== 'number' || targetIndex < 0 || targetIndex >= this.state.seats.length) {
      targetIndex = this.determineFirstSpeaker();
    }
    this.dispatchTurn(targetIndex);
  }

  pause() {
    this.state.sessionStatus = 'PAUSED';
    clearTimeout(this.autoAdvanceTimer);
    clearTimeout(this.safetyTimer);
    this.callbacks.onSessionPaused();
  }

  resume() {
    if (this.state.sessionStatus === 'ACTIVE') return;
    this.state.sessionStatus = 'ACTIVE';
    this.callbacks.onSessionResumed();
    this.advanceNext();
  }

  passBaton(targetSeatIndex, immediateContext = '') {
    clearTimeout(this.autoAdvanceTimer);
    clearTimeout(this.safetyTimer);

    // If a speaker is currently streaming, cleanly conclude it without dropping
    if (this.state.isSpeakerStreaming) {
      this.state.concludeStreamingTurn();
    }

    this.state.sessionStatus = 'ACTIVE';
    this.callbacks.onSessionResumed();
    this.dispatchTurn(targetSeatIndex, immediateContext);
    return true;
  }

  completeTurn(text = '', isFinished = true) {
    clearTimeout(this.safetyTimer);
    this.state.concludeStreamingTurn();

    const activeSeat = this.state.seats[this.state.activeSpeakerIndex];
    if (activeSeat) {
      activeSeat.turnCount = (activeSeat.turnCount || 0) + 1;
      activeSeat.status = 'idle';
    }

    this.callbacks.onTurnFinished({
      seatIndex: this.state.activeSpeakerIndex,
      seat: activeSeat,
      text,
      isFinished
    });

    // Progression logic: Seamless coordination with Manual Turn-Taking
    if (this.state.debateMode === 'manual') {
      // Manual conductor halts cleanly after each speech, calculating the recommended next chair
      this.state.sessionStatus = 'WAITING_FOR_MAESTRO';
      const recommendedNext = this.state.calculateRecommendedNextSpeaker();
      this.state.recommendedNextSpeakerIndex = recommendedNext;

      this.callbacks.onSessionWaitingForMaestro({
        seatIndex: recommendedNext,
        seat: this.state.seats[recommendedNext]
      });
      return;
    }

    if (this.state.sessionStatus !== 'ACTIVE') return;

    // Schedule next turn in automated flow
    clearTimeout(this.autoAdvanceTimer);
    const delay = this.state.config.autoAdvanceDelayMs || 2400;
    this.autoAdvanceTimer = setTimeout(() => {
      this.advanceNext();
    }, delay);
  }

  advanceNext() {
    if (!this.state.seats || this.state.seats.length === 0) return;

    // If in manual mode, dispatch the recommended or active speaker index
    if (this.state.debateMode === 'manual' || this.state.sessionStatus === 'WAITING_FOR_MAESTRO') {
      const nextIdx = (typeof this.state.recommendedNextSpeakerIndex === 'number' && this.state.recommendedNextSpeakerIndex >= 0)
        ? this.state.recommendedNextSpeakerIndex
        : this.state.calculateRecommendedNextSpeaker();

      this.state.sessionStatus = 'ACTIVE';
      this.callbacks.onSessionResumed();
      this.dispatchTurn(nextIdx);
      return;
    }

    if (this.state.sessionStatus !== 'ACTIVE') return;

    const nextIndex = this.calculateNextSpeakerIndex();
    if (nextIndex === -1) {
      this.pause();
      this.callbacks.onSessionCompleted();
      return;
    }

    this.dispatchTurn(nextIndex);
  }

  dispatchTurn(seatIndex, immediateContext = '') {
    const seat = this.state.seats[seatIndex];
    if (!seat || seat.isMuted) {
      this.advanceNext();
      return;
    }

    this.state.activeSpeakerIndex = seatIndex;
    this.state.isSpeakerStreaming = true;
    this.state.resetAllSeatStatuses(seatIndex);
    this.state.setSeatStatus(seatIndex, 'speaking');

    // Case A: Seated User's turn
    if (seat.isUser) {
      this.state.sessionStatus = 'WAITING_FOR_USER';
      this.callbacks.onUserTurnPrompted({
        seat,
        seatIndex
      });
      return;
    }

    // Case B: AI Model turn
    this.callbacks.onSeatDispatched({
      seat,
      seatIndex,
      immediateContext
    });

    // Safety watchdog: prevent hanging if model frame stops responding
    clearTimeout(this.safetyTimer);
    this.safetyTimer = setTimeout(() => {
      if (this.state.isSpeakerStreaming && this.state.activeSpeakerIndex === seatIndex) {
        console.warn('[TurnSequencer] Speaker watchdog timeout triggered. Advancing.');
        this.completeTurn('(Response turn timed out)', true);
      }
    }, 50000);
  }

  calculateNextSpeakerIndex() {
    const { seats, activeSpeakerIndex, debateMode, roundIndex, config } = this.state;
    const count = seats.length;
    if (count === 0) return -1;

    switch (debateMode) {
      case 'manual': {
        // Calculate recommended next speaker without halting sequencer abruptly
        return this.state.calculateRecommendedNextSpeaker();
      }

      case 'round_robin':
      case 'autonomous': {
        let next = (activeSpeakerIndex + 1) % count;
        let checked = 0;
        while (seats[next]?.isMuted && checked < count) {
          next = (next + 1) % count;
          checked++;
        }
        if (next <= activeSpeakerIndex) {
          this.advanceRound();
        }
        return next;
      }

      case 'socratic':
      case 'delphi': {
        let next = (activeSpeakerIndex + 1) % count;
        let checked = 0;
        while (seats[next]?.isMuted && checked < count) {
          next = (next + 1) % count;
          checked++;
        }
        if (next <= activeSpeakerIndex) {
          this.advanceRound();
        }
        return next;
      }

      case 'random': {
        const available = [];
        seats.forEach((s, i) => {
          if (!s.isMuted && i !== activeSpeakerIndex) available.push(i);
        });
        if (available.length === 0) return (activeSpeakerIndex + 1) % count;
        return available[Math.floor(Math.random() * available.length)];
      }

      default:
        return (activeSpeakerIndex + 1) % count;
    }
  }

  determineFirstSpeaker() {
    const { seats } = this.state;
    if (this.state.userParticipant.isSeated) {
      // If user is seated, user opens the symposium
      const userIdx = seats.findIndex(s => s.isUser);
      if (userIdx >= 0) return userIdx;
    }
    // Or first unmuted model
    const firstActive = seats.findIndex(s => !s.isMuted);
    return firstActive >= 0 ? firstActive : 0;
  }

  advanceRound() {
    this.state.roundIndex++;
    this.callbacks.onRoundAdvanced(this.state.roundIndex);

    if (this.state.config.maxRounds > 0 && this.state.roundIndex > this.state.config.maxRounds) {
      this.pause();
      this.callbacks.onSessionCompleted();
    }
  }
}
