const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const http = require('http');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Chrome', 'Linux', ''],
        connectTimeoutMs: 60000,
        qrTimeout: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000, // hält Verbindung aktiv
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!text) return;

        const lowerText = text.toLowerCase();

        if (lowerText === 'hallo') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Moin! Bot läuft 🚀' });
        }

        if (lowerText === 'ping') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'pong' });
        }

        if (lowerText === 'hilfe') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Befehle: hallo, ping, hilfe' });
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('=== QR-Code zum Scannen ===');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode!== DisconnectReason.loggedOut;
            console.log('Verbindung getrennt:', lastDisconnect.error?.message);
            if (shouldReconnect) {
                console.log('Versuche Reconnect...');
                startBot();
            }
        }

        if (connection === 'open') {
            console.log('✅ Bot erfolgreich verbunden!');
        }
    });
}

// hält Render wach
http.createServer((req, res) => res.end('Bot läuft')).listen(process.env.PORT || 3000);

startBot();
