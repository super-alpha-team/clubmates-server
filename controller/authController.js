const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendResponse = require('../utils/sendResponse');

const createAndSendToken = (user, statusCode, response) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  sendResponse({
    user: user.toAuthJSON(),
    token,
  },
  statusCode,
  response);
};

exports.sign = catchAsync(async (request, response) => {
  const { userId } = request.body
  let user = await User.findOne({ userId });
  if (!user) {
    const {
      name, email, photo
    } = request.body;
    user = await User.create({
      userId,
      name,
      email,
      photo
    });
  }

  createAndSendToken(user, StatusCodes.CREATED, response);
});

// eslint-disable-next-line consistent-return
exports.protect = catchAsync(async (request, response, next) => {
  // 1 Getting token and check of it's there
  let token;

  // token is set at header:
  // authorization: Bearer {token}
  if (
    request.headers.authorization
    && request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', StatusCodes.UNAUTHORIZED),
    );
  }

  // 2 Verification token
  const verifiedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET,
  ); // promisify(jwt.verify) will return a promise

  // 3 Check if user still exists
  const user = await User.findById(verifiedToken.id);

  if (!user) return next(new AppError('This user does no longer exist.', StatusCodes.UNAUTHORIZED));

  request.user = user; // tranfer data logged user to the next middleware function

  next();
});

exports.restrictTo = (...roles) => (request, response, next) => {
  if (!roles.includes(request.user.role)) {
    return next(
      new AppError(
        'You do not have permission to perform this action.',
        StatusCodes.FORBIDDEN,
      ),
    );
  }
  next();
};
