const mongoose = require('mongoose');
const { Schema } = mongoose;

const ImagesSchema = new Schema({
  goal_id: mongoose.Schema.Types.ObjectId,
  url: {type: String, default: ''}
});

mongoose.model('Images', ImagesSchema);
