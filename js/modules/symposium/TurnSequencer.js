/**
 * OmniAI Hub — The Silk Symposium Dual-Paradigm Turn-Sequencing Engine
 * Manages strictly 2 fundamental deliberation paradigms:
 *   1. Human Maestro Conductor (حاکمیت مطلق و نوبت‌دهی دستی انسان)
 *   2. AI Chairman / Autonomous Conductor (ریاست هوشمند مدل بر اساس متدولوژی با گیت تأیید گام‌به‌گام)
 */

export class TurnSequencer {
  constructor(state, callbacks = {}) {
    this.state = state;
    this.callbacks = {
      onSeatDispatched: () => {},
      onUserTurnPrompted: () => {},
      onTurnFinished: () => {},
      onAITurnProposed: () => {},
      onProposalApproved: () => {},
      onProposalVetoed: () => {},
      onRoundAdvanced: () => {},
      onSessionPaused: () => {},
      onSessionResumed: () => {},
      onSessionCompleted: () => {},
      onSessionWaitingForMaestro: () => {},
      onGovernanceTriggered: () => {},
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
    if (this.isCompletingTurn) return;
    this.isCompletingTurn = true;
    clearTimeout(this.safetyTimer);
    this.state.concludeStreamingTurn();

    const activeSeat = this.state.seats[this.state.activeSpeakerIndex];
    if (activeSeat) {
      activeSeat.turnCount = (activeSeat.turnCount || 0) + 1;
      activeSeat.status = 'idle';
    }

    const currentTurn = this.state.transcript[this.state.transcript.length - 1];

    this.callbacks.onTurnFinished({
      seatIndex: this.state.activeSpeakerIndex,
      seat: activeSeat,
      text,
      isFinished
    });

    // فراخوانی بررسی‌های کابینه نظارت پس از پایان هر نوبت
    if (activeSeat && !activeSeat.isMuted) {
      this.triggerGovernanceEvaluation('every_turn', {
        seat: activeSeat,
        text,
        speakerName: activeSeat?.name,
        turnId: currentTurn?.id
      });
    }

    setTimeout(() => {
      this.isCompletingTurn = false;
    }, 600);

    // ۱. در حالت مدیریت کاملاً دستی انسان (Human Maestro)
    if (this.state.debateMode === 'manual') {
      this.state.sessionStatus = 'WAITING_FOR_MAESTRO';
      const recommendedNext = this.state.calculateRecommendedNextSpeaker();
      this.state.recommendedNextSpeakerIndex = recommendedNext;

      this.callbacks.onSessionWaitingForMaestro({
        seatIndex: recommendedNext,
        seat: this.state.seats[recommendedNext]
      });
      return;
    }

    // ۲. در حالت ریاست هوش مصنوعی (AI Chairman Conductor)
    if (this.state.debateMode === 'ai_chairman') {
      if (this.state.sessionStatus !== 'ACTIVE') return;

      const proposal = this.calculateNextChairmanProposal();
      if (!proposal) {
        this.pause();
        this.callbacks.onSessionCompleted();
        return;
      }

      // اگر تأیید گام‌به‌گام فعال باشد، نوبت متوقف شده و کارت پیشنهاد به انسان نمایش داده می‌شود
      if (this.state.config.aiStepApprovalRequired) {
        this.state.sessionStatus = 'WAITING_FOR_MAESTRO_APPROVAL';
        this.state.proposedTurn = proposal;
        this.callbacks.onAITurnProposed(proposal);
        return;
      }

      // در غیر این صورت با تأخیر خودکار پیش می‌رود
      clearTimeout(this.autoAdvanceTimer);
      const delay = this.state.config.autoAdvanceDelayMs || 2400;
      this.autoAdvanceTimer = setTimeout(() => {
        this.dispatchTurn(proposal.nextSeatIndex, proposal.proposedMandate);
      }, delay);
      return;
    }

    if (this.state.sessionStatus !== 'ACTIVE') return;
  }

  advanceNext() {
    if (!this.state.seats || this.state.seats.length === 0) return;

    // مدیریت دستی یا انتظار برای دستور انسان
    if (this.state.debateMode === 'manual' || this.state.sessionStatus === 'WAITING_FOR_MAESTRO') {
      const nextIdx = (typeof this.state.recommendedNextSpeakerIndex === 'number' && this.state.recommendedNextSpeakerIndex >= 0)
        ? this.state.recommendedNextSpeakerIndex
        : this.state.calculateRecommendedNextSpeaker();

      this.state.sessionStatus = 'ACTIVE';
      this.callbacks.onSessionResumed();
      this.dispatchTurn(nextIdx);
      return;
    }

    // ریاست هوش مصنوعی
    if (this.state.debateMode === 'ai_chairman') {
      const proposal = this.calculateNextChairmanProposal();
      if (!proposal) {
        this.pause();
        this.callbacks.onSessionCompleted();
        return;
      }

      if (this.state.config.aiStepApprovalRequired) {
        this.state.sessionStatus = 'WAITING_FOR_MAESTRO_APPROVAL';
        this.state.proposedTurn = proposal;
        this.callbacks.onAITurnProposed(proposal);
        return;
      }

      this.state.sessionStatus = 'ACTIVE';
      this.callbacks.onSessionResumed();
      this.dispatchTurn(proposal.nextSeatIndex, proposal.proposedMandate);
      return;
    }
  }

  approveProposedTurn(overrideMandate = null) {
    if (!this.state.proposedTurn) return false;
    const { nextSeatIndex, proposedMandate } = this.state.proposedTurn;
    const mandateToUse = overrideMandate !== null ? overrideMandate : proposedMandate;

    this.state.proposedTurn = null;
    this.state.sessionStatus = 'ACTIVE';
    this.callbacks.onProposalApproved({ nextSeatIndex, mandateToUse });
    this.callbacks.onSessionResumed();

    this.dispatchTurn(nextSeatIndex, mandateToUse);
    return true;
  }

  vetoProposedTurn() {
    if (!this.state.proposedTurn) return false;
    const vetoed = this.state.proposedTurn;
    this.state.proposedTurn = null;
    this.state.sessionStatus = 'WAITING_FOR_MAESTRO';

    this.callbacks.onProposalVetoed(vetoed);
    this.callbacks.onSessionWaitingForMaestro({
      seatIndex: this.state.activeSpeakerIndex,
      seat: this.state.seats[this.state.activeSpeakerIndex]
    });
    return true;
  }

  calculateNextChairmanProposal() {
    const { seats, activeSpeakerIndex, roundIndex } = this.state;
    const count = seats.length;
    if (count === 0) return null;

    const methodology = this.state.getActiveMethodology();
    const stepSeq = methodology.stepSequence || ['thesis', 'antithesis', 'synthesis'];
    const currentStepKey = stepSeq[((roundIndex - 1) * count + Math.max(0, activeSpeakerIndex + 1)) % stepSeq.length];
    const mandate = methodology.stepInstructions?.[currentStepKey] || methodology.description;

    let nextIdx = (activeSpeakerIndex + 1) % count;
    let checked = 0;
    while (seats[nextIdx]?.isMuted && checked < count) {
      nextIdx = (nextIdx + 1) % count;
      checked++;
    }

    if (nextIdx <= activeSpeakerIndex) {
      this.advanceRound();
    }

    const nextSeat = seats[nextIdx];
    return {
      nextSeatIndex: nextIdx,
      nextSeat,
      stepKey: currentStepKey,
      proposedMandate: mandate,
      reason: `متدولوژی «${methodology.title.split('(')[0].trim()}» نیازمند گام [${currentStepKey}] توسط ${nextSeat?.name || 'مدل بعدی'} است.`,
      methodologyTitle: methodology.title
    };
  }

  triggerGovernanceEvaluation(triggerType, turnContext = {}) {
    if (!this.state.governanceCabinet?.enabled) return;
    const activeRoles = this.state.governanceCabinet.activeRoles || [];
    const templates = this.state.getGovernanceRoleTemplates();

    activeRoles.forEach(roleAssignment => {
      if (!roleAssignment.isActive) return;
      const shouldTrigger =
        triggerType === 'manual_call' ||
        roleAssignment.trigger === triggerType ||
        (triggerType === 'every_turn' && roleAssignment.trigger === 'every_turn');

      if (shouldTrigger) {
        const tpl = templates[roleAssignment.roleKey];
        if (tpl) {
          this.callbacks.onGovernanceTriggered({
            assignment: roleAssignment,
            template: tpl,
            triggerType,
            turnContext
          });
        }
      }
    });
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
    this.triggerGovernanceEvaluation('end_of_round', { roundIndex: this.state.roundIndex });

    if (this.state.config.maxRounds > 0 && this.state.roundIndex > this.state.config.maxRounds) {
      this.pause();
      this.callbacks.onSessionCompleted();
    }
  }
}
