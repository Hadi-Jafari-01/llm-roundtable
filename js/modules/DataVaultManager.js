/**
 * OmniAI Hub — Universal Data Vault Controller (مدیر صندوق جامع داده‌ها)
 * Master Controller for Universal Import, Export, Backup, and Data Migration.
 * Handles single-click Master Backup (.omniai.json) and granular per-module exports.
 */

import { globalBus } from './EventBus.js';

export class DataVaultManager {
  constructor({ stateStore, domDriverRegistry, symposiumState, mirrorChat, councilOrchestrator }) {
    this.stateStore = stateStore;
    this.domDriverRegistry = domDriverRegistry;
    this.symposiumState = symposiumState;
    this.mirrorChat = mirrorChat;
    this.councilOrchestrator = councilOrchestrator;
    this.isOpen = false;
    this.activeTab = 'master'; // 'master' | 'granular' | 'maintenance'

    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.modalEl = document.getElementById('modal-data-vault');
    this.btnClose = document.getElementById('btn-close-data-vault');
    this.navTabs = document.querySelectorAll('.vault-tab-btn');
    this.panels = {
      master: document.getElementById('vault-tab-master'),
      granular: document.getElementById('vault-tab-granular'),
      maintenance: document.getElementById('vault-tab-maintenance')
    };

    // Master Export & Import
    this.btnExportMaster = document.getElementById('btn-vault-export-master');
    this.fileImportMaster = document.getElementById('file-vault-import-master');
    this.btnTriggerImportMaster = document.getElementById('btn-trigger-import-master');
    this.dropzoneMaster = document.getElementById('vault-master-dropzone');

    // Granular Module Buttons
    this.btnExportCanvas = document.getElementById('btn-vault-export-canvas');
    this.fileImportCanvas = document.getElementById('file-vault-import-canvas');
    this.btnImportCanvas = document.getElementById('btn-vault-import-canvas');

    this.btnExportDrivers = document.getElementById('btn-vault-export-drivers');
    this.fileImportDrivers = document.getElementById('file-vault-import-drivers');
    this.btnImportDrivers = document.getElementById('btn-vault-import-drivers');

    this.btnExportSymposium = document.getElementById('btn-vault-export-symposium');
    this.fileImportSymposium = document.getElementById('file-vault-import-symposium');
    this.btnImportSymposium = document.getElementById('btn-vault-import-symposium');

    this.btnExportChats = document.getElementById('btn-vault-export-chats');
    this.fileImportChats = document.getElementById('file-vault-import-chats');
    this.btnImportChats = document.getElementById('btn-vault-import-chats');

    this.btnExportCouncil = document.getElementById('btn-vault-export-council');
    this.fileImportCouncil = document.getElementById('file-vault-import-council');
    this.btnImportCouncil = document.getElementById('btn-vault-import-council');

    // Maintenance / Reset
    this.btnResetDrivers = document.getElementById('btn-vault-reset-drivers');
    this.btnClearChats = document.getElementById('btn-vault-clear-chats');
    this.btnResetCanvas = document.getElementById('btn-vault-reset-canvas');
    this.btnWipeAll = document.getElementById('btn-vault-wipe-all');
  }

  bindEvents() {
    this.btnClose?.addEventListener('click', () => this.closeVaultModal());
    this.modalEl?.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.closeVaultModal();
    });

    // Tab Navigation
    this.navTabs?.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });

    // Master Full Export
    this.btnExportMaster?.addEventListener('click', () => {
      this.exportMasterBackup();
    });

    // Master Full Import via File Picker
    this.btnTriggerImportMaster?.addEventListener('click', () => {
      this.fileImportMaster?.click();
    });

    this.fileImportMaster?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      await this.importMasterBackup(text);
      this.fileImportMaster.value = '';
    });

    // Master Dropzone Drag and Drop
    this.dropzoneMaster?.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzoneMaster.classList.add('drag-over');
    });

    this.dropzoneMaster?.addEventListener('dragleave', () => {
      this.dropzoneMaster.classList.remove('drag-over');
    });

    this.dropzoneMaster?.addEventListener('drop', async (e) => {
      e.preventDefault();
      this.dropzoneMaster.classList.remove('drag-over');
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      const text = await file.text();
      await this.importMasterBackup(text);
    });

    // --- Granular Canvas ---
    this.btnExportCanvas?.addEventListener('click', () => {
      const json = this.stateStore.exportSpatialStateJson();
      this.downloadFile(`omniai_canvas_${Date.now()}.json`, json);
      this.showToast('پشتیبان بوم و مدل‌ها استخراج شد ✓');
    });

    this.btnImportCanvas?.addEventListener('click', () => this.fileImportCanvas?.click());
    this.fileImportCanvas?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const res = await this.stateStore.importSpatialStateJson(text);
      if (res.success) {
        this.showToast(`بوم با موفقیت بازیابی شد (${res.count} کارت) ✓`);
      } else {
        alert(`خطا: ${res.error}`);
      }
      this.fileImportCanvas.value = '';
    });

    // --- Granular Drivers ---
    this.btnExportDrivers?.addEventListener('click', () => {
      const json = this.domDriverRegistry.exportDriversJson();
      this.downloadFile(`omniai_dom_drivers_${Date.now()}.json`, json);
      this.showToast('درایورهای DOM استخراج شدند ✓');
    });

    this.btnImportDrivers?.addEventListener('click', () => this.fileImportDrivers?.click());
    this.fileImportDrivers?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const res = await this.domDriverRegistry.importDriversJson(text);
      if (res.success) {
        this.showToast(`درایورها با موفقیت درون‌ریزی شدند (${res.count} الگو) ✓`);
      } else {
        alert(`خطا: ${res.error}`);
      }
      this.fileImportDrivers.value = '';
    });

    // --- Granular Symposium ---
    this.btnExportSymposium?.addEventListener('click', () => {
      const json = this.symposiumState.exportSymposiumData(true);
      this.downloadFile(`omniai_symposium_${Date.now()}.json`, json);
      this.showToast('پشتیبان کامل تالار هم‌اندیشی استخراج شد ✓');
    });

    this.btnImportSymposium?.addEventListener('click', () => this.fileImportSymposium?.click());
    this.fileImportSymposium?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const res = this.symposiumState.importSymposiumData(text, true);
      if (res.success) {
        this.showToast(`تالار هم‌اندیشی با موفقیت بازیابی شد ✓`);
        globalBus.emit('SILK_SYMPOSIUM_RESTORED');
      } else {
        alert(`خطا: ${res.error}`);
      }
      this.fileImportSymposium.value = '';
    });

    // --- Granular Chats ---
    this.btnExportChats?.addEventListener('click', () => {
      const json = this.mirrorChat.exportAllConversationsJson();
      this.downloadFile(`omniai_chats_${Date.now()}.json`, json);
      this.showToast('تاریخچه تمام گفتگوها استخراج شد ✓');
    });

    this.btnImportChats?.addEventListener('click', () => this.fileImportChats?.click());
    this.fileImportChats?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const res = this.mirrorChat.importConversationsJson(text);
      if (res.success) {
        this.showToast(`گفتگوها با موفقیت بازیابی شدند (${res.count} مدل) ✓`);
      } else {
        alert(`خطا: ${res.error}`);
      }
      this.fileImportChats.value = '';
    });

    // --- Granular Council ---
    this.btnExportCouncil?.addEventListener('click', () => {
      const json = this.councilOrchestrator.exportCouncilJson();
      this.downloadFile(`omniai_council_${Date.now()}.json`, json);
      this.showToast('جلسه شورای افلاک استخراج شد ✓');
    });

    this.btnImportCouncil?.addEventListener('click', () => this.fileImportCouncil?.click());
    this.fileImportCouncil?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const res = this.councilOrchestrator.importCouncilJson(text);
      if (res.success) {
        this.showToast('شورای افلاک بازیابی شد ✓');
      } else {
        alert(`خطا: ${res.error}`);
      }
      this.fileImportCouncil.value = '';
    });

    // --- Maintenance Actions ---
    this.btnResetDrivers?.addEventListener('click', async () => {
      if (confirm('آیا از بازنشانی تمام درایورهای DOM به حالت پیش‌فرض کارخانه اطمینان دارید؟')) {
        await this.domDriverRegistry.resetToDefaults();
        this.showToast('درایورها به تنظیمات کارخانه بازنشانی شدند ✓');
      }
    });

    this.btnClearChats?.addEventListener('click', () => {
      if (confirm('آیا از پاک‌سازی تمام تاریخچه چت‌های ذخیره‌شده استودیو اطمینان دارید؟')) {
        this.mirrorChat.conversations.clear();
        this.mirrorChat.persistConversations();
        this.mirrorChat.renderConversation();
        this.showToast('تمام گفتگوها پاک شدند.');
      }
    });

    this.btnResetCanvas?.addEventListener('click', () => {
      if (confirm('آیا مایلید کارت‌های روی بوم به حالت پیش‌فرض (ChatGPT, Claude, Gemini) بازنشانی شوند؟')) {
        this.stateStore.state.cards = [
          this.stateStore.createCardInstance('chatgpt', 60, 60),
          this.stateStore.createCardInstance('claude', 730, 60),
          this.stateStore.createCardInstance('gemini', 1400, 60)
        ];
        this.stateStore.saveState();
        this.stateStore.notify();
        this.showToast('بوم به کارت‌های اولیه بازنشانی شد ✓');
      }
    });

    this.btnWipeAll?.addEventListener('click', async () => {
      if (confirm('⚠️ توجه: این عملیات تمام داده‌ها، کارت‌ها، چت‌ها و سناریوهای شما را پاک کرده و برنامه را نو می‌کند. آیا ادامه می‌دهید؟')) {
        localStorage.clear();
        await this.domDriverRegistry.resetToDefaults();
        window.location.reload();
      }
    });
  }

  openVaultModal(tab = 'master') {
    this.isOpen = true;
    this.modalEl?.classList.remove('hidden');
    this.switchTab(tab);
    globalBus.emit('DATA_VAULT_OPENED');
  }

  closeVaultModal() {
    this.isOpen = false;
    this.modalEl?.classList.add('hidden');
    globalBus.emit('DATA_VAULT_CLOSED');
  }

  toggleVaultModal() {
    if (this.isOpen) this.closeVaultModal();
    else this.openVaultModal();
  }

  switchTab(tabKey) {
    this.activeTab = tabKey;
    this.navTabs?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    if (this.panels.master) this.panels.master.style.display = tabKey === 'master' ? 'flex' : 'none';
    if (this.panels.granular) this.panels.granular.style.display = tabKey === 'granular' ? 'flex' : 'none';
    if (this.panels.maintenance) this.panels.maintenance.style.display = tabKey === 'maintenance' ? 'flex' : 'none';
  }

  exportMasterBackup() {
    const rawSpatial = this.stateStore.exportSpatialStateJson();
    const rawDrivers = this.domDriverRegistry.exportDriversJson();
    const rawSymposium = this.symposiumState.exportSymposiumData(true);
    const rawChats = this.mirrorChat.exportAllConversationsJson();
    const rawCouncil = this.councilOrchestrator.exportCouncilJson();

    const masterPayload = {
      schema: 'OmniAI_Master_Vault',
      version: '2.0.0',
      system: 'OmniAI Hub — Obsidian Silk Spatial Workspace',
      exportedAt: new Date().toISOString(),
      timestamp: Date.now(),
      data: {
        spatialCanvas: JSON.parse(rawSpatial),
        domDrivers: JSON.parse(rawDrivers),
        symposium: JSON.parse(rawSymposium),
        mirrorChats: JSON.parse(rawChats),
        council: JSON.parse(rawCouncil)
      }
    };

    const formatted = JSON.stringify(masterPayload, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);
    this.downloadFile(`omniai_master_backup_${dateStr}_${Date.now()}.omniai.json`, formatted);
    this.showToast('پشتیبان کامل همه‌چیز با موفقیت دانلود شد 🌟');
  }

  async importMasterBackup(jsonInput) {
    try {
      const parsed = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
      if (!parsed || (!parsed.data && !parsed.schema)) {
        throw new Error('فایل انتخاب‌شده قالب استاندارد OmniAI Hub را ندارد.');
      }

      const vault = parsed.data || parsed;
      let restoredCount = 0;

      // 1. Spatial Canvas
      if (vault.spatialCanvas) {
        await this.stateStore.importSpatialStateJson(vault.spatialCanvas);
        restoredCount++;
      }

      // 2. DOM Drivers
      if (vault.domDrivers) {
        await this.domDriverRegistry.importDriversJson(typeof vault.domDrivers === 'string' ? vault.domDrivers : JSON.stringify(vault.domDrivers));
        restoredCount++;
      }

      // 3. Symposium
      if (vault.symposium) {
        this.symposiumState.importSymposiumData(vault.symposium, true);
        restoredCount++;
      }

      // 4. Mirror Chats
      if (vault.mirrorChats) {
        this.mirrorChat.importConversationsJson(vault.mirrorChats);
        restoredCount++;
      }

      // 5. Council
      if (vault.council) {
        this.councilOrchestrator.importCouncilJson(vault.council);
        restoredCount++;
      }

      globalBus.emit('STATE_CHANGED', this.stateStore.getState());
      globalBus.emit('DATA_VAULT_RESTORED');

      this.showToast(`همه‌چیز با موفقیت بازیابی شد! (${restoredCount} بخش احیا شدند) 🎉`);
      setTimeout(() => this.closeVaultModal(), 1200);
      return { success: true };
    } catch (err) {
      alert(`خطا در بازیابی نسخه پشتیبان: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  downloadFile(filename, textContent) {
    const blob = new Blob([textContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  showToast(msg) {
    let toast = document.getElementById('omni-vault-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'omni-vault-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%);
        backdrop-filter: blur(20px);
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Vazirmatn", sans-serif;
        font-size: 13px;
        font-weight: 600;
        padding: 9px 20px;
        border-radius: 20px;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.4);
        z-index: 10000;
        opacity: 0;
        pointer-events: none;
        transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2500);
  }
}
