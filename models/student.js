var mongoose = require('mongoose');

var studentSchema = new mongoose.Schema({
  name: {
    first: String,
    last: String,
  },
  image: String,
  imageId: String,
  fullName: String,
  school: String,
  grade: Number,
  height: String,
  weight: String,
  position: String,
  armSpan: String,
  benchPress: {
    first: String,
    second: String
  },
  broad: String,
  vertical: String,
  forty: {
    first: String,
    second: String
  },
  shuttle: {
    firstL: String,
    secondR: String
  },
  strength: String,
  weakness: String,
  comment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment"
  }]
})

module.exports = mongoose.model("student", studentSchema)