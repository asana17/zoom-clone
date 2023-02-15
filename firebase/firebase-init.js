exports.firebaseInit = function(firebase, admin, serviceAccount) {
  var firebaseConfig = {
      apiKey: "AIzaSyAvIIVHhYR16gbEj_eZYU4smhssui5JmXU",
      authDomain: "pbl-group4.firebaseapp.com",
      databaseURL: "https://pbl-group4.firebaseio.com",
      projectId: "pbl-group4",
      storageBucket: "pbl-group4.appspot.com",
      messagingSenderId: "266447126662",
      appId: "1:266447126662:web:a88726e974f464bec45107"
  }

  firebase.initializeApp(firebaseConfig)


  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pbl-group4.firebaseio.com"
  });

}
