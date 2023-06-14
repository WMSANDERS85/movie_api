const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();

const movies = [
  {
    title: 'Point Break',
    description:
      'An F.B.I. Agent goes undercover to catch a gang of surfers who may be bank robbers.',
    genre: {
      name: 'Action',
      description:
        'Action films are built around a core set of characteristics: spectacular physical action; a narrative emphasis on fights, chases, and explosions; and a combination of state-of-the-art special effects and stunt-work.',
    },
    director: {
      name: 'Kathryn Bigelow',
      bio: 'Kathryn Ann Bigelow is an American filmmaker. Covering a wide range of genres, her films include Near Dark, Point Break, Strange Days, K-19: The Widowmaker, The Hurt Locker, Zero Dark Thirty, and Detroit.',
      birth: '1951',
      death: 'N/A',
    },
    Released: '1991',
    imageUrl:
      'https://www.imdb.com/title/tt0102685/mediaviewer/rm1454182656/?ref_=tt_ov_i,',
    featured: 'true',
  },
  {
    title: 'Tombstone',
    description: `A successful lawman's plans to retire anonymously in Tombstone, Arizona are disrupted by the kind of outlaws he was famous for eliminating.`,
    genre: {
      name: 'Drama',
      description: `The drama genre features stories with high stakes and many conflicts. They're plot-driven and demand that every character and scene move the story forward.`,
    },
    director: {
      name: 'George P. Cosmatos',
      bio: 'George Pan Cosmatos was a Greek-Italian film director and screenwriter. Following early success in his home country with drama films such as Massacre in Rome.',
      birth: '1941',
      death: '2005',
    },
    Released: '1993',
    imageUrl:
      'https://www.imdb.com/title/tt0108358/mediaviewer/rm2107331584/?ref_=tt_ov_i',
    featured: false,
  },
  {
    title: 'Snatch',
    description:
      'Unscrupulous boxing promoters, violent bookmakers, a Russian gangster, incompetent amateur robbers and supposedly Jewish jewelers fight to track down a priceless stolen diamond.',
    genre: {
      name: 'Comedy',
      description:
        'Comedy is a genre of fiction that consists of discourses or works intended to be humorous or amusing by inducing laughter, especially in theatre, film, stand-up comedy, television, radio, books, or any other entertainment medium. ',
    },
    director: {
      name: 'Guy Ritchie',
      bio: 'Guy Stuart Ritchie is an English film director, producer and screenwriter. His work includes British gangster films, and the Sherlock Holmes films starring Robert Downey Jr. Ritchie left school at age 15 and worked entry-level jobs in the film industry before going on to direct television commercials.',
      birth: '1968',
      death: 'N/A',
    },
    Released: '2000',
    imageUrl:
      'https://www.imdb.com/title/tt0208092/mediaviewer/rm1248859904/?ref_=tt_ov_i',
    featured: true,
  },
];

const users = [
  {
    username: 'MovieLover123',
    password: 'Password',
    email: 'movielover123@gmail.com',
    topMovies: ['Point Break'],
  },
];

app.use(morgan('common'));

app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Pardon our dust, movie database is under construction');
});

// Gets the list of data about all movies
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

// Gets the data about a single movie by title
app.get('/movies/:title', (req, res) => {
  const foundMovie = movies.find(
    (movie) => movie.title.toLowerCase() === req.params.title.toLowerCase()
  );

  if (!foundMovie) {
    res
      .status(404)
      .send(`Movie with the title ${req.params.title} was not found`);
  } else {
    res.status(200).json(foundMovie);
  }
});
// return a list of movies by genre
app.get('/movies/genres/:genreName/movies', (req, res) => {
  const moviesByGenre = movies.filter(
    (movie) =>
      movie.genre &&
      movie.genre.name.toLowerCase() === req.params.genreName.toLowerCase()
  );

  if (moviesByGenre.length === 0) {
    res
      .status(404)
      .send(`No movies found with the genre ${req.params.genreName}`);
  } else {
    res.status(200).json(moviesByGenre);
  }
});

// Get detial about a genre by name
app.get('/movies/genres/:genreName', (req, res) => {
  const moviesByGenre = movies.filter(
    (movie) =>
      movie.genre &&
      movie.genre.name.toLowerCase() === req.params.genreName.toLowerCase()
  );

  if (moviesByGenre.length === 0) {
    res.status(404).send(`No genre found for genre ${req.params.genreName}`);
  } else {
    // create a new array with only the genre name and description
    const genres = moviesByGenre.map((movie) => ({
      name: movie.genre.name,
      description: movie.genre.description,
    }));

    // remove duplicate genre entries
    const uniqueGenres = [
      ...new Set(genres.map((genre) => JSON.stringify(genre))),
    ].map((genre) => JSON.parse(genre));
    res.status(200).json(uniqueGenres);
  }
});

// Get all details about director by name
app.get('/movies/directors/:directorName', (req, res) => {
  const moviesByDirector = movies.filter(
    (movie) =>
      movie.director &&
      movie.director.name.toLowerCase() ===
        req.params.directorName.toLowerCase()
  );

  if (moviesByDirector.length === 0) {
    res.status(404).send(`Director ${req.params.directorName} was not found`);
  } else {
    // create a new array with only the genre name and description
    const directors = moviesByDirector.map((movie) => ({
      name: movie.director.name,
      bio: movie.director.bio,
      birth: movie.director.birth,
      death: movie.director.death,
    }));
    // remove any duplicate entries
    const uniqueDirectors = [
      ...new Set(directors.map((director) => JSON.stringify(director))),
    ].map((director) => JSON.parse(director));
    res.status(200).json(uniqueDirectors);
  }
});

// Allow new users to register
app.post('/users', (req, res) => {
  const newUser = req.body;
  const userNameTaken = users.find(
    (user) => user.username === newUser.username
  );

  if (!newUser.username) {
    res.status(400).send('Please enter username.');
  } else if (userNameTaken) {
    res.status(400).send('Username is taken.');
  } else {
    newUser.topMovies = [];
    users.push(newUser);
    res.status(201).json(newUser);
  }
});

// Allow users to update username and information.
app.put('/users/username/:newUserName', (req, res) => {
  const {username} = req.params;
  const {newUsername, password, email} = req.body;

  const userIndex = users.findIndex((user) => user.username === username);

  if (userIndex === -1) {
    res.status(404).send(`User with the username &{username} not found.`);
    return;
  }

  if (newUsername) {
    const usernameExists = users.some((user) => user.username === newUsername);

    if (usernameExists) {
      res.status(400).send('Username is already taken.');
    } else {
      users[userIndex].username = newUsername;
    }
  }

  if (password) {
    users[userIndex].password = password;
  }
  if (email) {
    users[userIndex].email = email;
  }

  res.status(200).json({
    user: users[userIndex],
    message: 'User information updated successfully',
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
