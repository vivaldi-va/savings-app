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



	app.get('/api/finances', function(req, res) {

		var model = {
			"success": false,
			"error": null,
			"message": null,
			"data": null
		};

		db.query('SELECT `id`, `name`, `amount`, `duedate`, `type`, `interval`, `description` FROM finances WHERE userid = 1 AND active = 1',
			function(err, result) {
				if(err) {
					model.error = err;
					res.send(model);
				}

				if(!result) {
					model.error = "no results found";
					res.send(model);
				} else {
					log.info('QUERY', "getting finances successful");


					model.data = {
						"income": [],
						"expenses": []
					};

					for(var i = 0; i<result.length; i++) {
						if(result[i].type === 0) model.data.income.push(result[i]);
						if(result[i].type === 1) model.data.expenses.push(result[i]);
					}

					//model.data = result;
					model.success = true;
					model.message = "got some stuff";
					res.send(model);
				}
			});
	});

	app.post('/api/finances', function(req, res) {

		log.info('DEBUG', "posting a finance");
		var model = {
			"success": false,
			"error": null,
			"message": null,
			"data": null
		};
		var sql = "INSERT INTO finances " +
			"(`id`, `userid`, `created`, `active`, `name`, `type`, `amount`, `duedate`, `interval`, `description`) " +
			"VALUES(null, 1, null, 1, \"" + req.body.name + "\", " + req.body.type + ", " + req.body.amount + ", \"" + req.body.date + "\", \"" + req.body.interval + "\", \"" + req.body.description + "\");";


		log.info("DEBUG", "Sql for inserting finance: %s", sql);
		// input validation
		req.checkBody('name', "Name is missing").notEmpty();
		req.assert('name', "Name is too long").len(1,50);

		req.checkBody('amount', "Amount is missing").notEmpty();
		req.assert('amount', "Amount needs to be a currency value").is(/\d+([,.]\d+)?/);

		if(req.validationErrors()) {
			model.error = req.validationErrors();
			log.warn("ERROR", "Here be errors ", req.validationErrors());
			res.send(model);
		}



		db.query(sql, function(err, result) {
			if (err) {
				log.error("ERROR", "Something went wrong %j", err);
				model.error = "Something went wrong: " + err;
				res.send(model);
			}

			if(result) {
				model.success = true;
				model.message = "New finance item added";
				res.send(model);
			}
		});





	});


	app.put('/api/finances/:id', function(req, res) {
		log.info('HTTP', "PUT request for finance id " + req.params.id + " received");

		var model = {
			"success": false,
			"error": null,
			"message": null,
			"data": null
		};

		// validate new data values

		try {
			db.query("UPDATE finances SET `name`=\""+req.body.name+"\", `amount`=" +
				req.body.amount + ", `duedate` = \"" + req.body.date + "\", `interval` = \"" + req.body.interval + "\", `description` = \"" + req.body.description + "\"" +
				" WHERE id = " + req.params.id,
				function(err, result) {
					if(err) {
						log.error('SQL ERR', "error updating finance item");

						throw err;
					}
					if(result) {
						log.info('HTTP', "Finance updating successful", result);
						model.success = true;
						model.message = "finance id " + req.params.id + " updated";

						res.send(model);
					}
				});
		} catch(err) {
			model.error = err;
			res.send(model);
		}
	});


	app.listen(3000);
}

// Listen for dying workers
cluster.on('exit', function (worker) {

	// Replace the dead worker,
	// we're not sentimental
	log.warn('Cluster', 'Worker has died :c', worker.id);
	cluster.fork();

});
