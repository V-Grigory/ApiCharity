let ObjectID = require('mongodb').ObjectID
let db = require('../db')

exports.all = (cb) => {
  db.get().collection('works').find().toArray((err, docs) => cb(err, docs))
}

exports.findById = (slug, cb) => {
  db.get().collection('works').findOne({_id: ObjectID(slug)}, (err, doc) => cb(err, doc))
}

exports.create = (work, cb) => {
  db.get().collection('works').insert(work, (err, result) => cb(err, result))
}

exports.update = (slug, newData, cb) => {
  db.get().collection('works').update({ _id: ObjectID(slug) }, newData, (err, result) => cb(err, result))
}

exports.delete = (slug, cb) => {
  db.get().collection('works').deleteOne({ _id: ObjectID(slug) }, (err, result) => cb(err, result))
}