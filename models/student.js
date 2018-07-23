var mongoose = require('mongoose');

var studentSchema = new mongoose.Schema({
  name: {
    first: String,
    last: String,
  },
  fullName: String,
  school: String,
  grade: Number,
  height: {
    feet: Number,
    inches: Number
  },
  weight: Number,
  position: String,
  armSpan: Number,
  benchPress: Number,
  broad: Number,
  vertical: Number,
  forty: {
    first: Number,
    second: Number
  },
  shuttle: {
    firstL: Number,
    secondR: Number
  },
  strength: String,
  weakness: String,
  comment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment"
  }]
})

module.exports = mongoose.model("student", studentSchema)