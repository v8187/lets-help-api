require('dotenv').config();

const firebaseAdmin = require('firebase-admin');

// console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

// const refreshToken; // Get refresh token from OAuth2 flow

const firebaseApp = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  // credential: admin.credential.refreshToken(refreshToken),
  databaseURL: 'https://letshelpasrpush.firebaseio.com'
});

// Retrieve services via the firebaseApp variable...
const firebaseAuth = firebaseApp.auth();
const firebaseDatabase = firebaseApp.database();

var ref = firebaseDatabase.ref("restricted_access/secret_document");
ref.once("value", function (snapshot) {
  console.log(snapshot);
});