const express = require('express');
const morgan = require('morgan');

const app = express();

const topMovies = [
  {
    Title: 'Point Break',
    Director: 'Kathryn Bigelow',
    Released: '1991',
  },
  {
    Title: 'Tombstone',
    Director: 'George P. Cosmatos - Kevin Jarre',
    Released: '1993',
  },
  {
    Title: 'Snatch',
    Director: 'Guy Ritchie',
    Released: '2000',
  },
  {
    Title: 'Legend',
    Director: 'Brian Helgeland',
    Released: '2015',
  },
  {
    Title: 'The Outsiders',
    Director: 'Francis Ford Coppola',
    Released: '1983',
  },
  {
    Title: 'Back to the Future',
    Director: 'Robert Zemeckis',
    Released: '1985',
  },
  {
    Title: 'The Goonies',
    Director: 'Richard Donner',
    Released: '1985',
  },
  {
    Title: 'The Dark Knight',
    Director: 'Christopher Nolan',
    Released: '2008',
  },
  {
    Title: 'Tropic Thunder',
    Director: 'Ben Stiller',
    Released: '2008',
  },
  {
    Title: 'Top Gun',
    Director: 'Tony Scott',
    Released: '1986',
  },
];

app.use(morgan('common'));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Pardon our dust, movie database is under construction');
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
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
