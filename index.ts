const { Server } = require('http');

require('dotenv').config();

import { initApp } from './src/app';

// require = require('esm')(module);
// module.exports = require('./src/app.js')
// const { initApp } = require('./src/app.js');
const { PORT } = process.env;
const app = initApp();

// let dbLetsHelpAPI;
// mongodb.MongoClient.connect(
//     process.env.MONGODB_URI || 'mongodb://localhost:27017/test',
//     (err, client) => {
//         if (err) {
//             console.log(err);
//             process.exit(1);
//         }

//         // Save database object from the callback for reuse.
//         dbLetsHelpAPI = client.db();
//         console.log('Database connection ready');

//         // Start the HTTP Server
//         const server = new Server(app);
//         server.listen(PORT, () => {
//             console.log(green(`Server is up and running on Port ${magenta.bold(`${PORT}`)}`));
//         });
//     }
// );

// Start the HTTP Server
const server = new Server(app);
server.listen(PORT, () => {
    console.log(`Server is up and running on Port ${PORT}`);
});