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

var uid, displayName;

checkLogin = function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      uid = user.uid;
      var phoneNumber = user.phoneNumber;
      var providerData = user.providerData;
      user.getIdToken().then(function(accessToken) {
        document.getElementById('sign-in-status').textContent = 'Signed in';
//        document.getElementById('sign-in').textContent = 'Sign out';
        //document.getElementById('account-details').textContent = JSON.stringify({
        document.getElementById('account-details').textContent =`
          displayName: ${displayName}
          email: ${email}
          uid: ${uid}`
        //}, null, '  ');
      });
    } else {
      // User is signed out.
    }
  }, function(error) {
    console.log(error);
  });
};

window.addEventListener('load', function() {
  checkLogin()
});

function Signout() {
  firebase.auth().signOut()
}

function gotoUserRoom() {
  url = "/room"
  location.href = url + "?uid=" + uid + "&username=" + displayName;
}

function gotoUserJoin() {
  url = "/Join"
  location.href = url + "?uid=" + uid + "&username=" + displayName;
}

function gotoUserSchedule() {
  url = "/schedule"
  location.href = url + "?uid=" + uid + "&username=" + displayName;
}

function gotoUserJoin() {
  url = "/join"
  location.href = url + "?uid=" + uid + "&username=" + displayName;
}

/*function gotoUserChat() {
  url = "/Chat"
  location.href = url + "?uid=" + uid;
}*/

