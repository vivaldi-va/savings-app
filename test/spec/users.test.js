/**
 * Created by Vivaldi on 06/08/14.
 */


var request			= require('supertest');
var assert			= require('assert');
var port			= process.env.PORT || 3000;
var serverUrl		= 'http://localhost:' + port;
var app				= request(serverUrl);

var testUserDetails = {
	email: 'email@email.com',
	password: 'password',
	username: 'username'
};

describe('User account testing', function() {

	describe("POST /api/user/register", function() {

		it("Shouldn't register a user without details", function(done) {
			app
				.post('/api/user/register')
				.expect(400, done);
		});

		it("Should register a user", function(done) {
			app
				.post('/api/user/register')
				.send(testUserDetails)
				.expect(201, done);
		});
	});

	describe('POST /api/user/login', function() {
		it("Should return 400 if email missing", function(done) {
			app
				.post('/api/user/login')
				.expect(400, done);
		});

		it("Should return 400 if password missing", function(done) {
			app
				.post('/api/user/login')
				.send({"email": testUserDetails.email})
				.expect(400, done);
		});

		it("Should return 401 if password wrong", function(done) {
			app
				.post('/api/user/login')
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
			app
				.post('/api/user/login')
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
					expect(res.body.email).to.equal(testUserDetails.email);
					done();
				});
		});
	});

	describe("DELETE /api/user/testuser", function() {
		it("Should delete the test user", function(done) {
			app
				.delete('/api/user/testuser')
				.expect(204, done);
		})
	});
});