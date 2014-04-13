/**
 * Created by vivaldi on 23/12/13.
 */
'use strict';
var cluster 	= require('cluster');
var log			= require('npmlog');

log.enableColor();


if (cluster.isMaster) {
	log.info('Cluster', "setting up master thread");
	// Count the machine's CPUs
	var cpuCount = require('os').cpus().length;

	// Create a worker for each CPU
	for (var i = 0; i < cpuCount; i += 1) {
		cluster.fork();
		log.info('Cluster', "Forking worker " + (i+1));
	}

// Code to run if we're in a worker process
} else {
	log.info('Cluster', "Setting up worker worker");
	var express 	= require('express');
	var mysql 		= require('mysql');
	var q 			= require('q');
	var validator	= require('express-validator');
	var dbConf		= require('./lib/config/conf.json');
	var app 		= express();
	var pool		= mysql.createPool(dbConf.db);





	/*
	 * TODO: make express.static point to /app for the actual app stuff, and / point to landing page stuff
	 * using ejs with html as view engine (google that shit, again...)
	 * maybe use routes to indicate rendering views, or just use express.static if that works.
	 */
	app.configure(function() {
		app.use(express.cookieParser("gO0g$I3qkEWr0X&C92*P/=aiL8NAV-"));
		app.use(express.session({secret: "gO0g$I3qkEWr0X&C92*P/=aiL8NAV-"}));
		app.use(validator());
		app.set('views', './public');
		app.engine('html', require('ejs').renderFile);
		if(process.env.NODE_ENV === 'production') {
			app.use(express.static(__dirname + 'dist/public')); 	// set the static files location /public/img will be /img for users
		} else {
			app.use('/', express.static(__dirname + '/public/landing')); 	// set the static files location /public/img will be /img for users
			app.use('/app', express.static(__dirname + '/public')); 	// set the static files location /public/img will be /img for users
		}
		//log.info('DEBUG:', "static path", __dirname + '/public');
		app.use(express.logger('dev')); 						// log every request to the console
		app.use(express.json());
		app.use(express.urlencoded());							// pull information from html in POST
		app.use(express.methodOverride()); 						// simulate DELETE and PUT
	});

	//log.info('DEBUG:', "static path", __dirname + '/public');

	//var controllers = require('./controllers').set(app, db);
	var routes		= require('./lib/routes')(app);
	var dbConn		= require('./lib/config/dbConnection')(pool);


	var port = process.env.PORT || 3000;
	app.listen(port);
	log.info('SERVER', "Listening on port", port);
}

// Listen for dying workers
cluster.on('exit', function (worker) {

	// Replace the dead worker,
	// we're not sentimental
	log.warn('Cluster', 'Worker ' + worker.id + ' has died', "Goodnight, sweet prince.");
	cluster.fork();

});
