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
	log.info('Cluster', "Setting up worker");
	var fs			= require('fs');
	var path		= require('path');
	var express 	= require('express');
	var mongoose	= require('mongoose');
	var q 			= require('q');
	var config		= require('./lib/config/config');
	var app 		= express();
	var port		= process.env.PORT || 3000;

	var db			= mongoose.connect(config.mongo.uri);
	var modelsPath	= path.join(__dirname, 'lib/models');

	fs.readdirSync(modelsPath).forEach(function (file) {
		if (/(.*)\.(js$|coffee$)/.test(file)) {
			require(modelsPath + '/' + file);
		}
	});

	require('./lib/config/express')(app);
	require('./lib/routes')(app);


	app.listen(port, function() {
		log.info('SERVER', "Listening on port", port);
	});

	exports = module.exports = app;
}

// Listen for dying workers
cluster.on('exit', function (worker) {

	// Replace the dead worker,
	// we're not sentimental
	log.warn('Cluster', 'Worker ' + worker.id + ' has died', "Goodnight, sweet prince.");
	cluster.fork();

});
