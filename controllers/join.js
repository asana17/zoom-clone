var util = require('../util/util')


async function getComingMtg(db, uid) {
  // console.log(uid)
  let mtgRef = db.collection('user_schedule').doc(uid).collection('mtg');
  let querySnapshot = await mtgRef.get()
  console.log(querySnapshot.size)
  console.log(querySnapshot.empty)
  console.log(querySnapshot.docs.map(postDoc => postDoc.id))
  let now = new Date()
  // const dayofweekArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  let mtgInfo = {}
  await querySnapshot.forEach(async (postDoc) => {
    let mtgId = postDoc.id
    if (postDoc.data()['is_attend'] == 1) {
      let mtg = await db.collection('mtg').doc(mtgId).get()
      let mtgData = mtg.data()
      let startAt = mtgData['start'].toDate()
      let endAt = mtgData['end'].toDate()
      var ms_Min = 60 * 1000;
      var ms_Hour = ms_Min * 60
      console.log(mtgId)
      console.log(mtgData)
      mtgInfo[mtgId] = mtgData
      // if (startAt - now < 3 * ms_Hour && endAt - now > 0) {
      //   comingMtg.push(mtgId)
      // }
    }
  })
  console.log(mtgInfo)
  return mtgInfo
}

module.exports = { getComingMtg }
