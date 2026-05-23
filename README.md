# Bundesliga Table Card for Home Assistant

A custom Lovelace dashboard card to display a clean, comprehensive German Bundesliga table inspired by the full view of bundesliga.com. It is optimized to look stunning on modern, transparent Home Assistant dashboards and completely bypasses theme-specific styling conflicts.

### Preview / Vorschau
<img width="516" height="705" alt="grafik" src="https://github.com/user-attachments/assets/fcf1c19c-4792-41d5-ae47-f77f2766c617" />

---

## 🇩🇪 Deutsche Version

Diese Custom Lovelace Card bringt das vollständige Datengerüst der 1. und 2. Bundesliga auf dein Home Assistant Dashboard. Dank modernem Shadow-DOM-Rendering bleibt die Karte absolut stabil und immun gegen aggressive Theme-Styles.

### Features
* **Vollständige Tabellenansicht:** Zeigt Platzierung (Pl.), Logo, Vereinsname, gespielte Spiele (Sp.), Siege (S), Unentschieden (U), Niederlagen (N), Tore, Tordifferenz (Diff.) und Punkte (Pkt.).
* **Vollautomatische Personalisierung:** Die Karte scannt dein System nach aktiven Sensoren der beliebten `teamtracker`-Integration ab und hebt deinen Lieblingsverein automatisch mit einem eleganten, transparent-bläulichen Fokus-Hintergrund und Accent-Border hervor.
* **Schöne Vereinsnamen:** Bereinigt die rohen englischen API-Namen automatisch in gängige deutsche Bezeichnungen (z. B. *Bayern Munich* &rarr; *FC Bayern*, *Borussia Dortmund* &rarr; *BVB*, etc.).
* **Theme-sicher:** Das Kartendesign nutzt das Shadow-DOM. Vereinslogos bleiben bei knackigen 18x18px fixiert und sind absolut immun gegen aggressive globale Theme-Styles (wie `width: 100% !important`).

### Voraussetzungen (Backend)
Die Karte benötigt ein passendes Daten-Array im Backend. Am einfachsten installierst du dafür die dazugehörige UI-basierte HACS-Integration, die die Sensoren ganz ohne YAML-Code für dich erstellt:
👉 [KhaosRipper/Bundesliga-Tabellen-integration](https://github.com/KhaosRipper/Bundesliga-Tabellen-integration)

### Installation über HACS
1. Navigiere in Home Assistant zu **HACS** &rarr; **Dashboards**.
2. Klicke oben rechts auf die **drei Punkte** und wähle **Benutzerdefinierte Repositories**.
3. Füge die URL dieses Repositories ein: `https://github.com/KhaosRipper/buli-table-card`
4. Wähle als Kategorie **Dashboard** und klicke auf **Hinzufügen**.
5. Klicke auf die Karte **Bundesliga Table Card**, wähle unten rechts **Herunterladen** und lade danach das Frontend neu.

### Dashboard-Einbindung
Füge die Karte über den manuellen Code-Editor deines Dashboards (oder im Raw-Konfigurationseditor) hinzu:

```yaml
type: 'custom:buli-table-card'
entity: sensor.bund_scoreboard2 # Für die 1. Bundesliga
entity: sensor.bund_2_scoreboard # Für die 2. Bundesliga (falls aktiviert)
