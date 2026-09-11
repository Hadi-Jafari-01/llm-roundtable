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

    const renderSection = (items = [], category) => {
      if (!items.length) {
        return `<span style="font-size:11px;color:#64748b;font-style:italic;">موردی ثبت نشده است</span>`;
      }

      return items.map((item, idx) => `
        <div class="ledger-item-card ${category}">
          <div class="ledger-item-text" dir="auto">${this.escapeHtml(item)}</div>
          <button type="button" class="btn-delete-ledger-item" data-category="${category}" data-index="${idx}" title="حذف این مورد">✕</button>
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
    if (!text || text.length < 25) return null;

    const agreements = [];
    const divergences = [];
    const openQuestions = [];

    const cleanLine = (raw) => {
      return raw
        .replace(/^[\s\d.،\-•*#\])[(]+/, '')
        .replace(/\*\*|__|`|\[|\]/g, '')
        .replace(/^[:\-–—\s]+/, '')
        .trim();
    };

    const isValidItem = (str) => {
      if (!str || str.length < 8 || str.length > 280) return false;
      if (/^(یک گزاره|نقطه|پرسش|سؤال|هم‌نظر|توافق|چالش)\b/.test(str) && str.length < 20) return false;
      return true;
    };

    const lines = text.split('\n');
    let currentSection = null; // 'agreement' | 'divergence' | 'question'

    const headerPatterns = {
      agreement: /(?:توافقات قطعی|توافقات|نقاط اشتراک|نقطه اشتراک|هم‌نظر هستیم که|هم‌نظریم که|اشتراکات|موارد مورد توافق|consensus|agreements|we agree that)/i,
      divergence: /(?:شکاف‌های لاینحل|شکاف‌ها|نقاط اختلاف|نقطه اختلاف|اختلافات|مواضع متعارض|مخالفت اساسی|نقاط چالش|چالش با|موارد اختلاف|تضادها|points? of contention|fundamental disagreement|divergences?|unresolved gaps)/i,
      question: /(?:پرسش‌های پیش‌برنده|پرسش پیش‌برنده|پرسش‌های بی‌پاسخ|پرسش بی‌پاسخ|پرسش‌های باز|پرسش باز|سوالات پیش‌برنده|سوال پیش‌برنده|سوالات بی‌پاسخ|سوال بی‌پاسخ|فرضیه مطرح|سوال کلیدی|پرسش کلیدی|open questions?|unresolved questions?|hypotheses)/i
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // 1. بررسی خطوط تک‌خطی ترکیبی (مانند: - **نقطه اختلاف:** متن چالش...)
      const inlineDiverge = line.match(/(?:نقطه اختلاف|شکاف‌های لاینحل|point of contention|اختلاف|چالش)[\s*:]+([^\n]+)/i);
      if (inlineDiverge && inlineDiverge[1]) {
        const cleaned = cleanLine(inlineDiverge[1]);
        if (isValidItem(cleaned)) divergences.push(`${speakerName}: ${cleaned}`);
      }

      const inlineAgree = line.match(/(?:هم‌نظر هستیم که|نقطه اشتراک|توافقات قطعی|we agree that|توافق)[\s*:]+([^\n]+)/i);
      if (inlineAgree && inlineAgree[1]) {
        const cleaned = cleanLine(inlineAgree[1]);
        if (isValidItem(cleaned)) agreements.push(`${speakerName}: ${cleaned}`);
      }

      const inlineQuestion = line.match(/(?:پرسش بی‌پاسخ|پرسش پیش‌برنده|سوال کلیدی|open question|پرسش)[\s*:]+([^\n]+)/i);
      if (inlineQuestion && inlineQuestion[1]) {
        const cleaned = cleanLine(inlineQuestion[1]);
        if (isValidItem(cleaned)) openQuestions.push(`${speakerName}: ${cleaned}`);
      }

      // 2. بررسی هدر بخش‌ها
      if (headerPatterns.agreement.test(line)) {
        currentSection = 'agreement';
        continue;
      } else if (headerPatterns.divergence.test(line)) {
        currentSection = 'divergence';
        continue;
      } else if (headerPatterns.question.test(line)) {
        currentSection = 'question';
        continue;
      }

      // اگر وارد بخش دیگری شدیم
      if (/^#{1,4}\s+|^\*\*[^\*]+\*\*:?$/.test(line)) {
        currentSection = null;
      }

      // اگر در داخل یک بخش چندخطی بولت‌دار هستیم
      if (currentSection && /^[\d\-•*]/.test(line)) {
        const cleaned = cleanLine(line);
        if (isValidItem(cleaned)) {
          const itemText = `${speakerName}: ${cleaned}`;
          if (currentSection === 'agreement' && !agreements.includes(itemText)) agreements.push(itemText);
          if (currentSection === 'divergence' && !divergences.includes(itemText)) divergences.push(itemText);
          if (currentSection === 'question' && !openQuestions.includes(itemText)) openQuestions.push(itemText);
        }
      }
    }

    return {
      agreements,
      divergences,
      openQuestions,
      agreement: agreements[0] || null,
      divergence: divergences[0] || null,
      question: openQuestions[0] || null
    };
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
