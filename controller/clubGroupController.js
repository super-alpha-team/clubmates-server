const ClubGroup = require('../models/clubGroupModel');
const catchAsync = require('../utils/catchAsync');
const handler = require('../utils/handlerFactory');
const sendResponse = require('../utils/sendResponse');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/appError');
const ClubGroupMember = require('../models/clubGroupMemberModel');
const ClubMember = require('../models/clubMemberModel')

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

// exports.checkClubGroupManagerOrAdmin = catchAsync(async (request, response, next) => {
//   if (request.user.role == 'admin') return next();

//   // const club = await Club.findById(request.params.id);
//   // if (request.user.id !== club.user.id) {
//   //   return next(
//   //     new AppError(
//   //       'You do not have permission to perform this action',
//   //       403,
//   //     ),
//   //   );
//   // }
//   next();
// });

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

exports.checkUserManager = (request, response, next) => {
  request.body.member = {
    user: request.user.id, 
    role: 'manager',
  };
  next();
};

exports.setClub = (req, res, next) => {
  req.body.club = req.params.clubId
  next()
}

exports.createByMe = (request, response, next) => {
  request.body.createBy = request.user.id
  next();
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

exports.checkClubGroupMemberOrAdmin = catchAsync(async (request, response, next) => {
  if (request.user.role == 'admin') return next();

  const isMember = await ClubGroupMember.findOne({
    clubGroup: request.params.id,
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
    club: request.params.clubId,
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


exports.checkClubGroupManagerOrAdmin = catchAsync(async (request, response, next) => {
  if (request.user.role == 'admin') return next();
console.log('clubgroup', request.params.id);
console.log('user', request.user.id);

  const isManager = await ClubGroupMember.findOne({
    clubGroup: request.params.id,
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

exports.checkClubGroupMemberManagerOrAdmin = catchAsync(async (request, response, next) => {
  if (request.user.role == 'admin') return next();
console.log('clubgroup', request.params.clubGroupId);
console.log('user', request.user.id);

  const isManager = await ClubGroupMember.findOne({
    clubGroup: request.params.clubGroupId,
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

exports.setMyClubGroupQuery = (request, response, next) => {
  // set for query clubgroup
  request.query["user__eq"] = request.user.id;
  request.query["role__ne"] = 'requested';
  //set for query members
  if (request.params.id) { request.query["clubGroup__eq"] = request.params.id } //?
  next();
}

exports.getAllClubGroupWithRole = handler.getAll(ClubGroupMember, {populate: 'clubGroup'})

exports.getAllClubGroupMember = handler.getAll(ClubGroupMember, {populate: 'user'})

exports.setAddmemberBody = (request, response, next) => {
  request.body["clubGroup"] = request.params.id
  next();
}

exports.createClubGroupMember = handler.createOne(ClubGroupMember);

exports.updateClubGroupMember = handler.updateOne(ClubGroupMember);

exports.deleteClubGroupMember = handler.deleteOne(ClubGroupMember);


exports.restrictUpdateClubGroupFields = (request, response, next) => {
  const allowedFields = ['name', 'description', 'photo', 'category']; //creatAt??

  Object.keys(request.body).forEach((element) => {
    if (!allowedFields.includes(element)) {
      delete request.body[element]
    }
  });
  next()
};
