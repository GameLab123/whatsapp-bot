const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const http = require('http');

// Dummy Server damit Railway nicht killt
http.createServer((req, res) => res.end('WhatsApp Bot läuft')).listen(process.env.PORT || 3000);

const PHONE_NUMBER = "4917XXXXXXX"; // Deine Nummer mit 49 ohne +

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        browser: ['Chrome', 'Linux', ''],
        printQRInTerminal: false
    });

    if (!sock.authState.creds.registered) {
        console.log("Hole Pairing Code...");
        const code = await sock.requestPairingCode(PHONE_NUMBER);
        console.log(`\n\nDEIN PAIRING CODE: ${code}\n\n`);
    }

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        console.log('Connection Update:', update.connection);
    });
}

startBot();
