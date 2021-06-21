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

  // const club = await Club.findById(request.params.id);
  // if (request.user.id !== club.user.id) {
  //   return next(
  //     new AppError(
  //       'You do not have permission to perform this action',
  //       403,
  //     ),
  //   );
  // }
  next();
});

exports.aliasTop10Clubs = (request, response, next) => {
  request.query.limit = '10';
  request.query.sort = '-createAt,coin';
  request.query.fields = 'title,content,coin,category';
  next();
};

exports.setUserId = (request, response, next) => {
  request.body.user = request.user.id;
  next();
};

exports.myClubs = (request, response, next) => {
  request.query.user = request.user.id;
  return next();
}

exports.restrictUpdateQuestionFields = (request, response, next) => {
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
