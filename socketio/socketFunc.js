exports.registerSocketData = function(db, roomId, socketId, uid, displayName) {
  let socketDataRef = db.collection('socketData');
  let socketsRef = socketDataRef.doc(roomId).collection('sockets')
  let setSocket = socketsRef.doc(socketId).set({
    uid : uid , displayName : displayName
  });
}

//call this before registerSocketId
exports.incrementConnectionCount = function(db, roomId) {
  let roomIdRef = db.collection('socketData').doc(roomId);
  let getDoc = roomIdRef.get()
    .then(doc => {
      var count = 0;
      if (doc.exists) {
        let data = doc.data()
        count = data.count
      }
        count++;
        roomIdRef.set({
          count : count
        });
    })
  .catch(err =>  {
    console.log('Error getting document', err);
  });
}

exports.deleteSocketId = function(db, roomId, socketId) {
  let deleteSocket = db.collection('socketData').doc(roomId).collection('sockets').doc(socketId).delete()
}

//call this after deleteSocketId
exports.decrementConnectionCount = function(db,roomId) {
  let roomIdRef = db.collection('socketData').doc(roomId);
  let getDoc = roomIdRef.get()
    .then(doc => {
      if (!doc.exists) {
        console.log("doc not exists in decConnectionCount!")
      } else {
        let data = doc.data()
        count = data.count
        count--;
        if (count == 0) {
          roomIdRef.delete()
        } else {
          roomIdRef.set({
            count : count
          });
        }
      }
    })
  .catch(err =>  {
    console.log('Error getting document', err);
  });
}

exports.sendSocketDataList = function(db, roomId, uid, io) {
  let socketsRef = db.collection('socketData').doc(roomId).collection('sockets')
  let socketDataList = new Object()
  var mySID
  let query = socketsRef.get()
    .then(snapshot => {
      if (snapshot.empty) {
        console.log("no snapshot in getSocketDataList");
      } else {
        snapshot.forEach(doc => {
          let data = doc.data()
          let sId = doc.id
          if (data.uid == uid) {
            mySID = sId
          }
          let dname = data.displayName
          socketDataList[sId] = dname
        })
        io.to(mySID).emit('socket-data-provided', socketDataList)
      }
    });
}
