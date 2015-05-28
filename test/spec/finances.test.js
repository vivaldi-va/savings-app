/**
 * Created by Zaccary on 26/05/2015.
 */

var request		= require('supertest');
var chai			= require('chai');
var spies			= require('chai-spies');
var io				= require('socket.io-client');
var app			= require('../../lib/server');
var config			= require('../helpers/config');
var appConfig		= require('../../lib/config/env');
var log			= require('log4js').getLogger('finances.test');
var expect			= chai.expect;
chai.use(spies);
require('../helpers/cleardb');

log.debug('finaces test', process.env.NODE_ENV);

var testUserDetails = config.user;

var socketClient;


// before running any tests, create the test
// user ONCE
before(function(done) {
	"use strict";
	request(app)
		.post('/api/auth/register')
		.set('X-Requested-With', 'XMLHttpRequest')
		.send(config.financeUser)
		.expect(201)
		.end(function(err, result) {

			if (err) {
				log.error("error creating user", err, result.text);
				return done(err);
			}

			log.debug('test user created');
			done();
		});
});




describe('Finances tests', function() {
	"use strict";

	// before each test, login with the
	// test user and save it's token for use
	// in connecting to sockets
	beforeEach(function(done) {
		request(app)
			.post('/api/auth/login')
			.set('X-Requested-With', 'XMLHttpRequest')
			.send({
				email: config.financeUser.email,
				password: config.financeUser.password
			})
			.expect(200)
			.end(function(err, result) {
				if(err) {
					throw err;
				}

				var sessionToken = result.body.token;

				var clientOpts = {
					'reconnection delay': 0,
					'repoen delay': 0,
					'force new connection': true,
					'query': "token=" + sessionToken
				};

				socketClient = io.connect('http://localhost:3001', clientOpts);

				socketClient.on('connect', function() {
					console.log('socket connected');
					done();
				});
			});
	});


	afterEach(function(done) {

		if(socketClient.connected) {
			socketClient.disconnect();
		}
		done();
	});

	console.log("socket client", socketClient);
	var testFinance = {
		name: 'finance',
		amount: '10',
		interval: 24,
		duedate: new Date('01/01/2015'),
		description: "description",
		type: 0
	};
	var addedFinance;

	describe('adding finances', function() {

		it('should not add a finance without a name', function(done) {

			socketClient.emit('finance::add', {
				name: '',
				amount: testFinance.amount,
				interval: testFinance.interval,
				duedate: testFinance.duedate,
				description: testFinance.description,
				type: testFinance.type
			});

			socketClient.on('err', function(err) {
				expect(err).to.be.ok;
				done();
			});
		});

		it('should add a finance', function(done) {

			var financeGetCallback = function(msg) {
				expect(msg).to.be.ok;
				expect(msg).to.have.property('_id');
				expect(msg).to.have.property('name');
				expect(msg).to.have.property('amount');

				expect(msg.name).to.equal(testFinance.name);
				log.debug('added finance amount', msg.amount, testFinance.amount);
				expect(msg.amount).to.equal(testFinance.amount);
				//expect(msg.name).to.equal(testFinance.name);
				//expect(msg.amount).to.equal(testFinance.amount);
				addedFinance = msg;
				done();
			};



			var financeGetCallbackSpy = chai.spy(financeGetCallback);

			socketClient.emit('finance::add', testFinance);
			socketClient.on('finance::get', financeGetCallback);

		});

		it('should generate timeline items', function(done) {

			var callbackCount = 0;
			var timelineItemGetCallback = function(msg) {
				log.debug('got timeline item');
				expect(msg).to.be.ok;
				callbackCount += 1;
				if(callbackCount === 1) {
					done();
				}
			};


			socketClient.emit('finance::add', testFinance);
			socketClient.on('timeline::item', timelineItemGetCallback);
		});

	});

	describe('modifying a finance', function() {
		it('should modify a finance', function(done) {
			addedFinance.name = 'new name';
			socketClient.emit('finance::modify', addedFinance);

			socketClient.on('finance::modified', function(msg) {
				expect(msg.name).to.equal(addedFinance.name);
				done();
			});
		});

		it('should send replacement timeline items', function(done) {
			var callbackCount = 0;
			addedFinance.name = 'new name again';
			socketClient.emit('finance::modify', addedFinance);

			socketClient.on('timeline::item', function(msg) {
				callbackCount += 1;
				expect(msg).to.have.property('name');
				expect(msg).to.have.property('finance_id');
				expect(msg).to.have.property('type');
				expect(msg.finance_id).to.equal(addedFinance._id);
				expect(msg.name).to.equal(addedFinance.name);
				if(callbackCount === 1) {
					done();
				}
			});
		});
	});

	describe('disabling a finance', function() {
		it('should disable a finance from current date if none is set', function(done) {
			socketClient.emit('finance::disable', {_id: addedFinance._id, disabled: true});
			socketClient.on('finance::disabled', function(msg) {
				expect(msg).to.have.property('_id');
				expect(msg).to.have.property('type');
				expect(msg).to.have.property('disabled');

				expect(msg._id).to.equal(addedFinance._id);
				expect(msg.disabled).to.equal(true);

				done();
			});
		});

		it('should disable a from set date', function(done) {
			var disabledDate = new Date('01/03/2015');

			var financeGetCallback = function(msg) {
				expect(msg).to.be.ok;
				expect(msg).to.have.property('_id');
				expect(msg).to.have.property('name');
				expect(msg).to.have.property('amount');

				expect(msg.name).to.equal(testFinance.name);
				log.debug('added finance amount', msg.amount, testFinance.amount);
				expect(msg.amount).to.equal(testFinance.amount);
				//expect(msg.name).to.equal(testFinance.name);
				//expect(msg.amount).to.equal(testFinance.amount);
				addedFinance = msg;


				socketClient.emit('finance::disable', {_id: addedFinance._id, disabled: true, disabled_date: disabledDate});
				socketClient.on('finance::disabled', function(msg) {
					expect(msg).to.have.property('_id');
					expect(msg).to.have.property('type');
					expect(msg).to.have.property('disabled');
					expect(msg).to.have.property('disabled_date');

					expect(new Date(msg.disabled_date).toISOString()).to.equal(disabledDate.toISOString());

					expect(msg._id).to.equal(addedFinance._id);
					expect(msg.disabled).to.equal(true);

					done();
				});
			};


			socketClient.emit('finance::add', testFinance);
			socketClient.on('finance::get', financeGetCallback);

		});
		it('should remove a finance if disabled set to false', function(done) {

			var financeGetCallback = function(msg) {
				expect(msg).to.be.ok;
				expect(msg).to.have.property('_id');
				expect(msg).to.have.property('name');
				expect(msg).to.have.property('amount');

				expect(msg.name).to.equal(testFinance.name);
				log.debug('added finance amount', msg.amount, testFinance.amount);
				expect(msg.amount).to.equal(testFinance.amount);
				//expect(msg.name).to.equal(testFinance.name);
				//expect(msg.amount).to.equal(testFinance.amount);
				addedFinance = msg;


				socketClient.emit('finance::disable', {_id: addedFinance._id, disabled: false});
				socketClient.on('finance::disabled', function(msg) {
					expect(msg).to.have.property('_id');
					expect(msg).to.have.property('type');
					expect(msg).to.have.property('disabled');
					expect(msg).to.have.property('disabled_date');
					expect(msg._id).to.equal(addedFinance._id);
					expect(msg.disabled_date).to.not.be.ok;
					expect(msg.disabled).to.equal(true);


					done();
				});
			};


			socketClient.emit('finance::add', testFinance);
			socketClient.on('finance::get', financeGetCallback);

		});
	});

});