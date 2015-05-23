/**
 * Created by Zaccary on 23/05/2015.
 */


var _ = require('lodash');
var path = require('path');

var all = {
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 3000,

	// Root path of server
	root: path.normalize(__dirname + '/../../..')
};

module.exports = _.merge(
	all,
	require('./' + all.env + '.js')
);