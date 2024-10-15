const express = require('express');
const bodyParser = require('body-parser');

const hostname = '127.0.0.1';
const port = 3000;

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json()); // Middleware to parse JSON body

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // Serve the HTML file
});

app.post('/submit', (req, res) => {
    const userPrompt = req.body.prompt; // Get the prompt from the request body
    let myMsg = userPrompt;
    console.log(myMsg);

    // Respond with a JSON object
    res.json({ response: myMsg });
});

app.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
});
