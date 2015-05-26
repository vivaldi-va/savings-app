/**
 * Created by Zaccary on 23/05/2015.
 */

module.exports = {
	port: 3001,
	mongo: {
		uri: 'mongodb://localhost/savings-test',
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
