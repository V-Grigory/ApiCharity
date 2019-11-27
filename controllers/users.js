const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const appConfig = require('../config/app');

const takeOffBalance = (user) => {
  return new Promise((responce, reject) => {
    let updateData = {
      balance: Number(user.balance) - appConfig.balanceAmountForJoinLottery
    };
    Users.findByIdAndUpdate(user._id, updateData).then(v => {
      if(v) {
        responce();
      } else {
        reject();
      }
    })
  })
};

module.exports = userController = {
  takeOffBalance
};
