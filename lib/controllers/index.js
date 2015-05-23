/**
 * Created by vivaldi on 01/01/14.
 */



/**
 * initialize the controllers using this
 * it basically channels the express app
 * @param app
 */
module.exports.set = function(app, db) {
	var finances = require('./../api/finances/finances.controller.js').set(app, db);
	var timeline = require('./../api/timeline/timeline.controller.js').set(app, db);
};