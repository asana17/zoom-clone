const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(uid, {
  host: '/',
  port: '3001'
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers ={}//save userId of others

let preview = document.getElementById("preview");
let recording = document.getElementById("recording");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let downloadButton = document.getElementById("downloadButton");
let logElement = document.getElementById("log");

let recordingTimeMS = 5000;
function log(msg) {
  logElement.innerHTML += msg + "\n";
}
function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}
function startRecording(stream, lengthInMS) {
  let recorder = new MediaRecorder(stream);
  let data = [];

  recorder.ondataavailable = event => data.push(event.data);
  recorder.start();
  log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");

  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(
    () => recorder.state == "recording" && recorder.stop()
  );

  return Promise.all([
    stopped,
    recorded
  ])
  .then(() => data);
}
function stop(stream) {
  stream.getTracks().forEach(track => track.stop());
}
startButton.addEventListener("click", function() {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    preview.srcObject = stream;
    downloadButton.href = stream;
    preview.captureStream = preview.captureStream || preview.mozCaptureStream;
    return new Promise(resolve => preview.onplaying = resolve);
  }).then(() => startRecording(preview.captureStream(), recordingTimeMS))
  .then (recordedChunks => {
    let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
    recording.src = URL.createObjectURL(recordedBlob);
    downloadButton.href = recording.src;
    downloadButton.download = "RecordedVideo.webm";

    log("Successfully recorded " + recordedBlob.size + " bytes of " +
        recordedBlob.type + " media.");
  })
  .catch(log);
}, false);stopButton.addEventListener("click", function() {
  stop(preview.srcObject);
}, false);

//~~~~~~~~~~~~~~~~~~bgm part~~~~~~~~~~~~~~~~~~~~~~
const bgm1 = document.createElement('audio')
const bgm2 = document.getElementById("bgmset")
//const bgmbtn = document.getElementById("bgmplay")
const upbtn = document.getElementById("bgm_up")
const uptext = document.getElementById("bgm_sta")
var bgm_flag = false
var bgmUid = new String
upbtn.onclick = function(){

  nam_flie=document.getElementById('bgm_file').files[0].name
  // if(!!"sample.mp3"){

    socket.emit('bgmup',ROOM_ID,bgm2.src,nam_flie)
    uptext.innerText = "Background music uploaded"
    if(!bgm2.error){
      bgm_flag=true
    }
  // }
  // else {upbtn.innerHTML = "no file"}
}
// bgm2.onplay = bgmupdate()
// bgm2.onpause = bgmupdate()
bgm2.addEventListener("play",function(){
  if(bgm_flag){
    socket.emit('bgm',bgm2.currentTime,bgm2.paused,bgm2.volume);
  }})
bgm2.addEventListener("pause",function(){
  if(bgm_flag){
    socket.emit('bgm',bgm2.currentTime,bgm2.paused,bgm2.volume);
  }})
bgm2.addEventListener("timeupdate",function(){
    if(bgm_flag){
      socket.emit('bgmtime',ROOM_ID,bgm2.currentTime);
  }})
bgm2.addEventListener("volumechange",function(){
  if(bgm_flag){
    socket.emit('bgm',bgm2.currentTime,bgm2.paused,bgm2.volume);
}})
// bgmbtn.onclick = function(){
//   if(!!bgm2.src){
//   bplay(bgm2);
//   }
//   else {alert("background music not upload")}
// }

function bgmupdate(){
  if(bgm_flag){
    console.log("222")
    socket.emit('bgm',bgm2.currentTime,bgm2.paused);
  }
}

socket.on('bgmsta', (time, paused,vol) => {
  if(!bgm2.error){
  console.log(time,paused,vol);
  bgm2.currentTime=time;
  bgm2.volume=vol;
  if (paused) {bgm2.pause();}
  else { bgm2.play();}
}})
socket.on('bgmdl',audsrc => {
  bgm2.src=audsrc;
  if(!bgm2.error){
    bgm2.load()
    bgm_flag=true
  }
})
socket.on('bgmnew', (audsrc,userId) => {
  console.log("new user")
  if (userId==bgmUid) {
    bgm2.src=audsrc;
}
  console.log(userId)
  if(!bgm2.error){
    bgm_flag=true
  }
})
// ~~~~~~~~~~~~~~~~~~~~~~bgm part over~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


navigator.mediaDevices.getUserMedia({
  video:true,
  audio:true
}).then(stream => {
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

socket.on('chat-message', function(msg){
  $('#messages').append($('<li>').text(`at ${msg.hour}:${msg.minute}, from ${msg.uname} : ${msg.content}`))
  $('#messagep').append($('<li>').text(`at ${msg.hour}:${msg.minute}, from ${msg.uname} : ${msg.content}`))
})

socket.on('socket-data-provided', socketDataList => {
  let socketDataString = JSON.stringify(socketDataList)
  let socketData = JSON.parse(socketDataString)
  let html = getHtmlFromSocketDataObject(socketData)
  $('#member-in-room').html(html)
})

function getHtmlFromSocketDataObject(socketData) {
  var html;
  html = `<form action="" id="private-message">
            <div style="display:inline-flex">Username<br>
              <select id="dst-socketId" name="socketId">`
  Object.keys(socketData).forEach(function (key) {
    html += '<option value="' + key + '">' + socketData[key] + '</option>'
  })
  html += `</select></div>
          <footer class="row">
          <input id="pm" autocomplete="off" class="input-field col s12 m10"/>
          <button id="cm" class="btn col s12 m2 teal darken-2 waves-effect waves-light">Priv</button>
          </footer>
        </form>`
  html += `<script>
      $('#private-message').submit(function(e){
        e.preventDefault();
        var message = {
          content : $('#pm').val(),
          uid: uid,
          roomId: ROOM_ID,
          dstSocketId: $('#dst-socketId').val()
        };
        socket.emit('private-message', message);
        $('#pm').val('');
        return false;
      });
    </script>`
  return html
}

socket.on('private-message', function(msg){
  $('#messages').append($('<li>').text(`private message at ${msg.hour}:${msg.minute}, from ${msg.uname} : ${msg.content}`))
  $('#messagep').append($('<li>').text(`private message at ${msg.hour}:${msg.minute}, from ${msg.uname} : ${msg.content}`))
})


myPeer.on('open', id => {

  if (ROOM_ID !== null) {
    socket.emit('join-room', ROOM_ID, uid, id)
    aElement = document.getElementById("room-id")
    aElement.text = ROOM_ID
  }
   //bgm part
   bgmUid=id;
   document.getElementById('textrid').value=ROOM_ID;
   document.getElementById('texthos').value=document.location.protocol+'//'+document.location.host;
   bgm2.src=document.location.protocol+'//'+document.location.host+'/bgm/'+ ROOM_ID;

})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  //send my video to the other user
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    //stream is from the other user
    addVideoStream(video, userVideoStream)
    //showName(e)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

function showName(e){
    var firstName= document.getElementById("firstname").value;
    var lastName = document.getElementById("lastname").value;
    document.getElementById("show").innerText = firstName+" "+lastName;
}

