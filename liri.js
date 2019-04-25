require ('dotenv').config ();
const axios = require("axios");
const keys = require ('./keys.js');
const Spotify = require ('node-spotify-api');
const spotify = new Spotify (keys.spotify);
const omdb = new (require ('omdbapi')) ('trilogy');
const bandsintown = require ('bandsintown') ('codingbootcamp');
const moment = require('moment');
const fs = require ('fs');
let movieId;

var inputCommand = process.argv[2];
var inputQuery = process.argv[3];
director(inputCommand, inputQuery)

function director (command, query) {
  switch (command) {
    case 'spotify-this-song':
      spotifyThis (query);
      break;

    case 'movie-this':
      movieThis (query);
      break;

    case 'concert-this':
      concertThis (query);
      break;

    case 'do-what-it-says':
      doWhatItSays ();
      break;
  }
}

function spotifyThis (query) {
  spotify.search ({type: 'track', query: query}, function (err, response) {
    if (err) {
      return console.log ('Error occurred: ' + err);
    }

    console.log ('');
    console.log ('');
    console.log ("\x1b[1m", response.tracks.items[0].name);
    console.log ("\x1b[0m", '---------------------');
    console.log ('Artist: ' + response.tracks.items[0].artists[0].name);
    console.log ('Album: ' + response.tracks.items[0].album.name);
    console.log ('Preview: ' + response.tracks.items[0].preview_url);
    console.log ('---------------------');
    console.log ('');
  });
}

function movieThis (query) {
  omdb
    .search ({
      search: query,
      type: 'movie',
    })
    .then (response => {
      movieId = response[0].imdbid;
      movieInfoSearch (movieId);
    })
    .catch (console.error);

  function movieInfoSearch (movieId) {
    omdb
      .get ({
        id: movieId,
        tomatoes: true,
      })
      .then (response => {
        console.log ('');
        console.log ('');
        console.log ("\x1b[1m", response.title);
        console.log ("\x1b[0m",'---------------------');
        console.log ('Release Year : ' + response.year);
        console.log ('IMDB Rating: ' + response.imdbrating);
        console.log ('Rotten Tomatoes Rating: ', response.ratings[1].value);
        console.log ('Country: ' + response.country);
        console.log ('Language: ', response.language);
        console.log (
          'Actors: ',
          response.actors[0] +
            ', ' +
            response.actors[1] +
            ', ' +
            response.actors[2] +
            ', ' +
            response.actors[3]
        );
        console.log ('---------------------');
        console.log ('');
        console.log ('');
      })
      .catch (console.error);
  }
}

function concertThis (query) {
  axios.get("https://rest.bandsintown.com/artists/" + query + "/events?app_id=codingbootcamp").then (
    function(response) {
      console.log(response)
      for (var i = 0; i <= response.data.length; i++) {
      console.log ('');
      console.log ('');
      console.log ('---------------------');
      console.log ('Location: ' + response.data[i].venue.name)
      console.log ('Date: ' + moment(response.data[i].datetime).format('MM/DD/YYYY'));
      console.log ('Additional Info: ' + response.data[i].description);
      console.log ('---------------------');
      console.log ('');
      }

    }
  )
}

function doWhatItSays () {
  fs.readFile("random.txt", "utf8", function(err, data) {
    if (err) throw err;
    var dataArr = data.split(",");
    director(dataArr[0], dataArr[1])
  })
}
