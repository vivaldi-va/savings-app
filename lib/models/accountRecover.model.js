/**
 * Created by vivaldi on 28.5.2014.
 */

var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var RecoverSchema = new Schema({
	email: String,
	token: String,
	created: {type: Date, default: Date.now},
	request_ip: String
});

module.exports = mongoose.model('Recover', RecoverSchema);