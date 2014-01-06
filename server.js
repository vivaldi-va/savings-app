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
		log.info('Cluster', "Forking worker");
	}

// Code to run if we're in a worker process
} else {
	log.info('Cluster', "Setting up worker worker");
	var express 	= require('express');
	var mysql 		= require('mysql');
	var q 			= require('q');
	var validator	= require('express-validator');
	var conf		= require('./conf.json');
	var app 		= express();



	app.configure(function() {
		app.use(express.cookieParser());
		app.use(express.session({secret: "gO0g$I3qkEWr0X&C92*P/=aiL8NAV-"}));
		app.use(validator());
		app.use(express.static(__dirname + '/public/app')); 	// set the static files location /public/img will be /img for users
		app.use(express.logger('dev')); 						// log every request to the console
		app.use(express.json());
		app.use(express.urlencoded());							// pull information from html in POST
		app.use(express.methodOverride()); 						// simulate DELETE and PUT
	});


	var db = mysql.createConnection(conf.db);
	var controllers = require('./controllers').set(app, db);





	var port = process.env.PORT || 3000;
	app.listen(port);
}

// Listen for dying workers
cluster.on('exit', function (worker) {

	// Replace the dead worker,
	// we're not sentimental
	log.warn('Cluster', 'Worker has died :c', worker.id);
	cluster.fork();

});
