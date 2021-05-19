const router = require("express").Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { checkNewUserCredentials, checkLoginCredentials, checkUsernameExists, validateRoleName } = require('./auth-middleware');
const { JWT_SECRET } = require("../secrets"); // use this secret!

const Users = require("../users/users-model.js");

router.post("/register", checkNewUserCredentials, validateRoleName, (req, res, next) => {
  let user = req.body;

  const hashRounds = process.env.BCRYPT_ROUNDS || 12;
  const hashedPassword = bcrypt.hashSync(user.password, hashRounds);

  user.password = hashedPassword;

  Users.add(user)
    .then(savedUser => {
      res.status(201).json(savedUser);
    })
    .catch(next);

  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
});


router.post("/login", checkUsernameExists, checkLoginCredentials, (req, res, next) => { // eslint-disable-line
  const user = req.body;
  const tokenBuilder = (user) => {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role
    };
    const options = {
      expiresIn: '2h',
  
    };
    const result = jwt.sign(
      payload,
      JWT_SECRET,
      options
    );
    return result;
  }
  const token = tokenBuilder(user);
  res.status(200).json({
    message: `${user.username} is back!`,
    token: token
  });

  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
});

module.exports = router;
