const http = require('http');
const express = require('express');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
    //res.send('Hello There!');
    res.send(index.html);
   });


app.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
   });