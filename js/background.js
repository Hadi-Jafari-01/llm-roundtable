/**
 * OmniAI Hub — Background Service Worker (Manifest V3)
 * Manages declarativeNetRequest rule verification, initial state defaults, and toolbar action.
 */

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[OmniAI Hub] Obsidian Silk Spatial Architecture Initialized.');

  if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.getEnabledRulesets) {
    const rulesets = await chrome.declarativeNetRequest.getEnabledRulesets();
    console.log('[OmniAI Hub] Verified Active Framing Rulesets:', rulesets);
  }
});

// Inter-frame and window control relay listener (Dual Firefox/Chrome API)
const runtimeApi = (typeof browser !== 'undefined' && browser.runtime) 
  ? browser.runtime 
  : (typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime : null);

// Toolbar action click opens workspace or focuses existing
const actionApi = (typeof chrome !== 'undefined' && chrome.action) 
  ? chrome.action 
  : ((typeof browser !== 'undefined' && browser.browserAction) ? browser.browserAction : (chrome.browserAction || null));

if (actionApi && actionApi.onClicked) {
  actionApi.onClicked.addListener(async () => {
    const hubUrl = runtimeApi.getURL('newtab.html');
    const tabsApi = (typeof browser !== 'undefined' && browser.tabs) ? browser.tabs : chrome.tabs;
    const winApi = (typeof browser !== 'undefined' && browser.windows) ? browser.windows : chrome.windows;

    const tabs = await tabsApi.query({});
    const existingTab = tabs.find(t => t.url && t.url.startsWith(hubUrl));

    if (existingTab && existingTab.id) {
      await tabsApi.update(existingTab.id, { active: true });
      if (existingTab.windowId) {
        await winApi.update(existingTab.windowId, { focused: true });
      }
    } else {
      await winApi.create({
        url: hubUrl + '?mode=app',
        type: 'popup'
      });
    }
  });
}

if (runtimeApi?.onMessage) {
  runtimeApi.onMessage.addListener((message, sender, sendResponse) => {
    if (message && message.action === 'OPEN_DESKTOP_WINDOW') {
      const winApi = (typeof browser !== 'undefined' && browser.windows) 
        ? browser.windows 
        : (typeof chrome !== 'undefined' && chrome.windows ? chrome.windows : null);

      const hubUrl = runtimeApi.getURL('newtab.html?mode=app');

      if (winApi?.create) {
        // Creates clean standalone app window without browser URL bar and features
        winApi.create({
          url: hubUrl,
          type: 'popup'
        }).then((win) => {
          sendResponse({ success: true, windowId: win?.id });
        }).catch((err) => {
          sendResponse({ success: false, error: err.message });
        });
        return true;
      }
    }

    if (message && message.action === 'RELAY_PROMPT') {
      const tabsApi = (typeof browser !== 'undefined' && browser.tabs) 
        ? browser.tabs 
        : (typeof chrome !== 'undefined' && chrome.tabs ? chrome.tabs : null);

      if (tabsApi?.query) {
        tabsApi.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            tabsApi.sendMessage(tabs[0].id, {
              action: 'OMNI_DISPATCH_PROMPT',
              prompt: message.prompt,
              messageId: message.messageId,
              targetCardId: message.targetCardId,
              targetCardIds: message.targetCardIds,
              targetHost: message.targetHost,
              scope: message.scope
            });
            sendResponse({ relayed: true });
          }
        });
        return true;
      }
    }

    if (message && message.action && message.action.startsWith('MIRROR_')) {
      const tabsApi = (typeof browser !== 'undefined' && browser.tabs) 
        ? browser.tabs 
        : (typeof chrome !== 'undefined' && chrome.tabs ? chrome.tabs : null);

      if (tabsApi?.sendMessage && sender?.tab?.id) {
        tabsApi.sendMessage(sender.tab.id, message).catch?.(() => {});
      } else if (tabsApi?.query) {
        tabsApi.query({ active: true }, (tabs) => {
          tabs.forEach(t => {
            if (t.id) tabsApi.sendMessage(t.id, message).catch?.(() => {});
          });
        });
      }
      sendResponse?.({ relayed: true });
      return true;
    }
  });
}
