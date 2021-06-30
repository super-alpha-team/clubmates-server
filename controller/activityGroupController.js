const ActivityGroup = require('../models/activityGroupModel');
const catchAsync = require('../utils/catchAsync');
const handler = require('../utils/handlerFactory');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/appError');
const ActivityGroupMember = require('../models/activityGroupMemberModel');
const ActivityMember = require('../models/activityMemberModel')


exports.getAllActivityGroup = handler.getAll(ActivityGroup);
exports.getActivityGroup = handler.getOne(ActivityGroup);

exports.createActivityGroup = handler.createOne(ActivityGroup);
exports.updateActivityGroup = handler.updateOne(ActivityGroup);
exports.deleteActivityGroup = handler.deleteOne(ActivityGroup);

exports.getCategoryAndCount = handler.getDistinctValueAndCount(
  ActivityGroup,
  'category',
);

// exports.checkActivityGroupManagerOrAdmin = catchAsync(async (req, res, next) => {
//   if (req.user.role == 'admin') return next();

//   // const activity = await Activity.findById(req.params.id);
//   // if (req.user.id !== activity.user.id) {
//   //   return next(
//   //     new AppError(
//   //       'You do not have permission to perform this action',
//   //       403,
//   //     ),
//   //   );
//   // }
//   next();
// });

exports.aliasTop10ActivityGroups = (req, res, next) => {
  req.query.limit = '10';
  req.query.sort = '-createAt,coin';
  req.query.fields = 'title,content,coin,category';
  next();
};


exports.setUserManager = (req, res, next) => {
  req.body.member = {
    user: req.user.id, 
    role: 'manager',
  };
  next();
};

exports.checkUserManager = (req, res, next) => {
  req.body.member = {
    user: req.user.id, 
    role: 'manager',
  };
  next();
};

exports.setActivity = (req, res, next) => {
  req.body.activity = req.params.activityId
  next()
}

exports.createByMe = (req, res, next) => {
  req.body.createBy = req.user.id
  next();
}

exports.myActivityGroups = (req, res, next) => {
  req.query.user = req.user.id;
  return next();
}

exports.restrictUpdateActivityGroupFields = (req, res, next) => {
  const allowedFields = ['title', 'content', 'category'];

  if (req.user.role == 'admin') {
    allowedFields.push('status')
  }

  Object.keys(req.body).forEach((element) => {
    if (!allowedFields.includes(element)) {
      delete req.body[element]
    }
  });
  next()
};

exports.checkActivityGroupMemberOrAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role == 'admin') return next();

  const isMember = await ActivityGroupMember.findOne({
    activityGroup: req.params.id,
    user: req.user.id,
    role: {
      '$nin': ['requested']
    },
  });
  if (!isMember) {
    return next(
      new AppError(
        'You do not have permission to perform this action',
        StatusCodes.FORBIDDEN,
      ),
    );
  }
  next();
});

exports.checkActivityManagerOrAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role == 'admin') return next();

  const isManager = await ActivityMember.findOne({
    activity: req.params.activityId,
    user: req.user.id,
    role: 'manager',
  });
  if (!isManager) {
    return next(
      new AppError(
        'You do not have permission to perform this action',
        StatusCodes.FORBIDDEN,
      ),
    );
  }
  next();
});


exports.checkActivityGroupManagerOrAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role == 'admin') return next();
console.log('activitygroup', req.params.id);
console.log('user', req.user.id);

  const isManager = await ActivityGroupMember.findOne({
    activityGroup: req.params.id,
    user: req.user.id,
    role: 'manager',
  });
  if (!isManager) { 
    return next(
      new AppError(
        'You do not have permission to perform this action',
        StatusCodes.FORBIDDEN,
      ),
    );
  }
  next();
});

exports.checkActivityGroupMemberManagerOrAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role == 'admin') return next();
console.log('activitygroup', req.params.activityGroupId);
console.log('user', req.user.id);

  const isManager = await ActivityGroupMember.findOne({
    activityGroup: req.params.activityGroupId,
    user: req.user.id,
    role: 'manager',
  });
  if (!isManager) { 
    return next(
      new AppError(
        'You do not have permission to perform this action',
        StatusCodes.FORBIDDEN,
      ),
    );
  }
  next();
});

exports.setMyActivityGroupQuery = (req, res, next) => {
  // set for query activitygroup
  req.query["user__eq"] = req.user.id;
  req.query["role__ne"] = 'requested';
  //set for query members
  if (req.params.id) { req.query["activityGroup__eq"] = req.params.id } //?
  next();
}

exports.getAllActivityGroupWithRole = handler.getAll(ActivityGroupMember, {populate: 'activityGroup'})

exports.getAllActivityGroupMember = handler.getAll(ActivityGroupMember, {populate: 'user'})

exports.setAddmemberBody = (req, res, next) => {
  req.body["activityGroup"] = req.params.id
  next();
}

exports.createActivityGroupMember = handler.createOne(ActivityGroupMember);

exports.updateActivityGroupMember = handler.updateOne(ActivityGroupMember);

exports.deleteActivityGroupMember = handler.deleteOne(ActivityGroupMember);


exports.restrictUpdateActivityGroupFields = (req, res, next) => {
  const allowedFields = ['name', 'description', 'photo', 'category']; //creatAt??

  Object.keys(req.body).forEach((element) => {
    if (!allowedFields.includes(element)) {
      delete req.body[element]
    }
  });
  next()
};
