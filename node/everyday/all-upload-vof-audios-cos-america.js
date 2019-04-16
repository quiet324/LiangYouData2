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

var deasync = require('deasync');

var rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = [0];
rule.minute = 5;




var mkdirp = require('mkdirp');


// var moment = require('moment');
var moment = require('moment-timezone');

moment.tz.setDefault('Asia/Shanghai');

var taskRunningTimes = 1;

var token = JSON.parse(fs.readFileSync('.token', 'utf8')).token;
var SecretId = JSON.parse(fs.readFileSync('.SecretId', 'utf8')).SecretId;
var SecretKey = JSON.parse(fs.readFileSync('.SecretKey', 'utf8')).SecretKey;


var cos = new COS({
    AppId: '1253798207',
    SecretId: SecretId,
    SecretKey: SecretKey
});

// var j = schedule.scheduleJob('0 * * * * *', function() { // "Runs job every minute"

// var j = schedule.scheduleJob('*/5 * * * *', function() { // "Runs job every 5 minute"



var lastYearWeekValue = "";

var year = moment().format('YYYY');
// var week = moment().format('WW') + moment().unix();
var week = moment().format('ww');
var repoName = "LiangYouRadioResource" + year + week;

var jsonFilesForCOS = [];
var jsonFilesForCOSDone = [];

var audioFilesForCOS = [];
var audioFilesForCOSDone = [];

var jsonFilesForCOSFileName = '../operate/jsonFilesForCOS.json';
var jsonFilesForCOSFileNameDone = '../operate/jsonFilesForCOSDone.json';

var audioFilesForCOSFileName = '../operate/audioFilesForCOS.json';
var audioFilesForCOSFileNameDone = '../operate/audioFilesForCOSDone.json';


if (fs.existsSync(jsonFilesForCOSFileName)) { //
    jsonFilesForCOS = JSON.parse(fs.readFileSync(jsonFilesForCOSFileName, 'utf8'));
}


// var j = schedule.scheduleJob('0 5 * * * *', function() { // // "Runs job every 5 minute"
// var j = schedule.scheduleJob('0 0 * * * *', function() { //// "Runs job every hour"
var now = moment().format('MMMM Do YYYY, h:mm:ss a');
console.log(now + year + week + ' taskRunningTimes:' + taskRunningTimes++);







var names = JSON.parse(fs.readFileSync('./vof2017-1.json', 'utf8'));
names.forEach(function(name, indexId) {

    var lastIndex = name.path.lastIndexOf('/');
    var vofFileName = name.path.substring(lastIndex + 1);
    if (!fs.existsSync('../../vof/' + vofFileName)) {
        console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + "downloading... " + name.path);


        mkdirp.sync('../../vof');


        if (shell.exec('wget -O ' + '../../vof/' + vofFileName + ' ' + name.path).code !== 0) {
            shell.echo('Error: wget failed');
            shell.exit(1);
        }


        //var data = require('child_process').execFileSync('curl', ['-L', vofDownUrl]);

        //mkdirp.sync('../../vof');

        //fs.writeFileSync('../../vof/old' + vofFileName, data);



        // console.log(moment().format('MMMM Do YYYY, h:mm:ss a ') + "lame... " + vofFileName);

        // if (shell.exec('lame --mp3input -b 64 ' + '../../vof/old' + vofFileName + ' ../../vof/' + vofFileName).code !== 0) {
        //     shell.echo('Error: lame failed');
        //     shell.exit(1);
        // }

        // console.log(moment().format('MMMM Do YYYY, h:mm:ss a ') + "lame... done " + vofFileName);


        var forCosAudioFile = {};
        forCosAudioFile.fileName = '../../vof/' + vofFileName;

        if (!_.some(audioFilesForCOS, forCosAudioFile)) {
            audioFilesForCOS.push(forCosAudioFile);
            fs.writeFileSync(audioFilesForCOSFileName, JSON.stringify(audioFilesForCOS, null, '\t'));
        }

        if (fs.existsSync(audioFilesForCOSFileName)) { //
            audioFilesForCOS = JSON.parse(fs.readFileSync(audioFilesForCOSFileName, 'utf8'));
            audioFilesForCOS.forEach(function(cosAudioFile) {


                if (fs.existsSync(cosAudioFile.fileName)) {


                    if (fs.existsSync(audioFilesForCOSFileNameDone)) { //
                        audioFilesForCOSDone = JSON.parse(fs.readFileSync(audioFilesForCOSFileNameDone, 'utf8'));
                    }


                    var forAudioCosFile = {};
                    forAudioCosFile.fileName = cosAudioFile.fileName;
                    if (_.some(audioFilesForCOSDone, forAudioCosFile)) {
                        console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + "upload already done ... " + cosAudioFile.fileName);
                        return;
                    }

                    var sync = true;
                    console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + " upload... " + cosAudioFile.fileName);

                    cos.sliceUploadFile({
                        Bucket: 'febc', // 替换为你的Bucket名称
                        Region: 'ap-chengdu', // 设置COS所在的区域，对应关系: 华南->cn-south, 华东->cn-east, 华北->cn-north
                        Key: 'vof/' + cosAudioFile.fileName.substring(cosAudioFile.fileName.lastIndexOf('/')), // 设置上传到cos后的文件的名称
                        FilePath: cosAudioFile.fileName // 设置要上传的本地文件
                    }, function(err, data) {
                        sync = false;

                        if (!err) {
                            console.log(data);
                            var forAudioCosFile = {};
                            forAudioCosFile.fileName = cosAudioFile.fileName;

                            fs.unlinkSync('../../vof/old' + vofFileName);
                            fs.unlinkSync('../../vof/' + vofFileName);

                            audioFilesForCOSDone.push(forAudioCosFile);
                            fs.writeFileSync(audioFilesForCOSFileNameDone, JSON.stringify(audioFilesForCOSDone, null, '\t'));
                        } else {
                            console.log(err);
                        }
                    });

                    while (sync) { require('deasync').sleep(2000); }
                }


            });
        }

    }

});