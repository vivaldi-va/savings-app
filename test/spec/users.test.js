/**
 * Created by Vivaldi on 06/08/14.
 */


var request		= require('supertest');
//var assert			= require('assert');
var expect			= require('chai').expect;
var app			= require('../../lib/server');

var config			= require('../helpers/config');
require('../helpers/cleardb');

var testUserDetails = config.user;

describe('User account testing', function() {
	describe("POST /api/user/register", function() {

		it("Shouldn't register a user without details", function(done) {
			request(app)
				.post('/api/auth/register')
				.set('X-Requested-With', 'XMLHttpRequest')
				.expect(400, done);
		});

		it("Should register a user", function(done) {
			request(app)
				.post('/api/auth/register')
				.set('X-Requested-With', 'XMLHttpRequest')
				.send(testUserDetails)
				.expect(201, done);
		});
	});

	describe('POST /api/auth/login', function() {
		it("Should return 400 if email missing", function(done) {
			request(app)
				.post('/api/auth/login')
				.set('X-Requested-With', 'XMLHttpRequest')
				.expect(400, done);
		});

		it("Should return 400 if password missing", function(done) {
			request(app)
				.post('/api/auth/login')
				.set('X-Requested-With', 'XMLHttpRequest')
				.send({"email": testUserDetails.email})
				.expect(400, done);
		});

		it("Should return 401 if password wrong", function(done) {
			request(app)
				.post('/api/auth/login')
				.set('X-Requested-With', 'XMLHttpRequest')
				.send({
					"email": testUserDetails.email,
					"password": "wrongpassword"
				})
				.expect(401)
				.end(function(err, result) {

					if(err) {
						return done(err);
					}

					expect(result.body).to.be.empty;
					expect(result.text).to.equal('ERR_BAD_PASS');
					done();

				});
		});

		it("Should log in with correct details", function(done) {
			request(app)
				.post('/api/auth/login')
				.set('X-Requested-With', 'XMLHttpRequest')
				.send({
					"email": testUserDetails.email,
					"password": testUserDetails.password
				})
				.expect(200)
				.end(function(err, res) {
					if(err) {
						return done(err);
					}

					expect(res.body).to.not.be.empty;
					expect(res.body).to.have.property('token');
					expect(res.body).to.have.property('_id');
					//expect(res.body.email).to.equal(testUserDetails.email);
					done();
				});
		});
	});
/*
	describe("DELETE /api/auth/testuser", function() {
		it("Should delete the test user", function(done) {
			request(app)
				.delete('/api/auth/testuser')
				.set('X-Requested-With', 'XMLHttpRequest')
				.expect(204, done);
		});
	});*/
});