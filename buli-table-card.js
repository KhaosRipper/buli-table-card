class BundesligaTableCard extends HTMLElement {
  connectedCallback() {
    // 1. Dual-Mode: Fallback für den Smart Home Hub, falls Lovelace `set hass()` nicht triggert
    if (!this._hass && typeof window.S === 'function') {
      this.config = { entity: this.getAttribute('entity') || 'sensor.bund_scoreboard2' };
      this.setupDOM();
      this.render();
    }
  }

  setupDOM() {
    if (this.content) return;
    
    // 2. DOM-Struktur: Nutze <ha-card> in Lovelace, aber <div class="card"> im Smart Home Hub
    const isLovelace = !!customElements.get('ha-card');
    const card = document.createElement(isLovelace ? 'ha-card' : 'div');
    if (!isLovelace) {
      card.className = 'card';
      card.style.padding = '0'; // Padding für Tabellen im Hub entfernen
      card.style.overflow = 'hidden';
    }

    // 3. CSS-Variablen-Bridge: Nutzt Lovelace-Variablen (--primary-text-color) mit Hub-Variablen (--txt) als Fallback
    const style = document.createElement('style');
    style.textContent = `
      .buli-table {
        width: 100%;
        border-collapse: collapse;
        font-family: var(--paper-font-body1_-_font-family, inherit);
        font-size: 13px;
        color: var(--primary-text-color, var(--txt, #eaebee));
        background-color: transparent;
      }
      .buli-table th {
        padding: 12px 10px;
        text-align: left;
        color: var(--secondary-text-color, var(--acc2, #6a74d3));
        font-weight: 600;
        border-bottom: 2px solid var(--divider-color, var(--line, #2a2f38));
        text-transform: uppercase;
        font-size: 11px;
      }
      .buli-table td {
        padding: 9px 10px;
        border-bottom: 1px solid var(--divider-color, var(--line, #2a2f38));
        vertical-align: middle;
      }
      .buli-table tr:last-child td { border-bottom: none; }
      .text-center { text-align: center; }
      .font-bold { font-weight: bold; }
      .team-logo { width: 18px; height: 18px; object-fit: contain; vertical-align: middle; margin-right: 8px; }
      .rank-border { width: 4px; padding: 0 !important; }
      .highlight-freiburg {
        background-color: var(--state-active-color, rgba(124, 108, 240, 0.15)) !important;
      }
      .diff-pos { color: var(--success-color, var(--ok, #34d399)); }
      .diff-neg { color: var(--error-color, var(--warn, #f59e0b)); }
    `;
    
    card.appendChild(style);
    this.content = document.createElement('div');
    card.appendChild(this.content);
    this.appendChild(card);
  }

  set hass(hass) {
    this._hass = hass;
    this.setupDOM();
    const entityId = this.config?.entity;
    if (entityId && hass.states[entityId]) {
      const currentLastUpdated = hass.states[entityId].last_updated;
      if (this._lastUpdated === currentLastUpdated) return;
      this._lastUpdated = currentLastUpdated;
    }
    this.render();
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Bitte eine Entität (z.B. sensor.bund_scoreboard2) definieren.");
    this.config = config;
  }

  render() {
    const entityId = this.config?.entity;
    if (!entityId) return;

    // 4. Daten-Bridge: Holt State nativ von HA (Lovelace) ODER über die globale window.S() Funktion des Hubs
    const state = (this._hass && this._hass.states[entityId]) || (typeof window.S === 'function' ? window.S(entityId) : null);

    if (!state || !state.attributes || !state.attributes.entries) {
      this.content.innerHTML = `<div style="padding: 16px; color: var(--error-color, var(--warn, #FF7F84));">Sensor-Daten werden geladen oder Entität (${entityId}) fehlt...</div>`;
      return;
    }

    const entries = state.attributes.entries;
    const cleanName = (name) => {
      const replacements = {
        "Bayern Munich": "FC Bayern", "Borussia Dortmund": "BVB", "Bayer Leverkusen": "Leverkusen",
        "Hamburg SV": "HSV", "FC Cologne": "Köln", "Werder Bremen": "Bremen", "VfL Wolfsburg": "Wolfsburg",
        "1. FC Heidenheim 1846": "Heidenheim", "Borussia Moenchengladbach": "Gladbach",
        "Borussia Mönchengladbach": "Gladbach", "Eintracht Frankfurt": "Frankfurt",
        "TSG Hoffenheim": "Hoffenheim", "VfB Stuttgart": "Stuttgart", "RB Leipzig": "RB Leipzig",
        "FC Augsburg": "Augsburg", "1. FC Union Berlin": "Union Berlin", "St. Pauli": "St. Pauli"
      };
      return replacements[name] || name;
    };

    let tableHtml = `
      <table class="buli-table">
        <thead>
          <tr>
            <th class="rank-border"></th>
            <th class="text-center" style="width: 25px;">Pl.</th>
            <th>Verein</th>
            <th class="text-center">Sp.</th>
            <th class="text-center">S</th>
            <th class="text-center">U</th>
            <th class="text-center">N</th>
            <th class="text-center">Tore</th>
            <th class="text-center">Diff.</th>
            <th class="text-center" style="padding-right: 12px;">Pkt.</th>
          </tr>
        </thead>
        <tbody>
    `;

    entries.forEach((entry) => {
      const team = entry.team;
      const stats = entry.stats;
      const getStat = (name) => { const s = stats.find(s => s.name === name); return s ? s.value : 0; };
      const getStatDisplay = (name) => { const s = stats.find(s => s.name === name); return s ? s.displayValue : '0'; };

      const rank = getStat('rank'), gp = getStat('gamesPlayed'), w = getStat('wins'), d = getStat('ties'), l = getStat('losses');
      const gf = getStat('pointsFor'), ga = getStat('pointsAgainst'), gd = getStat('pointDifferential');
      const pts = getStat('points');
      const noteColor = entry.note?.color || 'transparent';
      const logoUrl = team.logos && team.logos[0] ? team.logos[0].href : '';
      
      const isFreiburg = team.name === "SC Freiburg" || team.location === "SC Freiburg";
      const rowClass = isFreiburg ? 'highlight-freiburg' : '';
      const diffClass = gd > 0 ? 'diff-pos' : (gd < 0 ? 'diff-neg' : '');

      tableHtml += `
        <tr class="${rowClass}">
          <td class="rank-border" style="background-color: ${noteColor};"></td>
          <td class="text-center font-bold">${rank}</td>
          <td><img class="team-logo" src="${logoUrl}" alt="" loading="lazy"><span>${cleanName(team.displayName)}</span></td>
          <td class="text-center">${gp}</td>
          <td class="text-center">${w}</td>
          <td class="text-center">${d}</td>
          <td class="text-center">${l}</td>
          <td class="text-center" style="opacity: 0.65;">${gf}:${ga}</td>
          <td class="text-center ${diffClass}">${getStatDisplay('pointDifferential')}</td>
          <td class="text-center font-bold" style="color: var(--secondary-text-color, var(--acc2, #6a74d3)); padding-right: 12px;">${pts}</td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    this.content.innerHTML = tableHtml;
  }

  getCardSize() { return 19; }
}

customElements.define('buli-table-card', BundesligaTableCard);