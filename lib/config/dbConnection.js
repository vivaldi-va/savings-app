/**
 * Created by vivaldi on 31/03/2014.
 */

var usersCtrl		= require('../controllers/users');
var financesCtrl	= require('../controllers/finances');
var timelineCtrl	= require('../controllers/timeline');

module.exports = function(pool) {
	usersCtrl.conn(pool);
	financesCtrl.conn(pool);
	timelineCtrl.conn(pool);
};