const { UserModel } = require('./models/user.model');
const { NotificationModel } = require('./models/notification.model');

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

export const sendNotification = (notification, roles) => {
    UserModel.getDeviceTokens(roles).then(resDeviceTokens => {
        const adminTokens = [];
        resDeviceTokens = resDeviceTokens.map(tokenInfo => {
            adminTokens.push(tokenInfo.deviceToken);
            return tokenInfo.toObject();

        });
        console.log('adminDeviceTokens', adminTokens, resDeviceTokens);
        // Send a message to the device corresponding to the provided
        // registration token.
        adminTokens.length && firebaseAdmin.messaging().sendMulticast({
            // data: {
            //   score: '850',
            //   time: '2:45'
            // },
            // notification: {
            //   title: '$GOOG up 1.43% on the day',
            //   body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.'
            // },
            ...notification,
            tokens: adminTokens
        })
            .then((response) => {
                /**
                 * Response is in following:
                 * {responses:[{
                 *    "success":true,
                 *    "messageId":"projects/letshelpasrpush/messages/0:1600604984255797%d96055fad96055fa"
                 * }],
                 * "successCount":1,"failureCount":0}
                 */
                if (response && response.responses) {
                    response.responses.map((res, i) => {
                        if (res.success) {
                            const newNoti = new NotificationModel();
                            const tokenInfo = resDeviceTokens[i];

                            NotificationModel.saveNotification({
                                ...newNoti,
                                userId: tokenInfo.userId,
                                data: notification.data,
                                ...notification.notification,
                            });
                        }
                    });
                }
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    }, error => {
        console.log('adminDeviceTokens::error', error);
    }).catch(dbReason => console.log('Something went wrong fetching Device Tokens for Admins'))
};

// sendNotification('', ['admin']);