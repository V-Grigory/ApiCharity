const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');

// router.get('/', auth.required, (req, res, next) => {
//   // const { payload: { id } } = req;
//   // let id = req.params.id
//
//   return Users.findById(id)
//     .then((user) => {
//       if(!user) {
//         return res.sendStatus(400);
//       }
//
//       return res.json({ user: user.toAuthJSON() });
//     });
// });

// router.post('/', auth.required, (req, res, next) => {
// 	const { body: { user } } = req;
//
// 	if(!user.email) {
// 		return res.status(422).json({
// 			errors: {
// 				email: 'is required',
// 			},
// 		});
// 	}
//
// 	if(!user.password) {
// 		return res.status(422).json({
// 			errors: {
// 				password: 'is required',
// 			},
// 		});
// 	}
//
// 	const finalUser = new Users(user);
//
// 	finalUser.setPassword(user.password);
//
// 	return finalUser.save()
// 		.then(() => res.json({ user: finalUser.toAuthJSON() }));
// });

module.exports = router;
