var nice = entry().field("nice")
var vruntime = entry().field("vruntime")
var running = entry().field("Running")
var timerStart = entry().field("Timer start")
var waitTime = entry().field("Wait time")
var name = entry().field("Name")
var timerMin = entry().field("timerMin")
var timerMax = entry().field("timerMax")
var timesDone = entry().field("timesDone")
var putOffs = entry().field("putOffs")
var lastDuration = entry().field("lastDuration")
function bounded(min, max, value) {
  return  Math.min(max, Math.max(min, value))
}
function boundedNice(nice) {
  return bounded(-20, 19, nice)
}
function currentDateTime() {return moment().toDate().getTime()}
function started(ent) {return ent.field("Started") == 1}
function startStop() {
  if (running) {
    var deltaExec = moment().diff(timerStart, "seconds")
    var weight = 1024 / Math.pow(1.25, nice)
    var deltaExecWeighted = deltaExec * 20 / weight
    entry().set("vruntime", vruntime + deltaExecWeighted)
    entry().set("Running", false)
    var entries = lib().entries()
    for (var i = 0; i < entries.length; i++) {
      waitTime = entries[i].field("Wait time")
      entries[i].set("Wait time", waitTime + deltaExec)
    }
    entry().set("Wait time", 0)
    entry().set("putOffs", 0)
  } else {
    entry().set("Running", true)
    entry().set("Timer start", currentDateTime())
    var activeEntries = lib().entries().filter(started).length
    var slice = waitTime / activeEntries
    var timerDuration = 0
    if (timerMin < timerMax) {
      timerDuration = bounded(timerMin, timerMax, slice)
    } else {
      timerDuration = (timerMin + timerMax) / 2
    }
    throw String(waitTime) + " " + String(nice) + "!"
    AndroidAlarm.timer(timerDuration, name, false)
    entry().set("lastDuration", timerDuration)
  }
}
function finish() {
  entry().set("doneDT", currentDateTime())
  entry().set("timesDone", timesDone + 1)
}
function putOff() {
  entry().set("putOffs", putOffs + 1)
  entry().set("putOffDT", currentDateTime())
}
function lowerPriority() {
  entry().set("nice", boundedNice(nice + 1))
}
function raisePriority() {
  entry().set("nice", boundedNice(nice - 1))
}
function activate() {
  entry().set("doneDT", null)
  entry().set("putOffs", 0)
}
function raiseTimerDuration() {
  entry().set("timerMin", lastDuration)
}
function limitTimerDuration() {
  entry().set("timerMax", lastDuration * 0.9)
}