/**
 * Created by Zaccary on 23/05/2015.
 */


var express = require('express');

var router = express.Router();

var controller = require('./user.controller.js');

router.post('/api/user/update', controller.changeDetails);
router.post('/api/user/passreset', controller.requestPassReset);
router.get('/api/user/passreset/:token', controller.resetPassAuth);
router.put('/api/user/passreset/:token', controller.resetPass);

router.put('/api/user/verify/:token', controller.verifyEmail);



module.exports = router;