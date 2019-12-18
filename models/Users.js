const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const UsersSchema = new Schema({
  role: { type: String, default: 'user' },
  id: String,
  email: String,
  hash: String,
  salt: String,
	balance: { type: Number, default: 0 },
  billId: { type: String, default: '' },
  billStatus: { type: String, default: '' }
});

UsersSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UsersSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UsersSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60); // +60 дней к текущей дате

  return jwt.sign({
    email: this.email,
    _id: this._id,
    // id: this.id,
    role: this.role,
    exp: parseInt(expirationDate.getTime() / 1000, 10),
  }, 'secret');
};

UsersSchema.methods.toAuthJSON = function() {
  return {
    //_id: this._id,
    id: this.id,
    // role: this.role,
    email: this.email,
    balance: this.balance,
    token: this.generateJWT(),
  };
};

mongoose.model('Users', UsersSchema);
