const express = require('express');

const router = express.Router();

const userCtrl = require('../controller/userCtrl');
const authCtrl = require('../controller/authCtrl');

router.post('/sign', authCtrl.sign);

// all the route below will have to pass the middleware protect before reach to another controllers
router.use(authCtrl.protect);

router.get('/me', userCtrl.getMe, userCtrl.getUser);
router.patch('/updateMe', userCtrl.getMe, userCtrl.updateMe);
router.delete('/deleteMe', userCtrl.getMe, userCtrl.deleteUser);

// ------ Most Secure router -------
// only trn-admin can use the route below
router.use(authCtrl.restrictTo('admin'));

router.route('/').get(userCtrl.getAllUsers);
router.route('/role').get(userCtrl.getRoleAndCount);

router
  .route('/:id')
  .get(userCtrl.getUser)
  .patch(userCtrl.updateUser)
  .delete(userCtrl.deleteUser);

module.exports = router;
