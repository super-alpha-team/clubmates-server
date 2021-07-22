const express = require('express');
const clubCtrl = require('../controller/clubController');
const authCtrl = require('../controller/authController');
const clubGroupRoter = require('./clubGroupRouter');

const router = express.Router();

// Advanced Route

router
  .route('/top-10-clubs')
  // to avoid conflix with route('/:id'), place this router above router /:id
  .get(clubCtrl.aliasTop10Clubs, clubCtrl.getAllClub);

router.route('/category').get(clubCtrl.getCategoryAndCount);

// Normal CRUD route

router
  .route('/me')
  .get(
    authCtrl.protect,
    clubCtrl.setMyClubsQuery,
    clubCtrl.getAllClubWithRole,
  );

router
  .route('/')
  .get(clubCtrl.getAllClub)
  .post(
    authCtrl.protect,
    clubCtrl.createByMe,
    clubCtrl.createClub,
  );

router.use('/:clubId/group/', clubGroupRoter);

router
  .route('/:id/member')
  .get(
    authCtrl.protect,
    clubCtrl.checkClubMemberOrAdmin,
    clubCtrl.setMyClubsQuery,
    clubCtrl.getAllClubMember,
  )
  .post(
    authCtrl.protect,
    clubCtrl.checkClubManagerOrAdmin,
    clubCtrl.setAddmemberBody,
    clubCtrl.createClubMember,
  );
router
  .route('/:clubId/member/:id')
  .patch(
    authCtrl.protect,
    clubCtrl.checkClubManagerOrAdmin,
    clubCtrl.restrictUpdateMemberFields,
    clubCtrl.updateMember,
  )
  .delete(
    authCtrl.protect,
    clubCtrl.checkClubManagerOrAdmin,
    clubCtrl.deleteMember,
  );
router
  .route('/:id/request')
  .get(
    authCtrl.protect,
    clubCtrl.checkClubManagerOrAdmin,
    clubCtrl.setRequestMemberQuery,
    clubCtrl.getAllClubMember,
  )
  .post(
    authCtrl.protect,
    clubCtrl.setAddmemberBody,
    clubCtrl.setRequestMemberBody,
    clubCtrl.createClubMember,
  );

router
  .route('/:id')
  .get(clubCtrl.getClub)
  .patch(
    authCtrl.protect,
    clubCtrl.checkClubManagerOrAdmin,
    clubCtrl.restrictUpdateClubFields,
    clubCtrl.updateClub,
  )
  .delete(
    authCtrl.protect,
    clubCtrl.checkClubManagerOrAdmin,
    clubCtrl.deleteClub,
  );

module.exports = router;
