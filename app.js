// https://medium.com/nuances-of-programming/%D1%83%D1%87%D0%B8%D0%BC%D1%81%D1%8F-%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%B0%D1%82%D1%8C-%D1%81-%D0%B0%D1%83%D1%82%D0%B5%D0%BD%D1%82%D0%B8%D1%84%D0%B8%D0%BA%D0%B0%D1%86%D0%B8%D0%B5%D0%B9-%D0%B2-node-%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D1%83%D1%8F-passport-js-58c14b9fe823
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');
const CronJob = require('cron').CronJob;
require('dotenv').config();


//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

//Initiate our app
const app = express();
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'public/uploads')));
app.use(session({ secret: 'Api-Charity', cookie: { maxAge: 60000 },
  resave: false, saveUninitialized: false }));

if(!isProduction) {
  app.use(errorHandler());
}

//Models & routes
require('./models/Users');
require('./models/Goals');
require('./models/Images');
require('./models/Rules');
require('./models/Lotteries');
require('./config/passport');
app.use(require('./routes'));

//Error handlers & middlewares
if(!isProduction) {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err,
      },
    });
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  res.json({
    errors: {
      message: err.message,
      error: {},
    },
  });
});

const lotteryController = require('./controllers/lotteries');
new CronJob('0 20 * * *', function() { /* every day at 8 p.m. */
// new CronJob('*/1 * * * *', function() { /* every 2 minutes */
  // console.log('You will see this message every second');
  lotteryController.startLottery();
}, null, true, 'Asia/Yekaterinburg');

mongoose.connect('mongodb://localhost:33017/charity').catch(error => {
  console.log(`Connect to DB ... ERROR: "${error.message}"`);
  process.exit(1);
});
mongoose.connection.once('open', () => {
  mongoose.set('debug', true);
  let port = 7777;
	app.listen(port, () =>
		console.log(`Server running on http://localhost:${port}/`)
	);
});
mongoose.connection.on('error', () => {
  console.error.bind(console, 'connection error:')
});
