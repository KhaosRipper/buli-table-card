class BuliTableCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          ha-card {
            background: transparent;
            border: none;
            box-shadow: none;
            font-size: 11px;
            font-family: var(--paper-font-body1_-_font-family, sans-serif);
            color: var(--primary-text-color);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            color: var(--secondary-text-color);
            font-weight: 600;
            padding: 8px 3px;
            border-bottom: 2px solid rgba(234, 235, 238, 0.1);
            text-align: left;
            font-size: 11px;
            letter-spacing: 0.3px;
          }
          td {
            padding: 7px 3px;
            border-bottom: 1px solid rgba(234, 235, 238, 0.04);
            vertical-align: middle;
          }
          tr:hover {
            background: rgba(234, 235, 238, 0.02);
          }
          img {
            width: 18px;
            height: 18px;
            object-fit: contain;
            vertical-align: middle;
            display: inline-block;
          }
          .center {
            text-align: center;
          }
          .bold {
            font-weight: 700;
          }
          .favorite-team {
            background: rgba(106, 116, 211, 0.15) !important;
            font-weight: 600;
          }
          .favorite-team td:first-child {
            border-left: 3px solid #6a74d3;
            padding-left: 1px;
          }
          .diff-pos {
            color: #4caf50;
          }
          .diff-neg {
            color: #f44336;
          }
        </style>
        <ha-card>
          <div id="container"></div>
        </ha-card>
      `;
      this.content = this.shadowRoot.getElementById('container');
    }

    const state = hass.states[this.config.entity];
    if (!state || !state.attributes.entries) {
      this.content.innerHTML = "<div style='padding: 10px;'>Warte auf Sensordaten...</div>";
      return;
    }

    const entries = state.attributes.entries;
    
    // 1. Automatische Erkennung der Lieblingsvereine aus der Teamtracker-Integration
    const favoriteTeams = [];
    Object.keys(hass.states).forEach(id => {
      if (id.startsWith('sensor.')) {
        const s = hass.states[id];
        // Teamtracker-Sensoren besitzen eindeutige Attribute wie 'team_name' oder 'opponent_id'
        if (s.attributes && (s.attributes.team_name || s.attributes.opponent_id)) {
          if (s.attributes.team_name) favoriteTeams.push(s.attributes.team_name.toLowerCase());
          if (s.attributes.team_abbr) favoriteTeams.push(s.attributes.team_abbr.toLowerCase());
          
          // Fallback über den Entitätsnamen (z.B. sensor.sc_freiburg -> freiburg)
          const cleanId = id.replace('sensor.', '').toLowerCase();
          favoriteTeams.push(cleanId);
          favoriteTeams.push(cleanId.replace(/_/g, ' '));
        }
      }
    });

    // Hilfsfunktion um Stats sicher via ESPN-Abkürzung auszulesen
    const getStat = (stats, abbr) => {
      const stat = stats.find(s => s.abbreviation && s.abbreviation.toUpperCase() === abbr.toUpperCase());
      return stat ? stat.displayValue : '0';
    };

    let html = `
      <table>
        <thead>
          <tr>
            <th style="width: 22px;">Pl.</th>
            <th style="width: 22px;" class="center"></th>
            <th>Verein</th>
            <th class="center" style="width: 24px;">Sp.</th>
            <th class="center" style="width: 20px;">S</th>
            <th class="center" style="width: 20px;">U</th>
            <th class="center" style="width: 20px;">N</th>
            <th class="center" style="width: 40px;">Tore</th>
            <th class="center" style="width: 32px;">Diff.</th>
            <th class="center" style="width: 26px;">Pkt.</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    entries.forEach((x) => {
      let name = x.team.displayName;
      if (x.team.name === "Bayern Munich") name = "FC Bayern";
      else if (x.team.name === "Borussia Dortmund") name = "BVB";
      else if (x.team.name === "Eintracht Frankfurt") name = "Frankfurt";
      else if (x.team.name === "Bayer Leverkusen") name = "Leverkusen";
      else if (x.team.name === "Borussia Moenchengladbach") name = "Gladbach";

      // 2. Abgleich: Gehört dieses Team zu den Teamtracker-Favoriten?
      const rowName = x.team.name.toLowerCase();
      const rowDisplay = x.team.displayName.toLowerCase();
      const rowMapped = name.toLowerCase();
      
      const isFavorite = favoriteTeams.some(fav => 
        fav.length > 2 && (
          rowName.includes(fav) || 
          rowDisplay.includes(fav) || 
          rowMapped.includes(fav) ||
          fav.includes(rowName) ||
          fav.includes(rowDisplay)
        )
      );

      const logo = (x.team.logos && x.team.logos[0]) ? `<img src="${x.team.logos[0].href}">` : '⚽';

      const rank = getStat(x.stats, 'R');
      const gp = getStat(x.stats, 'GP');
      const w = getStat(x.stats, 'W');
      const d = getStat(x.stats, 'D');
      const l = getStat(x.stats, 'L');
      const f = getStat(x.stats, 'F');
      const a = getStat(x.stats, 'A');
      const gd = getStat(x.stats, 'GD');
      const pts = getStat(x.stats, 'P');

      let gdClass = '';
      if (gd.startsWith('+')) gdClass = 'class="diff-pos"';
      else if (gd.startsWith('-')) gdClass = 'class="diff-neg"';

      html += `
        <tr class="${isFavorite ? 'favorite-team' : ''}">
          <td>${rank}</td>
          <td class="center">${logo}</td>
          <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${name}</td>
          <td class="center">${gp}</td>
          <td class="center">${w}</td>
          <td class="center">${d}</td>
          <td class="center">${l}</td>
          <td class="center">${f}:${a}</td>
          <td class="center" ${gdClass}>${gd}</td>
          <td class="center bold">${pts}</td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    if (this.content.innerHTML !== html) {
      this.content.innerHTML = html;
    }
  }

  setConfig(config) {
    if (!config.entity) throw new Error('Bitte eine Entität angeben');
    this.config = config;
  }

  getCardSize() { return 6; }
}
customElements.define('buli-table-card', BuliTableCard);
