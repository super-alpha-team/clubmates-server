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
    clubCtrl.myClubs, 
    clubCtrl.getAllClub
  );

router
  .route('/')
  .get(clubCtrl.getAllClub)
  .post(
    authCtrl.protect,
    clubCtrl.setUserManager,
    clubCtrl.createClub,
  );

router.post('/:id/request', 
  authCtrl.protect,
  clubCtrl.requestJoinClub,
  clubCtrl.updateClub
)

router.use('/:id/group/', clubGroupRoter)

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
