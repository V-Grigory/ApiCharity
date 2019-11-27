const mongoose = require('mongoose');
const { Schema } = mongoose;

const GoalsSchema = new Schema({
	type: {type: String, default: ''},
	title: {type: String, default: ''},
	description: {type: String, default: ''}
});

mongoose.model('Goals', GoalsSchema);
