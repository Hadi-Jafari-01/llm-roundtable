/**
 * OmniAI Hub — Haute Spatial Layout Engine
 * Calculates dynamic coordinates, aspect ratios, responsive columns, and non-overlapping packing.
 */

export class LayoutEngine {
  /**
   * Main calculation entry point
   */
  static calculateLayout(cards, preset = 'atelier', options = {}) {
    if (!cards || cards.length === 0) return [];

    const viewportW = options.viewportWidth || (window.innerWidth || 1920);
    const viewportH = options.viewportHeight || (window.innerHeight || 1080);
    const spacing = typeof options.spacing === 'number' ? options.spacing : 24;
    const sizingPreset = options.sizingPreset || 'balanced';
    const focusedCardId = options.focusedCardId || (cards[0] ? cards[0].id : null);

    // Standard card dimensions by sizing preset
    const dimensions = this.getDimensionsByPreset(sizingPreset, viewportW, viewportH, cards.length);

    switch (preset) {
      case 'ribbon':
        return this.layoutRibbon(cards, dimensions, spacing);
      case 'duet':
        return this.layoutDuet(cards, dimensions, spacing, focusedCardId);
      case 'hero':
        return this.layoutHero(cards, dimensions, spacing, focusedCardId);
      case 'vertical':
        return this.layoutVertical(cards, dimensions, spacing, viewportH);
      case 'cascade':
        return this.layoutCascade(cards, dimensions, focusedCardId);
      case 'atelier':
      default:
        return this.layoutAtelierGrid(cards, dimensions, spacing, viewportW);
    }
  }

  static getDimensionsByPreset(sizingPreset, viewportW, viewportH, cardCount) {
    if (sizingPreset === 'compact') {
      return { width: 520, height: 720 };
    }
    if (sizingPreset === 'fill') {
      const cols = Math.min(cardCount, Math.max(1, Math.round(Math.sqrt(cardCount * 1.4))));
      const rows = Math.ceil(cardCount / cols);
      const w = Math.max(460, Math.floor((viewportW - 80 - (cols + 1) * 20) / cols));
      const h = Math.max(620, Math.floor((viewportH - 120 - (rows + 1) * 20) / rows));
      return { width: w, height: h };
    }
    // Default 'balanced'
    return { width: 640, height: 820 };
  }

  /**
   * 1. Atelier Dynamic Grid: Auto-calculates optimal rows/columns and centers rows
   */
  static layoutAtelierGrid(cards, dim, spacing, viewportW) {
    const N = cards.length;
    let cols = 1;

    if (N === 1) cols = 1;
    else if (N === 2) cols = 2;
    else if (N === 3 && viewportW > 1700) cols = 3;
    else if (N === 3 || N === 4) cols = 2;
    else if (N <= 6) cols = 3;
    else if (N <= 8) cols = 4;
    else cols = Math.min(5, Math.ceil(Math.sqrt(N * 1.5)));

    const rows = Math.ceil(N / cols);
    const results = [];

    // Calculate total grid dimensions for centering around origin (0, 0)
    const maxGridW = cols * dim.width + (cols - 1) * spacing;
    const totalGridH = rows * dim.height + (rows - 1) * spacing;
    const startY = -totalGridH / 2;

    for (let r = 0; r < rows; r++) {
      const startIndex = r * cols;
      const countInRow = Math.min(cols, N - startIndex);
      const rowWidth = countInRow * dim.width + (countInRow - 1) * spacing;
      const rowStartX = -rowWidth / 2;
      const y = startY + r * (dim.height + spacing);

      for (let c = 0; c < countInRow; c++) {
        const card = cards[startIndex + c];
        const x = rowStartX + c * (dim.width + spacing);
        results.push({
          id: card.id,
          x: Math.round(x),
          y: Math.round(y),
          width: dim.width,
          height: dim.height,
          zIndex: 10 + (startIndex + c)
        });
      }
    }
    return results;
  }

  /**
   * 2. Panoramic Horizon Ribbon: Continuous horizontal stream
   */
  static layoutRibbon(cards, dim, spacing) {
    const N = cards.length;
    const totalW = N * dim.width + (N - 1) * spacing;
    const startX = -totalW / 2;
    const y = -dim.height / 2;

    return cards.map((card, i) => ({
      id: card.id,
      x: Math.round(startX + i * (dim.width + spacing)),
      y: Math.round(y),
      width: dim.width,
      height: dim.height,
      zIndex: 10 + i
    }));
  }

  /**
   * 3. Duet Focus: Two main side-by-side cards, secondary below
   */
  static layoutDuet(cards, dim, spacing, focusedId) {
    if (cards.length === 0) return [];
    if (cards.length === 1) {
      return [{ id: cards[0].id, x: -dim.width / 2, y: -dim.height / 2, width: dim.width, height: dim.height, zIndex: 10 }];
    }

    const focusedIndex = Math.max(0, cards.findIndex(c => c.id === focusedId));
    const duetCards = [cards[focusedIndex]];
    const others = cards.filter((_, i) => i !== focusedIndex);
    duetCards.push(others.shift());

    const duetWidth = Math.max(dim.width, 680);
    const duetHeight = Math.max(dim.height, 860);
    const totalDuetW = 2 * duetWidth + spacing;
    const startX = -totalDuetW / 2;

    const results = [
      {
        id: duetCards[0].id,
        x: Math.round(startX),
        y: Math.round(-duetHeight / 2),
        width: duetWidth,
        height: duetHeight,
        zIndex: 20
      },
      {
        id: duetCards[1].id,
        x: Math.round(startX + duetWidth + spacing),
        y: Math.round(-duetHeight / 2),
        width: duetWidth,
        height: duetHeight,
        zIndex: 19
      }
    ];

    // Position remaining cards neatly in a row below
    if (others.length > 0) {
      const subW = Math.min(dim.width, 520);
      const subH = Math.min(dim.height, 680);
      const subTotalW = others.length * subW + (others.length - 1) * spacing;
      const subStartX = -subTotalW / 2;
      const subY = duetHeight / 2 + spacing;

      others.forEach((card, idx) => {
        results.push({
          id: card.id,
          x: Math.round(subStartX + idx * (subW + spacing)),
          y: Math.round(subY),
          width: subW,
          height: subH,
          zIndex: 10 + idx
        });
      });
    }

    return results;
  }

  /**
   * 4. Hero Focus: 1 Prominent Master pane + stacked sidebar cards
   */
  static layoutHero(cards, dim, spacing, focusedId) {
    if (cards.length <= 1) {
      return this.layoutRibbon(cards, dim, spacing);
    }

    const focusedIndex = Math.max(0, cards.findIndex(c => c.id === focusedId));
    const heroCard = cards[focusedIndex];
    const sideCards = cards.filter((_, i) => i !== focusedIndex);

    const heroW = Math.round(dim.width * 1.35);
    const heroH = dim.height;
    const sideW = Math.max(480, Math.round(dim.width * 0.85));
    const sideCount = sideCards.length;

    const totalLayoutW = heroW + spacing + sideW;
    const startX = -totalLayoutW / 2;
    const startY = -heroH / 2;

    const results = [{
      id: heroCard.id,
      x: Math.round(startX),
      y: Math.round(startY),
      width: heroW,
      height: heroH,
      zIndex: 25
    }];

    // Side cards stacked vertically
    const sideH = Math.max(340, Math.round((heroH - (sideCount - 1) * spacing) / sideCount));
    sideCards.forEach((card, idx) => {
      results.push({
        id: card.id,
        x: Math.round(startX + heroW + spacing),
        y: Math.round(startY + idx * (sideH + spacing)),
        width: sideW,
        height: sideH,
        zIndex: 10 + idx
      });
    });

    return results;
  }

  /**
   * 5. Vertical Columns
   */
  static layoutVertical(cards, dim, spacing, viewportH) {
    const colH = Math.max(760, viewportH - 120);
    const colW = Math.max(480, dim.width);
    const totalW = cards.length * colW + (cards.length - 1) * spacing;
    const startX = -totalW / 2;

    return cards.map((card, i) => ({
      id: card.id,
      x: Math.round(startX + i * (colW + spacing)),
      y: Math.round(-colH / 2),
      width: colW,
      height: colH,
      zIndex: 10 + i
    }));
  }

  /**
   * 6. Cascade Staggered Stack
   */
  static layoutCascade(cards, dim, focusedId) {
    const step = 42;
    const N = cards.length;
    const startX = -dim.width / 2 - ((N - 1) * step) / 2;
    const startY = -dim.height / 2 - ((N - 1) * step) / 2;

    return cards.map((card, idx) => {
      const isFocused = card.id === focusedId;
      return {
        id: card.id,
        x: Math.round(startX + idx * step),
        y: Math.round(startY + idx * step),
        width: dim.width,
        height: dim.height,
        zIndex: isFocused ? 100 : 10 + idx
      };
    });
  }

  /**
   * Non-overlapping placement algorithm for when auto-arrange is toggled OFF.
   * Finds the nearest empty coordinate so new tabs never overlap existing ones.
   */
  static findNonOverlappingPosition(existingCards, newWidth = 640, newHeight = 820, spacing = 24) {
    if (!existingCards || existingCards.length === 0) {
      return { x: -newWidth / 2, y: -newHeight / 2 };
    }

    // Grid scan starting from center outward in concentric rectangles
    const stepX = newWidth + spacing;
    const stepY = newHeight + spacing;

    const collides = (x, y) => {
      const margin = 10;
      return existingCards.some(card => {
        const cLeft = card.x;
        const cRight = card.x + (card.width || newWidth);
        const cTop = card.y;
        const cBottom = card.y + (card.height || newHeight);

        return !(
          x + newWidth - margin <= cLeft ||
          x + margin >= cRight ||
          y + newHeight - margin <= cTop ||
          y + margin >= cBottom
        );
      });
    };

    // First try immediately to the right of the rightmost card
    let maxX = -Infinity;
    let rightmostCard = existingCards[0];
    existingCards.forEach(c => {
      if (c.x > maxX) {
        maxX = c.x;
        rightmostCard = c;
      }
    });

    const candidateRightX = rightmostCard.x + (rightmostCard.width || newWidth) + spacing;
    const candidateRightY = rightmostCard.y;
    if (!collides(candidateRightX, candidateRightY)) {
      return { x: candidateRightX, y: candidateRightY };
    }

    // Spiral search pattern
    let radius = 1;
    while (radius < 10) {
      for (let r = -radius; r <= radius; r++) {
        for (let c = -radius; c <= radius; c++) {
          if (Math.abs(r) !== radius && Math.abs(c) !== radius) continue;
          const posX = Math.round(c * stepX - newWidth / 2);
          const posY = Math.round(r * stepY - newHeight / 2);
          if (!collides(posX, posY)) {
            return { x: posX, y: posY };
          }
        }
      }
      radius++;
    }

    return { x: candidateRightX, y: candidateRightY };
  }

  /**
   * Calculates pan and zoom to fit all cards into the current viewport
   */
  static calculateFitTransform(cards, viewportW, viewportH, padding = 80) {
    if (!cards || cards.length === 0) {
      return { pan: { x: viewportW / 2, y: viewportH / 2 }, zoom: 1 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    cards.forEach(card => {
      minX = Math.min(minX, card.x);
      minY = Math.min(minY, card.y);
      maxX = Math.max(maxX, card.x + (card.width || 640));
      maxY = Math.max(maxY, card.y + (card.height || 820));
    });

    const boundsW = Math.max(100, maxX - minX);
    const boundsH = Math.max(100, maxY - minY);
    const centerX = minX + boundsW / 2;
    const centerY = minY + boundsH / 2;

    const availableW = Math.max(200, viewportW - padding * 2);
    const availableH = Math.max(200, viewportH - padding * 2);

    const scaleX = availableW / boundsW;
    const scaleY = availableH / boundsH;
    const targetZoom = Math.min(1.05, Math.max(0.2, Math.min(scaleX, scaleY)));

    const panX = viewportW / 2 - centerX * targetZoom;
    const panY = viewportH / 2 - centerY * targetZoom;

    return {
      pan: { x: Math.round(panX), y: Math.round(panY) },
      zoom: Number(targetZoom.toFixed(3))
    };
  }
}