const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const validate = require('../validate');
const Users = mongoose.model('Users');

router.post('/registration', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if(!user) {
    return res.status(422).json({
      errors: {
        user: 'object is required',
      },
    });
  }

  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  const checkAndPrepareData = () => {
    return new Promise((response, reject) => {
      Users.find({}, 'id email').then(users => {
        if(users.find(v => v.email === user.email)) {
          return res.status(422).json({
            errors: { message: 'This email already exist' }
          })
        }
        if(users.length === 0) {
          user.role = 'admin';
        }
        user.id = generateId(users);
        response();
      })
      .catch(() => {
        return res.status(500).json({
          errors: { message: 'Error BD' }
        })
      });
    });
  };

  const generateId = (users) => {
    const randomInteger = (min, max) => {
      let rand = min + Math.random() * (max - min + 1);
      return Math.round(rand);
    };
    let generatedId;
    do {
      generatedId = randomInteger(100000, 999999);
    } while (users.find(v => Number(v.id) === generatedId));
    return generatedId;
  };

  const createUser = () => {
    const finalUser = new Users(user);
    finalUser.setPassword(user.password);
    return finalUser.save().then(() =>
      res.json({ user: finalUser.toAuthJSON() })
    );
  };

  checkAndPrepareData().then(() => createUser())
});

router.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if(!user) {
    return res.status(422).json({
      errors: {
        email: 'user object is required',
      },
    });
  }

  if(!user.email) {
    return res.status(511).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(511).json({
      errors: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err) {
      // return next(err);
      return res.status(422).json({
        errors: {
          message: 'email or password: is invalid',
        },
      });
    }

    if(passportUser) {
      const user = passportUser;
      // user.token = passportUser.generateJWT();

      return res.json({ user: user.toAuthJSON() });
    }

    return status(400).info;
  })(req, res, next);
});

router.get('/:id', auth.required, (req, res, next) => {

  if( !validate.userId(req.params.id) ) {
    return res.status(400).json({
      errors: { message: 'Invalid user id' }
    });
  }

  Users.find({id: req.params.id}, 'id role email balance').then((user) => {
    if(user.length === 0) {
      return res.status(400).json({
        errors: { message: 'User does not exist' }
      });
    }
    const { payload: { id, role } } = req;

    if( (role && role === 'admin') || (id && id === req.params.id) ) {
      return res.json({ user: user });
    }

    return res.status(403).json({
      errors: { message: 'FORBIDDEN!' }
    });
  });
});

//GET current route (required, only authenticated users have access)
// router.get('/current', auth.required, (req, res, next) => {
//   const { payload: { id } } = req;
//
//   return Users.findById(id)
//     .then((user) => {
//       if(!user) {
//         return res.sendStatus(400);
//       }
//
//       return res.json({ user: user.toAuthJSON() });
//     });
// });

module.exports = router;
