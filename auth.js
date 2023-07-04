const jwtSecret = 'your_jwt_secret'; // Name has to be the same key used on the JWTStrategy

const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport'); // local passport file

const generateJWTToken = (user) => {
  jwt.sign(user, jwtSecret, {
    subject: user.Username, // username that is being encoded in the JWT
    expiresIn: '7d', // token will expire after 7 days
    algorithm: 'HS256', // algorithm used to 'sign' or encode the values of JWT
  });
};

// POST login
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', {session: false}, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: info ? info.message : 'Something is not right',
          user,
        });
      }
      req.login(user, {session: false}, (err) => {
        if (err) {
          res.send(err);
        }
        const token = generateJWTToken(user.toJSON());
        return res.json({user, token});
      });
    })(req, res);
  });
};
