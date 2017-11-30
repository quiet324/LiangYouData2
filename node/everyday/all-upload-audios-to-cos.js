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


var cos = new COS({
    AppId: '1253798207',
    SecretId: SecretId,
    SecretKey: SecretKey
});

var jsonFilesForCOS = [];
var jsonFilesForCOSDone = [];

var audioFilesForCOS = [];
var audioFilesForCOSDone = [];

var jsonFilesForCOSFileName = '../operate/jsonFilesForCOS.json';
var jsonFilesForCOSFileNameDone = '../operate/jsonFilesForCOSDone.json';

var audioFilesForCOSFileName = '../operate/audioFilesForCOS.json';
var audioFilesForCOSFileNameDone = '../operate/audioFilesForCOSDone.json';


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
                Bucket: 'dailyaudio', // 替换为你的Bucket名称
                Region: 'ap-chengdu', // 设置COS所在的区域，对应关系: 华南->cn-south, 华东->cn-east, 华北->cn-north
                Key: cosAudioFile.fileName.substring(cosAudioFile.fileName.lastIndexOf('/')), // 设置上传到cos后的文件的名称
                FilePath: cosAudioFile.fileName // 设置要上传的本地文件
            }, function(err, data) {
                sync = false;

                if (!err) {
                    console.log(data);
                    var forAudioCosFile = {};
                    forAudioCosFile.fileName = cosAudioFile.fileName;


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


// var results = JSON.parse(fs.readFileSync('../../artist.json', 'utf8'));
// results.forEach(function(artist) {
//     if (fs.existsSync('../../' + artist.shortName + '/' + artist.shortName + '171129.mp3')) {
//         var sync = true;
//         console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + "upload... " + '../../' + artist.shortName + '/' + artist.shortName + '171129.mp3');

//         cos.sliceUploadFile({
//             Bucket: 'dailyaudio', // 替换为你的Bucket名称
//             Region: 'ap-chengdu', // 设置COS所在的区域，对应关系: 华南->cn-south, 华东->cn-east, 华北->cn-north
//             Key: artist.shortName + '171129.mp3', // 设置上传到cos后的文件的名称
//             FilePath: '../../' + artist.shortName + '/' + artist.shortName + '171129.mp3' // 设置要上传的本地文件
//         }, function(err, data) {
//             sync = false;
//             if (!err) {
//                 console.log(data);
//             } else {
//                 console.log(err);
//             }
//         });

//         while (sync) { require('deasync').sleep(10000); }
//     }


// });



// cos.sliceUploadFile({
//     Bucket: 'dailyaudio', // 替换为你的Bucket名称
//     Region: 'cn-west', // 设置COS所在的区域，对应关系: 华南->cn-south, 华东->cn-east, 华北->cn-north
//     Key: fileName, // 设置上传到cos后的文件的名称
//     FilePath: '../../' + artist.shortName + '/' + fileName // 设置要上传的本地文件
// }, function(err, data) {
//     if (!err) {
//         console.log(data);
//     } else {
//         console.log(err);
//     }
// });