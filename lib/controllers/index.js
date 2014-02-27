/**
 * Created by vivaldi on 01/01/14.
 */



/**
 * initialize the controllers using this
 * it basically channels the express app
 * @param app
 */
module.exports.set = function(app, db) {
	var finances = require('./finances.js').set(app, db);
	var timeline = require('./timeline.js').set(app, db);
};