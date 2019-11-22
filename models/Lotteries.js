const mongoose = require('mongoose');
const { Schema } = mongoose;

const LotteriesSchema = new Schema({
  date: {type: Date, default: new Date()},
  members: [{ids: Number, winSumm: {type: Number, default: 0}}],
  statusLottery: {type: String, default: 'open'} // open, close
});

mongoose.model('Lotteries', LotteriesSchema);
