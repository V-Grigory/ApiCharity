const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const utils = require('../../utils');
const Users = mongoose.model('Users');
const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');
const SECRET_KEY = 'eyJ2ZXJzaW9uIjoiUDJQIiwiZGF0YSI6eyJwYXlpbl9tZXJjaGFudF9zaXRlX3VpZCI6InUzbjI0Mi0wMCIsInVzZXJfaWQiOiI3OTIyNDgxOTAwMCIsInNlY3JldCI6ImQwNWQzNjViZDdmNzk4MGYyOGY2NDAxMzhmMGJhNmI2NzViYTgyNjNjMDI0NzNhM2JmMDM2MjU5NzQ4ODBjYzYifX0=';

router.post('/registration', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if( !utils.checkUserData(user).ok ) {
    return res.status(422).json({
      errors: utils.checkUserData(user).msg
    });
  }

  const checkAndPrepareData = () => {
    return new Promise((response, reject) => {
      Users.find({}, 'id email').then(users => {
        if(users.find(v => v.email === user.email)) {
          return res.status(422).json({
            errors: 'This email already exist'
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
          errors: 'Error BD'
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

  if( !utils.checkUserData(user).ok ) {
    return res.status(422).json({
      errors: utils.checkUserData(user).msg
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err) {
      // return next(err);
      return res.status(422).json({
        errors: 'email or password: is invalid'
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

router.get('/balance', auth.required, (req, res, next) => {
  const { payload: { _id } } = req;

  Users.findById(_id, 'balance billId billStatus').then(user => {
    if(user) {

      if (user.billStatus !== 'WAITING') {
        return res.json({ balance: user.balance });
      }

      if (user.billStatus === 'WAITING') {
        const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);

        qiwiApi.getBillInfo(user.billId).then(data => {
          console.log(data);
          let updData = {
            billStatus: data.status.value
          };
          if (data.status.value === 'PAID') {
            updData.balance = user.balance + Number(data.amount.value);
          }
          Users.findByIdAndUpdate(_id, updData, {new: true}).then((v) => {
            return res.json({ balance: v.balance });
          });

        }).catch(e => {
          // console.log(e);
          return res.status(400).json({
            errors: 'Error get balance'
          });
        });
      }

    } else {
      return res.status(400).json({
        errors: 'User does not exist'
      });
    }
  });
});

router.post('/increasebalance', auth.required, (req, res, next) => {
  const { payload: { _id } } = req;

  let { body: { sum } } = req;
  sum = Number(sum);
  if(!sum || sum <= 0) {
    return res.status(400).json({
      errors: 'Bill sum is incorrect'
    });
  }

  Users.findById(_id, '').then(user => {
    if(user) {
      const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);

      let qiwiApiCreateBill = (billId, fields) => {
        // return Promise.reject();
        // return Promise.resolve();
        return new Promise((responce, reject) => {
          qiwiApi.createBill( billId, fields )
            .then(data => responce(data))
            .catch(error => reject(error));
        })
      };

      const billId = user._id + '-' + new Date().getTime();
      const fields = {
        amount: sum,
        currency: 'RUB',
        comment: 'Тест 2. Проверка выставления счета.',
        expirationDateTime: qiwiApi.getLifetimeByDay(1)
        //email: 'example@mail.org',
        //account : 'client4563',
        //successUrl: 'http://test.ru/'
      };

      qiwiApiCreateBill(billId, fields).then(data => {
        // console.log(data);
        let updData = {
          billId: billId, billStatus: 'WAITING'
        };
        Users.findByIdAndUpdate(_id, updData).then(() => {
          // return res.json({ message: 'success increasebalance' });
          return res.json({ payUrl: data.payUrl });
        })
      }).catch(e => {
        // console.log(e);
        return res.status(400).json({
          errors: 'Error createBill'
        });
      });

    } else {
      return res.status(400).json({
        errors: 'User does not exist'
      });
    }
  });
});

/*
router.get('/bill/:action', auth.required, (req, res, next) => {

  let allowRoutes = ['create', 'getinfo'];
  if (!allowRoutes.includes(req.params.action)) {
    return res.status(400).json({
      errors: { message: 'This route does not exist' }
    });
  }

  const { payload: { _id } } = req;

  Users.findById(_id, 'billId billStatus').then(user => {
    if(user) {
      const QiwiBillPaymentsAPI = require('@qiwi/bill-payments-node-js-sdk');
      const SECRET_KEY = 'eyJ2ZXJzaW9uIjoiUDJQIiwiZGF0YSI6eyJwYXlpbl9tZXJjaGFudF9zaXRlX3VpZCI6InUzbjI0Mi0wMCIsInVzZXJfaWQiOiI3OTIyNDgxOTAwMCIsInNlY3JldCI6ImQwNWQzNjViZDdmNzk4MGYyOGY2NDAxMzhmMGJhNmI2NzViYTgyNjNjMDI0NzNhM2JmMDM2MjU5NzQ4ODBjYzYifX0=';
      const qiwiApi = new QiwiBillPaymentsAPI(SECRET_KEY);

      // ==== выставляем счет ====
      if (req.params.action === 'create') {

        let { body: { sum } } = req;
        sum = Number(sum);
        if(!sum || sum <= 0) {
          return res.status(400).json({
            errors: { message: 'Bill sum is incorrect' }
          });
        }

        let qiwiApiCreateBill = (billId, fields) => {
          // return Promise.reject();
          return Promise.resolve();
          return new Promise((responce, reject) => {
            qiwiApi.createBill( billId, fields )
              .then(data => responce(data))
              .catch(error => reject(error));
          })
        };

        const billId = user._id + '-' + new Date().getTime();
        const fields = {
          amount: sum,
          currency: 'RUB',
          comment: 'Тест 2. Проверка выставления счета.',
          expirationDateTime: qiwiApi.getLifetimeByDay(1)
          //email: 'example@mail.org',
          //account : 'client4563',
          //successUrl: 'http://test.ru/'
        };

        qiwiApiCreateBill(billId, fields).then(data => {
          // console.log(data);
          let updData = {billId: billId, billStatus: 'WAITING'};
          Users.findByIdAndUpdate(_id, updData).then(() => {
            return res.json({ message: 'success createBill' });
          })
        }).catch(e => {
          // console.log(e);
          return res.status(400).json({
            errors: { message: 'Error createBill' }
          });
        });
      }

      // ==== получаем инфо о счете ====
      if (req.params.action === 'getinfo') {

        if (user.billStatus === 'PAID') {
          return res.json({ message: 'success createBill' });
        }
        console.log(user)
        // qiwiApi.getBillInfo(billId).then( data => {
        //   console.log(data);
        //   return res.json({ billInfo: data });
        // });
      }

    } else {
      return res.status(400).json({
        errors: { message: 'User does not exist' }
      });
    }
  });
});
*/

/*
router.get('/:id', auth.required, (req, res, next) => {

  if( !utils.validateUserId(req.params.id) ) {
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

router.delete('/:id', auth.required, utils.accessOnlyAdmin, (req, res, next) => {

  if( !utils.validateUserId(req.params.id) ) {
    return res.status(400).json({
      errors: { message: 'Invalid user id' }
    });
  }

  Users.find({id: req.params.id}, 'id role').then((user) => {
    if(user.length === 0) {
      return res.status(400).json({
        errors: { message: 'User does not exist' }
      });
    }
    if(user[0].role === 'admin') {
      return res.status(400).json({
        errors: { message: 'Admins are protected from deletion!' }
      });
    }
    Users.deleteOne({ id: user[0].id }, function (err) {
      if (err) {
        return res.status(400).json({
          errors: { message: 'Error delete user' }
        });
      }
      return res.status(200).json({
        success: {
          message: 'User successfully deleted!',
        },
      });
    });
  });
});
*/

module.exports = router;
