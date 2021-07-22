const express = require('express');
const activityCtrl = require('../controller/activityController');
const authCtrl = require('../controller/authController');
const activityGroupRouter = require('./activityGroupRouter');

const router = express.Router();

router
  .route('/top-10-activities')
  .get(activityCtrl.aliasTop10Activities, activityCtrl.getAllActivities);

router.route('/category').get(activityCtrl.getCategoryAndCount);

router
  .route('/me')
  .get(
    authCtrl.protect,
    activityCtrl.setMyActivitiesQuery,
    activityCtrl.getAllActivityWithRole,
  );

router
  .route('/')
  .get(activityCtrl.getAllActivities)
  .post(
    authCtrl.protect,
    activityCtrl.createByMe,
    activityCtrl.createActivity,
  );

router.use('/:activityId/group/', activityGroupRouter);

router
  .route('/:id')
  .get(activityCtrl.getActivity)
  .patch(
    authCtrl.protect,
    activityCtrl.checkActivityManagerOrAdmin,
    activityCtrl.restrictUpdateActivityFields,
    activityCtrl.updateActivity,
  )
  .delete(
    authCtrl.protect,
    activityCtrl.checkActivityManagerOrAdmin,
    activityCtrl.deleteActivity,
  );

router
  .route('/:id/request')
  .get(
    authCtrl.protect,
    activityCtrl.checkActivityManagerOrAdmin,
    activityCtrl.setRequestMemberQuery,
    activityCtrl.getAllActivityMember,
  )
  .post(
    authCtrl.protect,
    activityCtrl.setAddMemberBody,
    activityCtrl.setRequestMemberBody,
    activityCtrl.createActivityMember,
  );

router
  .route('/:id/member')
  .get(
    authCtrl.protect,
    activityCtrl.checkActivityMemberOrAdmin,
    activityCtrl.setMyActivitiesQuery,
    activityCtrl.getAllActivityMember,
  )
  .post(
    authCtrl.protect,
    activityCtrl.checkActivityManagerOrAdmin,
    activityCtrl.setAddMemberBody,
    activityCtrl.createActivityMember,
  );

router
  .route('/:activityId/member/:id')
  .patch(
    authCtrl.protect,
    activityCtrl.checkActivityManagerOrAdmin,
    activityCtrl.restrictUpdateMemberFields,
    activityCtrl.updateMember,
  )
  .delete(
    authCtrl.protect,
    activityCtrl.checkActivityManagerOrAdmin,
    activityCtrl.deleteMember,
  );

module.exports = router;
