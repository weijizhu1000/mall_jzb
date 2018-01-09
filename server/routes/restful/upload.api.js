var FileDb = require('../../db/mongo/index').File
var upload = require('../../common/fileuploads')

var ResponseResult = require('../model/response.result')

module.exports = {
    init: function (app, auth) {
        app.post('/File/uploadPicture', auth, upload, this.uploadPicture)
        app.get('/File/downloadPicture', this.downloadPicture)
    },

    downloadPicture: function (req, res) {
        var avatar_id = req.query.avatar_id
        console.log(avatar_id)
        FileDb.getFile(avatar_id, function (err, result) {
            if (err || result == null){
                res.status(404).send('File not found')
            }else {
                res.download(result.path)
            }
        })
    },

    uploadPicture: function (req, res) {
        var fileInfo = req.file
        console.log(req.file)
        if (fileInfo){
            var file = {}
            file['originalname'] = fileInfo.originalname
            var index = fileInfo.originalname.lastIndexOf('.')
            file['ext'] = fileInfo.originalname.substring(index + 1, fileInfo.originalname.length)
            file['path'] = fileInfo.path
            file['filename'] = fileInfo.filename
            file['mimetype'] = fileInfo.mimetype
            file['size'] =  fileInfo.size
            file['userid'] = req.user._doc._id
            FileDb.create(file, function (err, result) {
                if (err){
                    res.status(400).json(new ResponseResult(0, '文件上传失败', err.message))
                }else {
                    console.log(result)
                    if (result == null){
                        res.status(400).json(new ResponseResult(0, '文件上传失败'))
                    }else {
                        res.json(new ResponseResult(1, '文件上传成功', {file: result}))
                    }
                }
            })
        }else {
            res.status(400).json(new ResponseResult(0, '文件上传失败'))
        }
    }
}