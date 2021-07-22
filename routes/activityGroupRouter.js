const express = require('express');
const activityGroupCtrl = require('../controller/activityGroupController');
const authCtrl = require('../controller/authController');
// const activityRouter = require('./activityRouter');
// const activityCtrl = require('../controller/activityController');

const router = express.Router({ mergeParams: true }); // get activity id

router.route('/category').get(activityGroupCtrl.getCategoryAndCount);

router
  .route('/me')
  .get(
    authCtrl.protect,
    activityGroupCtrl.setMyActivityGroupQuery,
    activityGroupCtrl.getAllActivityGroupWithRole,
  );

router
  .route('/')
  .get(activityGroupCtrl.getAllActivityGroup)
  .post(
    authCtrl.protect,
    activityGroupCtrl.checkActivityManagerOrAdmin,
    activityGroupCtrl.setUserManager,
    activityGroupCtrl.setActivity,
    activityGroupCtrl.createByMe,
    activityGroupCtrl.createActivityGroup,
  );

router
  .route('/:id')
  .get(activityGroupCtrl.getActivityGroup)
  .patch(
    authCtrl.protect,
    activityGroupCtrl.checkActivityGroupManagerOrAdmin,
    activityGroupCtrl.restrictUpdateActivityGroupFields,
    activityGroupCtrl.updateActivityGroup,
  )
  .delete(
    authCtrl.protect,
    activityGroupCtrl.checkActivityGroupManagerOrAdmin,
    activityGroupCtrl.deleteActivityGroup,
  );

router
  .route('/:id/member')
  .get(
    authCtrl.protect,
    activityGroupCtrl.checkActivityGroupMemberOrAdmin,
    activityGroupCtrl.setMyActivityGroupQuery,
    activityGroupCtrl.getAllActivityGroupMember,
  )
  .post(
    authCtrl.protect,
    activityGroupCtrl.checkActivityGroupManagerOrAdmin,
    activityGroupCtrl.setAddmemberBody,
    activityGroupCtrl.createActivityGroupMember,
  );

router
  .route('/:activityGroupId/member/:id')
  .patch(
    authCtrl.protect,
    activityGroupCtrl.checkActivityGroupMemberManagerOrAdmin,
    // activityCtrl.restrictUpdateMemberFields, ????
    activityGroupCtrl.updateActivityGroupMember,
  )
  .delete(
    authCtrl.protect,
    activityGroupCtrl.checkActivityGroupMemberManagerOrAdmin,
    activityGroupCtrl.deleteActivityGroupMember,
  );

module.exports = router;
