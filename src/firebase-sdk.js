const { UserModel } = require('./models/user.model');
const { NotificationModel } = require('./models/notification.model');

const firebaseAdmin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

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
        const deviceTokens = [];
        resDeviceTokens = resDeviceTokens.map(tokenInfo => {
            deviceTokens.push(tokenInfo.deviceToken);
            return tokenInfo.toObject();

        });
        console.log('deviceTokens', deviceTokens, resDeviceTokens);
        // Send a message to the device corresponding to the provided
        // registration token.
        deviceTokens.length && firebaseAdmin.messaging().sendMulticast({
            // data: {
            //   score: '850',
            //   time: '2:45'
            // },
            // notification: {
            //   title: '$GOOG up 1.43% on the day',
            //   body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.'
            // },
            ...notification,
            tokens: deviceTokens
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

                            newNoti.userId = tokenInfo.userId;
                            newNoti.data = notification.data;
                            newNoti.title = notification.notification.title;
                            newNoti.body = notification.notification.body;

                            NotificationModel.saveNotification(newNoti);
                        }
                    });
                }
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });
    }, error => {
        console.log('deviceTokens::error', error);
    }).catch(dbReason => console.log('Something went wrong fetching Device Tokens for Admins'))
};

// sendNotification('', ['admin']);