const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const http = require('http');

const PHONE_NUMBER = "4917618720127"; // HIER DEINE NUMMER MIT 49 OHNE +

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        browser: ['Chrome', 'Linux', ''],
    });

    if (!sock.authState.creds.registered) {
        console.log("Noch nicht verbunden. Fordere Pairing Code an...");
        const code = await sock.requestPairingCode(PHONE_NUMBER);
        console.log(`\n\nDEIN PAIRING CODE: ${code}\n\n`);
        console.log("Geh in WhatsApp → 3 Punkte → Verknüpfte Geräte → Gerät hinzufügen → Mit Telefonnummer verknüpfen");
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Verbindung getrennt:', lastDisconnect.error?.message);
            if (shouldReconnect) {
                startBot();
            }
        }

        if (connection === 'open') {
            console.log('✅ Bot erfolgreich verbunden!');
        }
    });
}

http.createServer((req, res) => res.end('Bot läuft')).listen(process.env.PORT || 3000);
startBot();
