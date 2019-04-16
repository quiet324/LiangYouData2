const Xray = require('x-ray');
const x = Xray();
const fs = require('fs');
const download = require('download');
var shell = require('shelljs');
var dateFormat = require('dateformat');
var async = require('async');
var downloadFileSync = require('download-file-sync');
var schedule = require('node-schedule');
var _ = require('lodash');
var COS = require('cos-nodejs-sdk-v5');
var qiniu = require('qiniu');

var deasync = require('deasync');

var rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = [0, 1, 5, 9, 12, 18, 21];
rule.minute = 46;




var mkdirp = require('mkdirp');


// var moment = require('moment');
var moment = require('moment-timezone');

moment.tz.setDefault('Asia/Shanghai');

var taskRunningTimes = 1;

var token = JSON.parse(fs.readFileSync('.token', 'utf8')).token;
var SecretId = JSON.parse(fs.readFileSync('.SecretId', 'utf8')).SecretId;
var SecretKey = JSON.parse(fs.readFileSync('.SecretKey', 'utf8')).SecretKey;


var QAccessKey = JSON.parse(fs.readFileSync('.qaccessKey', 'utf8')).accessKey;
var QSecretKey = JSON.parse(fs.readFileSync('.qsecretKey', 'utf8')).SecretKey;
var mac = new qiniu.auth.digest.Mac(QAccessKey, QSecretKey);
var options = {
    scope: 'download',
    expires: 7200 * 24 * 365
};
var putPolicy = new qiniu.rs.PutPolicy(options);
var uploadToken = putPolicy.uploadToken(mac);

var config = new qiniu.conf.Config();
// 空间对应的机房
config.zone = qiniu.zone.Zone_z2;
// 是否使用https域名
//config.useHttpsDomain = true;
// 上传是否使用cdn加速
//config.useCdnDomain = true;

var bucketManager = new qiniu.rs.BucketManager(mac, config);

//每个operations的数量不可以超过1000个，如果总数量超过1000，需要分批发送
var deleteOperations = [];

for (let index = 2000; index < 3000; index++) {
    if (index < 10) {
        var item = qiniu.rs.deleteOp('download', 'lyotg/000' + index + '.mp3');
    } else if (index < 100) {
        var item = qiniu.rs.deleteOp('download', 'lyotg/00' + index + '.mp3');
    } else if (index < 1000) {
        var item = qiniu.rs.deleteOp('download', 'lyotg/0' + index + '.mp3');
    } else if (index < 10000) {
        var item = qiniu.rs.deleteOp('download', 'lyotg/' + index + '.mp3');
    }
    deleteOperations.push(item);
}

bucketManager.batch(deleteOperations, function(err, respBody, respInfo) {
    if (err) {
        console.log(err);
        //throw err;
    } else {
        // 200 is success, 298 is part success
        if (parseInt(respInfo.statusCode / 100) == 2) {
            respBody.forEach(function(item) {
                if (item.code == 200) {
                    console.log(item.code + "\tsuccess");
                } else {
                    console.log(item.code + "\t" + item.data.error);
                }
            });
        } else {
            console.log(respInfo.deleteusCode);
            console.log(respBody);
        }
    }
});