"use strict";

var express = require('express'); //require func is used in nodejs server instead of import


var app = express();

var server = require('http').Server(app);

var io = require('socket.io')(server);

var cookieParser = require('cookie-parser');

var json2csv = require('json2csv');

var session = require('express-session');

var _require = require('uuid'),
    uuidV4 = _require.v4;

var bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs'); //use .ejs file inside views dir for template

app.use(express["static"]('public')); //use public folder

app.use(cookieParser());
app.use(session({
  secret: 'gaojeioa',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 5 * 60 * 60 * 1000
  }
}));

var fbinit = require('./firebase/firebase-init');

var firebase = require('firebase');

var admin = require('firebase-admin');

var FieldValue = admin.firestore.FieldValue; //use your own key!

var serviceAccount = require("./serviceAccountKey.json");

fbinit.firebaseInit(firebase, admin, serviceAccount);
var db = admin.firestore();
app.get('/login', function (req, res) {
  res.render('login');
});
app.post('/sessionLogin', function (req, res) {
  var state = req.body.state;
  req.session.state = {
    state: state
  };
  res.redirect('/home');
});
app.post('/sessionLogout', function (req, res) {
  req.session.destroy();
  res.redirect('/login');
});
app.use('/', function (req, res, next) {
  if (req.session.state) {
    next();
  } else {
    res.redirect('/login');
  }
});
app.get('/', function (req, res) {
  //req is a http request to the first arg of app.get
  //res.redirect(`/${uuidV4()}`)
  res.redirect('login');
});
app.get('/home', function (req, res) {
  res.render('home');
});
app.get('/Demo', function (req, res) {
  res.render('demo');
});

var _require2 = require('./controllers/join'),
    getComingMtg = _require2.getComingMtg;

app.get('/join', function (req, res) {
  var uid = req.query.uid;
  var userName = req.query.username; // getComingMtg(db, uid).then((comingMtg => {
  //   console.log(comingMtg)
  //   console.log("in app: %d", comingMtg.length)
  //   res.render('join', {mtg: comingMtg})
  // }))

  res.render('join', {
    uid: uid,
    username: userName
  });
}); //schedule

var sched = require('./controllers/schedule');

var util = require('./util/util');

var _require3 = require('./controllers/room'),
    getMtgInfo = _require3.getMtgInfo,
    getUserInfo = _require3.getUserInfo;

app.get('/schedule', function (req, res) {
  var uid = req.query.uid;
  var day = util.getWeekdayOfToday();
  sched.showAlldayScheduleWithPopup(res, db, uid, day);
});
app.post('/schedule/update', function _callee(req, res) {
  var name, description, participants, ref, messageHtml;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          name = req.body.name;
          description = req.body.description;
          participants = req.body.participants.split(/,\s*/);
          participants.push(req.query.uid);
          _context.next = 6;
          return regeneratorRuntime.awrap(db.collection('mtg').add({
            name: name,
            description: req.body.description,
            participants: participants,
            start: req.body.start,
            end: req.body.end,
            host: req.query.uid,
            repeat: req.body.repeat
          }));

        case 6:
          ref = _context.sent;
          console.log(ref.id);
          messageHtml = "<h1>schedule added!</h1>";

          if (name == undefined || name == "") {
            messageHtml = "<h1>schedule update failed!</h1><br>\n    <h3>you should specify mtg name!</h3>"; // } else if (description == undefined && dow == undefined) {
            //   //console.log("delete")
            //   sched.deleteMtgSchedule(db, uid, mtgname)
            //   messageHtml = `<h1>schedule deleted!</h1>`
            // } else if (mi == undefined) {
            //   messageHtml = `<h1>schedule update failed!</h1><br>
            //   <h3>you should specify mtg ID!</h3>`
          } else {
            // sched.setMtgSchedule(db, uid, mtgname, dow, sh, sm, eh, em, mi, desc)
            messageHtml += "<br><h3>$Meeting Name: ".concat(name, " (").concat(description, ", Meeting ID: ").concat(ref.id, ")</h3>");
          }

          res.render('scheduleUpdate', {
            messageHtml: messageHtml,
            uid: uid
          });
          /*let day = util.getWeekdayOfToday()
          sched.showAlldaySchedule(res, db, uid, day)*/

        case 11:
        case "end":
          return _context.stop();
      }
    }
  });
});
app.get('/room', function (req, res) {
  res.redirect("/".concat(uuidV4()));
});
var attendState = {};
app.get('/:room', function _callee2(req, res) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          uid = req.query.uid;
          userName = req.query.username;
          roomId = req.params.room;
          getMtgInfo(db, roomId).then(function (mtgInfo) {
            if (attendState[roomId] === undefined) {
              attendState[roomId] = {};
              participants = mtgInfo["participants"];

              for (var i = 0; i < participants.length; ++i) {
                attendState[roomId][participants[i]] = "absence";
              }
            }

            if (uid !== undefined && uid in attendState[roomId]) {
              attendState[roomId][uid] = "attendance";
            } else {
              attendState[roomId][uid] = "attendance (not reserved)";
            }

            if (roomId !== undefined && !(undefined in attendState[roomId])) {
              // console.log(attendState[roomId])
              db.collection("log").add({
                uid: uid,
                mtg_id: roomId,
                action: "in",
                time_at: FieldValue.serverTimestamp()
              });
              res.render('room', {
                uid: uid,
                userName: userName,
                roomName: mtgInfo["name"],
                description: mtgInfo["description"],
                attendState: attendState[roomId]
              });
            }
          })["catch"](function (e) {}); // getUserInfo(db, roomId, uid)

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
});
app.get('/:room/download', function _callee3(req, res) {
  var logList, i, csv;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          roomId = req.params.room;
          _context3.next = 3;
          return regeneratorRuntime.awrap(db.collection("log").where("mtg_id", "==", roomId).get().then(function (querySnapshot) {
            return querySnapshot.docs.map(function (doc) {
              return doc.data();
            });
          }));

        case 3:
          logList = _context3.sent;

          for (i = 0; i < logList.length; i++) {
            logList[i]['time_at'] = logList[i]['time_at'].toDate();
          }

          csv = json2csv.parse(logList, ['mtg_id', 'uid', 'time_at', 'action']);
          res.setHeader('Content-disposition', "attachment; filename=mtglog_".concat(roomId, ".csv"));
          res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
          res.send(csv);

        case 9:
        case "end":
          return _context3.stop();
      }
    }
  });
});
io.on('connection', function (socket) {
  //when someone connected
  socket.on('join-room', function (roomId, userId) {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId); //using public/script.js (defined as src in room.ejs)

    socket.on('disconnect', function () {
      console.log(userId);
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
});
server.listen(3000);