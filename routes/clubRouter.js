const express = require('express');
const clubCtrl = require('../controller/clubCtrl');
const authCtrl = require('../controller/authCtrl');

const router = express.Router();

router.get('/', clubCtrl.getAllClub);

router.use(authCtrl.protect);

router.post('/', clubCtrl.createClub);

module.exports = router;
