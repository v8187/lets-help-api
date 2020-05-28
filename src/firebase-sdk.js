const { UserModel } = require('./models/user.model');

// require('dotenv').config();

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

var ref = firebaseDatabase.ref('restricted_access/secret_document');
ref.once('value', function (snapshot) {
  // console.log(snapshot);
});

export const sendNotificationToAdmins = (notification) => {
  UserModel.getAdminDeviceTokens().then(adminDeviceTokens => {
    const adminTokens = [];
    adminDeviceTokens.map(list => list.deviceToken && adminTokens.push(list.deviceToken));
    console.log('adminDeviceTokens', adminTokens);
    // Send a message to the device corresponding to the provided
    // registration token.
    adminTokens.length && firebaseAdmin.messaging().sendMulticast({
      // data: {
      //   score: '850',
      //   time: '2:45'
      // },
      notification: {
        title: '$GOOG up 1.43% on the day',
        body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.'
      },
      tokens: adminTokens
    })
      .then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  }, error => {
    console.log('adminDeviceTokens::error', error);
  }).catch(dbReason => console.log('Something went wrong fetching Device Tokens for Admins'))
};

sendNotificationToAdmins();