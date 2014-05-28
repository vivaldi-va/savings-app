/**
 * Created by vivaldi on 28.5.2014.
 */

var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var FinanceSchema = new Schema({
	user_id: Schema.Types.ObjectId,
	name: String,
	amount: Number,
	duedate: Date,
	interval: Number,
	type: Number,
	description: {type: String, default: null},
	disabled: {type: Boolean, default: false},
	disabled_date: {type: Date, default: null},
	meta: {
		created: {type: Date, default: Date.now}
	},
	modifications: [{
		date: Date,
		amount: Number
	}]
});

mongoose.model('Finance', FinanceSchema);