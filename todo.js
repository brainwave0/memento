var ToDo = {
  bounded: function (min, max, value) {
    return Math.max(min, Math.min(max, value))
  },
  boundedNice: function (nice) {
    return bounded(-20, 19, nice)
  },
  currentDateTime: function () {return moment().toDate().getTime()},
  started: function (ent) {return ent.field("Started") == 1},

  startStop: function () {
    var running = entry().field("Running")
    if (running) {
      var deltaExec = moment().diff(timerStart, "seconds")

      var nice = entry().field("nice")
      var weight = 1024 / Math.pow(1.25, nice)
      var deltaExecWeighted = deltaExec * 20 / weight
      entry().set("vruntime", deltaExecWeighted)

      entry().set("Running", false)

      var timerStart = entry().field("Timer start")
      var entries = lib().entries()
      for (var i = 0; i < entries.length; i++) {
        var waitTime = entries[i].field("Wait time")
        entries[i].set("Wait time", waitTime + deltaExec)
      }

      entry().set("Wait time", 0)

      entry().set("putOffs", 0)
    } else {
      entry().set("Running", true)

      entry().set("Timer start", this.currentDateTime())

      var activeEntries = lib().entries().filter(this.started).length
      var slice = this.bounded(10 * 60, 60 * 60, waitTime / activeEntries)
      AndroidAlarm.timer(slice)
    }
  },

  finish: function () {
    entry().set("doneDT", currentDateTime())

    var timesDone = entry().field("timesDone")
    entry().set("timesDone", timesDone + 1)
  },

  putOff: function () {
    var putOffs = entry().field("putOffs")
    entry().set("putOffs", putOffs + 1)

    entry().set("putOffDT", this.currentDateTime())
  },

  lowerPriority: function () {
    var nice = entry().field("nice")
    entry().set("nice", this.boundedNice(nice + 1))

    var vruntime = entry().field("vruntime")
    entry().set("vruntime", vruntime * 2)
  },

  raisePriority: function () {
    var nice = entry().field("nice")
    var started = entry().field("started")
    if (started) {
      entry().set("nice", this.boundedNice(nice - 1))

      function onVruntime(a, b) {
        return a.field("vruntime") - b.field("vruntime")
      }
      var toDoList =
        lib().entries().filter(this.started).sort(onVruntime)
      function isThisEntry(ent) {
        return ent.field("Name") == entry().field("Name")
      }
      var prev = toDoList[toDoList.findIndex(isThisEntry) - 1]
      if (prev && prev.field("vruntime")) {
        var vruntime = entry().field("vruntime")
        entry().set("vruntime", vruntime / 2)
      } else if (prev) {entry().set("vruntime", 0)}
    } else {entry().set("putOffs", 0)}
  }
}