const mongoose = require('mongoose');
const { Schema } = mongoose;

const RulesSchema = new Schema({
  title: String,
  description: String
});

mongoose.model('Rules', RulesSchema);
