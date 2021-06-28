const ClubGroup = require('../models/clubGroupModel');
const catchAsync = require('../utils/catchAsync');
const handler = require('../utils/handlerFactory');
const sendResponse = require('../utils/sendResponse');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/appError');

// ROUTE HANDLERS

exports.getAllClubGroup = handler.getAll(ClubGroup);
exports.getClubGroup = handler.getOne(ClubGroup);

exports.createClubGroup = handler.createOne(ClubGroup);
exports.updateClubGroup = handler.updateOne(ClubGroup);
exports.deleteClubGroup = handler.deleteOne(ClubGroup);

exports.getCategoryAndCount = handler.getDistinctValueAndCount(
  ClubGroup,
  'category',
);

exports.checkClubGroupManagerOrAdmin = catchAsync(async (request, response, next) => {
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

exports.aliasTop10ClubGroups = (request, response, next) => {
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

exports.setClub = (req, res, next) => {
  req.body.club = req.params.id
  next()
}

exports.myClubGroups = (request, response, next) => {
  request.query.user = request.user.id;
  return next();
}

exports.restrictUpdateClubGroupFields = (request, response, next) => {
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
