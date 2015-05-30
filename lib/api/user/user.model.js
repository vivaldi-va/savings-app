/**
 * Created by vivaldi on 28.5.2014.
 */


var mongoose	= require('mongoose');
var Schema	= mongoose.Schema;

var UserSchema = new Schema({
	email: String,
	username: String,
	passhash: String,
	attrs: {
		verified: {type: Boolean, default: false},
		invited_by: {type: Schema.Types.ObjectId, default: null},
		i18n_code: String,
		assistance: {type: Boolean, default: true}
	},
	meta: {
		created: {type: Date, default: Date.now},
		created_ip: String,
		last_log_date: {type: Date, default: Date.now},
		last_log_ip: String
	}
});

module.exports = mongoose.model('User', UserSchema);