const Activity = require('../models/activityModel');
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

exports.checkActivityManagerOrAdmin = catchAsync(async (request, response, next) => {
  if (request.user.role == 'admin') return next();

  const activity = await Activity.findById(request.params.id).query({
    "member.user": request.user.id,
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

exports.aliasTop10Activities = (request, response, next) => {
  request.query.limit = '10';
  // request.query.sort = '-createAt';
  next();
};

exports.setUserManager = (request, response, next) => {
  request.body.member = {
    user: request.user.id,
    role: 'manager',
  };
  next();
};

// export.setClubGroup = (req,res,next) => {
//   req.body.clubGroup = value
//   next()
// }

exports.myActivities = (request, response, next) => {
  request.query["member.user__eq"] = request.user.id;
  return next();
}

exports.restrictUpdateActivityFields = (request, response, next) => {
  const allowedFields = ['name', 'description', 'photo', 'category', 'createAt'];

  Object.keys(request.body).forEach((element) => {
    if (!allowedFields.includes(element)) {
      delete request.body[element]
    }
  });
  next()
};


exports.requestJoinActivity = (request, response, next) => {
  request.body["$addToSet"] = {
    member: {
      user: request.user.id,
      role: 'requested',
    }
  }
  next
};
