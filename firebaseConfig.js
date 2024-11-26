const admin = require("firebase-admin");
const serviceAccount = require("./firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://immofind-46ef8.firebaseio.com",
});

module.exports = admin;
