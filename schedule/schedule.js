var util = require('../util/util')

function snapshotToHtml(snapshot) {
  var html = ''
  if (snapshot.empty) {
    html = '<p>no schedule!</p>'
  } else {
    html = '<ul>'
    snapshot.forEach(doc => {
      var data = doc.data()
      let sh = data.startHour.toString()
      let sm = data.startMinute.toString()
      if (data.startMinute < 10) {
        sm = "0" + sm;
      }
      let eh = data.endHour.toString()
      let em = data.endMinute.toString()
      if (data.endMinute < 10) {
        em = "0" + em;
      }
      html += `<li>${data.name}, ${data.description}, ${sh}:${sm}~${eh}:${em}</li>`
    });
    html += '</ul>'
  }
  return html;
}

function matchMtgTime(snapshot, mtgId) {
  let dayofweek = util.getWeekdayOfToday();
  let nowHour = util.getHourOfNow();
  let nowMinute = util.getMinuteOfNow();
  var html = ""
  if (!snapshot.empty) {
    snapshot.forEach(doc => {
      var data = doc.data()
      let sh = data.startHour.toString()
      let sm = data.startMinute.toString()
      if (data.startMinute < 10) {
        sm = "0" + sm;
      }
      let eh = data.endHour.toString()
      let em = data.endMinute.toString()
      if (data.endMinute < 10) {
        em = "0" + em;
      }
      let startTime = Number(data.startHour) * 60 + Number(data.startMinute);
      let endTime = Number(data.endHour) * 60 + Number(data.endMinute);
      let nowTime= nowHour * 60 + nowMinute;
      if ((startTime <= (nowTime + 5)) && (nowTime <= endTime)) {
        html += `<li>${data.name}, ${data.description}, ${sh}:${sm}~${eh}:${em}<br>
          ${data.mtgId}</li>`
        mtgId[0] = data.mtgId
      }
    });
  }
  return html
}

function getDaySnapshot(htmls, db, uid, day) {
  let mtgRef = db.collection('schedule').doc(uid).collection('mtg');
  let query = mtgRef.where('day', '==', day).get()
    .then(snapshot => {
      htmls[day] = snapshotToHtml(snapshot);
    })
  .catch(err => {
    console.log('Error getting day schedule', err);
  });
  return query;
}

function getDaySnapshotWithMatching(htmls, mtgId, mSchedule, db, uid, day) {
  let mtgRef = db.collection('schedule').doc(uid).collection('mtg');
  let query = mtgRef.where('day', '==', day).get()
    .then(snapshot => {
      htmls[day] = snapshotToHtml(snapshot);
      mSchedule[0] = matchMtgTime(snapshot, mtgId);
    })
  .catch(err => {
    console.log('Error getting day schedule', err);
  });
  return query;
}


exports.showAlldaySchedule = function(res, db, uid, day) {
  let mtgRef = db.collection('schedule').doc(uid).collection('mtg');
  var schedules = {};
  var promises = new Array();
  const dayofweekArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  for (var i = 0; i < dayofweekArray.length; i++) {
    promises[i] = getDaySnapshot(schedules, db, uid, dayofweekArray[i])
  }
  Promise.all(promises).then(() => {
    res.render('schedule', {uid:uid, todayofweek: day, scheduleHtmls:schedules, matchedSchedule:"", mtgId:''})
  })
}

exports.showAlldayScheduleWithPopup = function(res, db, uid, day) {
  let mtgRef = db.collection('schedule').doc(uid).collection('mtg');
  var schedules = {};
  var promises = new Array();
  var mtgId= new Array();
  var matchedSchedule = new Array();
  const dayofweekArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  for (var i = 0; i < dayofweekArray.length; i++) {
    if (dayofweekArray[i] === util.getWeekdayOfToday()) {
      promises[i] = getDaySnapshotWithMatching(schedules, mtgId, matchedSchedule, db, uid, dayofweekArray[i])
    } else {
      promises[i] = getDaySnapshot(schedules, db, uid, dayofweekArray[i])
    }
  }
  Promise.all(promises).then(() => {
    res.render('schedule', {uid:uid, todayofweek: day, scheduleHtmls:schedules, matchedSchedule:matchedSchedule[0], mtgId:mtgId[0]})
  })
}

exports.setMtgSchedule = function(db, uid, mtn, wd, stHour, stMinute, edHour, edMinute, mtgId, des) {
  let scheduleRef = db.collection('schedule');
  let mtgRef = scheduleRef.doc(uid).collection('mtg');
  let setMtg = mtgRef.doc(mtn).set({
    name: mtn, day: wd, startHour: stHour, startMinute: stMinute, endHour: edHour, endMinute: edMinute, mtgId: mtgId, description: des
  });
}

exports.deleteMtgSchedule = function(db, uid, mtn) {
  let deleteMtg = db.collection('schedule').doc(uid).collection('mtg').doc(mtn).delete()
}
