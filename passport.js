const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const Models = require('./models');

const Users = Models.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    (username, password, callback) => {
      console.log(`Received username: ${username}`);
      console.log(`Received password: ${password}`);

      Users.findOne({Username: username})
        .then((user) => {
          if (!user) {
            console.log('Incorrect username');
            return callback(null, false, {message: 'Incorrect username'});
          }

          if (!user.validatePassword(password)) {
            return callback(null, false, {message: 'Incorrect password'});
          }

          console.log('finished');
          return callback(null, user);
        })
        .catch((error) => {
          console.log(error);
          return callback(error);
        });
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret',
    },
    (jwtPayload, callback) =>
      // eslint-disable-next-line no-underscore-dangle
      Users.findById(jwtPayload._id)
        .then((user) => callback(null, user))
        .catch((error) => callback(error))
  )
);
