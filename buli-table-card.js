class BuliTableCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          ha-card { background: transparent; border: none; box-shadow: none; font-size: 12px; font-family: var(--paper-font-body1_-_font-family, sans-serif); color: var(--primary-text-color); }
          table { width: 100%; border-collapse: collapse; }
          th { color: var(--secondary-text-color); font-weight: 600; padding: 6px 2px; border-bottom: 1px solid rgba(234, 235, 238, 0.1); text-align: left; }
          td { padding: 6px 2px; border-bottom: 1px solid rgba(234, 235, 238, 0.04); vertical-align: middle; }
          img { width: 20px; height: 20px; object-fit: contain; vertical-align: middle; display: inline-block; }
          .center { text-align: center; }
          .freiburg { background: rgba(106, 116, 211, 0.15); font-weight: 600; }
          .freiburg td:first-child { border-left: 3px solid #6a74d3; padding-left: 0px; }
        </style>
        <ha-card>
          <div id="container"></div>
        </ha-card>
      `;
      this.content = this.shadowRoot.getElementById('container');
    }

    const state = hass.states[this.config.entity];
    if (!state || !state.attributes.entries) {
      this.content.innerHTML = "Warte auf Sensordaten...";
      return;
    }

    const entries = state.attributes.entries;
    let html = `<table><thead><tr><th>Pl.</th><th class="center"></th><th>Verein</th><th class="center">Sp.</th><th class="center">Tore</th><th class="center">Pkt.</th></tr></thead><tbody>`;
    
    entries.forEach((x, index) => {
      let name = x.team.displayName;
      if (x.team.name === "Bayern Munich") name = "FC Bayern";
      else if (x.team.name === "Borussia Dortmund") name = "BVB";
      else if (x.team.name === "Eintracht Frankfurt") name = "Frankfurt";
      else if (x.team.name === "Bayer Leverkusen") name = "Leverkusen";
      else if (x.team.name === "Borussia Moenchengladbach") name = "Gladbach";
      else if (x.team.name.includes("Freiburg")) name = "SC Freiburg";

      const isFreiburg = x.team.name.includes("Freiburg");
      const logo = (x.team.logos && x.team.logos[0]) ? `<img src="${x.team.logos[0].href}">` : '⚽';

      html += `
        <tr class="${isFreiburg ? 'freiburg' : ''}">
          <td>${index + 1}</td>
          <td class="center">${logo}</td>
          <td>${name}</td>
          <td class="center">${Math.round(x.stats[0].value)}</td>
          <td class="center">${Math.round(x.stats[4].value)}:${Math.round(x.stats[3].value)}</td>
          <td class="center"><strong>${Math.round(x.stats[2].value)}</strong></td>
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

  getCardSize() { return 3; }
}
customElements.define('buli-table-card', BuliTableCard);