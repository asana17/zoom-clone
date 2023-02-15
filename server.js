const express = require('express')
//require func is used in nodejs server instead of import
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const cookieParser = require('cookie-parser')
const json2csv = require('json2csv')
var session = require('express-session')
const { v4: uuidV4 } = require('uuid')
const bodyParser = require("body-parser")

const path=require('path')
const bgtime ={}//save bgm info
const bgpaused ={}
const upuser={}
const bgsrc={}
const bgvol={}
var fs=require("fs")
var multer = require('multer');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs')
//use .ejs file inside views dir for template
app.use(express.static('public'))
//use public folder
app.use(cookieParser())
app.use(session({
  secret: 'gaojeioa',
  resave: false,
  saveUninitialized : false,
  cookie: {
    maxAge: 5 * 60 * 60 * 1000
  }
}))

var fbinit = require('./firebase/firebase-init')
var firebase = require('firebase')
var admin = require('firebase-admin')
const FieldValue = admin.firestore.FieldValue;
//use your own key!
var serviceAccount = require("./serviceAccountKey.json")
fbinit.firebaseInit(firebase, admin, serviceAccount);

const db = admin.firestore()


app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/sessionLogin', (req, res) => {
  let state = req.body.state
  req.session.state = {state: state}
  res.redirect('/home');
})

app.post('/sessionLogout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
})

app.use('/', function (req, res, next) {
  if (req.session.state) {
    next();
  } else {
    res.redirect('/login');
  }
})

app.get('/', (req, res) => {
  //req is a http request to the first arg of app.get
  res.redirect('/home')
})

app.get('/home', (req, res) => {
  res.render('home')
})

app.get('/Demo', (req, res) => {
  res.render('demo')
})


var { getComingMtg } = require('./controllers/join')

app.get('/join', (req, res) => {
  let uid = req.query.uid
  let userName = req.query.username
  // getComingMtg(db, uid).then((comingMtg => {
  //   console.log(comingMtg)
  //   console.log("in app: %d", comingMtg.length)
  //   res.render('join', {mtg: comingMtg})
  // }))
  res.render('join', {uid: uid, username: userName})
})

//bgm upload
app.use(multer({ dest: '/tmp/'}).array('file'));

//schedule
var sched = require('./controllers/schedule')
var util = require('./util/util')
const { getMtgInfo, getUserInfo } = require('./controllers/room')



app.get('/schedule', (req, res) => {
  let uid = req.query.uid
  let username = req.query.username
  console.log(uid, username)
  sched.showAlldayScheduleWithPopup(res, db, uid, username)
})

app.post('/scheduleupdate', async (req, res) => {
  var name = req.body.name
  var description = req.body.description
  var participants = req.body.participants.split(/,\s*/)
  participants.push(req.query.uid)
  var ref = await db.collection('mtg').add({
    name: name,
    description: req.body.description,
    participants: participants,
    start: new Date(req.body.start),
    end: new Date(req.body.end),
    host: req.query.uid
  })
  for (var i = 0; i < participants.length; i++) {
    await db.collection('user_schedule').doc(participants[i]).collection('mtg').doc(ref.id).set({
      is_attend: 1
    })
  }

  var messageHtml = `<h2>Schedule added!</h2>`
  if (name == undefined || name == "" ) {
    messageHtml = `<h2>Schedule update failed!</h2><br>
      <h4>you should specify mtg name!</h4>`
  // } else if (description == undefined && dow == undefined) {
  //   //console.log("delete")
  //   sched.deleteMtgSchedule(db, uid, mtgname)
  //   messageHtml = `<h1>schedule deleted!</h1>`
  // } else if (mi == undefined) {
  //   messageHtml = `<h1>schedule update failed!</h1><br>
  //   <h3>you should specify mtg ID!</h3>`
  } else {
    // sched.setMtgSchedule(db, uid, mtgname, dow, sh, sm, eh, em, mi, desc)
    messageHtml += `<br><h4>Meeting Name: ${name} (${description}, Meeting ID: ${ref.id})</h4>`
  }
  res.render('scheduleUpdate', {messageHtml: messageHtml, uid: req.query.uid, username: req.query.username})

})

app.get('/room', (req, res) => {
  let url = `/${uuidV4()}` + "?uid=" + req.query.uid + "&username=" + req.query.username
  console.log("move to room:", url)
  res.redirect(url)
})

var attendState = {}

app.get('/:room', async (req, res) => {
  uid = req.query.uid
  userName = req.query.username
  console.log("username ", userName)
  roomId = req.params.room

  getMtgInfo(db, roomId).then((mtgInfo) => {
    if (mtgInfo === undefined) {
      console.log('instant room start')
      if (attendState[roomId] === undefined) {
        attendState[roomId] = {}
      }
      attendState[roomId][uid] = "attendance"
      db.collection("log").add({
        uid: uid,
        mtg_id: roomId,
        action: "in",
        time_at: FieldValue.serverTimestamp()
      })
      res.render('room', {
        uid: uid, userName: userName, roomId : roomId, roomName: "Instant room",
        description: "", attendState: attendState[roomId]
      })
    } else {
      if (attendState[roomId] === undefined) {
        attendState[roomId] = {}
        participants = mtgInfo["participants"]
        for (var i = 0; i < participants.length; ++i) {
          attendState[roomId][participants[i]] = "absence"
        }
      }
      if (uid !== undefined && uid in attendState[roomId]) {
        attendState[roomId][uid] = "attendance"
      } else {
        attendState[roomId][uid] = "attendance (not reserved)"
      }
      if (roomId !== undefined) {
        if (!(undefined in attendState[roomId])) {
          // console.log(attendState[roomId])
          db.collection("log").add({
            uid: uid,
            mtg_id: roomId,
            action: "in",
            time_at: FieldValue.serverTimestamp()
          })
          res.render('room', {
            uid: uid, roomId: roomId, userName: userName, roomName: mtgInfo["name"],
            description: mtgInfo["description"], attendState: attendState[roomId]
          })
        }
      }
    }
  }).catch((e) => {
    console.log('error!')
    res.render('room', {
        uid: uid, userName: userName, roomName: "Instant room",
        description: "", attendState: {}
      })
  })
})

app.get('/:room/download', async (req, res) => {
  roomId = req.params.room
  const logList = await db.collection("log").where("mtg_id", "==", roomId).get().then(querySnapshot => {
    return querySnapshot.docs.map(doc => doc.data())
  })
  for (var i = 0; i < logList.length; i++) {
    logList[i]['time_at'] = logList[i]['time_at'].toDate()
  }
  const csv = json2csv.parse(logList, ['mtg_id', 'uid', 'time_at', 'action']);
  res.setHeader('Content-disposition', `attachment; filename=mtglog_${roomId}.csv`);
  res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
  res.send(csv);
})

var sockF = require('./socketio/socketFunc.js')

let sRef = db.collection('socketData')
let query = sRef.get()
  .then(snapshot => {
    if (!snapshot.empty) {
      snapshot.forEach(doc => {
        let rId = doc.id
        sRef.doc(rId).delete()
      })
    }
  });

io.on('connection', socket => {
  //when someone connected
  socket.on('join-room', (roomId, uid, userId) => {
    socket.join(roomId)
    sockF.incrementConnectionCount(db, roomId)
    admin.auth().getUser(uid).then((userRecord) => {
      let dname = (JSON.stringify(userRecord.displayName))
      sockF.registerSocketData(db, roomId, socket.id, uid, dname)
      socket.to(roomId).broadcast.emit('user-connected', userId)
    }).catch((e) => {
      console.log("error in join-room: can't get info of uid ", uid)
    });

    socket.on('disconnect', () => {
      console.log(userId)
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
      sockF.deleteSocketId(db, roomId, socket.id)
      sockF.decrementConnectionCount(db, roomId)
      //console.log('rooms after disconnect:',io.sockets.adapter.rooms)
    })
    //bgm part2 sync with the new attender the info of bgm if it's already been
    //played in the room. So it need to follow the connect listening
    if(!!bgsrc[roomId]){
      io.to(roomId).emit('bgmnew', bgsrc[roomId],userId)}
    if(!!bgtime[roomId]){
      io.to(roomId).emit('bgmsta',bgtime[roomId],bgpaused[roomId],bgvol[roomId])}
    //normal sync, write here to save the trans for roomid every time
    socket.on('bgm', (time, paused,vol) => {
      socket.to(roomId).broadcast.emit('bgmsta', time, paused, vol)
      bgtime[roomId]=time
      bgpaused[roomId]=paused
      bgvol[roomId]=vol
    })
  })
  //danmaku
  socket.on('danmaku send', (msg) => {
    io.emit('danmaku show', msg)
  })
  //-end

  socket.on('chat-message', (msg) => {
    admin.auth().getUser(msg.uid).then((userRecord) => {
      let uname = (JSON.stringify(userRecord.displayName))
      let now = new Date()
      let hour = now.getHours();
      let minute = now.getMinutes();
      io.to(msg.roomId).emit('chat-message', {uname : uname, content : msg.content, hour : hour, minute : minute});
    })
    .catch((error) => {
      console.log('Error fetching data in chat:', error);
    });
  })

  socket.on('bgmup',(roomId,audsrc1,filename)=>{
    if(!bgsrc[roomId])
    {bgsrc[roomId]=audsrc1+path.extname(filename);
    //console.log("src set assigned by socket")}
    io.to(roomId).emit('bgmdl', bgsrc[roomId])
  }})
  socket.on('bgmtime',(roomId,time)=>{
    bgtime[roomId]=time
  })
  // upload bgm
  app.post('/bgm_upload', function (req, res) {
    var ext=path.extname(req.files[0].originalname)
    var nam_file="/bgm/"+req.body.rid+path.extname(req.files[0].originalname);
    if(ext==".mp3" ||ext==".ogg"){
      bgsrc[req.body.rid]=req.body.hos+"/bgm/"+req.body.rid+path.extname(req.files[0].originalname)
    }
    else{alert("Only .mp3 or .ogg file is supported")}

    console.log(req.body, req.files[0]);  //the info of uploaded files

    var des_file = __dirname + "/public/bgm/" +req.body.rid +path.extname(req.files[0].originalname);
    console.log( des_file );
    //socket
    fs.readFile( req.files[0].path, function (_err, data) {  // async read file
        fs.writeFile(des_file, data, function (err) { // des_file is file name，data is async written into file
          if( err ){
              console.log( err );
              response = {
                message:'BGM uploading failed. Please try again or contact the server manager, if there is no room id below',
                roomid:req.body.rid
          };
          }else{
                // feedback to the client after successful uploading.
                response = {
                    message:'bgm uploaded successfully, Please close this tab',
                    roomid:req.body.rid
              };
          }
          console.log( response );
          res.end( JSON.stringify( response ));
          io.to(req.body.rid).emit('bgmdl', bgsrc[req.body.rid])
        });
    });
  })
  //bgm part2 over

  socket.on('member-list-requested', (reqArg) => {
    sockF.sendSocketDataList(db, reqArg.roomId, reqArg.uid, io)
  })
  socket.on('private-message', (msg) => {
    admin.auth().getUser(msg.uid).then((userRecord) => {
      let uname = (JSON.stringify(userRecord.displayName))
      let now = new Date()
      let hour = now.getHours()
      let minute = now.getMinutes()
      io.to(msg.dstSocketId).emit('private-message', {uname : uname, content : msg.content, hour : hour, minute : minute});
    })
    .catch((error) => {
      console.log('Error fetching data in chat:', error);
    });
  });
})

server.listen(3000)
