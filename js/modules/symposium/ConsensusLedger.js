/**
 * OmniAI Hub — The Milestone Consensus Ledger
 * Manages confirmed agreements, critical divergences, and open hypotheses.
 * Scans dialectic streams for automated signal extraction.
 */

export class ConsensusLedger {
  constructor(trayEl, callbacks = {}) {
    this.trayEl = trayEl;
    this.callbacks = {
      onItemDeleted: () => {},
      onItemAdded: () => {},
      ...callbacks
    };

    this.bindEvents();
  }

  bindEvents() {
    this.trayEl?.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.btn-delete-ledger-item');
      if (deleteBtn) {
        const category = deleteBtn.dataset.category;
        const index = parseInt(deleteBtn.dataset.index, 10);
        if (category && !isNaN(index)) {
          this.callbacks.onItemDeleted(category, index);
        }
      }
    });
  }

  render(ledger = { agreements: [], divergences: [], openQuestions: [] }) {
    if (!this.trayEl) return;

    const renderSection = (items = [], category, labelColor) => {
      if (!items.length) {
        return `<span style="font-size:11px;color:#64748b;font-style:italic;">No entries logged yet</span>`;
      }

      return items.map((item, idx) => `
        <div class="ledger-item-card ${category}">
          <div class="ledger-item-text">${this.escapeHtml(item)}</div>
          <button type="button" class="btn-delete-ledger-item" data-category="${category}" data-index="${idx}" title="Remove entry">✕</button>
        </div>
      `).join('');
    };

    const agreementsList = document.getElementById('ledger-agreements-list');
    const divergencesList = document.getElementById('ledger-divergences-list');
    const questionsList = document.getElementById('ledger-questions-list');

    if (agreementsList) agreementsList.innerHTML = renderSection(ledger.agreements, 'agreement', '#34d399');
    if (divergencesList) divergencesList.innerHTML = renderSection(ledger.divergences, 'divergence', '#f87171');
    if (questionsList) questionsList.innerHTML = renderSection(ledger.openQuestions, 'open-question', '#c084fc');
  }

  toggleVisibility(collapsed) {
    this.trayEl?.classList.toggle('collapsed', Boolean(collapsed));
  }

  extractSignalsFromText(text = '', speakerName = 'Intelligence') {
    if (!text || text.length < 40) return null;

    const extracted = {
      agreement: null,
      divergence: null,
      question: null
    };

    // Agreement matcher
    const agreeMatch = text.match(/(?:we agree that|consensus point:|نقطه اشتراک|هم‌نظر هستیم که|توافق داریم)([\s\S]{12,160}?)(?:\n|\.|$)/i);
    if (agreeMatch && agreeMatch[1]) {
      extracted.agreement = `${speakerName}: ${agreeMatch[1].trim()}`;
    }

    // Divergence matcher
    const divergeMatch = text.match(/(?:point of contention:|fundamental disagreement|نقطه اختلاف|مخالفت اساسی|چالش با)([\s\S]{12,160}?)(?:\n|\.|$)/i);
    if (divergeMatch && divergeMatch[1]) {
      extracted.divergence = `${speakerName}: ${divergeMatch[1].trim()}`;
    }

    // Question matcher
    const questionMatch = text.match(/(?:unresolved question:|open question|پرسش بی‌پاسخ|فرضیه مطرح)([\s\S]{12,160}?)(?:\n|\.|\?|$)/i);
    if (questionMatch && questionMatch[1]) {
      extracted.question = `${speakerName}: ${questionMatch[1].trim()}`;
    }

    return extracted;
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
