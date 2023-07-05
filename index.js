const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Models = require('./models');

const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.use(morgan('common'));

app.use(express.static('public'));

const auth = require('./auth')(app);

const passport = require('passport');

require('./passport');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/cfDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/', (req, res) => {
  res.send('Pardon our dust, movie database is under construction');
});

// Gets the list of data about all movies
app.get(
  '/movies',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(`Error ${err}`);
      });
  }
);

// Gets the data about a single movie by title
app.get(
  '/movies/:title',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const title = new RegExp(`^${req.params.title}$`, 'i');

    Movies.findOne({Title: {$regex: title}})
      .then((movie) => {
        if (movie) {
          res.status(200).json(movie);
          return;
        }
        res.status(404).send('No movie found with that title');
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(`Server error: ${err}`);
      });
  }
);

// return a list of movies by genre
app.get(
  '/movies/genres/:genreName/movies',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const {genreName} = req.params;
    const regex = new RegExp(`^${genreName}$`, 'i'); // case-insensitive search

    Movies.find({'Genre.Name': {$regex: regex}})
      .select('Title')
      .then((movieTitles) => {
        if (movieTitles.length === 0) {
          return res.status(404).send(`Genre ${genreName} was not found`);
        }
        res.status(200).json(movieTitles);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
      });
  }
);

// Get detail about a genre by name
app.get(
  '/movies/genres/:genreName',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const {genreName} = req.params;
    const genreQuery = new RegExp(`^${genreName}$`, 'i'); // case-insensitive search

    Movies.findOne({'Genre.Name': {$regex: genreQuery}})
      .select('Genre')
      .then((genre) => {
        if (!genre) {
          return res.status(404).send(`Genre ${genreName} was not found`);
        }
        res.status(200).json(genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
      });
  }
);

// Get all details about director by name
app.get(
  '/movies/directors/:directorName',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const {directorName} = req.params;
    const directorQuery = new RegExp(`^${directorName}$`, 'i'); // case insensitive search

    Movies.findOne({'Director.Name': {$regex: directorQuery}})
      .select('Director')
      .then((director) => {
        if (!director) {
          return res.status(404).send(`Director ${directorName} was not found`);
        }
        res.status(200).json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(`Error ${err}`);
      });
  }
);

// Return a list of movies by a certain director

app.get(
  '/movies/directors/:directorName/movies',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const {directorName} = req.params;
    const regex = new RegExp(`^${directorName}$`, 'i'); // case-insensitive search

    Movies.find({'Director.Name': {$regex: regex}})
      .select('Title')
      .then((movieTitles) => {
        if (movieTitles.length === 0) {
          return res.status(404).send(`No movies found by ${directorName}`);
        }
        res.status(200).json(movieTitles);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
      });
  }
);

// get a list of all users
app.get(
  '/users',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(`Error ${err}`);
      });
  }
);

// Allow new users to register
app.post('/users', (req, res) => {
  Users.findOne({Username: req.body.Username})
    .then((user) => {
      if (user) {
        return res.status(400).send(`${req.body.Username} already exists`);
      }
      Users.create({
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
        FavoriteMovies: [],
      })
        .then((user) => {
          res.status(201).json({
            message: `${req.body.Username} has been added successfully`,
            user: user,
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send(`Error: ${err}`);
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(`Error: ${err}`);
    });
});

// Allow users to update username and information.
app.put(
  '/users/:username',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const currentUsername = req.params.username;
    function updateUser() {
      Users.findOneAndUpdate(
        {Username: currentUsername},
        {
          $set: {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          },
        },
        // This line is to specify that the following callback function will take the updated object as parameter
        {new: true}
      )
        .then((updatedUser) => {
          res.status(200).json({
            message: 'Profile has been updated',
            user: updatedUser,
          });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send(`Error: ${error}`);
        });
    }

    if (currentUsername !== req.body.Username) {
      Users.findOne({Username: req.body.Username}).then((user) => {
        if (user) {
          return res.status(409).send(`${req.body.Username} already exists.`);
        }
        updateUser();
      });
    }
    updateUser();
  }
);

// Allow users to add a movie to their list of top movies
app.post(
  '/users/:username/favoriteMovies/:movieid',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const {username, movieid: movieId} = req.params;
    Users.findOne({Username: username, FavoriteMovies: movieId})
      .then((movieIsPresent) => {
        if (movieIsPresent) {
          return res.status(409).send('Movie is already on your list.');
        }

        Users.findOneAndUpdate(
          {Username: username},
          {$addToSet: {FavoriteMovies: movieId}},
          {new: true}
        )
          .then((updatedUser) => {
            res.status(200).json({
              message: 'Movie was successfully added',
              user: updatedUser,
            });
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send(`Error: '${error}`);
          });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(`Error: ${error}`);
      });
  }
);

// Allow users to remove a movie from their list of top movies
app.delete(
  '/users/:username/favoriteMovies/:movieid',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const {username, movieid: movieId} = req.params;
    Users.findOne({Username: username, FavoriteMovies: movieId})
      .then((movieIsPresent) => {
        if (!movieIsPresent) {
          return res.status(409).send('Movie is not in your list.');
        }

        Users.findOneAndUpdate(
          {Username: username},
          {$pull: {FavoriteMovies: movieId}},
          {new: true}
        )
          .then((updatedUser) => {
            res.status(200).json({
              message: 'Movie was successfully removed',
              user: updatedUser,
            });
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send(`Error: ${error}`);
          });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send(`Error: ${error}`);
      });
  }
);

// Allow users to unregister
app.delete(
  '/users/:username',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    const {username} = req.params;
    Users.findOneAndRemove({Username: username})
      .then((user) => {
        if (!user) {
          res.status(400).send(`${username} was not found`);
        }
        res.status(200).send(`${username} has been deleted`);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(`Error ${err}`);
      });
  }
);

app.get('/documentation', (req, res) => {
  res.sendFile('public/documentation.html', {root: __dirname});
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(8080, () => {
  console.log('Myflix is listening on port 8080');
});
