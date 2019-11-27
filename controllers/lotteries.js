const mongoose = require('mongoose');
const Lotteries = mongoose.model('Lotteries');
const userController = require('../controllers/users');

const addUserToLottery = (user) => {
  return new Promise((responce, reject) => {
    Lotteries.findOne().sort({_id: -1}).then((lottery) => {
      if(!lottery) {
        let dataLottery = {
          members: [{id: user.id}]
        };
        new Lotteries(dataLottery).save();
        userController.takeOffBalance(user);
        responce('User successfully joined the lottery')
      } else {
        if(!lottery.members.find(v => Number(v.id) === Number(user.id))) {
          lottery.members.push({id: user.id});
          let query = {_id: lottery._id};
          let updData = {members: lottery.members};
          Lotteries.findOneAndUpdate(query, updData).then(() => {
            userController.takeOffBalance(user);
            responce('User successfully joined the lottery')
          })
        } else {
          responce('User already joined the lottery')
        }
      }
    })
  })
};

module.exports = lotteryController = {
  addUserToLottery
};
