// const { StatusCodes } = require('http-status-codes');
const ClubModel = require('../models/clubModel');
// const catchAsync = require('../utils/catchAsync');
const handler = require('../utils/handlerFactory');
// const sendResponse = require('../utils/sendResponse');
// const AppError = require('../utils/appError');

// ROUTE HANDLERS

exports.getAllClub = handler.getAll(ClubModel);
exports.getClub = handler.getOne(ClubModel);
exports.createClub = handler.createOne(ClubModel);
exports.updateClub = handler.updateOne(ClubModel);
exports.deleteClub = handler.deleteOne(ClubModel);
