

<!-- dsh-openwolf:start -->
# Code Map
Generated 2026-09-12T05:35:34.083Z · 80 files · 17343 lines · 0.69s

## ./
- `manifest.json` — 75 lines · Infinite 2D spatial AI workspace. Run ChatGPT, Gemini, DeepSeek, Grok, Z.ai, Qwen, Kimi.ai, Google AI Studio, Arena.ai, Claude, and Mistral…
- `manifest.webmanifest` — 32 lines · {
- `newtab.html` — 39 lines · <!DOCTYPE html>
- `rules.json` — 58 lines · [

## backup
- `backup/DOMs-1.json` — 385 lines · {
- `backup/omniai_dom_drivers_1788974204581.json` — 246 lines · {
- `backup/omniai_dom_drivers_1788975449602.json` — 247 lines · {
- `backup/omniai_master_backup_2026-09-09_1788996753822.omniai.json` — 486 lines · {

## components
- `components/01-chrome-sensors.html` — 13 lines · <div class="nano-nav-sensor" id="nano-nav-sensor"></div>
- `components/02-topbar-left-zone.html` — 72 lines · <header class="top-nano-nav" id="top-nav">
- `components/03-topbar-center-zone.html` — 33 lines · <div class="nav-cluster center tabs-stage">
- `components/04-topbar-auto-arrange.html` — 136 lines · <div class="collapsible-island-wrapper" id="wrapper-layout-menu">
- `components/05-topbar-tools-menu.html` — 61 lines · <div class="collapsible-island-wrapper" id="wrapper-tools-menu">
- `components/06-canvas-viewport.html` — 8 lines · <main id="spatial-viewport" class="spatial-viewport">
- `components/07-omnibar-capsule.html` — 77 lines · <div class="omnibar-capsule-island" id="omnibar-island">
- `components/08-symposium-shell.html` — 78 lines · <div id="silk-symposium-chamber" class="silk-symposium-overlay" aria-label="The Silk Symposium">
- `components/09-symposium-step-proposal.html` — 86 lines · <div id="composer-proposal-capsule" class="composer-proposal-capsule hidden">
- `components/10-symposium-seat-inspector.html` — 46 lines · <div id="seat-inline-inspector" class="seat-inline-inspector" role="dialog" aria-label="Seat Inspector">
- `components/11-sanctum-atelier-a.html` — 114 lines · <div id="sanctum-backdrop" class="sanctum-backdrop"></div>
- `components/12-sanctum-atelier-b.html` — 66 lines · <div id="sanctum-zone-personas" class="sanctum-zone-panel" style="display: none;">
- `components/13-governance-suite.html` — 109 lines · <div id="sanctum-zone-governance" class="sanctum-zone-panel" style="display: none;">
- `components/14-dialectic-engine.html` — 78 lines · <div class="engine-section-block">
- `components/15-dialectic-formula-editor.html` — 102 lines · <div class="formula-editor-card">
- `components/16-council-chamber.html` — 124 lines · <div id="council-chamber-overlay" class="council-chamber-overlay" aria-label="The Celestial Council">

## components/drawers
- `components/drawers/01-selector-studio-a.html` — 115 lines · <div id="selector-studio-backdrop" class="selector-studio-backdrop"></div>
- `components/drawers/02-selector-studio-b.html` — 90 lines · <div class="driver-field-card">
- `components/drawers/03-selector-studio-c.html` — 132 lines · <div class="driver-field-card kinematics-master-card">
- `components/drawers/04-mirror-chat.html` — 65 lines · <aside id="mirror-chat-studio" class="mirror-chat-studio">
- `components/drawers/05-silk-pavilion.html` — 44 lines · <div id="silk-pavilion-backdrop" class="silk-pavilion-backdrop"></div>
- `components/drawers/06-sessions-history.html` — 44 lines · <div id="symposium-history-backdrop" class="symposium-history-backdrop"></div>

## components/modals
- `components/modals/01-data-vault-a.html` — 69 lines · <div id="modal-data-vault" class="modal-veil hidden">
- `components/modals/02-data-vault-b.html` — 138 lines · <div id="vault-tab-granular" style="display: none; flex-direction: column; gap: 10px;">
- `components/modals/03-custom-model.html` — 44 lines · <div id="modal-custom-bot" class="modal-veil hidden">
- `components/modals/04-keyboard-shortcuts.html` — 81 lines · <div id="modal-shortcuts" class="modal-veil hidden">

## css
- `css/layout.css` — 94 lines · .app-root {
- `css/reset.css` — 105 lines · box-sizing: border-box;
- `css/tokens.css` — 98 lines · :root {

## css/components
- `css/components/auto-arrange-popover.css` — 94 lines · .spatial-popover-menu {
- `css/components/auto-arrange-presets.css` — 107 lines · display: grid !important;
- `css/components/auto-arrange-sizing.css` — 99 lines · grid-column: 1 / -1 !important;
- `css/components/council-chamber.css` — 575 lines · OmniAI Hub — The Celestial Council Chamber (تالار شورای افلاک)
- `css/components/data-vault.css` — 368 lines · OmniAI Hub — Universal Data Vault & Backup Studio Stylesheet
- `css/components/mirror-chat.css` — 587 lines · OmniAI Hub — The Silk Mirror Sanctuary (Native Unified Chat Studio)
- `css/components/modals.css` — 216 lines · .modal-veil {
- `css/components/nav-bar.css` — 991 lines · 1. Root Top Nano-Horizon Bar
- `css/components/omnibar.css` — 455 lines · .omnibar-capsule-island {
- `css/components/pane.css` — 174 lines · .spatial-card {
- `css/components/radar.css` — 50 lines · .spatial-radar-card {
- `css/components/selector-studio.css` — 589 lines · OmniAI Hub — Neural DOM Driver Studio (#171717 / #212121)
- `css/components/silk-pavilion.css` — 414 lines · OmniAI Hub — The Silk Pavilion (Atelier Studio Chamber)
- `css/components/silk-symposium.css` — 0 lines · [file too large]
- `css/components/window-controls.css` — 46 lines · html, body {

## icons
- `icons/generate_icons.js` — 31 lines · fs, path, generateDummyPng, pngHeader · const fs = require('fs');
- `icons/icon.svg` — 31 lines · <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
- `icons/icon128.png` — 0 lines · [binary]
- `icons/icon16.png` — 0 lines · [binary]
- `icons/icon48.png` — 0 lines · [binary]

## js
- `js/app.js` — 0 lines · [file too large]
- `js/background.js` — 113 lines · runtimeApi, actionApi · chrome.runtime.onInstalled.addListener(async () => {
- `js/boot.js` — 85 lines · PARTIALS, COMPONENTS_DIR, renderBootFailure, loadPartials, host · const PARTIALS = [
- `js/injector.js` — 1125 lines · getDriverMerged, setNativeValue, setContentEditableValue, applyInputStrategy, dispatchHumanClick, clickElement · (() => {

## js/modules
- `js/modules/CouncilOrchestrator.js` — 867 lines · GREEK_CODENAMES, CouncilOrchestrator · Exports GREEK_CODENAMES, CouncilOrchestrator
- `js/modules/DataVaultManager.js` — 417 lines · DataVaultManager · Exports DataVaultManager
- `js/modules/DomDriverRegistry.js` — 468 lines · STORAGE_KEY_DOM_DRIVERS, DEFAULT_HUMAN_KINEMATICS, FACTORY_DRIVER_PRESETS, DomDriverRegistry, domDriverRegistry · Exports STORAGE_KEY_DOM_DRIVERS, DEFAULT_HUMAN_KINEMATICS, FACTORY_DRIVER_PRESETS, domDriverRegistry
- `js/modules/EventBus.js` — 37 lines · EventBus, globalBus · Exports globalBus
- `js/modules/LayoutEngine.js` — 371 lines · LayoutEngine · Exports LayoutEngine
- `js/modules/MirrorChatStudio.js` — 962 lines · MirrorChatStudio · Exports MirrorChatStudio
- `js/modules/ModelRegistry.js` — 141 lines · MODEL_REGISTRY, STANDARD_CARD_WIDTH, STANDARD_CARD_HEIGHT, createCardInstance, INITIAL_CANVAS_PRESETS · Exports MODEL_REGISTRY, STANDARD_CARD_WIDTH, STANDARD_CARD_HEIGHT, createCardInstance, INITIAL_CANVAS_PRESETS
- `js/modules/OmnibarController.js` — 222 lines · OmnibarController · Exports OmnibarController
- `js/modules/PaneComponent.js` — 221 lines · PaneComponent · Exports PaneComponent
- `js/modules/SelectorStudioDrawer.js` — 494 lines · SelectorStudioDrawer · Exports SelectorStudioDrawer
- `js/modules/SilkPavilionDrawer.js` — 336 lines · SilkPavilionDrawer · Exports SilkPavilionDrawer
- `js/modules/SilkSymposiumOrchestrator.js` — 0 lines · [file too large]
- `js/modules/StateStore.js` — 727 lines · StateStore, stateStore · Exports stateStore
- `js/modules/WorkspaceCanvas.js` — 664 lines · WorkspaceCanvas · Exports WorkspaceCanvas

## js/modules/symposium
- `js/modules/symposium/ConsensusLedger.js` — 244 lines · ConsensusLedger · Exports ConsensusLedger
- `js/modules/symposium/SymposiumDais.js` — 266 lines · SymposiumDais · Exports SymposiumDais
- `js/modules/symposium/SymposiumState.js` — 0 lines · [file too large]
- `js/modules/symposium/SymposiumTranscript.js` — 474 lines · SymposiumTranscript · Exports SymposiumTranscript
- `js/modules/symposium/TurnSequencer.js` — 392 lines · TurnSequencer · Exports TurnSequencer
<!-- dsh-openwolf:end -->
