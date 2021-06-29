const express = require('express');
const clubGroupCtrl = require('../controller/clubGroupController');
const authCtrl = require('../controller/authController');
const activityRoter = require('./activityRouter');
const clubCtrl = require('../controller/clubController')

const router = express.Router({ mergeParams: true }); //get club id

// Advanced Route

router.route('/category').get(clubGroupCtrl.getCategoryAndCount);

// Normal CRUD route

router
  .route('/me')
  .get(
    authCtrl.protect,
    clubGroupCtrl.setMyClubGroupQuery, 
    clubGroupCtrl.getAllClubGroupWithRole
  );


//create clubgroup ok
router
  .route('/')
  .get(clubGroupCtrl.getAllClubGroup)
  .post( //create
    authCtrl.protect,
    clubGroupCtrl.checkClubManagerOrAdmin,
    clubGroupCtrl.setUserManager,
    clubGroupCtrl.setClub, 
    clubGroupCtrl.createByMe,   
    clubGroupCtrl.createClubGroup,
  );

  // crud clubgroup ok
router
.route('/:id')
.get( clubGroupCtrl.getClubGroup) //read
.patch(  //update
  authCtrl.protect,
  clubGroupCtrl.checkClubGroupManagerOrAdmin,
  clubGroupCtrl.restrictUpdateClubGroupFields,
  clubGroupCtrl.updateClubGroup,
)
.delete( //delete
  authCtrl.protect,
  clubGroupCtrl.checkClubGroupManagerOrAdmin,
  clubGroupCtrl.deleteClubGroup,
);

//create read clubgroup member
router
.route('/:id/member')
.get(
  authCtrl.protect,
  clubGroupCtrl.checkClubGroupMemberOrAdmin,
  clubGroupCtrl.setMyClubGroupQuery,
  clubGroupCtrl.getAllClubGroupMember
)
.post(
  authCtrl.protect,
  clubGroupCtrl.checkClubGroupManagerOrAdmin,
  clubGroupCtrl.setAddmemberBody,
  clubGroupCtrl.createClubGroupMember
)

router
  .route('/:clubGroupId/member/:id')
  .patch(
    authCtrl.protect,
    clubGroupCtrl.checkClubGroupMemberManagerOrAdmin,
    // clubCtrl.restrictUpdateMemberFields, ????
    clubGroupCtrl.updateClubGroupMember,
  )
  .delete(
    authCtrl.protect,
    clubGroupCtrl.checkClubGroupMemberManagerOrAdmin,
    clubGroupCtrl.deleteClubGroupMember,
  )



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
