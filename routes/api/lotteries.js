const mongoose = require('mongoose');
const router = require('express').Router();
const appConfig = require('../../config/app');
const auth = require('../auth');
const Users = mongoose.model('Users');
const lotteryController = require('../../controllers/lotteries');

router.post('/join', auth.required, (req, res, next) => {
  const { payload: { _id, role } } = req;

  if(!_id || !role) {
    return res.status(400).json({
      errors: 'Not exists data in token!'
    });
  }

  if(role === 'admin') {
    return res.status(400).json({
      errors: 'User with the admin role cannot participate in the lottery'
    });
  }

  Users.find({_id: _id, role: 'user'}, 'id balance').then((user) => {
    if(user.length === 0) {
      return res.status(400).json({
        errors: 'User does not exist'
      });
    }
    if(user[0].balance >= appConfig.balanceAmountForJoinLottery) {
      lotteryController.addUserToLottery(user[0]).then((v) => {
        return res.status(200).json({
          message: v
        });
      });
    } else {
      return res.status(400).json({
        errors: 'Balance not enough'
      });
    }
  })
  .catch(() => {
    // return res.status(500).json({
    //   errors: { message: 'Error BD' }
    // })
    return res.status(400).json({
      errors: 'User does not exist'
    });
  });

});

router.get('/timetostart', (req, res, next) => {
  return res.status(200).json({
    timetostart: lotteryController.timeToStart()
  });
});

router.get('/result', auth.required, (req, res, next) => {
  const { payload: { _id } } = req;
  Users.findById(_id, 'id balance').then(user => {
    if(user) {
      lotteryController.resultForUser(user).then(v => {
        return res.status(200).json(v)
      });
    } else {
      return res.status(400).json({
        errors: 'User does not exist'
      });
    }
  });
});

// router.get('/start', (req, res, next) => {
//   lotteryController.startLottery();
//   return res.status(200).json({
//     errors: 'Lottery started !!!'
//   });
// });

module.exports = router;
