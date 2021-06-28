const express = require('express');
const activityCtrl = require('../controller/activityController');
const authCtrl = require('../controller/authController');
const activityGroupRouter = require('./activityGroupRouter');

const router = express.Router();

// Advanced Route

router
  .route('/top-10-activities')
  .get(activityCtrl.aliasTop10Activities, activityCtrl.getAllActivities);

router.route('/category').get(activityCtrl.getCategoryAndCount);


router
  .route('/me')
  .get(
    authCtrl.protect,
    activityCtrl.myActivities, 
    activityCtrl.getAllActivities
  );

router
  .route('/')
  .get(activityCtrl.getAllActivities)
  .post(
    authCtrl.protect,
    activityCtrl.setUserManager,
    // activityCtrl.set,
    activityCtrl.createActivity,
  );

router.post('/:id/request', 
  authCtrl.protect,
  activityCtrl.requestJoinActivity,
  activityCtrl.updateActivity
)

router.use('/:id/group/', activityGroupRouter)

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

module.exports = router;
