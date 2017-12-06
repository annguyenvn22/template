const express = require('express');
const app = express();

app.use(express.static('./build'));

app.get('/*', (req, res) => {
   res.sendFile(__dirname + '/build/index.html');
});

app.listen(3001, _ => {
   console.log('Docs is served at http://localhost:3001');
});
