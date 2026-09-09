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
      ...callbacks
    };

    this.autoAdvanceTimer = null;
    this.safetyTimer = null;
  }

  start(initialPrompt = '') {
    if (initialPrompt) {
      this.state.userCorePrompt = initialPrompt;
    }

    this.state.sessionStatus = 'ACTIVE';
    this.callbacks.onSessionResumed();

    const targetIndex = this.determineFirstSpeaker();
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

  passBaton(targetSeatIndex) {
    if (this.state.isSpeakerStreaming) {
      console.warn('[TurnSequencer] Speaker active. Baton pass queued or rejected.');
      return false;
    }

    clearTimeout(this.autoAdvanceTimer);
    clearTimeout(this.safetyTimer);
    this.state.sessionStatus = 'ACTIVE';
    this.callbacks.onSessionResumed();
    this.dispatchTurn(targetSeatIndex);
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

    if (this.state.sessionStatus !== 'ACTIVE') return;

    // Progression logic based on active topology
    if (this.state.debateMode === 'manual') {
      // Manual conductor halts after each speech, awaiting maestro trigger
      this.pause();
      return;
    }

    // Schedule next turn
    clearTimeout(this.autoAdvanceTimer);
    const delay = this.state.config.autoAdvanceDelayMs || 2200;
    this.autoAdvanceTimer = setTimeout(() => {
      this.advanceNext();
    }, delay);
  }

  advanceNext() {
    if (this.state.sessionStatus !== 'ACTIVE') return;
    if (!this.state.seats || this.state.seats.length === 0) return;

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
      case 'manual':
        return -1;

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

      case 'socratic': {
        // Socratic Dialectic: Picks the seat with maximum theoretical tension with the last speaker
        const lastSpeaker = seats[activeSpeakerIndex];
        let candidateIdx = -1;

        if (lastSpeaker?.personaKey === 'architect' || lastSpeaker?.personaKey === 'empiricist') {
          candidateIdx = seats.findIndex(s => s.personaKey === 'devils_advocate' && !s.isMuted);
        } else if (lastSpeaker?.personaKey === 'devils_advocate') {
          candidateIdx = seats.findIndex(s => s.personaKey === 'synthesizer' && !s.isMuted);
        } else if (lastSpeaker?.personaKey === 'innovator') {
          candidateIdx = seats.findIndex(s => s.personaKey === 'cynic' && !s.isMuted);
        }

        if (candidateIdx === -1 || candidateIdx === activeSpeakerIndex) {
          candidateIdx = (activeSpeakerIndex + 1) % count;
          while (seats[candidateIdx]?.isMuted && candidateIdx !== activeSpeakerIndex) {
            candidateIdx = (candidateIdx + 1) % count;
          }
        }

        if (candidateIdx <= activeSpeakerIndex) {
          this.advanceRound();
        }
        return candidateIdx;
      }

      case 'delphi': {
        // Delphi Convergence: Cycles through participants until round limit, then calls synthesizer
        if (roundIndex >= config.maxRounds) {
          const synthIdx = seats.findIndex(s => s.personaKey === 'synthesizer' && !s.isMuted);
          return synthIdx >= 0 ? synthIdx : activeSpeakerIndex;
        }

        let next = (activeSpeakerIndex + 1) % count;
        while (seats[next]?.isMuted) {
          next = (next + 1) % count;
        }
        if (next <= activeSpeakerIndex) {
          this.advanceRound();
        }
        return next;
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
      if (this.state.config.autoSynthesizeOnFinish) {
        const synthIdx = this.state.seats.findIndex(s => s.personaKey === 'synthesizer');
        if (synthIdx >= 0) {
          this.dispatchTurn(synthIdx, 'FINAL CONSENSUS MANDATE: Formulate the definitive synthesis.');
          return;
        }
      }
      this.pause();
      this.callbacks.onSessionCompleted();
    }
  }
}
