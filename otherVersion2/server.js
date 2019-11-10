let express = require('express')
let bodyParser = require('body-parser')
// let MongoClient = require('mongodb').MongoClient
let ObjectID = require('mongodb').ObjectID
let db = require('./db')
let worksController = require('./controllers/works')

let app = express()


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('HELLO!!!')
})

app.get('/works', worksController.all)

app.get('/works/:slug', worksController.findById)

app.post('/works', worksController.create)

app.put('/works/:slug', worksController.update)

app.delete('/works/:slug', worksController.delete)

db.connect('mongodb://localhost:27017', (err) => {
  if(err) {
    return console.log(err)
  }
  app.listen(8080, () => console.log(`server listen at 8080`))
})
