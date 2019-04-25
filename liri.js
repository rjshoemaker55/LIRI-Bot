require ('dotenv').config ();
var keys = require ('./keys.js');

const Spotify = require ('node-spotify-api');
const spotify = new Spotify (keys.spotify);
const omdb = new (require ('omdbapi')) ('trilogy');
const bandsintown = require ('bandsintown') ('codingbootcamp');
const fs = require ('fs');

var movieId;

var command = process.argv[2];
var query = process.argv[3];

switch (command) {
  case 'spotify-this-song':
    spotifyThis ();
    break;

  case 'movie-this':
    movieThis ();
    break;

  case 'concert-this':
    concertThis ();
    break;

  case 'do-what-it-says':
    doWhatItSays ();
    break;
}

function spotifyThis () {
  spotify.search ({type: 'track', query: query}, function (err, response) {
    if (err) {
      return console.log ('Error occurred: ' + err);
    }

    console.log ('');
    console.log ('');
    console.log (response.tracks.items[0].name);
    console.log ('---------------------');
    console.log ('Artist: ' + response.tracks.items[0].artists[0].name);
    console.log ('Album: ' + response.tracks.items[0].album.name);
    console.log ('Preview: ' + response.tracks.items[0].preview_url);
    console.log ('---------------------');
    console.log ('');
  });
}

function movieThis () {
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
        id: movieId, // optionnal (requires imdbid or title)
        tomatoes: true, // optionnal (get rotten tomatoes ratings)
      })
      .then (response => {
        console.log ('');
        console.log ('');
        console.log (response.title);
        console.log ('---------------------');
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

function concertThis () {
  bandsintown
    .getArtistEventList (query)
    .then (function (events) {
      console.log (events);
    })
    .catch (console.error);
}

// function doWhatItSays () {
//   fs.readFile("random.txt", "utf8", function(data) {
//     var dataArr = data.split(",");

// }),

// };
