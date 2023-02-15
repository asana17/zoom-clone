//firebase init
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

/*checkLogin = function() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      document.getElementById('loader').style.display = 'none';
      var uid = user.uid;
      location.href = "/home"
    } else {
      // User is signed out.
      initFirebaseLoginUI();
    }
  }, function(error) {
    console.log(error);
  });
};

window.addEventListener('load', function() {
  checkLogin()
});*/

initFirebaseLoginUI();

function post(path, params, method='post') {
  const form = document.createElement('form')
  form.method = method
  form.action = path

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input')
      hiddenField.type = 'hidden'
      hiddenField.name = key
      hiddenField.value = params[key]

      form.appendChild(hiddenField)
    }
  }

  document.body.appendChild(form);
  form.submit();
}

function initFirebaseLoginUI() {
  //init firebase ui
  var ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth())

  /*ui.start('#firebaseui-auth-container', {
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
  })*/

  var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        post("/sessionLogin", {state:"success"})
        //return true;
      },
      uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
        document.getElementById('loader').style.display = 'none';
      },
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: '/home',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      //firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      //firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      //firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    tosUrl: '<your-tos-url>',
    // Privacy policy url.
    privacyPolicyUrl: '<your-privacy-policy-url>'
  };

  ui.start('#firebaseui-auth-container', uiConfig);
}
