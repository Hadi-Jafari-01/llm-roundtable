/**
 * OmniAI Hub — Modular UI Bootstrapper
 *
 * newtab.html is intentionally a thin shell. The workspace markup lives in
 * components/ as ordered fragments (chrome + canvas at the root, slide-over
 * panels in drawers/, dialogs in modals/). This module fetches every fragment
 * in parallel, mounts them into the #app host in the order listed below, and
 * only then starts js/app.js so the application always sees a complete DOM.
 *
 * This array is the single source of truth for fragment order — the numeric
 * prefixes are per-directory and only aid navigation.
 */

/** Ordered list of markup fragments, relative to the components/ directory. */
const PARTIALS = [
  '01-chrome-sensors.html',
  '02-topbar-left-zone.html',
  '03-topbar-center-zone.html',
  '04-topbar-auto-arrange.html',
  '05-topbar-tools-menu.html',
  '06-canvas-viewport.html',
  'drawers/01-selector-studio-a.html',
  'drawers/02-selector-studio-b.html',
  'drawers/03-selector-studio-c.html',
  'drawers/04-mirror-chat.html',
  '07-omnibar-capsule.html',
  'drawers/05-silk-pavilion.html',
  '08-symposium-shell.html',
  '09-symposium-step-proposal.html',
  '10-symposium-seat-inspector.html',
  '11-sanctum-atelier-a.html',
  '12-sanctum-atelier-b.html',
  '13-governance-suite.html',
  '14-dialectic-engine.html',
  '15-dialectic-formula-editor.html',
  'drawers/06-sessions-history.html',
  '16-council-chamber.html',
  'modals/01-data-vault-a.html',
  'modals/02-data-vault-b.html',
  'modals/03-custom-model.html',
  'modals/04-keyboard-shortcuts.html',
];

const COMPONENTS_DIR = new URL('../components/', import.meta.url);

/** Render a visible failure state instead of a silently blank workspace. */
const renderBootFailure = (host, error) => {
  const message = error && error.message ? error.message : String(error);
  console.error('[OmniAI] Interface bootstrap failed:', error);
  if (!host) return;
  const escaped = message.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]));
  host.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:center;height:100vh;' +
    'font-family:system-ui,sans-serif;color:#cbd5e1;text-align:center;padding:32px;">' +
    '<div><h2 style="margin:0 0 10px;font-size:16px;">OmniAI Hub could not assemble its interface</h2>' +
    '<p style="margin:0;font-size:12.5px;color:#9ca3af;max-width:560px;line-height:1.6;">' +
    'The markup fragments in <code>components/</code> must be reachable from this page. Load the ' +
    'workspace through the browser extension, or serve the folder over HTTP, instead of opening ' +
    'newtab.html straight from the filesystem.</p>' +
    '<p style="margin:14px 0 0;font-size:11.5px;color:#6b7280;font-family:ui-monospace,monospace;">' +
    escaped + '</p></div></div>';
};

/** Fetch every fragment concurrently; PARTIALS order is preserved by Promise.all. */
const loadPartials = async () => {
  const responses = await Promise.all(PARTIALS.map((name) => fetch(new URL(name, COMPONENTS_DIR))));

  const missing = responses
    .map((response, index) => (response.ok ? null : PARTIALS[index] + ' (HTTP ' + response.status + ')'))
    .filter(Boolean);
  if (missing.length) throw new Error('Missing fragments: ' + missing.join(', '));

  return Promise.all(responses.map((response) => response.text()));
};

const host = document.getElementById('app');
host?.setAttribute('data-boot', 'pending');

try {
  host.innerHTML = (await loadPartials()).join('');
  host.setAttribute('data-boot', 'ready');
  await import('./app.js');
} catch (error) {
  renderBootFailure(host, error);
}
