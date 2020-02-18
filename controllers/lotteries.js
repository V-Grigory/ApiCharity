const mongoose = require('mongoose');
const logger = require('../logger');
const Lotteries = mongoose.model('Lotteries');
const userController = require('../controllers/users');

const dateLottery = (day = '') => {
  let d = new Date();
  if(day === 'tomorrow') {
    d.setDate(d.getDate() + 1);
  }
  d.setUTCHours(15);
  d.setUTCMinutes(0);
  d.setUTCSeconds(0);
  return d;
};

const addUserToLottery = (user) => {
  return new Promise((responce, reject) => {
    Lotteries.findOne().sort({_id: -1}).then((lottery) => {
      if(lottery) {
        if(lottery.members.find(v => Number(v.id) === Number(user.id))) {
          reject('Пользователь уже участвует в лотерее');
        } else {
          lottery.members.push({id: user.id});
          let query = {_id: lottery._id};
          let updData = {members: lottery.members};
          Lotteries.findOneAndUpdate(query, updData).then(() => {
            userController.takeOffBalance(user);
            responce('Пользовател успешно добавлен в участники');
          })
        }
      } else {
        reject('Нет открытых лотерей');
      }
    })
  })
};

const checkAddedUserToLottery = (user) => {
  return new Promise((responce, reject) => {
    Lotteries.findOne().sort({_id: -1}).then(lottery => {
      if(lottery) {
        if(lottery.members.find(v => Number(v.id) === Number(user.id))) {
          return responce(true);
        } else {
          return responce(false)
        }
      } else {
        return responce(false)
      }
    })
  })
};

const checkParticipateUserLastClosedLottery = (user) => {
  return new Promise((responce, reject) => {
    Lotteries.findOne({statusLottery: 'close'}).sort({_id: -1})
    .then(lottery => {
      if(lottery) {
        if(lottery.members.find(v => Number(v.id) === Number(user.id))) {
          return responce(true);
        } else {
          return responce(false)
        }
      } else {
        return responce(false)
      }
    })
  })
};

const startLottery = () => {
  Lotteries.findOne().sort({_id: -1}).then(lottery => {
    if(lottery) {
      // let usersWin = [];
      if(lottery.members.length >= 8) {
        lottery.members[0].winSum = 10;
        lottery.members[3].winSum = 10;
        lottery.members[7].winSum = 10;
      }
      if(lottery.members.length >= 4) {
        lottery.members[0].winSum = 10;
        lottery.members[3].winSum = 10;
      }
      if(lottery.members.length >= 1) {
        lottery.members[0].winSum = 10;
      }
      let query = {_id: lottery._id};
      let updData = {
        statusLottery: 'close',
        members: lottery.members
      };
      Lotteries.findOneAndUpdate(query, updData)
      .then(() => {
        new Lotteries({date: dateLottery('tomorrow')}).save()
        .then(() => logger.logSuccess('New loterry started'))
        .catch(e => logger.logError(e));
      })
      .catch(e => logger.logError(e))
    } else {
      new Lotteries({date: dateLottery('tomorrow')}).save()
      .then(() => logger.logSuccess('New loterry started'))
      .catch(e => logger.logError(e));
    }
  })
  .catch(e => logger.logError(e))
};

const timeToStart = () => {
  return new Promise((responce, reject) => {
    Lotteries.findOne().sort({_id: -1}).then(lottery => {
      if (lottery) {
        return responce(lottery.date - new Date())
      }
      return reject ('Нет открытых лотерей')
    })
  });
  //return dateLottery() - new Date()
};

const resultForUser = (user) => {

  const formatLotteryDate = (lotteryDate) => {
    const d = new Date(lotteryDate);
    let day = d.getUTCDate();
    let month = d.getUTCMonth();
    month = Number(month) + 1;
    if(month.toString().length === 1) {
      month = '0' + month.toString();
    }
    let year = d.getUTCFullYear();

    return `${day}.${month}.${year}`;
  };

  return new Promise((responce, reject) => {
    Lotteries.findOne({statusLottery: 'close'}).sort({_id: -1})
    .then(lottery => {
      if(lottery) {
        let userWin = lottery.members.find(v => {
          return (Number(v.id) === Number(user.id)) && v.winSum > 0
        });
        let lotteryDate = formatLotteryDate(lottery.date);
        if(userWin) {
          responce({
            iswin: true,
            message: 'По результатам проведения акции ' +
                '( с 20.00 ' + lotteryDate + ' по 20.00 ' + lotteryDate + ' ) ' +
                'вы стали победителем!',
            sum: userWin.winSum
          })
        } else {
          responce({
            iswin: false,
            message: 'По результатам проведения акции ' +
                '( с 20.00 ' + lotteryDate + ' по 20.00 ' + lotteryDate + ' ) ' +
                'к сожалению вы не стали победителем, но помните, ' +
                'что вы помогаете тем, кто в этом действительно нуждается, ' +
                'большое вам спасибо'
          })
        }
      } else {
        responce('Лотерея еще не завершена')
      }
    })
  })
};

module.exports = lotteryController = {
  addUserToLottery,
  checkAddedUserToLottery,
  checkParticipateUserLastClosedLottery,
  startLottery,
  timeToStart,
  resultForUser
};
