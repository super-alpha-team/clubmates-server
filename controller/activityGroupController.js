const ActivityGroup = require('../models/activityGroupModel');
const catchAsync = require('../utils/catchAsync');
const handler = require('../utils/handlerFactory');
const sendResponse = require('../utils/sendResponse');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/appError');

// ROUTE HANDLERS

exports.getAllActivityGroup = handler.getAll(ActivityGroup);
exports.getActivityGroup = handler.getOne(ActivityGroup);

exports.createActivityGroup = handler.createOne(ActivityGroup);
exports.updateActivityGroup = handler.updateOne(ActivityGroup);
exports.deleteActivityGroup = handler.deleteOne(ActivityGroup);

exports.getCategoryAndCount = handler.getDistinctValueAndCount(
  ActivityGroup,
  'category',
);

exports.checkActivityGroupManagerOrAdmin = catchAsync(async (request, response, next) => {
  if (request.user.role == 'admin') return next();

  // const Activity = await Activity.findById(request.params.id);
  // if (request.user.id !== Activity.user.id) {
  //   return next(
  //     new AppError(
  //       'You do not have permission to perform this action',
  //       403,
  //     ),
  //   );
  // }
  next();
});

exports.aliasTop10ActivityGroups = (request, response, next) => {
  request.query.limit = '10';
  request.query.sort = '-createAt,coin';
  request.query.fields = 'title,content,coin,category';
  next();
};

exports.setUserManager = (request, response, next) => {
  request.body.member = {
    user: request.user.id,
    role: 'manager',
  };
  next();
};

exports.myActivityGroups = (request, response, next) => {
  request.query.user = request.user.id;
  return next();
}

exports.restrictUpdateActivityGroupFields = (request, response, next) => {
  const allowedFields = ['title', 'content', 'category'];

  if (request.user.role == 'admin') {
    allowedFields.push('status')
  }

  Object.keys(request.body).forEach((element) => {
    if (!allowedFields.includes(element)) {
      delete request.body[element]
    }
  });
  next()
};
