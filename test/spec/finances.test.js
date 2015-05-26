/**
 * Created by Zaccary on 26/05/2015.
 */

var request		= require('supertest');
var expect			= require('chai').expect;
var io				= require('socket.io-client');
var app			= require('../../lib/server');
var config			= require('../helpers/config');
var appConfig		= require('../../lib/config/env');
var log			= require('log4js').getLogger('finances.test');
require('../helpers/cleardb');

log.debug('finaces test', process.env.NODE_ENV);

var testUserDetails = config.user;

var sessionToken;
var socketClient;

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

				sessionToken = result.body.token;

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
			//socketClient.disconnect();
		}
		done();
	});

	console.log("socket client", socketClient);
	var testFinance = {
		name: 'finance',
		amount: 10,
		interval: 24,
		duedate: new Date('01/01/2015'),
		type: 0
	};

	describe('adding finances', function() {
		it('should add a finance', function(done) {
			socketClient.emit('finance::add', testFinance);
			socketClient.on('finance::get', function(msg) {
				expect(msg).to.be.ok;
				done();
			});
		});
	});

});