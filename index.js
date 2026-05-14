const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        browser: ['Chrome', 'Linux', ''],
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('Gib deine Nummer mit Ländercode ein, z.B. 49123456789: ');
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\nDein Pairing Code: ${code}\n`);
        rl.close();
    }

    sock.ev.on('creds.update', saveCreds);
}

startBot();
