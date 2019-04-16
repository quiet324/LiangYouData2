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


var allSongs = [];



var songs = JSON.parse(fs.readFileSync('./all_album_songs.json', 'utf8'));
songs.forEach(song => {
    console.log(song);
    if (song.path.startsWith("https://rawcdn.githack.com/quiet324/LiangYouSchoolAlbum")) {

        var splits = song.path.split("/");
        var githubTag = splits[splits.length - 3];
        var repoName = splits[splits.length - 4];
        //            source = source.replace("https://rawcdn.githack.com/quiet324/" + repoName + "/" + githubTag + "/", "http://lysa3-1253798207.file.myqcloud.com/" + repoName + "/");
        var source = song.path.replace("https://rawcdn.githack.com/quiet324/" + repoName + "/" + githubTag + "/", "http://lysa.ali.soundofbible.xyz/" + repoName + "/");

        console.log(source);

        allSongs.push(source);

    }

});




fs.writeFile("./all_lysa_songs.json", JSON.stringify(allSongs, null, '\t'));