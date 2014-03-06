/**
 * Created by vivaldi on 22/02/14.
 */

/**
 * Created by vivaldi on 01/01/14.
 */

var log 			= require('npmlog');
var dateFormat 		= require('dateformat');
var moment 			= require('moment');
var mysql			= require('mysql');
var dbConf			= require('../dbconf.json');
var user			= require('./users');
var db				= mysql.createConnection(dbConf.db);


function _getTotalPerMonth(interval, amount) {

	var daysThisMonth = moment().daysInMonth();
	var multiplyBy = null;
	switch (interval) {
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


exports.getFinances = function (req, res) {
	var model = {
		"success": false,
		"error": null,
		"message": null,
		"data": null
	};

	var userId 	= req.signedCookies.saIdent;
	db.connect();
	db.query('SELECT `id`, `name`, `amount`, `duedate`, `type`, `interval`, `description` FROM finances WHERE userid = '+userId+' AND active = 1;',
		function (err, result) {
			if (err) {
				model.error = err;
				res.send(model);
			}

			if (!result) {
				model.error = "no results found";
				res.send(model);
			} else {

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


				for (var i in result) {

					if(result[i].interval === 'once' && result[i].duedate <= new Date()) {
						//result.splice(i, 1);
						continue;
					}


					result[i].duedate =  dateFormat(result[i].duedate, 'dd/mm/yyyy');
					if (result[i].type === 0) {
						model.data.income.push(result[i]);
						model.data.attrs.income.count++;
						model.data.attrs.income.total_per_month += _getTotalPerMonth(result[i].interval, parseFloat(result[i].amount));
					}
					if (result[i].type === 1) {
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
		db.end();
};
exports.addFinance = function (req, res) {

	log.info('DEBUG', "posting a finance");
	var model = {
		"success": false,
		"error": null,
		"message": null,
		"data": null
	};

	var userId 	= req.signedCookies.saIdent;
	db.connect();

	// === | input validation | ===

	// Make sure name is not missing and isn't too long (max 50 chars)
	req.checkBody('name', "Name is missing").notEmpty();
	// min-length set to 0 to avoid having multiple errors if name is empty
	req.assert('name', "Name is too long").len(0, 50);

	// Validate amount is not missing, and is a proper format (using . or , as decimal)
	req.checkBody('amount', "Amount is missing").notEmpty();
	req.assert('amount', "Amount needs to be a currency value").is(/\d+([,.]\d+)?/);

	// Convert currency to proper float decimal format.
	if (req.body.amount) {
		req.body.amount = req.body.amount.replace(',', '.');
	}


	// Validate date is not missing and it's format is correct ('dd/mm/yyyy')
	req.checkBody('date', "date is missing").notEmpty();
	req.assert('date', "invalid date, correct format is: dd/mm/yy").is(/(\d{2})\/(\d{2})\/(\d{2,4})/);
	if (!!req.body.date) {
		var duedate = req.body.date.replace(/(\d{2})\/(\d{2})\/(\d{2,4})/, "$3-$2-$1");
	}

	// check interval
	//req.checkBody('interval', "no interval selected").notNull();

	// validate description if one is given to ensure it's length isn't greater than 140
	if (!!req.body.description) {
		req.assert('description', "description is too long").len(0, 140);
	}


	if (req.validationErrors()) {
		model.error = req.validationErrors();
		log.warn("ERROR", "Here be errors ", req.validationErrors());
		res.send(model);
	} else {

		// TODO: dont send null as a string for description if none is provided
		var sql = "INSERT INTO finances " +
			"(`id`, `userid`, `created`, `active`, `name`, `type`, `amount`, `duedate`, `interval`, `description`, `disabled`) " +
			"VALUES(null, "+userId+", null, 1, \"" + req.body.name + "\", " + req.body.type + ", " + req.body.amount + ", \"" + duedate + "\", \"" + req.body.interval + "\", \"" + req.body.description + "\", null);";

		log.info('DEBUG', sql);

		db.query(sql, function (err, result) {
			if (err) {
				log.error("ERROR", "Something went wrong %j", err);
				model.error = "Something went wrong: " + err;
				res.send(model);
			}

			if (result) {
				log.info("DEBUG", "insertion query successful", result);
				model.success = true;
				model.data = {"insertId": result.insertId};
				model.message = "New finance item added";
				res.send(model);
			}
		});
		db.end();
	}
};

exports.updateFinance = function (req, res) {
	log.info('HTTP', "PUT request for finance id " + req.params.id + " received");

	var model = {
		"success": false,
		"error": null,
		"message": null,
		"data": null
	};

	// TODO: validation for updating finance details

	var duedate = req.body.duedate.replace(/(\d{2})\/(\d{2})\/(\d{2,4})/, "$3-$2-$1");
	var db 		= mysql.createConnection(dbConf.db);
	db.connect();
	db.query("UPDATE finances SET `name`=\"" + req.body.name + "\", `amount`=" +
		req.body.amount + ", `duedate` = \"" + duedate + "\", `interval` = \"" + req.body.interval + "\", `description` = \"" + req.body.description + "\"" +
		" WHERE id = " + req.params.id,
		function (err, result) {
			if (err) {
				log.error('SQL ERR', "error updating finance item", err);
				model.error = err;
				res.send(model);
				db.end();
			}
			if (result) {
				log.info('HTTP', "Finance updating successful", result);
				model.success = true;
				model.message = "finance id " + req.params.id + " updated";
				res.send(model);
			}
		});
		db.end();
};

exports.removeFinance = function (req, res) {
	log.info('HTTP', "DELETE request for finance id " + req.params.id + " received");

	var model = {
		"success": false,
		"error": null,
		"message": null,
		"data": null
	};
	var db = mysql.createConnection(dbConf.db);
	db.connect();
	db.query("UPDATE finances SET `active` = 0, `disabled` = CURRENT_DATE" +
		" WHERE id = " + req.params.id,
		function (err, result) {
			if (err) {
				log.error('SQL ERR', "error updating finance item", err);
				model.error = err;
				db.end();
				res.send(model);
			}
			if (result) {
				log.info('HTTP', "Finance updating successful", result);
				model.success = true;
				model.message = "finance id " + req.params.id + " updated";

				res.send(model);
			}
		});
		db.end();
};