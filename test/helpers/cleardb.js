/**
 * Created by Zaccary on 26/05/2015.
 */


var mongoose	= require('mongoose');
var log		= require('log4js').getLogger('test::util');
log.debug("test/helpers/cleardb.js");

// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
process.env.NODE_ENV = 'test';

var clearDB = function clearDB(cb) {
	"use strict";
	log.debug('UTIL', "clearing test database");
	var i = 0;
	for (var collection in mongoose.connection.collections) {
		if(mongoose.connection.collections.hasOwnProperty(collection)) {
			log.debug("removing collection %s from %s", collection, mongoose.connection.name);
			mongoose.connection.collections[collection].remove(function() {
				i += 1;
				log.debug("removed collection %d of %d", i, Object.keys(mongoose.connection.collections).length);

				// only call back if asynchronously removed all collections
				if(i === Object.keys(mongoose.connection.collections).length) {
					cb(null);
				}
			});
		}
	}
};

before(function (done) {


	function reconnect() {
		log.debug('UTIL', "Reconnecting to test database");
		mongoose.connect('mongodb://localhost/savings-test', function (err) {
			if (err) {
				throw err;
			}

			log.debug("connected to test db");
		});
	}

	switch (mongoose.connection.readyState) {
		case 0:
			reconnect();
			break;
		case 1:
			done();
			break;
	}

	mongoose.connection.on('connected', function () {
		log.debug("UTIL", "Connected to DB %s", mongoose.connection.name, !!mongoose.connection.readyState);
		clearDB(function() {
			"use strict";
			done();
		});
	});
});

after(function (done) {
	"use strict";
	log.info("tests done, clearing db");
	clearDB(function() {
		done();
	});
});