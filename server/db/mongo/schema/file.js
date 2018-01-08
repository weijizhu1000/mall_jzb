var mongoose = require('mongoose')

var Schema = mongoose.Schema
var FileSchema = new Schema({
    userid:String,
    mimetype:String,
    filename: String,
    originalname: String,
    ext: String,
    path: String,
    size: Number,
})

FileSchema.statics.getFile = function (fileid, callback) {
    if (!fileid || fileid.length == 0) {
        return callback(null, [])
    }
    this.findOne({'_id': fileid}, callback)
}

mongoose.model('File', FileSchema)