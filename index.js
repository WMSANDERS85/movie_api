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
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(`Error ${err}`);
    });
});

// Gets the data about a single movie by title
app.get('/movies/:title', (req, res) => {
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
});

// return a list of movies by genre
app.get('/movies/genres/:genreName/movies', (req, res) => {
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
});

// Get detail about a genre by name
app.get('/movies/genres/:genreName', (req, res) => {
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
});

// Get all details about director by name
app.get('/movies/directors/:directorName', (req, res) => {
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
});

// Return a list of movies by a certain director

app.get('/movies/directors/:directorName/movies', (req, res) => {
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
});

// get a list of all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(`Error ${err}`);
    });
});

// Allow new users to register
app.post('/users', (req, res) => {
  Users.findOne({Username: req.body.Username}).then((user) => {
    if (user) {
      return res.status(400).send(`${req.body.Username} already exists`);
    }
    Users.create({
      Username: req.body.Username,
      Password: req.body.Password,
      Birthday: req.body.Birthday,
    })

      .then((user) => {
        res.status(201).json(user).send(`${user} has been added sucessfully`);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(`Error: ${err}`);
      });
  });
});

// Allow users to update username and information.
app.put('/users/:username', (req, res) => {
  const {username} = req.params;
  const {newUsername, password, email, birthday} = req.body;

  // Remember to hash the password before storing!
  const update = {};
  if (newUsername) update.Username = newUsername;
  if (password) update.Password = password;
  if (email) update.Email = email;
  if (birthday) update.Birthday = birthday;

  console.log(`Username: ${username}`); // Debugging statement
  console.log(`Update object: ${JSON.stringify(update)}`); // Debugging statement

  Users.findOneAndUpdate(
    {Username: username},
    {$set: update},
    {new: true, useFindAndModify: false}
  )
    .then((user) => {
      if (!user) {
        console.log('No user found to update'); // Debugging statement
        res.status(404).send(`User with the username ${username} not found.`);
        return;
      }
      console.log(`Updated user: ${JSON.stringify(user)}`); // Debugging statement
      res.status(200).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('An error occurred');
    });
});

// Allow users to add a movie to their list of top movies
app.put('/users/:username/topMovies/:title', (req, res) => {
  const {username, title} = req.params;

  const userIndex = users.findIndex((user) => user.username === username);
  const movieIndex = movies.findIndex(
    (movie) => movie.title.toLowerCase() === title.toLowerCase()
  );

  if (userIndex === -1) {
    res.status(404).send(`User with the username ${username} not found.`);
    return;
  }

  if (movieIndex === -1) {
    res.status(404).send(`Movie with the title ${title} not found.`);
    return;
  }

  users[userIndex].topMovies.push(movies[movieIndex]);
  res.status(200).json({
    user: users[userIndex],
    message: 'Movie added to top movies successfully',
  });
});

// Allow users to remove a movie from their list of top movies
app.delete('/users/:username/topMovies/:title', (req, res) => {
  const {username, title} = req.params;

  const userIndex = users.findIndex((user) => user.username === username);

  if (userIndex === -1) {
    res.status(404).send(`User with the username ${username} not found.`);
    return;
  }

  const movieIndex = users[userIndex].topMovies.findIndex(
    (movie) => movie.title.toLowerCase() === title.toLowerCase()
  );

  if (movieIndex === -1) {
    res
      .status(404)
      .send(
        `Movie with the title ${title} not found in the user's top movies list.`
      );
    return;
  }

  users[userIndex].topMovies.splice(movieIndex, 1);
  res.status(200).json({
    user: users[userIndex],
    message: 'Movie removed from top movies successfully',
  });
});

// Allow users to unregister
app.delete('/users/:username', (req, res) => {
  const {username} = req.params;

  const userIndex = users.findIndex((user) => user.username === username);

  if (userIndex === -1) {
    res.status(404).send(`User with the username ${username} not found.`);
    return;
  }

  users.splice(userIndex, 1);
  res.status(200).send(`User ${username} was successfully unregistered.`);
});

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
