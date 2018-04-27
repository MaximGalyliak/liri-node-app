require("dotenv").config();

const KEYS = require('./keys.js');
const FS = require('fs');
const REQUEST = require('request');
const TWITTER = require('twitter');
const SPOTIFY = require('node-spotify-api');

const COMMAND = process.argv[2];

runCommand(COMMAND, input());
 
function runCommand(command, name) {
    logIt(command, name);
    switch (command) {
        case 'movie-this': getMovieInfo(name); break;
        case 'my-tweets': getMyTweets(); break;
        case 'spotify-this-song': spotifySong(name); break;
        case 'do-what-it-says': getWhatItSays(); break;
        default: console.log('Invalid command!'); break;
    }
}
function getMovieInfo(name) {
    if (name == undefined) {
        name = 'Mr.Nobody';
    }
    const url = 'http://www.omdbapi.com/?t=' + name + '&r=json&apikey=' + KEYS.omdb.key;
    REQUEST(url, (error, response, body) => {
        if (error || response.statusCode != 200) {
            console.log(`Sorry can't retrieve data, please try again later...`);
            logIt('error-', response.statusCode, JSON.parse(body).error);
        } else {
            let movieInfo = JSON.parse(body);
            console.log(`\nTITLE: ${movieInfo.Title}`);
            console.log(`YEAR: ${movieInfo.Year}`);
            console.log(`Country: ${movieInfo.Country}`);
            console.log(`Language: ${movieInfo.Language}`);
            console.log(`ACTORS: ${movieInfo.Actors}\n`);
            console.log(`PLOT: ${movieInfo.Plot}\n`);
            try {
                console.log(`IMDB Rating: ${movieInfo.Ratings[0].Value}`);
                console.log(`RT rating: ${movieInfo.Ratings[1].Value}`);
            } catch (err) {
                console.log('Rating unavailable.');
            }
            logIt('success!');
        }
    });
}
function getMyTweets() {
    const CLIENT = new TWITTER(KEYS.twitter);
    CLIENT.get('statuses/user_timeline', { count: 20 }, (error, tweets, response) => {
        if (error) {
            console.log('Something went wrong with Twitter...');
            error.map((err) => {
                logIt('error-', err.message);
            });
        } else {
            tweets.map((tw) => {
                console.log(`${tw.created_at}\n${tw.user.name}: ${tw.text}\n`);
            });
            logIt('success!');
        }
    });
}
function spotifySong(name) {
    if (name == undefined) {
        name = 'The+Sign+Ace+of+Base';
    }
    const spotify = new SPOTIFY(KEYS.spotify);
    spotify.search({ type: 'track', query: name, limit: '1' }, (err, data) => {
        if (err) {
            console.log('Something went wrong with Spotify...');
            logIt('error-', err);
        } else {
            let Track = data.tracks.items[0];
            console.log('ARTIST/s: ');
            Track.artists.map((artist) => {
                console.log(`-${artist.name}`);
            });
            console.log(`TRACK: ${Track.name}`);
            console.log(`ALBUM: ${Track.album.name}`);
            console.log(`LINK:  ${Track.external_urls.spotify}`);
            logIt('success!');
        }
    });
    //TODO get spotify keys, set up api calls, log needed info into console and log.txt
}
function getWhatItSays() {
    FS.readFile('random.txt', 'utf8', (err, data) => {
        if (err) {
            console.log('Something went wrong with file...');
            logIt('error-', err.message);
        } else {
            var dataArr = data.split(',');
            if (dataArr[0] === 'do-what-it-says') {
                console.log("Are you trying to trick me?");
            } else {
                runCommand(dataArr[0], dataArr[1]);
            }
        }
    });
}
//utils
function input() {
    let name = process.argv[3];
    if (process.argv.length > 4) {
        for (var i = 4; i < process.argv.length; i++) {
            name += ' ' + process.argv[i];
        }
    }
    return name;
}
function timeStamp() {
    const time = new Date;
    return '@' + time.toDateString() + '/' + time.toLocaleTimeString();
}
function logIt(...arg) {
    FS.appendFileSync('log.txt', `${timeStamp()} -${arg}\n`);
}