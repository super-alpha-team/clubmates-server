const Club = require('../models/clubModel');
const catchAsync = require('../utils/catchAsync');
const handler = require('../utils/handlerFactory');
const sendResponse = require('../utils/sendResponse');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/appError');

// ROUTE HANDLERS

exports.getAllClub = handler.getAll(Club);
exports.getClub = handler.getOne(Club);

exports.createClub = handler.createOne(Club);
exports.updateClub = handler.updateOne(Club);
exports.deleteClub = handler.deleteOne(Club);

exports.getCategoryAndCount = handler.getDistinctValueAndCount(
  Club,
  'category',
);

exports.checkClubManagerOrAdmin = catchAsync(async (request, response, next) => {
  if (request.user.role == 'admin') return next();

  const club = await Club.findById(request.params.id).query({
    "member.user": request.user.id,
    "member.role": "manager",
  })
  if (!club) {
    return next(
      new AppError(
        'You do not have permission to perform this action',
        StatusCodes.FORBIDDEN,
      ),
    );
  }
  next();
});

exports.aliasTop10Clubs = (request, response, next) => {
  request.query.limit = '10';
  request.query.sort = '-createAt';
  next();
};

exports.setUserManager = (request, response, next) => {
  request.body.member = {
    user: request.user.id,
    role: 'manager',
  };
  next();
};

exports.myClubs = (request, response, next) => {
  request.query["member.user__eq"] = request.user.id;
  return next();
}

exports.restrictUpdateClubFields = (request, response, next) => {
  const allowedFields = ['name', 'description', 'photo', 'category', 'createAt'];

  Object.keys(request.body).forEach((element) => {
    if (!allowedFields.includes(element)) {
      delete request.body[element]
    }
  });
  next()
};


exports.requestJoinClub = (request, response, next) => {
  request.body["$addToSet"] = {
    member: {
      user: request.user.id,
      role: 'requested',
    }
  }
  next
};
