/*
* 账号相关接口
* */
var {handleResponse, OperateType} = require('../../common/http/hander.response')
var {ResponseSuccess, ResponseError} = require('../../common/http/response.result')
var config = require('../config/token.config')
const jwt = require('jsonwebtoken');
var logger = require('../../common/util/logger')


var UserDb = require('../../db/mongo/index').User
var AccountDb = require('../../db/mongo/index').Account
var WalletDb = require('../../db/mongo/index').Wallet
var WalletRecordDb = require('../../db/mongo/index').WalletRecord

function createToken(username) {
    var token = jwt.sign({name: username}, config.secret, {
        expiresIn: config.expiresIn
    });
    return token
}

module.exports = {
    init: function (app, auth, apigroup) {
        app.post(apigroup + '/User/Accesstoken', this.getAccessToken)
        app.post(apigroup + '/User/Register', this.register)
        app.post(apigroup + '/User/Login', auth, this.login)
        app.post(apigroup + '/User/accountInfo', auth, this.accountInfo)
        app.post(apigroup + '/User/modifyAvatar', auth, this.editAvatar)
        app.post(apigroup + '/User/editSex', auth, this.editSex)
        app.post(apigroup + '/User/editNickname', auth, this.editNickname)
        app.post(apigroup + '/User/myWallet', auth, this.myWallet)
        app.post(apigroup + '/User/myWalletRecord', auth, this.myWalletRecord)
    },

    myWallet: function (req, res) {
        var userid = req.user._doc._id
        WalletDb.findOne({user_id: userid}, function (err, result) {
            handleResponse(OperateType.Query, res, err, result)
        })
    },

    myWalletRecord: function (req, res) {
        var params = {}
        params.user_id = req.user._doc._id
        if (req.body.status) {
            params.status = req.body.status;
        }
        WalletRecordDb.find(params, function (err, result) {
            handleResponse(OperateType.Query, res, err, result)
        })
    },

    editSex: function (req, res) {
        var userid = req.user._doc._id
        var sex = req.body.sex
        AccountDb.editAccountInfo(userid, {sex: sex}, function (err, result) {
            handleResponse(OperateType.Edit, res, err, result)
        })
    },

    editNickname: function (req, res) {
        var userid = req.user._doc._id
        var nickname = req.body.nickname
        AccountDb.editAccountInfo(userid, {nickname: nickname}, function (err, result) {
            handleResponse(OperateType.Edit, res, err, result)
        })
    },


    editAvatar: function (req, res) {
        var userid = req.user._doc._id
        var avatar_url = "/Api/File/downloadPicture?avatar_id=" + req.body.avatar_id
        AccountDb.editAccountInfo(userid, {avatar_url: avatar_url}, function (err, result) {
            handleResponse(OperateType.Edit, res, err, result)
        })
    },


    accountInfo: function (req, res) {
        var userid = req.user._doc._id
        AccountDb.getAccountInfo(userid, function (err, result) {
            handleResponse(OperateType.Query, res, err, result)
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
                    res.json(new ResponseError('用户名不存在'));
                } else {
                    if (result.pwd == props.pwd) {
                        resolve(result)
                    } else {
                        res.json(new ResponseError('密码错误'));
                    }
                }
            })
        }).then(function (result) {
            var username = result.username
            var token = createToken(username)
            UserDb.updateToken(username, token, function (err, result) {
                if (result != null && result.nModified == 1) {
                    res.json(new ResponseSuccess("认证成功", {
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
