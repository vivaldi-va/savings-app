/**
 * Created by Zaccary on 23/05/2015.
 */


var express = require('express');

var router = express.Router();

var controller = require('./timeline.controller.js');


router.get('/', controller.getEmptyTimeline);
router.put('/modify', controller.modifyTimelineItem);

module.exports = router;