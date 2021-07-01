const Activity = require('../models/activityModel');
const ActivityMember = require('../models/activityMemberModel');
const catchAsync = require('../utils/catchAsync');
const handler = require('../utils/handlerFactory');
const sendResponse = require('../utils/sendResponse');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/appError');

// ROUTE HANDLERS

exports.getAllActivities = handler.getAll(Activity);
exports.getActivity = handler.getOne(Activity);

exports.createActivity = handler.createOne(Activity);
exports.updateActivity = handler.updateOne(Activity);
exports.deleteActivity = handler.deleteOne(Activity);

exports.getCategoryAndCount = handler.getDistinctValueAndCount(
  Activity,
  'category',
);

exports.checkActivityManagerOrAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role == 'admin') return next();

  const activity = await Activity.findById(req.params.id).query({
    "member.user": req.user.id,
    "member.role": "manager",
  })
  if (!activity) {
    return next(
      new AppError(
        'You do not have permission to perform this action',
        StatusCodes.FORBIDDEN,
      ),
    );
  }
  next();
});

exports.aliasTop10Activities = (req, res, next) => {
  req.query.__limit = '10';
  req.query.__sort = '-createAt';
  next();
};

exports.setUserManager = (req, res, next) => {
  req.body.member = {
    user: req.user.id,
    role: 'manager',
  };
  next();
};

exports.createByMe = (req, res, next) => {
  req.body.createBy = req.user.id
  next();
}

exports.setMyActivitiesQuery = (req, res, next) => {
  req.query["user__eq"] = req.user.id;
  req.query["role__ne"] = 'requested';
  if (req.params.id) { req.query["activity__eq"] = req.params.id }
  next();
}

exports.getAllActivityWithRole = handler.getAll(ActivityMember, {populate: 'activity'})

exports.restrictUpdateActivityFields = (req, res, next) => {
  const allowedFields = ['name', 'description', 'photo', 'category', 'createAt'];

  Object.keys(req.body).forEach((element) => {
    if (!allowedFields.includes(element)) {
      delete req.body[element]
    }
  });
  next()
};

exports.reqJoinActivity = (req, res, next) => {
  req.body["$addToSet"] = {
    member: {
      user: req.user.id,
      role: 'requested',
    }
  }
  next
};

exports.setRequestMemberQuery = (req, res, next) => {
  req.query["role__eq"] = 'requested'
  req.query["activity__eq"] = req.params.id 
  next();
};

exports.setRequestMemberBody = (req, res, next) => {
  req.body["user"] = req.user.id
  req.body["role"] = 'requested'
  next();
};

exports.checkActivityMemberOrAdmin = catchAsync(async (req, res, next) => {
  if (req.user.role == 'admin') return next();

  const isMember = await ActivityMember.findOne({
    activity: req.params.id,
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

exports.setMyActivitiesQuery = (req, res, next) => {
  req.query["user__eq"] = req.user.id;
  req.query["role__ne"] = 'reqed';
  if (req.params.id) { req.query["activity__eq"] = req.params.id }
  next();
}

exports.getAllActivityMember = handler.getAll(ActivityMember, {populate: 'user'})

exports.setAddMemberBody = (req, res, next) => {
  req.body["activity"] = req.params.id
  next();
}

exports.restrictUpdateMemberFields = (req, res, next) => {
  const allowedFields = ['role', 'dateAdded'];
  
  Object.keys(req.body).forEach((element) => {
    if (!allowedFields.includes(element)) {
      delete req.body[element]
    }
  });
  next()
};

exports.createActivityMember = handler.createOne(ActivityMember);
exports.updateMember = handler.updateOne(ActivityMember);
exports.deleteMember = handler.deleteOne(ActivityMember);
