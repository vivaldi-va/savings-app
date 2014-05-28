/**
 * Created by vivaldi on 28.5.2014.
 */

var express			= require('express');
var config			= require('./config');
var validator		= require('express-validator');
var path			= require('path');
var morgan			= require('morgan');
var compression		= require('compression');
var bodyParser		= require('body-parser');
var methodOverride	= require('method-override');
var cookieParser	= require('cookie-parser');
var session			= require('express-session');
var errorHandler	= require('errorhandler');
var log				= require('npmlog');

module.exports = function(app) {
	app.configure(function() {
		app.use(cookieParser("gO0g$I3qkEWr0X&C92*P/=aiL8NAV-"));
		app.use(session({secret: "gO0g$I3qkEWr0X&C92*P/=aiL8NAV-"}));
		app.use(validator());
		app.set('views', config.root + '/public/views');
		app.engine('html', require('ejs').renderFile);

		if(process.env.NODE_ENV === 'production') {
			app.use(express.static(path.join(config.root, 'dist/public'))); 	// set the static files location /public/img will be /img for users
		} else {
			app.use('/', express.static(path.join(config.root, 'public/landing'))); 	// set the static files location /public/img will be /img for users
			app.use('/app', express.static(path.join(config.root, 'public'))); 	// set the static files location /public/img will be /img for users
		}
		//log.info('DEBUG:', "static path", path.join(config.root, 'public'));
		app.use(express.logger('dev')); 						// log every request to the console
		app.use(morgan('dev'));
		app.use(express.json());
		app.use(express.urlencoded());							// pull information from html in POST
		app.use(methodOverride()); 						// simulate DELETE and PUT
	});
};