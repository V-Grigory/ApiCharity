const mongoose = require('mongoose');
const Lotteries = mongoose.model('Lotteries');

const addUserToLottery = (user) => {
  return new Promise((responce, reject) => {
    Lotteries.findOne().sort({_id: -1}).then((lottery) => {
      if(!lottery) {
        let dataLottery = {
          members: [{ids: user.id}]
        };
        const createLottery = new Lotteries(dataLottery);
        return createLottery.save();
      }

      responce()
    })
  })
};

module.exports = lotteryController = {
  addUserToLottery
};
