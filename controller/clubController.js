const Club = require('../models/clubModel');
const ClubMember = require('../models/clubMemberModel');
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

exports.checkClubMemberOrAdmin = catchAsync(async (request, response, next) => {
  if (request.user.role == 'admin') return next();

  const isMember = await ClubMember.findOne({
    club: request.params.id,
    user: request.user.id,
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
exports.checkClubManagerOrAdmin = catchAsync(async (request, response, next) => {
  if (request.user.role == 'admin') return next();

  const isManager = await ClubMember.findOne({
    club: request.params.id,
    user: request.user.id,
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

exports.aliasTop10Clubs = (request, response, next) => {
  request.query.limit = '10';
  request.query.sort = '-createAt';
  next();
};

exports.createByMe = (request, response, next) => {
  request.body.createBy = request.user.id
  next();
}

exports.setMyClubsQuery = (request, response, next) => {
  // set for query clubs
  request.query["user__eq"] = request.user.id;
  request.query["role__ne"] = 'requested';
  //set for query members
  if (request.params.id) { request.query["club__eq"] = request.params.id }
  next();
}
exports.getAllClubWithRole = handler.getAll(ClubMember, {populate: 'club'})
exports.getAllClubMember = handler.getAll(ClubMember, {populate: 'user'})

exports.restrictUpdateClubFields = (request, response, next) => {
  const allowedFields = ['name', 'description', 'photo', 'category', 'createAt'];

  Object.keys(request.body).forEach((element) => {
    if (!allowedFields.includes(element)) {
      delete request.body[element]
    }
  });
  next()
};




exports.setAddmemberBody = (request, response, next) => {
  request.body["club"] = request.params.id
  next();
}
exports.setRequestMemberBody = (request, response, next) => {
  request.body["user"] = request.user.id
  request.body["role"] = 'requested'
  next();
};

exports.setRequestMemberQuery = (request, response, next) => {
  request.query["role__eq"] = 'requested'
  request.query["club__eq"] = request.params.id 
  next();
};

exports.restrictUpdateMemberFields = (request, response, next) => {
  const allowedFields = ['role', 'dateAdded'];

  Object.keys(request.body).forEach((element) => {
    if (!allowedFields.includes(element)) {
      delete request.body[element]
    }
  });
  next()
};

exports.createClubMember = handler.createOne(ClubMember);
exports.updateMember = handler.updateOne(ClubMember);
exports.deleteMember = handler.deleteOne(ClubMember);
