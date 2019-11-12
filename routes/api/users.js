const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
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

  Users.findOne({ email: user.email })
    .then((v) => {
      if(v) {
        return res.status(422).json({
          errors: { message: 'This email already exist' }
        })
      }
      createUser()
    })
    .catch(() => {
      return res.status(500).json({
        errors: { message: 'Error BD' }
      })
    });

  const createUser = () => {
    const finalUser = new Users(user);

    finalUser.setPassword(user.password);

    return finalUser.save()
        .then(() => res.json({ user: finalUser.toAuthJSON() }));
  }
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
      user.token = passportUser.generateJWT();

      return res.json({ user: user.toAuthJSON() });
    }

    return status(400).info;
  })(req, res, next);
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
