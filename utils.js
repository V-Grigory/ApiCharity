// let nowPlusOneDay = () => {
//   let d = new Date();
//   d.setDate(d.getDate() + 1);
//   return d;
// };

const checkUserData = (v) => {
  let ok = true;
  if(!v) {
    ok = false;
    return {ok: ok, msg: 'Необходим объект User'};
  }
  if(!v.email) {
    ok = false;
    return {ok: ok, msg: 'email необходим'};
  }
  if(!v.password) {
    ok = false;
    return {ok: ok, msg: 'password необходим'};
  }
  return {ok};
};

const checkRuleData = (v, target = 'forInsert') => {
  if(target === 'forInsert') {
    let ok = true;
    if(!v) {
      ok = false;
      return {ok: ok, msg: 'Необходим объект Rule'};
    }
    if(!v.title) {
      ok = false;
      return {ok: ok, msg: 'title необходим'};
    }
    if(!v.description) {
      ok = false;
      return {ok: ok, msg: 'description необходим'};
    }
    return {ok};
  }
  if(target === 'forUpdate') {
    let ok = true;
    if(!v) {
      ok = false;
      return {ok: ok, msg: 'Необходим объект Rule'};
    }
    if(!v.title && !v.description) {
      ok = false;
    }
    return {ok: ok, msg: 'Нет данных для обновления'};
  }
};

const checkGoalData = (v, target = 'forInsert') => {
  if(target === 'forInsert') {
    let ok = true;
    if(!v) {
      ok = false;
      return {ok: ok, msg: 'Объект Goal необходим'};
    }
    if(!v.type) {
      ok = false;
      return {ok: ok, msg: 'type необходим'};
    }
    if(!v.title) {
      ok = false;
      return {ok: ok, msg: 'title необходим'};
    }
    if(!v.description) {
      ok = false;
      return {ok: ok, msg: 'description необходим'};
    }
    return {ok};
  }
  if(target === 'forUpdate') {
    let ok = true;
    if(!v) {
      ok = false;
      return {ok: ok, msg: 'Объект Goal необходим'};
    }
    if(!v.type && !v.title && !v.description) {
      ok = false;
    }
    return {ok: ok, msg: 'Нет данных для обновления'};
  }
};

// const checkGoalData = (req, res, next) => {
//   if(!req.body.type) {
//     return res.status(422).json({
//       errors: {type: 'is required'}
//     });
//   }
//   if(!req.body.title) {
//     return res.status(422).json({
//       errors: {title: 'is required'}
//     });
//   }
//   if(!req.body.description) {
//     return res.status(422).json({
//       errors: {description: 'is required'}
//     });
//   }
// };

const validateUserId = (v) => {
  let num = Number(v);
  if(!num) return false;
  num = num.toString();
  return num.length === 6 ? num : false;
};

const accessOnlyAdmin = (req, res, next) => {
  // Вопрос, надо ли смотреть по базе существует ли пользователь из токена
  // и админ ли этот пользователь?
  /*
  const { payload: { _id } } = req;
  Users.findById(_id).then((user) => {
    if(!user) {
      return res.status(403).json({
        errors: { message: 'FORBIDDEN!' }
      });
    }
    if(user.role !== 'admin') {
      return res.status(403).json({
        errors: { message: 'FORBIDDEN!' }
      });
    }
    next()
  }); */

  // Или достаточно наличия роли admin в токене?
  const { payload: { role } } = req;

  if(role && role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      errors: 'FORBIDDEN!'
    });
  }
};

module.exports = utils = {
  checkUserData,
  checkRuleData,
  checkGoalData,
  validateUserId,
  accessOnlyAdmin
};
