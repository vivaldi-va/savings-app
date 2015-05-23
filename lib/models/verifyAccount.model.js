/**
 * Created by vivaldi on 28.5.2014.
 */

var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var VerifySchema = new Schema({
	user_id:Schema.Types.ObjectId,
	email: String,
	token: String
});

module.exports = mongoose.model('Verify', VerifySchema);