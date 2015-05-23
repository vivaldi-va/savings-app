/**
 * Created by Zaccary on 23/05/2015.
 */


var express = require('express');

var router = express.Router();

var controller = require('./auth.controller.js');

router.get('/session', controller.session);
router.post('/register', controller.create);
router.post('/login', controller.login);
router.get('/logout', controller.logout);

module.exports = router;