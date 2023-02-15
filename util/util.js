exports.getWeekdayOfToday = function() {
  var today = new Date()
  weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return weekdays[today.getDay()]
}
exports.getHourOfNow = function() {
  var now = new Date()
  var hour = now.getHours();
  return hour
}
exports.getMinuteOfNow = function() {
  var now = new Date()
  var minute = now.getMinutes();
  return minute
}
