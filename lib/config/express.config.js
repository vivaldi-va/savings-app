/**
 * Created by vivaldi on 28.5.2014.
 */

'use strict';

var express			= require('express');
var config				= require('./env');
var validator			= require('express-validator');
var path				= require('path');
var morgan			= require('morgan');
var compression		= require('compression');
var bodyParser			= require('body-parser');
var methodOverride	= require('method-override');
var cookieParser		= require('cookie-parser');
var session			= require('express-session');
var errorHandler		= require('errorhandler');
var log4js				= require('log4js');
var log				= log4js.getLogger('app');

module.exports = function(app) {
	app.use(cookieParser("gO0g$I3qkEWr0X&C92*P/=aiL8NAV-"));
	//app.use(session({secret: "gO0g$I3qkEWr0X&C92*P/=aiL8NAV-"}));
	app.use(validator());
	//app.use(require('express-domain-middleware'));
	app.set('views', config.root + '/lib/views');
	app.set('view engine', 'jade');

	app.use('/', express.static(path.join(config.root, 'public/landing')));

	if(process.env.NODE_ENV === 'production') {
		app.use('/app', express.static(path.join(config.root, 'dist/public')));
	} else {
		app.use('/app', express.static(path.join(config.root, '.tmp')));
		app.use('/app', express.static(path.join(config.root, 'react-client')));
		app.use('/app', express.static(path.join(config.root, 'node_modules')));
		app.use('/old', express.static(path.join(config.root, 'public')));
	}

	//app.use(express.logger('dev')); 						// log every request to the console
	app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }));
	//app.use(morgan('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(methodOverride()); 						// simulate DELETE and PUT

	app.use(function errorHandler(err, req, res, next) {
		log.error("Server error", process.domain.id, req.method, req.url, err);
		res.send(500, "Server error");
	});
};