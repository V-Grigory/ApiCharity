const mongoose = require('mongoose');

const { Schema } = mongoose;

const GoalsSchema = new Schema({
	type: String,
	title: String,
	description: String,
	params: String,
});

mongoose.model('Goals', GoalsSchema);