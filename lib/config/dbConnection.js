/**
 * Created by vivaldi on 31/03/2014.
 */

var usersCtrl		= require('../controllers/users.controller');
var financesCtrl	= require('../controllers/finances.controller');
var timelineCtrl	= require('../controllers/timeline.controller');

module.exports = function(pool) {
	usersCtrl.conn(pool);
	financesCtrl.conn(pool);
	timelineCtrl.conn(pool);
};