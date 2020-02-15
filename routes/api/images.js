const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const router = require('express').Router();
const multer = require('multer');
const auth = require('../auth');
// const logger = require('../../logger');
const utils = require('../../utils');
const Images = mongoose.model('Images');
const Goals = mongoose.model('Goals');

const dirUploads = path.join(__dirname, '../../public/uploads');
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dirUploads);
  },
  filename: (req, file, cb) => {
    // cb(null, file.originalname);
    let p1 = `f${(~~(Math.random()*1e8)).toString(16)}`;
    let p2 = (+new Date).toString(16);
    let ext;
    if (file.mimetype === 'image/png') ext = '.png';
    if (file.mimetype === 'image/jpg') ext = '.jpg';
    if (file.mimetype === 'image/jpeg') ext = '.jpeg';
    cb (null, `${p1}${p2}${ext}`);
  }
});
const fileFilter = (req, file, cb) => {
  if(['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) {
    cb (null, true);
  } else {
    cb (null, false);
  }
};
const multerOptions = { storage: storageConfig };
const upload = multer(multerOptions).array('files');

const deleteFiles = (files) => {
  return new Promise((resolve, reject) => {
    files.forEach(v => {
      try {
        fs.unlinkSync(`${dirUploads}/${v.filename}`)
        //file removed
      } catch(err) {
        console.error(err)
      }
    });
    resolve();
  })
};
const deleteFile = (file) => {
  return new Promise((resolve, reject) => {
    try {
      fs.unlinkSync(`${dirUploads}/${file}`)
    } catch(err) {
      console.error(err);
      reject(`Image does not exist or error delete image ${file}`);
    }
    resolve('Image successfully deleted');
  })
};

router.get('/:_id', (req, res, next) => {
  let fields = 'goal_id url';

  return Images.findById(req.params._id, fields).then((image) => {
    if(!image) {
      return res.status(400).json({
        errors: 'Изображение не существует'
      });
    }
    return res.json({ image: image });
  })
  .catch(() => {
    // return res.status(500).json({
    //   errors: { message: 'Error BD' }
    // })
    return res.status(400).json({
      errors: 'Изображение не существует'
    });
  });
});

router.post('/', auth.required, utils.accessOnlyAdmin, upload, (req, res, next) => {
  // console.log(req.body);
  // console.log(req.files);

  if(req.files.length === 0) {
    return res.status(400).json({
      errors: 'Нет изображений!'
    });
  }

  if(!req.body.goal_id) {
    deleteFiles(req.files);
    return res.status(400).json({
      errors: 'Отсутствует или некорректный ИД цели!'
    });
  }

  Goals.findById(req.body.goal_id, 'id').then((goal) => {
    if(!goal) {
      deleteFiles(req.files);
      return res.status(400).json({
        errors: 'Цель не существует'
      });
    }
    let loadedImages = [];
    async function loadImages() {
      for(let i in req.files) {
        let imageData = {
          goal_id: req.body.goal_id,
          url: req.files[i].filename
        };
        let t = await new Images(imageData).save();
        loadedImages.push(t);
      }
    }
    loadImages().then(() => {
      return res.status(200).json({
        message: 'Изображения успешно загружены',
        images: loadedImages
      });
    });
  })
  .catch(() => {
    deleteFiles(req.files);
    return res.status(500).json({
      errors: 'Error BD'
    })
  });
});

router.delete('/:_id', auth.required, utils.accessOnlyAdmin, (req, res, next) => {
  // Images.findById(req.params._id).then(image => {
  //   if(image) {
  //     deleteFile(image.url).then(msgOK => {
  //       return res.status(200).json({
  //         message: msgOK
  //       });
  //     }).catch(msgErr => {
  //       return res.status(400).json({
  //         message: msgErr
  //       });
  //     })
  //
  //   } else {
  //     return res.status(400).json({
  //       errors: { message: 'This image does not exist' }
  //     });
  //   }
  // })
  // .catch(() => {
  //   return res.status(400).json({
  //     errors: { message: 'This image does not exist' }
  //   });
  // });

  Images.findByIdAndRemove(req.params._id).then((image) => {
    if(image) {
      deleteFile(image.url);
      return res.status(200).json({
        message: 'Изображение успешно удалено'
      });
    } else {
      return res.status(400).json({
        errors: 'Это изображение не существует'
      });
    }
  })
  .catch(() => {
    return res.status(400).json({
      errors: 'Это изображение не существует'
    });
  })
});

module.exports = router;
