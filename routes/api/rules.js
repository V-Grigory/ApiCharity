const mongoose = require('mongoose');
const router = require('express').Router();
const auth = require('../auth');
const utils = require('../../utils');
const Rules = mongoose.model('Rules');

router.get('/', (req, res, next) => {
  let fields = 'title description';

  return Rules.find({}, fields).then((rules) => {
    // if(rules.length === 0) {
    //   return res.sendStatus(204);
    // }
    return res.json({ rules: rules });
  });
});

router.post('/', auth.required, utils.accessOnlyAdmin, (req, res, next) => {
  const { body: { rule } } = req;

  if( !utils.checkRuleData(rule).ok ) {
    return res.status(422).json({
      errors: utils.checkRuleData(rule).msg
    });
  }

  const createRule = new Rules(rule);

  return createRule.save()
      .then(() => res.json({ rule: createRule }));
});

router.put('/:_id', auth.required, utils.accessOnlyAdmin, (req, res, next) => {
  const { body: { rule } } = req;

  if( !utils.checkRuleData(rule, 'forUpdate').ok ) {
    return res.status(422).json({
      errors: utils.checkRuleData(rule, 'forUpdate').msg
    });
  }

  let query = {_id: req.params._id};
  let updData = {};
  if(rule.title) updData.title = rule.title;
  if(rule.description) updData.description = rule.description;

  Rules.findOneAndUpdate(query, updData).then(() => {
    return res.status(200).json({
      message: 'Правило успешно обновлено'
    });
  }).catch(() => {
    return res.status(400).json({
      errors: 'Это правило не существует'
    });
  })
});

router.delete('/:_id', auth.required, utils.accessOnlyAdmin, (req, res, next) => {

  Rules.findByIdAndRemove(req.params._id).then((v) => {
    if(v) {
      return res.status(200).json({
        message: 'Правило успешно удалено'
      });
    }
    return res.status(400).json({
      errors: 'Это правило не существует'
    });
  })
  .catch(() => {
    return res.status(400).json({
      errors: 'Это правило не существует'
    });
  })
});

module.exports = router;
