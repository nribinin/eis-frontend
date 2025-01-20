# EIS Frontend

Ein Vue.js-Projekt mit TypeScript-Unterstützung, basierend auf einem früheren [VueJS-Projekt](https://github.com/rmartin69420/EIS-Frontend/).

## Voraussetzungen

- Node.js v14 oder höher
- npm
- Eine Datenbank (z. B. MariaDB in Docker mit einer erstellten Datenbank "eis")
- Backend-Anbindung unter https://github.com/nribinin/Diplomarbeit_TGM_Backend/
- (Nur wenn außerhalb des TGMs) VPN-Verbindung zum TGM (mit Barracuda VPN, Anleitung unter https://portal.tgm.ac.at/Anleitungen/VPN-Client-einrichten.pdf. Der VPN Client kann unter https://portal.tgm.ac.at im Abschnitt **Virtuelle TGM Citrix Desktops & VPN (Verbindung von extern)** gefunden werden.)

## Installation

1. **Repository klonen:**

   ```bash
   git clone https://github.com/nribinin/eis-frontend.git

2. **In das Verzeichnis wechseln**
   ```bash
   cd eis-frontend
   ```
   
3. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

## Verwendung: 
**Entwicklungsserver starten:**
  ```bash
  npm run dev
   ```

Anmeldung erfolgt mit TGM Cridentials (z.B. Username: nribinin & Passwort = <DeinPasswort>)
