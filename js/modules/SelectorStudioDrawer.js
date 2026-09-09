/**
 * OmniAI Hub — Neural DOM Driver Studio Controller
 * Interactive slide-over glass drawer to inspect, edit, probe live frames,
 * and persist driver selectors for any AI platform.
 */

import { domDriverRegistry, FACTORY_DRIVER_PRESETS } from './DomDriverRegistry.js';
import { globalBus } from './EventBus.js';

export class SelectorStudioDrawer {
  constructor(stateStore) {
    this.stateStore = stateStore;
    this.activeProfileId = 'chatgpt';
    this.isOpen = false;
    this.probeTimeouts = new Map();
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.drawerEl = document.getElementById('selector-studio-drawer');
    this.backdropEl = document.getElementById('selector-studio-backdrop');
    this.profilesScroll = document.getElementById('studio-profiles-scroll');
    this.formEl = document.getElementById('form-driver-editor');
    this.btnClose = document.getElementById('btn-close-studio-drawer');
    this.btnSave = document.getElementById('btn-save-driver-master');
    this.btnReset = document.getElementById('btn-reset-factory-drivers');
    this.btnExport = document.getElementById('btn-export-drivers-json');
    this.btnImport = document.getElementById('btn-import-drivers-json');
    this.fileImportInput = document.getElementById('file-import-drivers');

    // Input fields
    this.fields = {
      name: document.getElementById('driver-field-name'),
      domain: document.getElementById('driver-field-domain'),
      inputSelector: document.getElementById('driver-field-input-selector'),
      inputStrategy: document.getElementById('driver-field-input-strategy'),
      submitSelector: document.getElementById('driver-field-submit-selector'),
      submitMechanism: document.getElementById('driver-field-submit-mechanism'),
      responseContainerSelector: document.getElementById('driver-field-response-container'),
      streamingTokenSelector: document.getElementById('driver-field-streaming-tokens'),
      stopSelector: document.getElementById('driver-field-stop-selector'),
      newChatSelector: document.getElementById('driver-field-new-chat-selector'),
      reasoningSelector: document.getElementById('driver-field-reasoning-selector'),
      userBubbleSelector: document.getElementById('driver-field-user-bubble-selector'),
      // Human Kinematics Fields
      humanizeEnabled: document.getElementById('driver-field-humanize-enabled'),
      humanizeMode: document.getElementById('driver-field-humanize-mode'),
      humanizeSpeed: document.getElementById('driver-field-humanize-speed'),
      preSubmitDelay: document.getElementById('driver-field-presubmit-delay'),
      punctuationDelay: document.getElementById('driver-field-punctuation-delay'),
      clickDwell: document.getElementById('driver-field-click-dwell'),
      cursorJitter: document.getElementById('driver-field-cursor-jitter'),
      hoverApproach: document.getElementById('driver-field-hover-approach'),
      simulateTypos: document.getElementById('driver-field-simulate-typos')
    };

    this.btnTestTyping = document.getElementById('btn-test-human-typing');
  }

  bindEvents() {
    this.btnClose?.addEventListener('click', () => this.close());
    this.backdropEl?.addEventListener('click', () => this.close());

    // Profile carousel click
    this.profilesScroll?.addEventListener('click', (e) => {
      const chip = e.target.closest('.profile-chip-btn');
      if (!chip) return;

      if (chip.id === 'btn-add-new-profile') {
        this.createNewProfile();
      } else if (chip.dataset.profileId) {
        this.selectProfile(chip.dataset.profileId);
      }
    });

    // Form Save
    this.formEl?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCurrentProfile();
    });

    this.btnSave?.addEventListener('click', () => {
      this.saveCurrentProfile();
    });

    // Reset Factory Defaults
    this.btnReset?.addEventListener('click', async () => {
      if (confirm('Reset all Neural DOM Drivers back to factory defaults? Any custom selectors will be overwritten.')) {
        await domDriverRegistry.resetToDefaults();
        this.renderProfiles();
        this.loadProfileIntoForm(this.activeProfileId);
        this.showToast('Reset to factory defaults successfully.');
      }
    });

    // Export JSON
    this.btnExport?.addEventListener('click', () => {
      const json = domDriverRegistry.exportDriversJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `omniai_dom_drivers_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    // Import JSON
    this.btnImport?.addEventListener('click', () => {
      this.fileImportInput?.click();
    });

    this.fileImportInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const res = await domDriverRegistry.importDriversJson(text);
      if (res.success) {
        this.renderProfiles();
        this.loadProfileIntoForm(this.activeProfileId);
        this.showToast(`Imported ${res.count} driver presets!`);
      } else {
        alert(`Import failed: ${res.error}`);
      }
      this.fileImportInput.value = '';
    });

    // Live Probe Buttons
    document.querySelectorAll('[data-probe-field]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const fieldKey = btn.dataset.probeField;
        this.executeSelectorProbe(fieldKey);
      });
    });

    // Live Test Human Typing Simulation Button
    this.btnTestTyping?.addEventListener('click', () => {
      this.executeLiveTypingTest();
    });

    // Cross-window probe & test result listener
    window.addEventListener('message', (e) => {
      if (e.data?.action === 'PROBE_RESULT') {
        this.handleProbeResult(e.data);
      } else if (e.data?.action === 'TEST_HUMAN_TYPING_RESULT') {
        this.handleTypingTestResult(e.data);
      }
    });

    const runtimeApi = (typeof browser !== 'undefined' && browser.runtime)
      ? browser.runtime
      : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null);

    if (runtimeApi?.onMessage) {
      runtimeApi.onMessage.addListener((msg) => {
        if (msg?.action === 'PROBE_RESULT') {
          this.handleProbeResult(msg);
        }
      });
    }

    // Hotkey Cmd+Shift+S / Ctrl+Shift+S toggle
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  open() {
    this.isOpen = true;
    this.drawerEl?.classList.add('open');
    this.backdropEl?.classList.add('open');
    this.renderProfiles();
    this.loadProfileIntoForm(this.activeProfileId);
    globalBus.emit('SELECTOR_STUDIO_OPENED');
  }

  close() {
    this.isOpen = false;
    this.drawerEl?.classList.remove('open');
    this.backdropEl?.classList.remove('open');
    globalBus.emit('SELECTOR_STUDIO_CLOSED');
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  renderProfiles() {
    if (!this.profilesScroll) return;
    const drivers = domDriverRegistry.getDrivers();
    const active = this.activeProfileId;

    this.profilesScroll.innerHTML = '';

    Object.keys(drivers).forEach(id => {
      const d = drivers[id];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `profile-chip-btn ${id === active ? 'active' : ''}`;
      btn.dataset.profileId = id;
      btn.innerHTML = `
        <span class="profile-chip-dot" style="background: ${d.color || '#c084fc'};"></span>
        <span>${d.name || id}</span>
      `;
      this.profilesScroll.appendChild(btn);
    });

    // Add "+ New Profile" button
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'profile-chip-btn profile-chip-add';
    addBtn.id = 'btn-add-new-profile';
    addBtn.innerHTML = `<span>+ New Driver</span>`;
    this.profilesScroll.appendChild(addBtn);
  }

  selectProfile(id) {
    this.activeProfileId = id;
    this.renderProfiles();
    this.loadProfileIntoForm(id);
  }

  loadProfileIntoForm(id) {
    const driver = domDriverRegistry.getDriver(id) || FACTORY_DRIVER_PRESETS.generic;
    if (!driver) return;

    if (this.fields.name) this.fields.name.value = driver.name || '';
    if (this.fields.domain) this.fields.domain.value = driver.domain || '';
    if (this.fields.inputSelector) this.fields.inputSelector.value = driver.inputSelector || '';
    if (this.fields.inputStrategy) this.fields.inputStrategy.value = driver.inputStrategy || 'auto';
    if (this.fields.submitSelector) this.fields.submitSelector.value = driver.submitSelector || '';
    if (this.fields.submitMechanism) this.fields.submitMechanism.value = driver.submitMechanism || 'click';
    if (this.fields.responseContainerSelector) this.fields.responseContainerSelector.value = driver.responseContainerSelector || '';
    if (this.fields.streamingTokenSelector) this.fields.streamingTokenSelector.value = driver.streamingTokenSelector || '';
    if (this.fields.stopSelector) this.fields.stopSelector.value = driver.stopSelector || '';
    if (this.fields.newChatSelector) this.fields.newChatSelector.value = driver.newChatSelector || '';
    if (this.fields.reasoningSelector) this.fields.reasoningSelector.value = driver.reasoningSelector || '';
    if (this.fields.userBubbleSelector) this.fields.userBubbleSelector.value = driver.userBubbleSelector || '';

    // Populate Human Kinematics
    if (this.fields.humanizeEnabled) this.fields.humanizeEnabled.checked = driver.humanizeEnabled !== false;
    if (this.fields.humanizeMode) this.fields.humanizeMode.value = driver.humanizeMode || 'burst';
    if (this.fields.humanizeSpeed) this.fields.humanizeSpeed.value = driver.humanizeSpeed || 'natural';
    if (this.fields.preSubmitDelay) this.fields.preSubmitDelay.value = driver.preSubmitDelayMs ?? 500;
    if (this.fields.punctuationDelay) this.fields.punctuationDelay.value = driver.punctuationPauseMs ?? 220;
    if (this.fields.clickDwell) this.fields.clickDwell.value = driver.clickDwellMs ?? 75;
    if (this.fields.cursorJitter) this.fields.cursorJitter.checked = driver.cursorJitter !== false;
    if (this.fields.hoverApproach) this.fields.hoverApproach.checked = driver.hoverBeforeClick !== false;
    if (this.fields.simulateTypos) this.fields.simulateTypos.checked = driver.simulateTypos !== false;

    // Clear probe status badges
    document.querySelectorAll('.probe-status-row').forEach(row => {
      row.innerHTML = '';
    });
  }

  async saveCurrentProfile() {
    const id = this.activeProfileId;
    const current = domDriverRegistry.getDriver(id) || {};

    const updated = {
      ...current,
      name: this.fields.name?.value.trim() || current.name || id,
      domain: this.fields.domain?.value.trim() || current.domain || '*',
      inputSelector: this.fields.inputSelector?.value.trim() || '',
      inputStrategy: this.fields.inputStrategy?.value || 'auto',
      submitSelector: this.fields.submitSelector?.value.trim() || '',
      submitMechanism: this.fields.submitMechanism?.value || 'click',
      responseContainerSelector: this.fields.responseContainerSelector?.value.trim() || '',
      streamingTokenSelector: this.fields.streamingTokenSelector?.value.trim() || '',
      stopSelector: this.fields.stopSelector?.value.trim() || '',
      newChatSelector: this.fields.newChatSelector?.value.trim() || '',
      reasoningSelector: this.fields.reasoningSelector?.value.trim() || '',
      userBubbleSelector: this.fields.userBubbleSelector?.value.trim() || '',
      // Human Kinematics
      humanizeEnabled: this.fields.humanizeEnabled ? this.fields.humanizeEnabled.checked : true,
      humanizeMode: this.fields.humanizeMode?.value || 'burst',
      humanizeSpeed: this.fields.humanizeSpeed?.value || 'natural',
      preSubmitDelayMs: parseInt(this.fields.preSubmitDelay?.value, 10) || 500,
      punctuationPauseMs: parseInt(this.fields.punctuationDelay?.value, 10) || 220,
      clickDwellMs: parseInt(this.fields.clickDwell?.value, 10) || 75,
      cursorJitter: this.fields.cursorJitter ? this.fields.cursorJitter.checked : true,
      hoverBeforeClick: this.fields.hoverApproach ? this.fields.hoverApproach.checked : true,
      simulateTypos: this.fields.simulateTypos ? this.fields.simulateTypos.checked : true
    };

    await domDriverRegistry.saveDriver(id, updated);
    this.renderProfiles();
    this.showToast(`Saved driver for ${updated.name}!`);
  }

  createNewProfile() {
    const name = prompt('Enter a name for the new AI Model Driver (e.g. "Kimi AI", "Cohere"):');
    if (!name) return;
    const id = `driver_${Date.now()}`;
    const newDriver = {
      ...FACTORY_DRIVER_PRESETS.generic,
      id,
      name,
      domain: ''
    };
    domDriverRegistry.saveDriver(id, newDriver);
    this.selectProfile(id);
  }

  executeSelectorProbe(fieldKey) {
    const inputEl = this.fields[fieldKey];
    if (!inputEl) return;
    const selector = inputEl.value.trim();
    const statusRow = document.getElementById(`probe-status-${fieldKey}`);
    if (!statusRow) return;

    if (!selector) {
      statusRow.innerHTML = `<span class="probe-pill not-found">Empty selector</span>`;
      return;
    }

    const probeId = `probe_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    statusRow.innerHTML = `
      <span class="probe-pill probing">
        <span>⏳</span> Probing live card...
      </span>
    `;

    // Broadcast probe request to all card iframes
    const iframes = document.querySelectorAll('#spatial-cards-container iframe');
    iframes.forEach(ifr => {
      try {
        ifr.contentWindow?.postMessage({
          action: 'PROBE_SELECTOR',
          selector,
          probeId,
          fieldKey
        }, '*');
      } catch (_) {}
    });

    const runtimeApi = (typeof browser !== 'undefined' && browser.runtime)
      ? browser.runtime
      : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null);

    if (runtimeApi?.sendMessage) {
      try {
        runtimeApi.sendMessage({
          action: 'PROBE_SELECTOR',
          selector,
          probeId,
          fieldKey
        });
      } catch (_) {}
    }

    // Set fallback timeout if no frame responds
    const timeout = setTimeout(() => {
      if (statusRow.querySelector('.probing')) {
        statusRow.innerHTML = `
          <span class="probe-pill not-found">🔴 No response from frame (ensure model card is loaded)</span>
        `;
      }
    }, 2800);

    this.probeTimeouts.set(probeId, { timeout, statusRow });
  }

  executeLiveTypingTest() {
    const statusRow = document.getElementById('probe-status-humanTyping');
    if (!statusRow) return;

    statusRow.innerHTML = `
      <span class="probe-pill probing">
        <span>⏳</span> شبیه‌سازی تایپ در فریم فعال مدل...
      </span>
    `;

    const currentDriver = domDriverRegistry.getDriver(this.activeProfileId) || {};
    const testDriver = {
      ...currentDriver,
      inputSelector: this.fields.inputSelector?.value.trim() || currentDriver.inputSelector,
      inputStrategy: this.fields.inputStrategy?.value || currentDriver.inputStrategy,
      humanizeEnabled: this.fields.humanizeEnabled?.checked,
      humanizeMode: this.fields.humanizeMode?.value || 'burst',
      humanizeSpeed: this.fields.humanizeSpeed?.value || 'natural',
      punctuationPauseMs: parseInt(this.fields.punctuationDelay?.value, 10) || 220,
      simulateTypos: this.fields.simulateTypos?.checked
    };

    const probeId = `type_test_${Date.now()}`;
    const iframes = document.querySelectorAll('#spatial-cards-container iframe');
    iframes.forEach(ifr => {
      try {
        ifr.contentWindow?.postMessage({
          action: 'TEST_HUMAN_TYPING',
          probeId,
          text: `Hello! Testing human cadence typing on this AI card...`,
          driver: testDriver
        }, '*');
      } catch (_) {}
    });

    const timeout = setTimeout(() => {
      if (statusRow.querySelector('.probing')) {
        statusRow.innerHTML = `<span class="probe-pill not-found">عدم پاسخ از فریم (اطمینان حاصل کنید کارت مدل باز است)</span>`;
      }
    }, 4500);

    this.probeTimeouts.set(probeId, { timeout, statusRow });
  }

  handleTypingTestResult(data) {
    const { probeId, success, count, mode, error } = data;
    const tracker = this.probeTimeouts.get(probeId);
    if (!tracker) return;

    clearTimeout(tracker.timeout);
    this.probeTimeouts.delete(probeId);

    const { statusRow } = tracker;
    if (!statusRow) return;

    if (success) {
      statusRow.innerHTML = `
        <span class="probe-pill found">🟢 موفقیت: تایپ ${count} کاراکتر در حالت ${mode}</span>
      `;
    } else {
      statusRow.innerHTML = `
        <span class="probe-pill not-found">🔴 خطا: ${error || 'ناموفق'}</span>
      `;
    }
  }

  handleProbeResult(data) {
    const { probeId, found, count, tagName, previewText, host } = data;
    const tracker = this.probeTimeouts.get(probeId);
    if (!tracker) return;

    clearTimeout(tracker.timeout);
    this.probeTimeouts.delete(probeId);

    const { statusRow } = tracker;
    if (!statusRow) return;

    if (found) {
      statusRow.innerHTML = `
        <span class="probe-pill found">🟢 Found (${count} element${count > 1 ? 's' : ''})</span>
        <span class="probe-snippet" title="${previewText || tagName}">&lt;${tagName}&gt; ${previewText ? `"${previewText}"` : ''}</span>
      `;
    } else {
      statusRow.innerHTML = `
        <span class="probe-pill not-found">🔴 Not Found on ${host || 'page'}</span>
      `;
    }
  }

  showToast(message) {
    let toast = document.getElementById('omni-studio-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'omni-studio-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: linear-gradient(135deg, rgba(129, 140, 248, 0.95) 0%, rgba(192, 132, 252, 0.95) 100%);
        backdrop-filter: blur(20px);
        color: #ffffff;
        font-size: 12px;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        z-index: 2000;
        opacity: 0;
        transform: translateY(8px);
        transition: all 0.22s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
      }, 2200);
    });
  }
}
