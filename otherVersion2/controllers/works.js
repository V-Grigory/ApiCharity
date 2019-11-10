let Works = require('../models/works')

exports.all = (req, res) => {
  Works.all((err, docs) => {
    if(err) {
      console.log(err)
      return res.sendStatus(500)
    }
    res.send(docs)
  })
}

exports.findById = (req, res) => {
  Works.findById(req.params.slug, (err, doc) => {
    if(err) {
      console.log(err)
      return res.sendStatus(500)
    }
    res.send(doc)
  })
}

exports.create = (req, res) => {
  let work = {
    name: req.body.name
  }
  Works.create(work, (err, result) => {
    if(err) {
      console.log(err)
      return res.sendStatus(500)
    }
    res.send(work)
  })
}

exports.update = (req, res) => {
  Works.update(req.params.slug, { name: req.body.name }, (err, result) => {
    if(err) {
      console.log(err)
      return res.sendStatus(500)
    }
    res.sendStatus(200)
  })
}

exports.delete = (req, res) => {
  Works.delete(req.params.slug, (err, result) => {
    if(err) {
      console.log(err)
      return res.sendStatus(500)
    }
    res.sendStatus(200)
  })
}