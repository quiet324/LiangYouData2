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
rule.hour = [0, 1, 6, 12, 13, 18, 23];
rule.minute = 58;




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

var results = JSON.parse(fs.readFileSync('../../artist.json', 'utf8'));
results.forEach(function(artist) {


    if (fs.existsSync("../operate/all_" + artist.shortName + '20171129' + "_songs.json")) {

        var qsync = true;
        console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + "upload... " + "../operate/all_" + artist.shortName + '20171129' + "_songs.json");

        var localFile = "../operate/all_" + artist.shortName + '20171129' + "_songs.json";
        var formUploader = new qiniu.form_up.FormUploader(config);
        var putExtra = new qiniu.form_up.PutExtra();
        var key = "all_" + artist.shortName + '20171129' + "_songs.json";
        // 文件上传
        formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
            respBody, respInfo) {

            qsync = false;

            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode == 200) {
                console.log(respBody);
            } else {
                console.log(respInfo.statusCode);
                console.log(respBody);
            }
        });

        while (qsync) { require('deasync').sleep(2000); }
    }


});