# zoom-clone

## objectives
make zoom-like application with some new fuction

## how to use
1. install libraries
   - $ npm install
   - $ npm i -g peer (may need to be root)
2. Linux: $ export GOOGLE_APPLICATION_CREDENTIALS="/home/user/Downloads/service-account-file.json"
   Windows:$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\username\Downloads\service-account-file.json" (.json is downloaded from firebase website)
3. set variable "serviceAccount" in server.js to your own service-account-file.json
4. $ npm run devStart (if "prompting [nodemon] app crashed - waiting for file changes before starting" try: $ npm i babel-core babel-preset-es2015 babel-cli)
5. $ peerjs --port 3001 (in another terminal)
6. access localhost:3000 in your browser

### reference
[WebRTC tutorial](https://youtube.com/watch?v=DvlyzDZDEq4)