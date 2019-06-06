const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require ('mongoose'),
  Models = require('./model.js');

const app = express();
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/potatoes', {useNewUrlParser: true});

// logging info-morgan and bodyParser
app.use(morgan('common'));
app.use(bodyParser.json());

//static public folders
app.use(express.static('public'));

// Movie responses
app.get('/', (req, res) => {
  res.send('Welcome to some healthy potatos?');
});

//Gets json list of all movies
app.get('/movies', (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
});

//Gets info of a single movie by title name
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ title: req.params.title })
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
});

// find a movies genre by title-
app.get('/movies/:title/genre', (req, res) => {
  Movies.findOne({ title: req.params.title })
  .then((movie) => {
    if (movie) {
    res.status(201).send(req.params.title + '\'s genre is ' + movie.genre.name);
  } else {
    res.status(400).send(req.params.title + ' not found');
  }
})
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
});

// find director by title
app.get('/movies/:title/director', (req, res) => {
  Movies.findOne({ title: req.params.title })
    .then((movie) => {
      if (movie) {
        res.status(201).send('The director for ' + movie.title + ' is ' + movie.director.name);
      } else {
        res.status(400).send('Director not found');
        }
    })
    .catch((err) => {
      res.status(500).send('Error ' + err)
    });
  });

// director information for all movies. -currently not working
// app.get('/directors', (req, res) => {
//   Movies.find()
//       .then((movies) => {
//           res.status(201).json(movies.director) //movies.director to return all directors?
//       })
//       .catch((err) => {
//           console.error(err);
//           res.status(500).send("Error: " + err);
//       });
// });

//Find a directors information by name
app.get('/directors/:director', (req, res) => {
  Movies.findOne({ 'director.name': req.params.director })
  .then((movie) => {
    res.json(movie.director);
  })
  .catch((err) => {
    res.status(500).send('Error ' + err);
  });
});

// USER INFORMATION

//create user
app.post('/users', (req, res) => {
  Users.findOne({ username: req.body.username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.username + ' already exists');
    }
      Users.create({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        birthday: req.body.birthday,
      })
      .then((user) => { res.status(201).json(user); })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error ' + error);
      });
  }).catch((error) => {
    console.error(error);
    res.status(505).send('Error ' + error);
  });
});

//get all users
app.get('/users', (req, res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
});

//get single user by username
app.get('/users/:username', (req, res) => {
  Users.findOne({ username: req.params.username })
  .then((user) => {
    res.json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
});

//update user by id
app.put('/users/:username', (req, res) => {
  Users.findOneAndUpdate({ username: req.params.username }, { $set:
  {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    birthday: req.body.birthday,
  } },
  { upsert: true, new: true }, //This line makes sure the the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// delete USER by username
app.delete('/users/:username', (req, res) => {
  Users.findOneAndRemove({ username: req.params.username })
  .then((user) => {
    if (!user) {
    res.status(400).send(req.params.username + ' was not found');
  } else {
    res.status(200).send(req.params.username + ' was deleted');
  }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error ' + err);
  });
});

//add favorite movie
app.post('/users/:username/favoriteMovies/:movieId', (req, res) => {
  Users.findOneAndUpdate({ username: req.params.username }, {
    $push: { favoriteMovies: req.params.movieId }
  },
{ new: true }, //updated document is returned
(err, updatedUser) => {
  if (err) {
    console.log(err);
    res.status(500).send('Error ' + err)
  } else {
    res.json(updatedUser);
    }
  });
});

//remove favorite movie- can't get to work hmmm..
app.delete('/users/:username/favoriteMovies/:movieId', (req, res) => {
  Users.findOneAndUpdate({ username: req.params.username }, {
    $pull: { favoriteMovies: req.params.movieId }
  },
{ new: true }, //updated document is returned
(err, updatedUser) => {
  if (err) {
    console.log(err);
    res.status(500).send('Error ' + err)
  } else {
    res.json(updatedUser);
    }
  });
});

//static public folders
app.use(express.static('public'));

//error handingling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('You broke something');
});

// listening for requests
app.listen(8080, () =>
console.log('Your app is listening on port 8080')
);
