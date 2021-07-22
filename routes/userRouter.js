const express = require('express');

const router = express.Router();

const userController = require('../controller/userController');
const authController = require('../controller/authController');

router.post('/sign', authController.sign);

// all the route below will have to pass the middleware protect before reach to another controllers
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.getMe, userController.updateMe);
router.delete('/deleteMe', userController.getMe, userController.deleteUser);

// ------ Most Secure router -------
// only trn-admin can use the route below
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);
router.route('/role').get(userController.getRoleAndCount);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
