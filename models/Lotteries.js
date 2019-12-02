const mongoose = require('mongoose');
const { Schema } = mongoose;

const LotteriesSchema = new Schema({
  date: {type: Date},
  members: [{id: Number, winSum: {type: Number, default: 0}}],
  statusLottery: {type: String, default: 'open'} // open, close
});

mongoose.model('Lotteries', LotteriesSchema);
