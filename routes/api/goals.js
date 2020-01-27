// const path = require('path');
const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../auth');
// const logger = require('../../logger');
const utils = require('../../utils');
const Goals = mongoose.model('Goals');
const Images = mongoose.model('Images');

router.get('/', (req, res, next) => {
  let fields = 'type title description';

  return Goals.find({}, fields).then((goals) => {

    const setImages = async () => {
      for (let g of goals) {
        await Images.find({ goal_id: g._id }, 'url').then(v => {
          let images = v.map(v => v.url);
          g.set('files', images, {strict: false});
        });
      }
    };
    setImages().then(() => res.json({ goals: goals }));
  });
});

router.get('/:_id', (req, res, next) => {
  let fields = 'type title description';

  return Goals.findById(req.params._id, fields).then((goal) => {
    if(!goal) {
      return res.status(400).json({
        errors: 'Goal does not exist'
      });
    }
    const setImages = async () => {
      await Images.find({ goal_id: goal._id }, 'url').then(v => {
        let images = v.map(v => v.url);
        goal.set('files', images, {strict: false});
      });
    };
    setImages().then(() => res.json({ goal: goal }));
  })
  .catch(() => {
    return res.status(500).json({
      errors: 'Error BD'
    })
  });
});

router.post('/', auth.required, utils.accessOnlyAdmin, (req, res, next) => {
	const { body: { goal } } = req;

  if( !utils.checkGoalData(goal).ok ) {
    return res.status(422).json({
      errors: utils.checkGoalData(goal).msg
    });
  }

	const createGoal = new Goals(goal);
	return createGoal.save()
		.then(() => res.json({ goal: createGoal }));
});

router.put('/:_id', auth.required, utils.accessOnlyAdmin, (req, res, next) => {
  const { body: { goal } } = req;

  if( !utils.checkGoalData(goal, 'forUpdate').ok ) {
    return res.status(422).json({
      errors: utils.checkGoalData(goal, 'forUpdate').msg
    });
  }

  let query = {_id: req.params._id};
  let updData = {};
  if(goal.type) updData.type = goal.type;
  if(goal.title) updData.title = goal.title;
  if(goal.description) updData.description = goal.description;

  Goals.findOneAndUpdate(query, updData).then(() => {
    return res.status(200).json({
      message: 'Goal successfully update'
    });
  }).catch(() => {
    return res.status(400).json({
      errors: 'This goal does not exist'
    });
  })
});

router.delete('/:_id', auth.required, utils.accessOnlyAdmin, (req, res, next) => {

  Goals.findByIdAndRemove(req.params._id).then((v) => {
    if(v) {
      // тут реализация удаления привязанных картинок !!!
      return res.status(200).json({
        message: 'Goal successfully deleted'
      });
    }
    return res.status(400).json({
      errors: 'This goal does not exist'
    });
  })
  .catch(() => {
    return res.status(400).json({
      errors: 'This goal does not exist'
    });
  })
});

module.exports = router;
