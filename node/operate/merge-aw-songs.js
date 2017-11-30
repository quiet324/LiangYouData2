const Xray = require('x-ray');
const x = Xray();
const fs = require('fs');
const download = require('download');
var shell = require('shelljs');
var dateFormat = require('dateformat');
var async = require('async');
var downloadFileSync = require('download-file-sync');
var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = [0, 1, 6, 9, 14, 17, 21];
rule.minute = 5;




var mkdirp = require('mkdirp');


// var moment = require('moment');
var moment = require('moment-timezone');

moment.tz.setDefault('Asia/Shanghai');

var taskRunningTimes = 1;


var _getAllFilesFromFolder = function(dir) {

    var filesystem = require("fs");
    var results = [];

    filesystem.readdirSync(dir).forEach(function(file) {

        results.push(file);

    });

    return results;

};

var artistName = 'zz';
const files = _getAllFilesFromFolder("../" + artistName);
console.log(files);
fs.writeFile("./" + artistName + "_songs_names.json", JSON.stringify(files, null, '\t'));

var allSongs = [];


files.forEach(function(name, indexId) {

    var songs = JSON.parse(fs.readFileSync('../' + artistName + '/' + name, 'utf8'));
    console.log(songs);

    allSongs.push(songs);


});

fs.writeFile("./all_" + artistName + "_songs.json", JSON.stringify(allSongs, null, '\t'));