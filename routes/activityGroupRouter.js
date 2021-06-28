const express = require('express');
const activityGroupCtrl = require('../controller/activityGroupController');
const authCtrl = require('../controller/authController');

const router = express.Router();

// Advanced Route

router.route('/category').get(activityGroupCtrl.getCategoryAndCount);

// Normal CRUD route

// router
//   .route('/me')
//   .get(
//     authCtrl.protect,
//     activityGroupCtrl.myQuestion, 
//     activityGroupCtrl.getAllQuestion
//   );


router
  .route('/')
  .get(activityGroupCtrl.getActivityGroup)
  .post(
    authCtrl.protect,
    activityGroupCtrl.setUserManager,
    activityGroupCtrl.createActivityGroup,
  );

// router
//   .route('/:id')
//   .get(questionCtrl.getQuestion)
//   .patch(
//     authCtrl.protect,
//     questionCtrl.checkQuestionOwnerOrAdmin,
//     questionCtrl.restrictUpdateQuestionFields,
//     questionCtrl.updateQuestion,
//   )
//   .delete(
//     authCtrl.protect,
//     questionCtrl.checkQuestionOwnerOrAdmin,
//     questionCtrl.deleteQuestion,
//   );

module.exports = router;
