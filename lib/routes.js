/**
 * Created by vivaldi on 22/02/14.
 */


var finances 	= require('./controllers/finances.js');
var timeline 	= require('./controllers/timeline.js');
var users 		= require('./controllers/users.js');


module.exports = function(app) {
	// Server API Routes
	app.get('/', function(req, res) {
		res.render('index.html');
	});

	app.get('/app', function(req, res) {
		res.render('index.html');
	});
	// Finance API routes
	app.get('/api/finances', finances.getFinances);
	app.post('/api/finances', finances.addFinance);
	app.put('/api/finances/:id', finances.updateFinance);
	app.delete('/api/finances/:id', finances.removeFinance);

	// Timeline API routes
	app.get('/api/timeline', timeline.getTimeline);

	// User API routes
	app.get('/api/user/session', users.session);
	app.post('/api/user/register', users.register);
	app.post('/api/user/login', users.login);
	app.get('/api/user/logout', users.logout);
	app.post('/api/user/update', users.changeDetails);
};