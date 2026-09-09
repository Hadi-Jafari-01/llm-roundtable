/**
 * OmniAI Hub — Infinite Spatial Workspace Canvas Architecture
 * Fixes tab switching camera glide without modifying card coordinates.
 * Prevents native browser scroll hijacking and iframe gesture interception.
 */

import { globalBus } from './EventBus.js';

export class WorkspaceCanvas {
  constructor(viewportEl, radarEl, stateStore) {
    this.viewportEl = viewportEl;
    this.planeEl = document.getElementById('spatial-canvas-plane');
    this.cardsContainerEl = document.getElementById('spatial-cards-container');
    this.tabsContainerEl = document.getElementById('silk-tabs-container');
    this.radarEl = radarEl;
    this.stateStore = stateStore;

    // Camera 2D Transform Coordinates
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.minZoom = 0.2;
    this.maxZoom = 2.4;

    // Interaction Flags
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;
    this.initialPanX = 0;
    this.initialPanY = 0;

    this.activeDragCard = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.initialCardX = 0;
    this.initialCardY = 0;

    this.activeResizeCard = null;
    this.resizeStartX = 0;
    this.resizeStartY = 0;
    this.initialCardW = 0;
    this.initialCardH = 0;

    this.glideAnimationId = null;

    this.setupViewportGuards();
    this.setupEvents();
    this.setupBusListeners();
  }

  /**
   * Prevents native browser scroll jumps when elements receive focus.
   */
  setupViewportGuards() {
    const lockScroll = () => {
      if (this.viewportEl.scrollTop !== 0) this.viewportEl.scrollTop = 0;
      if (this.viewportEl.scrollLeft !== 0) this.viewportEl.scrollLeft = 0;
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    this.viewportEl.addEventListener('scroll', lockScroll, { passive: false, capture: true });
    window.addEventListener('scroll', lockScroll, { passive: false, capture: true });
  }

  setupBusListeners() {
    globalBus.on('STATE_CHANGED', () => {
      this.render();
    });

    globalBus.on('ZOOM_IN', () => {
      this.zoomCamera(1.15, this.viewportEl.clientWidth / 2, this.viewportEl.clientHeight / 2);
    });

    globalBus.on('ZOOM_OUT', () => {
      this.zoomCamera(0.85, this.viewportEl.clientWidth / 2, this.viewportEl.clientHeight / 2);
    });

    globalBus.on('ZOOM_RESET', () => {
      this.zoom = 1;
      this.applyTransform();
      this.updateZoomReadout();
    });

    globalBus.on('FIT_VIEWPORT', () => {
      this.fitViewport();
    });
  }

  setupEvents() {
    // Canvas Panning via Space + Drag, Middle Click, or Drag on background
    this.viewportEl.addEventListener('mousedown', (e) => {
      if (e.target.closest('.spatial-card') || e.target.closest('.spatial-radar-card')) {
        return;
      }

      if (e.button === 0 || e.button === 1 || e.spaceKey) {
        this.isPanning = true;
        this.panStartX = e.clientX;
        this.panStartY = e.clientY;
        this.initialPanX = this.panX;
        this.initialPanY = this.panY;
        this.viewportEl.classList.add('panning');
        this.setIframeShields(true);
        e.preventDefault();
      }
    });

    window.addEventListener('mousemove', (e) => {
      // 1. Camera Panning
      if (this.isPanning) {
        const dx = e.clientX - this.panStartX;
        const dy = e.clientY - this.panStartY;
        this.panX = this.initialPanX + dx;
        this.panY = this.initialPanY + dy;
        this.applyTransform();
        this.renderRadar();
        return;
      }

      // 2. Card Dragging
      if (this.activeDragCard) {
        const dx = (e.clientX - this.dragStartX) / this.zoom;
        const dy = (e.clientY - this.dragStartY) / this.zoom;
        this.activeDragCard.x = Math.round(this.initialCardX + dx);
        this.activeDragCard.y = Math.round(this.initialCardY + dy);

        const cardEl = document.getElementById(this.activeDragCard.id);
        if (cardEl) {
          cardEl.style.transform = `translate3d(${this.activeDragCard.x}px, ${this.activeDragCard.y}px, 0)`;
        }
        this.renderRadar();
        return;
      }

      // 3. Card Resizing
      if (this.activeResizeCard) {
        const dx = (e.clientX - this.resizeStartX) / this.zoom;
        const dy = (e.clientY - this.resizeStartY) / this.zoom;
        this.activeResizeCard.width = Math.max(380, Math.round(this.initialCardW + dx));
        this.activeResizeCard.height = Math.max(460, Math.round(this.initialCardH + dy));

        const cardEl = document.getElementById(this.activeResizeCard.id);
        if (cardEl) {
          cardEl.style.width = `${this.activeResizeCard.width}px`;
          cardEl.style.height = `${this.activeResizeCard.height}px`;
        }
        this.renderRadar();
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        this.viewportEl.classList.remove('panning');
        this.setIframeShields(false);
      }

      if (this.activeDragCard) {
        const card = this.activeDragCard;
        this.activeDragCard = null;
        this.setIframeShields(false);
        this.stateStore.updateCard(card.id, { x: card.x, y: card.y });
      }

      if (this.activeResizeCard) {
        const card = this.activeResizeCard;
        this.activeResizeCard = null;
        this.setIframeShields(false);
        this.stateStore.updateCard(card.id, { width: card.width, height: card.height });
      }
    });

    // Zoom on wheel with Ctrl/Cmd or trackpad pinch
    this.viewportEl.addEventListener('wheel', (e) => {
      if (e.target.closest('.card-body-wrapper')) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = Math.exp(-e.deltaY * 0.0025);
        this.zoomCamera(factor, e.clientX, e.clientY);
      } else {
        // Trackpad 2-finger pan
        e.preventDefault();
        this.panX -= e.deltaX;
        this.panY -= e.deltaY;
        this.applyTransform();
        this.renderRadar();
      }
    }, { passive: false });

    // Smooth horizontal wheel scroll for the Silk Tab Ribbon
    if (this.tabsContainerEl) {
      this.tabsContainerEl.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          this.tabsContainerEl.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }

    // Mini-map radar click teleports camera
    if (this.radarEl) {
      this.radarEl.addEventListener('click', (e) => {
        this.handleRadarClick(e);
      });
    }

    // Window resize recalculates transform
    window.addEventListener('resize', () => {
      this.applyTransform();
      this.renderRadar();
    });
  }

  setIframeShields(active) {
    document.querySelectorAll('.spatial-card').forEach(card => {
      card.classList.toggle('shield-active', active);
    });
  }

  zoomCamera(scaleFactor, originX, originY) {
    const prevZoom = this.zoom;
    let nextZoom = this.zoom * scaleFactor;
    nextZoom = Math.max(this.minZoom, Math.min(this.maxZoom, nextZoom));

    if (nextZoom === prevZoom) return;

    // Zoom centered on cursor
    this.panX = originX - (originX - this.panX) * (nextZoom / prevZoom);
    this.panY = originY - (originY - this.panY) * (nextZoom / prevZoom);
    this.zoom = nextZoom;

    this.applyTransform();
    this.renderRadar();
    this.updateZoomReadout();
  }

  applyTransform() {
    this.planeEl.style.transform = `translate3d(${this.panX}px, ${this.panY}px, 0) scale(${this.zoom})`;
  }

  updateZoomReadout() {
    const readoutBtn = document.getElementById('zoom-readout-btn');
    if (readoutBtn) {
      readoutBtn.textContent = `${Math.round(this.zoom * 100)}%`;
    }
  }

  /**
   * CRITICAL BUGFIX: glideToCard glides the camera directly to center the card.
   * Modifies ONLY panX & panY via smooth lerp. NEVER modifies card.x, card.y.
   * NEVER triggers tidyUp() or layout shifts.
   */
  glideToCard(cardId) {
    const card = this.stateStore.getCard(cardId);
    if (!card) return;

    // 1. Bring card to front without shifting positions
    this.stateStore.setActiveCard(cardId);

    // 2. Center Calculation:
    // targetPanX = (viewportWidth / 2) - (card.x + card.width / 2) * zoom
    // targetPanY = (viewportHeight / 2) - (card.y + card.height / 2) * zoom
    const vpW = this.viewportEl.clientWidth;
    const vpH = this.viewportEl.clientHeight;
    const targetPanX = (vpW / 2) - (card.x + card.width / 2) * this.zoom;
    const targetPanY = (vpH / 2) - (card.y + card.height / 2) * this.zoom;

    // 3. Smooth animated interpolation (360ms spring ease-out)
    this.animateCameraTo(targetPanX, targetPanY, this.zoom, 360);
  }

  animateCameraTo(targetX, targetY, targetZoom, duration = 360) {
    if (this.glideAnimationId) {
      cancelAnimationFrame(this.glideAnimationId);
    }

    const startX = this.panX;
    const startY = this.panY;
    const startZoom = this.zoom;
    const startTime = performance.now();

    const frame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);

      this.panX = startX + (targetX - startX) * ease;
      this.panY = startY + (targetY - startY) * ease;
      this.zoom = startZoom + (targetZoom - startZoom) * ease;

      this.applyTransform();
      this.renderRadar();
      this.updateZoomReadout();

      if (progress < 1) {
        this.glideAnimationId = requestAnimationFrame(frame);
      } else {
        this.glideAnimationId = null;
      }
    };

    this.glideAnimationId = requestAnimationFrame(frame);
  }

  fitViewport() {
    const cards = this.stateStore.getCards();
    if (cards.length === 0) return;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    cards.forEach(card => {
      minX = Math.min(minX, card.x);
      minY = Math.min(minY, card.y);
      maxX = Math.max(maxX, card.x + card.width);
      maxY = Math.max(maxY, card.y + card.height);
    });

    const padding = 80;
    const bboxW = (maxX - minX) + padding * 2;
    const bboxH = (maxY - minY) + padding * 2;

    const vpW = this.viewportEl.clientWidth;
    const vpH = this.viewportEl.clientHeight;

    const scaleX = vpW / bboxW;
    const scaleY = vpH / bboxH;
    const fitZoom = Math.max(0.25, Math.min(1.0, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const targetPanX = (vpW / 2) - centerX * fitZoom;
    const targetPanY = (vpH / 2) - centerY * fitZoom;

    this.animateCameraTo(targetPanX, targetPanY, fitZoom, 400);
  }

  render() {
    this.renderCards();
    this.renderSilkTabs();
    this.renderRadar();
  }

  renderSilkTabs() {
    if (!this.tabsContainerEl) return;

    const state = this.stateStore.getState();
    const cards = state.cards;
    const activeId = state.activeCardId;

    this.tabsContainerEl.innerHTML = '';

    cards.forEach(card => {
      const tab = document.createElement('div');
      tab.className = `silk-tab-pill ${card.id === activeId ? 'active' : ''}`;
      tab.dataset.cardId = card.id;

      if (card.id === activeId) {
        tab.style.setProperty('--tab-glow', `${card.color}40`);
        tab.style.setProperty('--tab-border-active', `${card.color}70`);
      }

      tab.innerHTML = `
        <span class="silk-tab-dot" style="color: ${card.color}; background: ${card.color};"></span>
        <span class="silk-tab-title">${card.title}</span>
        <button class="silk-tab-close" title="Close Tab">✕</button>
      `;

      // Tab selection smoothly glides to card
      tab.addEventListener('click', (e) => {
        if (e.target.closest('.silk-tab-close')) {
          e.stopPropagation();
          this.stateStore.removeCard(card.id);
          return;
        }

        this.glideToCard(card.id);
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });

      this.tabsContainerEl.appendChild(tab);
    });

    // Quick add button in tabs bar
    const addBtn = document.createElement('button');
    addBtn.className = 'silk-tab-add-btn';
    addBtn.title = 'Quick Add Model';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', () => {
      document.getElementById('btn-quick-launcher')?.click();
    });
    this.tabsContainerEl.appendChild(addBtn);
  }

  renderCards() {
    const cards = this.stateStore.getCards();
    const state = this.stateStore.getState();
    const activeId = state.activeCardId;

    // Track existing card DOM elements
    const existingDomMap = new Map();
    this.cardsContainerEl.querySelectorAll('.spatial-card').forEach(el => {
      existingDomMap.set(el.id, el);
    });

    const activeCardIds = new Set(cards.map(c => c.id));

    // Remove deleted cards
    existingDomMap.forEach((el, id) => {
      if (!activeCardIds.has(id)) {
        el.remove();
      }
    });

    // Create or update cards
    cards.forEach(card => {
      let cardEl = existingDomMap.get(card.id);

      if (!cardEl) {
        cardEl = document.createElement('div');
        cardEl.id = card.id;
        cardEl.dataset.cardId = card.id;
        cardEl.className = 'spatial-card';
        cardEl.innerHTML = `
          <div class="card-header">
            <div class="card-title-group">
              <span class="card-model-pearl" style="color: ${card.color}; background: ${card.color};"></span>
              <span class="card-title-text">${card.title || card.name || 'AI Model'}</span>
            </div>
            <div class="card-controls-cluster">
              <button class="card-ctrl-btn reload" title="Reload Frame">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </button>
              <button class="card-ctrl-btn focus" title="Center Focus">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="card-ctrl-btn close" title="Close Intelligence">✕</button>
            </div>
          </div>
          <div class="card-body-wrapper">
            <iframe class="card-iframe" id="iframe-${card.id}" name="${card.id}" data-card-id="${card.id}" src="${card.url}" allow="clipboard-read; clipboard-write; microphone; camera; autoplay"></iframe>
            <div class="card-iframe-shield"></div>
          </div>
          <div class="card-resize-handle" title="Resize Card"></div>
        `;

        const iframeEl = cardEl.querySelector('iframe');
        iframeEl?.addEventListener('load', () => {
          try {
            iframeEl.contentWindow?.postMessage({
              action: 'SET_CARD_ID',
              cardId: card.id
            }, '*');
          } catch (_) {}
        });

        this.setupCardInteractions(cardEl, card);
        this.cardsContainerEl.appendChild(cardEl);
      }

      cardEl.dataset.cardId = card.id;

      // Update geometry & styling
      cardEl.style.width = `${card.width}px`;
      cardEl.style.height = `${card.height}px`;
      cardEl.style.transform = `translate3d(${card.x}px, ${card.y}px, 0)`;
      cardEl.style.zIndex = card.zIndex || 10;

      const isActive = card.id === activeId;
      cardEl.classList.toggle('active', isActive);
      if (isActive) {
        cardEl.style.setProperty('--active-card-color', `${card.color}80`);
      }
    });
  }

  setupCardInteractions(cardEl, card) {
    const header = cardEl.querySelector('.card-header');
    const resizeHandle = cardEl.querySelector('.card-resize-handle');

    // Click card brings to front
    cardEl.addEventListener('mousedown', () => {
      this.stateStore.setActiveCard(card.id);
    });

    // Header drag handler
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.card-ctrl-btn')) return;

      this.activeDragCard = card;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.initialCardX = card.x;
      this.initialCardY = card.y;
      this.stateStore.setActiveCard(card.id);
      this.setIframeShields(true);
      e.preventDefault();
    });

    // Resize handler
    resizeHandle.addEventListener('mousedown', (e) => {
      this.activeResizeCard = card;
      this.resizeStartX = e.clientX;
      this.resizeStartY = e.clientY;
      this.initialCardW = card.width;
      this.initialCardH = card.height;
      this.stateStore.setActiveCard(card.id);
      this.setIframeShields(true);
      e.preventDefault();
      e.stopPropagation();
    });

    // Card buttons
    const reloadBtn = cardEl.querySelector('.card-ctrl-btn.reload');
    reloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const iframe = cardEl.querySelector('.card-iframe');
      if (iframe) iframe.src = iframe.src;
    });

    const focusBtn = cardEl.querySelector('.card-ctrl-btn.focus');
    focusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.glideToCard(card.id);
    });

    const closeBtn = cardEl.querySelector('.card-ctrl-btn.close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.stateStore.removeCard(card.id);
    });
  }

  renderRadar() {
    if (!this.radarEl) return;

    const cards = this.stateStore.getCards();
    const activeId = this.stateStore.getState().activeCardId;

    let minX = -1000;
    let minY = -1000;
    let maxX = 3000;
    let maxY = 2500;

    cards.forEach(c => {
      minX = Math.min(minX, c.x - 400);
      minY = Math.min(minY, c.y - 400);
      maxX = Math.max(maxX, c.x + c.width + 400);
      maxY = Math.max(maxY, c.y + c.height + 400);
    });

    const worldW = maxX - minX;
    const worldH = maxY - minY;
    const radarW = this.radarEl.clientWidth || 170;
    const radarH = this.radarEl.clientHeight || 110;

    this.radarEl.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'radar-canvas-view';

    // Render Cards in radar
    cards.forEach(card => {
      const rx = ((card.x - minX) / worldW) * radarW;
      const ry = ((card.y - minY) / worldH) * radarH;
      const rw = Math.max(4, (card.width / worldW) * radarW);
      const rh = Math.max(4, (card.height / worldH) * radarH);

      const rCard = document.createElement('div');
      rCard.className = `radar-card-rect ${card.id === activeId ? 'active' : ''}`;
      rCard.style.left = `${rx}px`;
      rCard.style.top = `${ry}px`;
      rCard.style.width = `${rw}px`;
      rCard.style.height = `${rh}px`;
      rCard.style.backgroundColor = `${card.color}35`;
      rCard.style.borderColor = card.color;
      rCard.style.color = card.color;

      container.appendChild(rCard);
    });

    // Render Viewport Camera Frustum
    const vpW = this.viewportEl.clientWidth;
    const vpH = this.viewportEl.clientHeight;
    const camWorldX = -this.panX / this.zoom;
    const camWorldY = -this.panY / this.zoom;
    const camWorldW = vpW / this.zoom;
    const camWorldH = vpH / this.zoom;

    const fx = ((camWorldX - minX) / worldW) * radarW;
    const fy = ((camWorldY - minY) / worldH) * radarH;
    const fw = (camWorldW / worldW) * radarW;
    const fh = (camWorldH / worldH) * radarH;

    const frustum = document.createElement('div');
    frustum.className = 'radar-frustum-box';
    frustum.style.left = `${fx}px`;
    frustum.style.top = `${fy}px`;
    frustum.style.width = `${fw}px`;
    frustum.style.height = `${fh}px`;

    container.appendChild(frustum);
    this.radarEl.appendChild(container);

    this.radarBounds = { minX, minY, worldW, worldH, radarW, radarH };
  }

  handleRadarClick(e) {
    if (!this.radarBounds) return;
    const rect = this.radarEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const { minX, minY, worldW, worldH, radarW, radarH } = this.radarBounds;
    const worldClickX = minX + (clickX / radarW) * worldW;
    const worldClickY = minY + (clickY / radarH) * worldH;

    const vpW = this.viewportEl.clientWidth;
    const vpH = this.viewportEl.clientHeight;
    const targetPanX = (vpW / 2) - worldClickX * this.zoom;
    const targetPanY = (vpH / 2) - worldClickY * this.zoom;

    this.animateCameraTo(targetPanX, targetPanY, this.zoom, 320);
  }
}
