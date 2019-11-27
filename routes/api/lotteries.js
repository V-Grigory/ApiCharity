const mongoose = require('mongoose');
const router = require('express').Router();
const appConfig = require('../../config/app');
const auth = require('../auth');
const Users = mongoose.model('Users');
const lotteryController = require('../../controllers/lotteries');

router.post('/joinlottery', auth.required, (req, res, next) => {
  const { payload: { id, role } } = req;

  if(!id || !role) {
    return res.status(400).json({
      errors: { message: 'Not exists data in token!' }
    });
  }

  if(role === 'admin') {
    return res.status(400).json({
      errors: {
        message: 'User with the admin role cannot participate in the lottery'
      }
    });
  }

  Users.find({id: id, role: 'user'}, 'id balance').then((user) => {
    if(user.length === 0) {
      return res.status(400).json({
        errors: { message: 'User does not exist' }
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
        errors: { message: 'Balance not enough' }
      });
    }
  })
  .catch(() => {
    // return res.status(500).json({
    //   errors: { message: 'Error BD' }
    // })
    return res.status(400).json({
      errors: { message: 'User does not exist' }
    });
  });

});

module.exports = router;
