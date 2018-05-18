var {handleResponse, OperateType} = require('../common/http/hander.response')
var DBHelper = require('../common/util/dbhelper')

var _model;

module.exports = {

    setModel: function (model) {
        _model = model;
        console.log("init model", _model);
    },

    /**
     *
     * @api {post} /{model}/create  创建新数据
     * @apiName create
     * @apiGroup BusinessBase
     * @apiVersion 1.0.0
     * @apiDescription 创建新数据，model为对应的业务类型
     *
     * @apiParam {Object} body 业务数据JSON对象
     *
     * @apiSuccess {String} status 结果码
     * @apiSuccess {String} message 消息说明
     * @apiSuccess {JSONObject} data   JSON数据
     * @apiPermission Auth
     */
    create: function (req, res) {
        _model.create(req.body, function (err, result) {
            handleResponse(OperateType.Create, res, err, result);
        })
    },

    /**
     *
     * @api {post} /{model}/edit  编辑数据
     * @apiName edit
     * @apiGroup BusinessBase
     * @apiVersion 1.0.0
     * @apiDescription 编辑数据，model为对应的业务类型
     * @apiParam {JSONObject} body 业务数据JSON对象
     * @apiSuccess {String} status 结果码
     * @apiSuccess {String} message 消息说明
     * @apiSuccess {JSONObject} data   JSON数据
     * @apiPermission Auth
     */
    edit: function (req, res) {
        _model.update({_id: req.body._id}, {$set: req.body}, function (err, result) {
            handleResponse(OperateType.Edit, res, err, result);
        })
    },

    /**
     *
     * @api {post get} /{model}/remove  删除数据
     * @apiName remove
     * @apiGroup  BusinessBase
     * @apiVersion 1.0.0
     * @apiDescription 删除数据，model为对应的业务类型
     * @apiParam {String} _id 业务数据JSON对象
     * @apiSuccess {String} status 结果码
     * @apiSuccess {String} message 消息说明
     * @apiPermission Auth
     */
    remove: function (req, res) {
        var originalParams = req.method == "GET" ? req.query : req.body;
        _model.remove({_id: originalParams._id}, function (err, result) {
            handleResponse(OperateType.Remove, res, err, result);
        })
    },

    /**
     *
     * @api {post} /{model}/query  查询数据
     * @apiName query
     * @apiGroup BusinessBase
     * @apiVersion 1.0.0
     * @apiDescription 查询数据，支持分页，model为对应的业务类型
     * @apiUse PageQuery
     * @apiSuccess {String} status 结果码
     * @apiSuccess {String} message 消息说明
     * @apiSuccess {JSONArray} data   JSON数据
     * @apiPermission Auth
     */
    query: function (req, res) {
        var originalParams = req.method == "GET" ? req.query : req.body;

        var page = originalParams.page
        var pagesize = originalParams.pagesize
        var params = JSON.parse(JSON.stringify(originalParams))
        delete  params.page
        delete  params.pagesize
        DBHelper.pageQuery(page, pagesize, _model, '', params, {}, function (err, result) {
            handleResponse(OperateType.Query, res, err, result);
        })
    }
}