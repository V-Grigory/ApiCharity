let MongoClient = require('mongodb').MongoClient

let state = {
  db: null
}

exports.connect = (url, done) => {
  if(state.db) {
    return done()
  }

  MongoClient.connect(url, (err, client) => {
    if(err) {
      return done(err)
    }
    state.db = client.db('myApi')
    done()
  })
}

exports.get = () => {
  return state.db
}