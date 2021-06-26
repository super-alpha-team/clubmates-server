const express = require('express');
const clubGroupCtrl = require('../controller/clubGroupController');
const authCtrl = require('../controller/authController');

const router = express.Router();

// Advanced Route

router.route('/category').get(clubGroupCtrl.getCategoryAndCount);

// Normal CRUD route

// router
//   .route('/me')
//   .get(
//     authCtrl.protect,
//     clubGroupCtrl.myQuestion, 
//     clubGroupCtrl.getAllQuestion
//   );


router
  .route('/')
  .get(clubGroupCtrl.getClubGroup)
  .post(
    authCtrl.protect,
    clubGroupCtrl.setUserManager,
    clubGroupCtrl.createClubGroup,
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
