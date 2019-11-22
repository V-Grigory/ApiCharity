const mongoose = require('mongoose');
const router = require('express').Router();
const multer = require('multer');
const auth = require('../auth');
const checkAccess = require('../checkAccess');
const Goals = mongoose.model('Goals');

router.get('/', (req, res, next) => {
  let fields = 'type title description params';

  return Goals.find({}, fields).then((goals) => {
    if(!goals) {
      return res.sendStatus(204);
    }
    return res.json({ goals: goals });
  });
});

router.post('/', auth.required, checkAccess.onlyAdmin, (req, res, next) => {
	const { body: { goal } } = req;

  if(!goal) {
    return res.status(422).json({
      errors: {
        goal: 'object is required',
      },
    });
  }

	if(!goal.type) {
		return res.status(422).json({
			errors: {
				type: 'is required',
			},
		});
	}

  if(!goal.title) {
    return res.status(422).json({
      errors: {
        title: 'is required',
      },
    });
  }

  if(!goal.description) {
    return res.status(422).json({
      errors: {
        description: 'is required',
      },
    });
  }

	const createGoal = new Goals(goal);

	return createGoal.save()
		.then(() => res.json({ goal: createGoal }));
});

router.post('/upload', function (req, res, next) {

  let filedata = req.file;
  if(!filedata)
    res.send('Ошибка при загрузке файла');
  else
    res.send('Файл загружен');
});

module.exports = router;
