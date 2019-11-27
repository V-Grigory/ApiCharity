
const checkUserData = (v) => {
  let ok = true;
  if(!v) {
    ok = false;
    return {ok: ok, msg: {user: 'object is required'}};
  }
  if(!v.email) {
    ok = false;
    return {ok: ok, msg: {email: 'is required'}};
  }
  if(!v.password) {
    ok = false;
    return {ok: ok, msg: {password: 'is required'}};
  }
  return {ok};
};

const checkRuleData = (v, target = 'forInsert') => {
  if(target === 'forInsert') {
    let ok = true;
    if(!v) {
      ok = false;
      return {ok: ok, msg: {rule: 'object is required'}};
    }
    if(!v.title) {
      ok = false;
      return {ok: ok, msg: {title: 'is required'}};
    }
    if(!v.description) {
      ok = false;
      return {ok: ok, msg: {description: 'is required'}};
    }
    return {ok};
  }
  if(target === 'forUpdate') {
    let ok = true;
    if(!v) {
      ok = false;
      return {ok: ok, msg: {rule: 'object is required'}};
    }
    if(!v.title && !v.description) {
      ok = false;
    }
    return {ok: ok, msg: {error: 'No data for update'}};
  }
};

const checkGoalData = (v, target = 'forInsert') => {
  if(target === 'forInsert') {
    let ok = true;
    if(!v) {
      ok = false;
      return {ok: ok, msg: {goal: 'object is required'}};
    }
    if(!v.type) {
      ok = false;
      return {ok: ok, msg: {type: 'is required'}};
    }
    if(!v.title) {
      ok = false;
      return {ok: ok, msg: {title: 'is required'}};
    }
    if(!v.description) {
      ok = false;
      return {ok: ok, msg: {description: 'is required'}};
    }
    return {ok};
  }
  if(target === 'forUpdate') {
    let ok = true;
    if(!v) {
      ok = false;
      return {ok: ok, msg: {goal: 'object is required'}};
    }
    if(!v.type && !v.title && !v.description) {
      ok = false;
    }
    return {ok: ok, msg: {error: 'No data for update'}};
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
      errors: { message: 'FORBIDDEN!' }
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
