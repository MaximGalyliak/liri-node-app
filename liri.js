require("dotenv").config();

const KEYS = require('./keys.js');
const FS = require('fs');
const COMMAND = process.argv[2];

runCommand(COMMAND, input());

function input() {
    let name = process.argv[3];
    if (process.argv.length > 4) {
        for (var i = 4; i < process.argv.length; i++) {
            name += ' ' + process.argv[i];
        }
    }
    return name;
}
function getMovieInfo(name) {
    if (name == undefined) {
        name = 'Mr.Nobody';
    }
    const REQUEST = require('request');
    FS.appendFileSync('log.txt', `${timeStamp()} -movie-this- ${name}\n`);
    const url = 'http://www.omdbapi.com/?t=' + name + '&r=json&apikey=' + KEYS.omdb.key;

    REQUEST(url, (error, response, body) => {
        if (error || response.statusCode != 200) {
            console.log(`Sorry can't retrieve data, please try again later...`);
            FS.appendFile('log.txt', `ERROR: ${error}\nRESPONSE: ${response.statusCode} ${JSON.parse(body).error}\n`);
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
                FS.appendFileSync('log.txt', `OMDB response error: ${err}\n`);
            }
            FS.appendFileSync('log.txt', `Success!\n`);
        }
    });
}
function getMyTweets() {
    const TWITTER = require('twitter');
    const CLIENT = new TWITTER(KEYS.twitter);
    FS.appendFileSync('log.txt', `${timeStamp()} -my-tweets- loading tweets...\n`);
    CLIENT.get('statuses/user_timeline', { q: 'node.js' }, (error, tweets, response)=>{
        if (error) {
            console.log('Something went wrong with Twitter...');
            error.map((err) => {
                FS.appendFileSync('log.txt', `ERROR: ${err.message}\n`);
            });
        } else {
            tweets.map((tw) => {
                console.log(`${tw.created_at}\n${tw.user.name}: ${tw.text}\n`);
            });
            FS.appendFileSync('log.txt', 'Success!\n');
        }
    });
}
function spotifySong(name) {
    if(name == undefined){
        name = 'The+Sign+Ace+of+Base';
    }
    const SPOTIFY = require('node-spotify-api');
    const spotify = new SPOTIFY(KEYS.spotify);
    FS.appendFileSync('log.txt', `${timeStamp()} -spotify-this-song- ${name}\n`);
    spotify.search({ type: 'track', query: name, limit:'1'}, function (err, data) {
        if (err) {
            console.log('Something went wrong with Spotify...');
            FS.appendFileSync('log.txt',`ERROR: ${err}\n`);
        } else {
            let Track = data.tracks.items[0];
            console.log('ARTIST/s: ');
            Track.artists.map((artist)=>{
                console.log(`-${artist.name}`);
            });
            console.log(`TRACK: ${Track.name}`);
            console.log(`ALBUM: ${Track.album.name}`);
            console.log(`LINK:  ${Track.external_urls.spotify}`);
            FS.appendFileSync('log.txt', 'Success!\n');
        }
    });
    //TODO get spotify keys, set up api calls, log needed info into console and log.txt
}
function getWhatItSays() {
    FS.appendFileSync('log.txt', `${timeStamp()} -do-what-it-says- reading file...\n`)
    FS.readFile('random.txt', 'utf8', (err, data) => {
        if (err) {
            console.log('Something went wrong with file...');
            FS.appendFileSync('log.txt', `ERROR: ${err.message}\n`);
        } else {
            FS.appendFileSync('log.txt', `Success!\n`);
            var dataArr = data.split(',');
            if (dataArr[0] === 'do-what-it-says') {
                console.log("I ain't gonna loop!");
            } else {
                runCommand(dataArr[0], dataArr[1]);
            }
        }
    });
}
function timeStamp() {
    const time = new Date;
    return '@' + time.toDateString() + '/' + time.toLocaleTimeString();
}
function runCommand(command, name) {
    switch (command) {
        case 'movie-this': getMovieInfo(name); break;
        case 'my-tweets': getMyTweets(); break;
        case 'spotify-this-song': spotifySong(name); break;
        case 'do-what-it-says': getWhatItSays(); break;
        default: console.log('Invalid command!'); break;
    }
}