/**
 * Created by vivaldi on 01/01/14.
 */



module.exports.set = function(app, db) {
	var log			= require('npmlog');
	var dateFormat	= require('dateformat');
	var moment		= require('moment');




	function _getTotalPerMonth(interval, amount) {

		var daysThisMonth = moment().daysInMonth();
		var multiplyBy = null;
		switch(interval) {
			case 'day':
				multiplyBy = daysThisMonth;

				break;
			case 'week':
				multiplyBy = 4;

				break;
			case 'biweekly':
				multiplyBy = 2;
				break;
			case 'month':
				multiplyBy = 1;
				break;
			case 'sixmonths':

				break;
			case 'year':

				break;
		}
		//log.info('_getTotalPerMonth', "mult numbe", multiplyBy, "calc'd amount", amount * multiplyBy);
		return amount * multiplyBy;
	}

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
					//log.info('QUERY', "getting finances successful", result);


					model.data = {
						"income": [],
						"expenses": [],
						"attrs": {
							"income": {
								"count": 0,
								"total_per_month": 0
							},
							"expenses": {
								"count": 0,
								"total_per_month": 0
							}

						}
					};

					for(var i = 0; i<result.length; i++) {
						var dateTest = [result[i].duedate.getFullYear(), result[i].duedate.getMonth(), result[i].duedate.getDate()];
						log.info('DEBUG', "date debugging", dateTest);
						var newDate = dateFormat(result[i].duedate, 'dd/mm/yyyy');
						result[i].duedate = newDate;

						if(result[i].type === 0) {
							model.data.income.push(result[i]);
							model.data.attrs.income.count++;
							model.data.attrs.income.total_per_month += _getTotalPerMonth(result[i].interval, parseFloat(result[i].amount));
						}
						if(result[i].type === 1) {
							model.data.expenses.push(result[i]);
							model.data.attrs.expenses.count++;
							model.data.attrs.expenses.total_per_month += _getTotalPerMonth(result[i].interval, parseFloat(result[i].amount));
						}
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

//		log.info("DEBUG", "Sql for inserting finance: %s", sql);
		// input validation
		req.checkBody('name', "Name is missing").notEmpty();
		req.assert('name', "Name is too long").len(0,50);

		// valdiate, generate errors
		req.checkBody('amount', "Amount is missing").notEmpty();
		req.assert('amount', "Amount needs to be a currency value").is(/\d+([,.]\d+)?/);

		//convert currency to propper float decimal format.
		if(req.body.amount) {
			req.body.amount = req.body.amount.replace(',', '.');
		}



		// Validate date
		req.checkBody('date', "date is missing").notEmpty();
		req.assert('date', "invalid date, correct format is: dd/mm/yy").is(/(\d{2})\/(\d{2})\/(\d{2,4})/);
		if(!!req.body.date) {
			var duedate = req.body.date.replace(/(\d{2})\/(\d{2})\/(\d{2,4})/, "$3-$2-$1");
		}

		// check interval
		req.checkBody('interval', "no interval selected").notNull();

		// validate description if one is given
		if(!!req.body.description) {
			req.assert('description', "description is too long").len(1,140);
		}


		if(req.validationErrors()) {
			model.error = req.validationErrors();
			log.warn("ERROR", "Here be errors ", req.validationErrors());
			res.send(model);
		} else {
			var sql = "INSERT INTO finances " +
				"(`id`, `userid`, `created`, `active`, `name`, `type`, `amount`, `duedate`, `interval`, `description`, `disabled`) " +
				"VALUES(null, 1, null, 1, \"" + req.body.name + "\", " + req.body.type + ", " + req.body.amount + ", \"" + duedate + "\", \"" + req.body.interval + "\", \"" + req.body.description + "\", null);";

			log.info('DEBUG', sql);

			db.query(sql, function(err, result) {
				if (err) {
					log.error("ERROR", "Something went wrong %j", err);
					model.error = "Something went wrong: " + err;
					res.send(model);
				}

				if(result) {
					log.info("DEBUG", "insertion query successful", result);
					model.success = true;
					model.data = {"insertId": result.insertId};
					model.message = "New finance item added";
					res.send(model);
				}
			});
		}
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

		var duedate = req.body.duedate.replace(/(\d{2})\/(\d{2})\/(\d{2,4})/, "$3-$2-$1");
		db.query("UPDATE finances SET `name`=\""+req.body.name+"\", `amount`=" +
			req.body.amount + ", `duedate` = \"" + duedate + "\", `interval` = \"" + req.body.interval + "\", `description` = \"" + req.body.description + "\"" +
			" WHERE id = " + req.params.id,
			function(err, result) {
				if(err) {
					log.error('SQL ERR', "error updating finance item", err);
					model.error = err;
					res.send(model);
				}
				if(result) {
					log.info('HTTP', "Finance updating successful", result);
					model.success = true;
					model.message = "finance id " + req.params.id + " updated";

					res.send(model);
				}
			});
	});

	app.delete('/api/finances/:id', function(req, res) {
		log.info('HTTP', "DELETE request for finance id " + req.params.id + " received");

		var model = {
			"success": false,
			"error": null,
			"message": null,
			"data": null
		};

		db.query("UPDATE finances SET `active` = 0, `disabled` = CURRENT_DATE"+
			" WHERE id = " + req.params.id,
			function(err, result) {
				if(err) {
					log.error('SQL ERR', "error updating finance item", err);
					model.error = err;
					res.send(model);
				}
				if(result) {
					log.info('HTTP', "Finance updating successful", result);
					model.success = true;
					model.message = "finance id " + req.params.id + " updated";

					res.send(model);
				}
			});
	});
};