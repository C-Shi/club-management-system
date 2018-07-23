var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        // 如果不要这个id也能完成界面处理，但是由于只传入了user，没有办法将数据和mongoDB联系起来
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        // 只存 req.user.username 只是把这个user的名字存下来，并没有关联该user的数据库
        username: String
    }
})

module.exports = mongoose.model("comment", commentSchema)
