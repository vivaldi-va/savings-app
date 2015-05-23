/**
 * Created by Zaccary on 23/05/2015.
 */

module.exports = {
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
