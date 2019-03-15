function bounded(min, max, value) {
  return Math.max(min, Math.min(max, value))
}
function boundedNice(nice) {
  return bounded(-20, 19, nice)
}
function currentDateTime() {return moment().toDate().getTime()}
function started(ent) {return ent.field("Started") == 1}
var nice = entry().field("nice")
var vruntime = entry().field("vruntime")
function startStop() {
  var running = entry().field("Running")
  var timerDuration = entry().field("timerDuration")
  if (running) {
    var timerStart = entry().field("Timer start")
    var deltaExec = moment().diff(timerStart, "seconds")
    var weight = 1024 / Math.pow(1.25, nice)
    var deltaExecWeighted = deltaExec * 20 / weight
    entry().set("vruntime", vruntime + deltaExecWeighted)
    entry().set("Running", false)
    var entries = lib().entries()
    for (var i = 0; i < entries.length; i++) {
      var waitTime = entries[i].field("Wait time")
      entries[i].set("Wait time", waitTime + deltaExec)
    }
    entry().set("Wait time", 0)
    entry().set("putOffs", 0)
    if (deltaExec < timerDuration) {
      entry().set("maxTime", maxTime + deltaExec)
      entry().set("maxs", maxs + 1)
    } else {
      entry().set("minTime", minTime + deltaExec)
      entry().set("mins", mins + 1)
    }
  } else {
    entry().set("Running", true)
    entry().set("Timer start", currentDateTime())
    var activeEntries = lib().entries().filter(started).length
    var waitTime = entry().field("Wait time")
    entry().recalc()
    var avgMinTime = entry().field("avgMinTime")
    var avgMaxTime = entry().field("avgMaxTime")
    var min
    var max
    if (avgMinTime > 0) {
      min = avgMinTime
    } else {
      min = 10 * 60
    }
    if (avgMaxTime > 0) {
      max = avgMaxTime
    } else {
      max = 60 * 60
    }
    var slice = bounded(min, max, waitTime / activeEntries)
    var name = entry().field("Name")
    AndroidAlarm.timer(slice, name, false)
    entry().set("timerDuration", slice)
  }
}
function finish() {
  entry().set("doneDT", currentDateTime())
  var timesDone = entry().field("timesDone")
  entry().set("timesDone", timesDone + 1)
}
function putOff() {
  var putOffs = entry().field("putOffs")
  entry().set("putOffs", putOffs + 1)
  entry().set("putOffDT", currentDateTime())
}
function lowerPriority() {
  entry().set("nice", boundedNice(nice + 1))
  entry().set("vruntime", vruntime * 2)
}
function raisePriority() {
  entry().set("nice", boundedNice(nice - 1))
  entry().set("vruntime", vruntime / 2)
}
function activate() {
  entry().set("doneDT", null)
  entry().set("putOffs", 0)
}
