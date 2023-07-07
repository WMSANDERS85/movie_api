const jwtSecret = 'your_jwt_secret'; // Name has to be the same key used on the JWTStrategy

const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport'); // local passport file

const generateJWTToken = (user) =>
  jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256',
  });

// POST login
// !do you need to hash password
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', {session: false}, (error, user, info) => {
      console.log('Error', error); // added
      console.log('User', user); // addded
      console.log('Info', info); // added
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
