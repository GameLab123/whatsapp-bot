const http = require('http');
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.end('Bot läuft');
}).listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
    console.log(`\n\nDEIN PAIRING CODE: TEST1234\n`);
});

