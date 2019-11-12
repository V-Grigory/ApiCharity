const mongoose = require('mongoose');
// const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Goals = mongoose.model('Goals');

router.get('/', auth.required, (req, res, next) => {
  // const { payload: { id } } = req;
  // let id = req.params.id

  return Goals.find({}, 'type title description params')
    .then((goals) => {
      if(!goals) {
        return res.sendStatus(400);
      }

      return res.json({ goals: goals });
    });

  // Goals.find({ type: 'человек'}, function (err, docs) {
  //   if(!docs) {
  //     return res.sendStatus(400);
  //   }
  //   console.log(docs)
  //   return res.json({ goals: docs });
  // });
});

router.post('/', auth.required, (req, res, next) => {
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

module.exports = router;
