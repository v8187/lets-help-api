const bodyParser = require('body-parser');
const express = require('express');
const mongodb = require('mongodb');
const path = require('path');
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


app.get('/', (req, res) => res.send('Hello'));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));