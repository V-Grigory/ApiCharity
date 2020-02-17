const mongoose = require('mongoose');
const router = require('express').Router();
const appConfig = require('../../config/app');
const auth = require('../auth');
const Users = mongoose.model('Users');
const Lotteries = mongoose.model('Lotteries');
const lotteryController = require('../../controllers/lotteries');

router.post('/join', auth.required, (req, res, next) => {
  const { payload: { _id, role } } = req;

  if(!_id || !role) {
    return res.status(400).json({
      errors: 'Некорректный токен, отсутствуют данные!'
    });
  }

  if(role === 'admin') {
    return res.status(400).json({
      errors: 'Пользователь с ролью admin не может участвовать в лотерее'
    });
  }

  Users.find({_id: _id, role: 'user'}, 'id balance').then((user) => {
    if(user.length === 0) {
      return res.status(400).json({
        errors: 'Пользователь не существует'
      });
    }
    if(user[0].balance >= appConfig.balanceAmountForJoinLottery) {
      lotteryController.addUserToLottery(user[0])
      .then(v => {
        return res.status(200).json({ message: v });
      })
      .catch(v => {
        return res.status(400).json({ errors: v });
      });
    } else {
      return res.status(400).json({
        errors: 'Недостаточная сумма баланса'
      });
    }
  })
  .catch(() => {
    // return res.status(500).json({
    //   errors: { message: 'Error BD' }
    // })
    return res.status(400).json({
      errors: 'Пользователь не существует'
    });
  });

});

router.get('/checkjoin', auth.required, (req, res, next) => {
  const { payload: { _id } } = req;
  Users.findById(_id, 'id balance').then(user => {
    if(user) {
      lotteryController.checkAddedUserToLottery(user).then(v => {
        return res.status(200).json({ result: v })
      });
    } else {
      return res.status(400).json({
        errors: 'Пользователь не существует'
      });
    }
  });
});

router.get('/timetostart', (req, res, next) => {
  lotteryController.timeToStart()
    .then(v => {
      return res.status(200).json({ timetostart: v });
    })
    .catch(v => {
      return res.status(400).json({ errors: v });
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
        errors: 'Пользователь не существует'
      });
    }
  });
});

router.get('/checkclosedlotteryjoin', auth.required, (req, res, next) => {
  const { payload: { _id } } = req;
  Users.findById(_id, 'id balance').then(user => {
    if(user) {
      lotteryController.checkParticipateUserLastClosedLottery(user)
      .then(v => {
        return res.status(200).json({ result: v })
      });
    } else {
      return res.status(400).json({
        errors: 'Пользователь не существует'
      });
    }
  });
});

router.get('/winners', auth.required, (req, res, next) => {
  const { payload: { _id, role } } = req;

  if(!_id || !role) {
    return res.status(400).json({
      errors: 'Нет данных в токене!'
    });
  }

  if(role !== 'admin') {
    return res.status(400).json({
      errors: 'Пользователь должен иметь роль admin'
    });
  }

  Lotteries.findOne({statusLottery: 'close'}).sort({_id: -1})
    .then(lottery => {
      if(lottery) {
        if(lottery.members.length === 0) {
          return res.status(200).json([])
        }
        let winners = lottery.members
            .filter(v => v.winSum > 0).map(v => v.id);

        Users.find({id: winners}).then(users => {
          return res.status(200).json(
            users.map(v => { return { id: v.id, email: v.email } })
          )
        });
      } else {
        return res.status(200).json([])
        // responce('Lottery has not yet been finished')
      }
    })
});

// router.get('/start', (req, res, next) => {
//   lotteryController.startLottery();
//   return res.status(200).json({
//     errors: 'Lottery started !!!'
//   });
// });

module.exports = router;
