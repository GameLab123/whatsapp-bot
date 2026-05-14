console.log("Test-Log: Bot wird gestartet");
const http = require('http');
http.createServer((req, res) => res.end('Bot läuft')).listen(process.env.PORT || 3000);
