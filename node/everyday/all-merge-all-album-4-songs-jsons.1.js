const Xray = require('x-ray');
const x = Xray();
const fs = require('fs');
const download = require('download');
var shell = require('shelljs');
var dateFormat = require('dateformat');
var async = require('async');
var downloadFileSync = require('download-file-sync');
var schedule = require('node-schedule');
var _ = require('underscore');

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

const files = _getAllFilesFromFolder(__dirname + "/all-album-4-songs-second");
console.log(files);
fs.writeFile("./all_album_4_songs_names.json", JSON.stringify(files, null, '\t'));

var allSongs = [];


files.forEach(function(name, indexId) {

    var songs = JSON.parse(fs.readFileSync('./all-album-4-songs-second/' + name, 'utf8'));
    console.log(songs);
    allSongs = allSongs.concat(songs);


});

fs.writeFile("./all_album_4_songs_second.json", JSON.stringify(allSongs, null, '\t'));