var util = require('../util/util')
var json2csv = require('json2csv')

async function getMtgInfo(db, mtgId) {
  let mtg = await db.collection('mtg').doc(mtgId).get()
  return mtg.data()
}

module.exports = {getMtgInfo}
