/**
 * Created by Zaccary on 23/05/2015.
 */

var express = require('express');
var router = express.Router();

var controller = require('./finances.controller.js');

router.get('/', controller.getFinances);
router.post('/', controller.addFinance);
router.put('/:id', controller.updateFinance);
router.delete('/:id', controller.removeFinance);

module.exports = router;