const express = require('express');
const router = express.Router();
const auth = require('../auth');
const nodemailer = require('nodemailer');
const logger = require('../../logger');

router.use('/users', require('./users'));
router.use('/goals', require('./goals'));
router.use('/images', require('./images'));
router.use('/rules', require('./rules'));
router.use('/lotteries', require('./lotteries'));

router.post('/sendemail', auth.required, (req, res, next) => {
  const { body: { email } } = req;

  if(!email) {
    return res.status(422).json({
      errors: 'Email объект необходим'
    });
  }

  if(!email.to) {
    return res.status(422).json({
      errors: 'To необходим'
    });
  }

  if(!email.message) {
    return res.status(422).json({
      errors: 'Message необходим'
    });
  }

  async function sendEmail() {

    const output = `
    <h3>Письмо из приложения</h3>
    <p>${email.message}</p>`;

    let smtpTransport;
    try {
      smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com', // 'smtp.yandex.ru',
        port: 587, // 465,
        secure: false, // true for 465, false for other ports 587
        auth: {
          user: 'mokoshrus@gmail.com',
          pass: '332456789q'
        }
      });
    } catch (e) {
      logger.logError('nodemailer.createTransport. Fail !!!');
      throw ({
        srcError: 'nodemailer.createTransport',
        msgError: e
      });
    }

    let mailOptions = {
      from: 'mokoshrus@gmail.com',
      to: email.to,
      subject: 'Письмо из приложения',
      text: 'Письмо из приложения - text',
      html: output
    };

    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        logger.logError('smtpTransport.sendMail. Fail !!!');
        throw ({
          srcError: 'smtpTransport.sendMail',
          msgError: error
        });
      }
    });
  }

  sendEmail()
    .then(() => {
      logger.logSuccess('Send email. (' + email.to + ')');
      return res.status(200).json({
        success: {
          message: 'Email сообщение успешно отправлено!',
        },
      });
    })
    .catch((objectError) => {
      logger.logError(objectError);
      // console.log(objectError);
      return res.status(500).json({
        errors: 'Ошибка отправки email'
      });
    });

});

// router.get('/dev', (req, res) => {
//   return res.status(200).json({
//     msg: 'hello'
//   });
// });

module.exports = router;
