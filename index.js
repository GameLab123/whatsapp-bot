const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        browser: ['Chrome', 'Linux', ''],
        connectTimeoutMs: 60000,
        qrTimeout: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
    });

    // Wenn nicht eingeloggt, Pairing Code anfordern
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('Gib deine Nummer mit Ländercode ein, z.B. 49123456789: ');
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\nDein Pairing Code: ${code}\n`);
        console.log('Geh in WhatsApp → Verknüpfte Geräte → Gerät hinzufügen → Mit Telefonnummer verknüpfen');
        rl.close();
    }

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
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode!== DisconnectReason.loggedOut;
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
