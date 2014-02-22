/**
 * Created by vivaldi on 22/02/14.
 */


var finances = require('../controllers/finances.js');
var timeline = require('../controllers/timeline.js');


module.exports = function(app) {
	// Server API Routes
	app.get('/api/finances', finances.getFinances);
	app.post('/api/finances', finances.addFinance);
	app.put('/api/finances/:id', finances.updateFinance);
	app.delete('/api/finances/:id', finances.removeFinance);
};