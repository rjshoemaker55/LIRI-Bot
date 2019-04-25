require ('dotenv').config ();
const axios = require ('axios');
const keys = require ('./keys.js');
const Spotify = require ('node-spotify-api');
const spotify = new Spotify (keys.spotify);
const omdb = new (require ('omdbapi')) ('trilogy');
const bandsintown = require ('bandsintown') ('codingbootcamp');
const moment = require ('moment');
const inquirer = require ('inquirer');
const fs = require ('fs');
let movieId;

function start () {
  console.log ('');
  inquirer
    .prompt ([
      {
        type: 'list',
        name: 'todoinput',
        message: 'What would you like to do?',
        choices: [
          'Song Search',
          'Movie Search',
          'Concert Search',
          "Search What's in Random.txt",
        ],
      },
    ])
    .then (function (response) {
      director (response.todoinput);
    });
  return;
}

function director (command) {
  switch (command) {
    case 'Song Search':
      inquirer
        .prompt ([
          {
            type: 'input',
            name: 'songinput',
            message: 'Song:',
          },
        ])
        .then (function (response) {
          spotifyThis (response.songinput.replace (/ /g, '+'));
        });
      break;

    case 'Movie Search':
      inquirer
        .prompt ([
          {
            type: 'input',
            name: 'movieinput',
            message: 'Movie:',
          },
        ])
        .then (function (response) {
          movieThis (response.movieinput.replace (/ /g, '+'));
        });
      break;

    case 'Concert Search':
      inquirer
        .prompt ([
          {
            type: 'input',
            name: 'concertinput',
            message: 'Artist:',
          },
        ])
        .then (function (response) {
          concertThis (response.concertinput.replace (/ /g, '+'));
        });
      break;

    case "Search What's in Random.txt":
      doWhatItSays ();
      break;
  }
}

function spotifyThis (query) {
  spotify.search ({type: 'track', query: query}, function (err, response) {
    if (err) {
      return console.log ('Error occurred: ' + err);
    }

    var spotifyInfo = {
      Name: response.tracks.items[0].name,
      Artist: response.tracks.items[0].artists[0].name,
      Album: response.tracks.items[0].album.name,
      Preview: response.tracks.items[0].preview_url,
    };

    fs.appendFile ('log.txt', JSON.stringify (spotifyInfo, null, 4), err => {
      if (err) throw err;

    });

    console.log ('');
    console.log ('');
    console.log ('\x1b[1m', spotifyInfo.Name);
    console.log ('\x1b[33m', '---------------------');
    console.log ('\x1b[32m', 'Artist: ' + spotifyInfo.Artist);

    console.log ('Album: ' + spotifyInfo.Album);
    console.log ('Preview: ' + spotifyInfo.Preview);
    console.log ('\x1b[33m', '---------------------');
    console.log ('\x1b[0m', '');
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
}

function movieInfoSearch (movieId) {
  omdb
    .get ({
      id: movieId,
      tomatoes: true,
    })
    .then (response => {
      var movieInfo = {
        Title: response.title,
        Year: response.year,
        IMDB_Rating: response.imdbrating,
        Rotten_Tomatoes_Rating: response.ratings[1].value,
        Country: response.country,
        Language: response.language,
        Actors: [
          response.actors[0],
          response.actors[1],
          response.actors[2],
          response.actors[3],
        ],
        Plot: response.plot,
      };

      fs.appendFile ('log.txt', JSON.stringify (movieInfo, null, 4), err => {
        // throws an error, you could also catch it here
        if (err) throw err;

      });

      console.log ('');
      console.log ('');
      console.log ('\x1b[1m', movieInfo.Title);
      console.log ('\x1b[33m', '---------------------');
      console.log ('\x1b[32m', 'Release Year : ' + movieInfo.Year);
      console.log ('IMDB Rating: ' + movieInfo.IMDB_Rating);
      console.log (
        'Rotten Tomatoes Rating: ',
        movieInfo.Rotten_Tomatoes_Rating
      );
      console.log ('Country: ' + movieInfo.Country);
      console.log ('Language: ', movieInfo.Language);
      console.log (
        'Actors: ',
        movieInfo.Actors[0] +
          ', ' +
          movieInfo.Actors[1] +
          ', ' +
          movieInfo.Actors[2] +
          ', ' +
          movieInfo.Actors[3]
      );
      console.log ('Plot' + movieInfo.Plot);
      console.log ('\x1b[33m', '---------------------');
      console.log ('\x1b[0m', '');
      console.log ('');
    })
    .catch (console.error);
}

function concertThis (query) {
  axios
    .get (
      'https://rest.bandsintown.com/artists/' +
        query +
        '/events?app_id=codingbootcamp'
    )
    .then (function (response) {
      for (var i = 0; i < response.data.length; i++) {
        var concertInfo = {
          Location: response.data[i].venue.name,
          Date: moment (response.data[i].datetime).format ('MM/DD/YYYY'),
          Additional_Info: response.data[i].description,
        };
        fs.appendFile (
          'log.txt',
          JSON.stringify (concertInfo, null, 4),
          err => {

            if (err) throw err;

          }
        );

        console.log ('');
        console.log ('');
        console.log ('\x1b[33m', '---------------------');
        console.log ('\x1b[32m', 'Location: ' + concertInfo.Location);
        console.log ('Date: ' + concertInfo.Date);
        console.log ('Additional Info: ' + concertInfo.Additional_Info);
        console.log ('\x1b[33m', '---------------------');
        console.log ('\x1b[0m', '');
      }
    });
}

function doWhatItSays () {
  fs.readFile ('random.txt', 'utf8', function (err, data) {
    if (err) throw err;
    var dataArr = data.split (',');

    switch (dataArr[0]) {
      case 'spotify-this-song':
        spotifyThis (dataArr[1]);
        break;

      case 'movie-this':
        movieThis (dataArr[1]);
        break;

      case 'concert-this':
        concertThis (dataArr[1]);
        break;
    }
  });
}

start ();
