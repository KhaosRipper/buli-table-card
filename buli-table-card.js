class BundesligaTableCard extends HTMLElement {
  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      const card = document.createElement('ha-card');
      const style = document.createElement('style');
      style.textContent = `
        .buli-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--paper-font-body1_-_font-family, sans-serif);
          font-size: 13px;
          color: #eaebee;
          background-color: #1a1e24;
          border-radius: 12px;
          overflow: hidden;
        }
        .buli-table th {
          padding: 10px 8px;
          text-align: left;
          color: #6a74d3;
          font-weight: 700;
          border-bottom: 2px solid #2a2f38;
          text-transform: uppercase;
          font-size: 11px;
        }
        .buli-table td {
          padding: 8px;
          border-bottom: 1px solid #2a2f38;
          vertical-align: middle;
        }
        .buli-table tr:last-child td {
          border-bottom: none;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .team-logo {
          width: 18px;
          height: 18px;
          object-fit: contain;
          vertical-align: middle;
          margin-right: 8px;
        }
        .rank-border {
          width: 4px;
          padding: 0 !important;
        }
        /* Highlight für den SC Freiburg */
        .highlight-freiburg {
          background-color: rgba(106, 116, 211, 0.15) !important;
          font-weight: 600;
        }
        .highlight-freiburg td {
          border-color: rgba(106, 116, 211, 0.4) !important;
        }
        .diff-pos { color: #81D6AC; }
        .diff-neg { color: #FF7F84; }
      `;
      card.appendChild(style);
      this.content = document.createElement('div');
      card.appendChild(this.content);
      this.appendChild(card);
    }
    this.render();
  }

  setConfig(config) {
    this.config = config;
  }

  render() {
    const entityId = this.config.entity;
    const state = this._hass.states[entityId];

    if (!state || !state.attributes.entries) {
      this.content.innerHTML = `<div style="padding: 16px; color: #FF7F84;">Sensor-Daten werden geladen oder Entity nicht gefunden...</div>`;
      return;
    }

    const entries = state.attributes.entries;
    
    // Namen-Bereinigung für deutsche Optik
    const cleanName = (name) => {
      const replacements = {
        "Bayern Munich": "FC Bayern",
        "Borussia Dortmund": "BVB",
        "Bayer Leverkusen": "Leverkusen",
        "Hamburg SV": "HSV",
        "FC Cologne": "Köln",
        "Werder Bremen": "Bremen",
        "VfL Wolfsburg": "Wolfsburg",
        "1. FC Heidenheim 1846": "Heidenheim",
        "Borussia Moenchengladbach": "Gladbach",
        "Borussia Mönchengladbach": "Gladbach",
        "Eintracht Frankfurt": "Frankfurt",
        "TSG Hoffenheim": "Hoffenheim",
        "VfB Stuttgart": "Stuttgart",
        "RB Leipzig": "RB Leipzig",
        "FC Augsburg": "Augsburg",
        "1. FC Union Berlin": "Union Berlin",
        "St. Pauli": "St. Pauli"
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

      // Helferfunktion um Stats sicher nach Namen zu fischen
      const getStat = (name) => {
        const stat = stats.find(s => s.name === name);
        return stat ? stat.value : 0;
      };

      const getStatDisplay = (name) => {
        const stat = stats.find(s => s.name === name);
        return stat ? stat.displayValue : '0';
      };

      const rank = getStat('rank');
      const gp = getStat('gamesPlayed');
      const w = getStat('wins');
      const d = getStat('ties');
      const l = getStat('losses');
      const gf = getStat('pointsFor');
      const ga = getStat('pointsAgainst');
      const gd = getStat('pointDifferential');
      const gdDisplay = getStatDisplay('pointDifferential');
      const pts = getStat('points');

      // ABSICHERUNG: Wenn "note" fehlt, nimm transparenten Hintergrund
      const noteColor = entry.note?.color || 'transparent';
      const logoUrl = team.logos && team.logos[0] ? team.logos[0].href : '';
      
      // Prüfen ob es Freiburg ist für das Highlight
      const isFreiburg = team.name === "SC Freiburg" || team.location === "SC Freiburg";
      const rowClass = isFreiburg ? 'highlight-freiburg' : '';
      
      // Tordifferenz-Farbe
      const diffClass = gd > 0 ? 'diff-pos' : (gd < 0 ? 'diff-neg' : '');

      tableHtml += `
        <tr class="${rowClass}">
          <td class="rank-border" style="background-color: ${noteColor};"></td>
          <td class="text-center font-bold">${rank}</td>
          <td>
            <img class="team-logo" src="${logoUrl}" alt="" loading="lazy">
            <span>${cleanName(team.displayName)}</span>
          </td>
          <td class="text-center">${gp}</td>
          <td class="text-center">${w}</td>
          <td class="text-center">${d}</td>
          <td class="text-center">${l}</td>
          <td class="text-center" style="color: #eaebee; opacity: 0.7;">${gf}:${ga}</td>
          <td class="text-center ${diffClass}">${gdDisplay}</td>
          <td class="text-center font-bold" style="color: #6a74d3; padding-right: 12px;">${pts}</td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    this.content.innerHTML = tableHtml;
  }

  getCardSize() {
    return 19;
  }
}

customElements.define('buli-table-card', BundesligaTableCard);
