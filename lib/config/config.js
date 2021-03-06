/**
 * Created by vivaldi on 28.5.2014.
 */
var path = require('path');
var pkg = require('../../package.json');
var rootPath = path.normalize(__dirname + '/../..');

module.exports = {
	root: rootPath,
	port: process.env.PORT || 3000,
	_v: pkg.version,
	mongo: {
		uri: 'mongodb://localhost/savings',
		options: {
			db: {
				safe: true
			}
		}
	},
	auth: {
		// TODO: use an ssh key file for each auth secret
		jwt: {
			secret: 'secret'
		},
		aes: {
			secret: 'supersecret'
		}
	}
};