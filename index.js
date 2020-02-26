const bodyParser = require('body-parser');
const express = require('express');
const mongodb = require('mongodb');
const path = require('path');
const PORT = process.env.PORT || 5000;
var ObjectID = mongodb.ObjectID;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

let dbLetsHelpAPI;

mongodb.MongoClient.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/test',
    () => {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        // Save database object from the callback for reuse.
        db = client.db();
        console.log("Database connection ready");

        // Initialize the app.
        var server = app.listen(process.env.PORT || 8080, function () {
            var port = server.address().port;
            console.log("App now running on port", port);
        });
    }
)


app.get('/', (req, res) => res.send('Hello'));
app.listen(PORT, () => console.log(`Listening on ${PORT}`));