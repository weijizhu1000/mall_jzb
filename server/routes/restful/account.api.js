/*
* 账号相关接口
* */

var {ResponseSuccess, ResponseError} = require('../model/response.result')
var config = require('../config/token.config')
const jwt = require('jsonwebtoken');
var logger = require('../../common/logger')


var UserDb = require('../../db/mongo/index').User
var AccountDb = require('../../db/mongo/index').Account

function createToken(username) {
    var token = jwt.sign({name: username}, config.secret, {
        expiresIn: config.expiresIn
    });
    return token
}

module.exports = {
    init: function (app, auth) {
        app.post('/User/Accesstoken', this.getAccessToken)
        app.post('/User/Register', this.register)
        app.post('/User/Login', auth, this.login)
        app.post('/User/accountInfo', auth, this.accountInfo)
        app.post('/User/modifyAvatar', auth, this.editAvatar)
        app.post('/User/editSex', auth, this.editSex)
        app.post('/User/editNickname', auth, this.editNickname)
    },

    editSex: function (req, res) {
        var userid = req.user._doc._id
        var sex = req.body.sex
        AccountDb.editAccountInfo(userid, {sex: sex}, function (err, result) {
            console.log(result)
            if (err || result == null || result.n == 0) {
                res.json(new ResponseError(err ? err.message : "修改性别失败"))
            } else {
                res.json(new ResponseSuccess("修改性别成功"))
            }
        })
    },

    editNickname: function (req, res) {
        var userid = req.user._doc._id
        var nickname = req.body.nickname
        AccountDb.editAccountInfo(userid, {nickname : nickname}, function (err, result) {
            console.log(result)
            if (err || result == null || result.n == 0) {
                res.json(new ResponseError(err ? err.message : "修改昵称失败"))
            } else {
                res.json(new ResponseSuccess("修改昵称成功"))
            }
        })
    },

    editAvatar: function (req, res) {
        var userid = req.user._doc._id
        var avatar_url = "/Api/File/downloadPicture?avatar_id=" + req.body.avatar_id
        AccountDb.editAccountInfo(userid, {avatar_url : avatar_url}, function (err, result) {
            if (err || result == null) {
                res.json(new ResponseError(err ? err.message : "修改头像失败"))
            } else {
                res.json(new ResponseSuccess("修改头像成功"))
            }
        })
    },

    accountInfo: function (req, res) {
        var userid = req.user._doc._id
        AccountDb.getAccountInfo(userid, function (err, result) {
            if (err || result == null) {
                res.json(new ResponseError(err ? err.message : "获取用户信息失败"))
            } else {
                res.json(new ResponseSuccess("获取用户信息成功", result))
            }
        })
    },

    login: function (req, res) {
        if (req.user.username) {
            res.json(new ResponseSuccess("登录成功"))
        } else {
            res.json(new ResponseError("登录失败"))
        }
    },

    register: function (req, res) {
        var data = req.body
        new Promise(function (resolve, reject) {
            UserDb.getUserByLoginName(data.username, function (err, result) {
                if (result == null || result == undefined) {
                    resolve()
                } else {
                    res.json(new ResponseError('账号已存在，不可重复创建'))
                }
            })
        }).then(function () {
            var token = createToken(data.username)
            UserDb.create(data, function (err, result) {
                if (err) {
                    logger.error(err)
                    res.json(new ResponseError('注册失败'))
                } else {
                    if (result == null) {
                        res.json(new ResponseError('注册失败'))
                    } else {
                        // 创建账号信息
                        AccountDb.create({'userid': result._id})
                        res.json(new ResponseSuccess('注册成功', {
                            token: 'Bearer ' + token,
                            name: data.username
                        }))
                    }
                }
            })
        })
    },

    getAccessToken: function (req, res) {
        var props = req.body
        new Promise(function (resolve, reject) {
            UserDb.getUserByLoginName(props.username, function (err, result) {
                if (err || result == null) {
                    logger.trace('用户名不存在 : ' + props.username)
                    res.json(new ResponseError(0, '用户名不存在'));
                } else {
                    if (result.pwd == props.pwd) {
                        resolve(result)
                    } else {
                        res.json(new ResponseError(0, '密码错误'));
                    }
                }
            })
        }).then(function (result) {
            var username = result.username
            var token = createToken(username)
            UserDb.updateToken(username, token, function (err, result) {
                if (result != null && result.nModified == 1) {
                    res.json(new ResponseSuccess(1, "认证成功", {
                        token: 'Bearer ' + token,
                        name: username
                    }));
                } else {
                    res.json(new ResponseError('认证失败,用户不存在!'));
                }
            })
        })
    },


};
