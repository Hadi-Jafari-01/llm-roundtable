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
      onLedgerUpdated: () => {},
      ...callbacks
    };

    this.bindEvents();
  }

  /**
   * پالایش و تفکیک خودکار آیتم‌های آلوده یا ادغام‌شده در حافظه دیتابیس محلی
   */
  sanitizeLedger(ledger) {
    if (!ledger || typeof ledger !== 'object') return false;
    let modified = false;

    const splitRegex = /(?:\[\s*(?:شکاف‌های لاینحل|شکاف‌ها|نقاط اختلاف|نقطه اختلاف|پرسش‌های پیش‌برنده|پرسش بی‌پاسخ)\s*\])/i;

    if (Array.isArray(ledger.agreements)) {
      const newAgreements = [];
      ledger.agreements.forEach(item => {
        if (typeof item === 'string' && splitRegex.test(item)) {
          modified = true;
          const speakerMatch = item.match(/^([^:]+):\s*/);
          const speaker = speakerMatch ? speakerMatch[1].trim() : 'مدل';
          const signals = this.extractSignalsFromText(item, speaker);
          if (signals) {
            (signals.agreements || []).forEach(a => { if (!newAgreements.includes(a)) newAgreements.push(a); });
            if (!Array.isArray(ledger.divergences)) ledger.divergences = [];
            (signals.divergences || []).forEach(d => { if (!ledger.divergences.includes(d)) ledger.divergences.push(d); });
            if (!Array.isArray(ledger.openQuestions)) ledger.openQuestions = [];
            (signals.openQuestions || []).forEach(q => { if (!ledger.openQuestions.includes(q)) ledger.openQuestions.push(q); });
          }
        } else {
          newAgreements.push(item);
        }
      });
      ledger.agreements = newAgreements;
    }

    return modified;
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

    if (this.sanitizeLedger(ledger)) {
      this.callbacks.onLedgerUpdated?.(ledger);
    }

    const renderSection = (items = [], category) => {
      if (!items || !items.length) {
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

    if (agreementsList) agreementsList.innerHTML = renderSection(ledger.agreements, 'agreement');
    if (divergencesList) divergencesList.innerHTML = renderSection(ledger.divergences, 'divergence');
    if (questionsList) questionsList.innerHTML = renderSection(ledger.openQuestions, 'open-question');
  }

  toggleVisibility(collapsed) {
    this.trayEl?.classList.toggle('collapsed', Boolean(collapsed));
  }

  /**
   * موتور سگمنت‌بندی پویا برای استخراج بی‌نقص توافقات، شکاف‌ها و پرسش‌ها حتی در صورت ادغام در یک خط
   */
  extractSignalsFromText(text = '', speakerName = 'Intelligence') {
    if (!text || text.length < 15) return null;

    const agreements = [];
    const divergences = [];
    const openQuestions = [];

    const cleanSnippet = (raw) => {
      if (!raw) return '';
      return raw
        .replace(/^[\s\d۰-۹.،\-•*#\])[(]+/, '')
        .replace(/\*\*|__|`/g, '')
        .replace(/^[:\-–—\s\]]+/, '')
        .replace(/^[\[(][^\])]*[\])][\s:：\-–—]*/, '')
        .replace(/[\s\-–—]+$/, '')
        .trim();
    };

    const isValidItem = (str) => {
      if (!str || str.length < 6 || str.length > 1500) return false;
      if (/^(یک گزاره|نقطه|پرسش|سؤال|هم‌نظر|توافق|چالش|موردی ثبت نشده|ندارد|یافت نشد)\b/i.test(str) && str.length < 40) return false;
      return true;
    };

    const addUnique = (list, item) => {
      const clean = cleanSnippet(item);
      if (!isValidItem(clean)) return;
      const full = clean.startsWith(`${speakerName}:`) ? clean : `${speakerName}: ${clean}`;
      if (!list.includes(full)) list.push(full);
    };

    // 1. Preliminary cleanup pass to unglue Persian/English bracket tags attached to sentences
    let normalized = text.replace(/\r\n?/g, '\n');

    const consensusTagsPattern = /(\*{0,2}(?:[۰-۹\d]+[\.\-]\s*)?\[\s*(?:توافقات قطعی|توافقات|نقاط اشتراک|نقطه اشتراک|هم‌نظر هستیم که|هم‌نظریم که|اشتراکات|شکاف‌های لاینحل|شکاف‌ها|نقاط اختلاف|نقطه اختلاف|اختلافات|مواضع متعارض|مخالفت اساسی|نقاط چالش|چالش با|موارد اختلاف|تضادها|معضلات|مغالطه|دیده‌بان مغالطه|خطای منطقی|تحلیل مغالطه|پرسش‌های پیش‌برنده|پرسش پیش‌برنده|پرسش‌های بی‌پاسخ|پرسش بی‌پاسخ|پرسش‌های باز|پرسش باز|سوالات پیش‌برنده|سوال پیش‌برنده|سوالات بی‌پاسخ|سوال بی‌پاسخ|فرضیه مطرح|سوال کلیدی|پرسش کلیدی|consensus|agreements?|confirmed agreements?|we agree that|divergences?|points? of contention|disagreements?|unresolved gaps?|critical divergences?|open questions?|unresolved questions?|hypotheses|open hypotheses)\s*\]\*{0,2})/gi;

    normalized = normalized.replace(new RegExp(`([^\\n\\s])\\s*${consensusTagsPattern.source}`, 'gi'), '$1\n\n$2');
    normalized = normalized.replace(new RegExp(`${consensusTagsPattern.source}\\s*([:：]?)\\s*([^\\n\\s])`, 'gi'), '$1$2\n$3');

    normalized = normalized.replace(/([.!?؛:])\s*([۰-۹\d]+[\.\-]\s+)/g, '$1\n\n$2');
    normalized = normalized.replace(/([.!?؛:]|[^\n\s])\s+([•\-*]\s+[^\n])/g, '$1\n$2');

    // 2. نشانگرهای سه‌گانه
    const markers = [
      {
        type: 'agreement',
        regex: /(?:\[\s*(?:توافقات قطعی|توافقات|نقاط اشتراک|نقطه اشتراک|هم‌نظر هستیم که|هم‌نظریم که|اشتراکات|consensus|agreements?|confirmed agreements?|we agree that)\s*\]|(?:\*\*|###?\s*)?(?:[۰-۹\d]+[\.\-]\s*)?(?:توافقات قطعی|توافقات|نقاط اشتراک|نقطه اشتراک|هم‌نظر هستیم که|هم‌نظریم که|اشتراکات|موارد مورد توافق|consensus|agreements?|confirmed agreements?|we agree that)(?:\*\*)?[\s:：\]\)]+)/gi
      },
      {
        type: 'divergence',
        regex: /(?:\[\s*(?:شکاف‌های لاینحل|شکاف‌ها|نقاط اختلاف|نقطه اختلاف|اختلافات|مواضع متعارض|مخالفت اساسی|نقاط چالش|چالش با|موارد اختلاف|تضادها|معضلات|مغالطه|دیده‌بان مغالطه|خطای منطقی|تحلیل مغالطه|divergences?|points? of contention|disagreements?|unresolved gaps?|critical divergences?)\s*\]|(?:\*\*|###?\s*)?(?:[۰-۹\d]+[\.\-]\s*)?(?:شکاف‌های لاینحل|شکاف‌ها|نقاط اختلاف|نقطه اختلاف|اختلافات|مواضع متعارض|مخالفت اساسی|نقاط چالش|چالش با|موارد اختلاف|تضادها|معضلات|مغالطه شناسایی‌شده|خطای منطقی|divergences?|points? of contention|fundamental disagreement|unresolved gaps?|disagreements?|critical divergences?)(?:\*\*)?[\s:：\]\)]+)/gi
      },
      {
        type: 'question',
        regex: /(?:\[\s*(?:پرسش‌های پیش‌برنده|پرسش پیش‌برنده|پرسش‌های بی‌پاسخ|پرسش بی‌پاسخ|پرسش‌های باز|پرسش باز|سوالات پیش‌برنده|سوال پیش‌برنده|سوالات بی‌پاسخ|سوال بی‌پاسخ|فرضیه مطرح|سوال کلیدی|پرسش کلیدی|open questions?|unresolved questions?|hypotheses|open hypotheses)\s*\]|(?:\*\*|###?\s*)?(?:[۰-۹\d]+[\.\-]\s*)?(?:پرسش‌های پیش‌برنده|پرسش پیش‌برنده|پرسش‌های بی‌پاسخ|پرسش بی‌پاسخ|پرسش‌های باز|پرسش باز|سوالات پیش‌برنده|سوال پیش‌برنده|سوالات بی‌پاسخ|سوال بی‌پاسخ|فرضیه مطرح|سوال کلیدی|پرسش کلیدی|open questions?|unresolved questions?|hypotheses|open hypotheses)(?:\*\*)?[\s:：\]\)]+)/gi
      }
    ];

    // استخراج موقعیت وقوع تمام سرفصل‌ها در متن
    const occurrences = [];
    markers.forEach(m => {
      let match;
      m.regex.lastIndex = 0;
      while ((match = m.regex.exec(normalized)) !== null) {
        occurrences.push({
          type: m.type,
          index: match.index,
          length: match[0].length
        });
      }
    });

    occurrences.sort((a, b) => a.index - b.index);

    if (occurrences.length > 0) {
      for (let i = 0; i < occurrences.length; i++) {
        const current = occurrences[i];
        const nextIndex = (i + 1 < occurrences.length) ? occurrences[i + 1].index : normalized.length;
        const segment = normalized.slice(current.index + current.length, nextIndex).trim();

        if (!segment) continue;

        const targetList = current.type === 'agreement' ? agreements : (current.type === 'divergence' ? divergences : openQuestions);

        // بررسی اینکه آیا سگمنت حاوی چند بولت است یا پاراگراف پیوسته
        const bulletSplit = segment.split(/(?:^|\n)(?=[•\-*]\s+|(?:[۰-۹\d]+[\.\-]\s+))/).map(s => s.trim()).filter(Boolean);
        if (bulletSplit.length > 1) {
          bulletSplit.forEach(item => addUnique(targetList, item));
        } else {
          const lines = segment.split('\n').map(l => l.trim()).filter(Boolean);
          const bulletLines = lines.filter(l => /^[\d۰-۹\-•*]/.test(l));

          if (bulletLines.length > 0) {
            bulletLines.forEach(bl => addUnique(targetList, bl));
          } else {
            addUnique(targetList, segment);
          }
        }
      }
    } else {
      // فال‌بک سطربه‌سطر در صورت عدم تطابق تگ‌های سگمنتی
      const lines = normalized.split('\n');
      let currentSection = null;

      const headerPatterns = {
        agreement: /(?:توافقات قطعی|توافقات|نقاط اشتراک|نقطه اشتراک|هم‌نظر هستیم که|هم‌نظریم که|اشتراکات|consensus|agreements?|confirmed agreements?|we agree that)/i,
        divergence: /(?:شکاف‌های لاینحل|شکاف‌ها|نقاط اختلاف|نقطه اختلاف|اختلافات|مواضع متعارض|نقاط چالش|تضادها|معضلات|divergences?|disagreements?|points? of contention|critical divergences?)/i,
        question: /(?:پرسش‌های پیش‌برنده|پرسش پیش‌برنده|پرسش‌های بی‌پاسخ|پرسش بی‌پاسخ|سوالات پیش‌برنده|سوال کلیدی|پرسش کلیدی|open questions?|unresolved questions?|hypotheses)/i
      };

      for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        if (headerPatterns.agreement.test(line)) {
          currentSection = 'agreement';
          const inlineContent = line.replace(/^[^\:]*[:：\]\)]+/, '').trim();
          if (inlineContent && inlineContent !== line) addUnique(agreements, inlineContent);
          continue;
        } else if (headerPatterns.divergence.test(line)) {
          currentSection = 'divergence';
          const inlineContent = line.replace(/^[^\:]*[:：\]\)]+/, '').trim();
          if (inlineContent && inlineContent !== line) addUnique(divergences, inlineContent);
          continue;
        } else if (headerPatterns.question.test(line)) {
          currentSection = 'question';
          const inlineContent = line.replace(/^[^\:]*[:：\]\)]+/, '').trim();
          if (inlineContent && inlineContent !== line) addUnique(openQuestions, inlineContent);
          continue;
        }

        if (currentSection) {
          const targetList = currentSection === 'agreement' ? agreements : (currentSection === 'divergence' ? divergences : openQuestions);
          addUnique(targetList, line);
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
