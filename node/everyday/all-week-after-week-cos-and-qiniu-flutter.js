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
rule.hour = [1, 4, 6, 7, 11, 13, 19, 22];
rule.minute = 10;




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
    scope: 'dailyjson',
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


var cos = new COS({
    AppId: '1253798207',
    SecretId: SecretId,
    SecretKey: SecretKey
});

var qsync2 = true;

var formUploader = new qiniu.form_up.FormUploader(config);
var putExtra = new qiniu.form_up.PutExtra();


var localFile = "../operate/all_" + "yu" + "_songs.json";
var key2 = "all_yu_songs.json";

var keyToOverwrite = key2;
var optionsOverride = {
    scope: "dailyjson" + ":" + keyToOverwrite,
    expires: 7200 * 24 * 365
}
var putPolicyOverride = new qiniu.rs.PutPolicy(optionsOverride);
var uploadTokenOverride = putPolicyOverride.uploadToken(mac);

console.log("upload flutter file");
// 文件上传
formUploader.putFile(uploadTokenOverride, key2, localFile, putExtra, function(respErr,
    respBody, respInfo) {
    console.log("respBody");

    qsync2 = false;

    if (respErr) {
        console.log(respErr);
    }
    if (respInfo.statusCode == 200) {
        console.log(respBody);



        var cdnManager = new qiniu.cdn.CdnManager(mac);

        var urlsToRefresh = [
            'http://dailyjson.soundofbible.xyz/' + key2,
        ];
        console.log(urlsToRefresh);

        cdnManager.refreshUrls(urlsToRefresh, function(err, respBody, respInfo) {
            console.log(respInfo);
            if (err) {
                throw err;
            }
        });


    } else {
        console.log(respInfo.statusCode);
        console.log(respBody);
    }
});

while (qsync2) { require('deasync').sleep(2000); }