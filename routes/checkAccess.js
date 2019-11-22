// const mongoose = require('mongoose');
// const Users = mongoose.model('Users');

const onlyAdmin = (req, res, next) => {
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

  if(role && role === 'admin') next();
  return res.status(403).json({
    errors: { message: 'FORBIDDEN!' }
  });
};

module.exports = checkAccess = {
  onlyAdmin
};
