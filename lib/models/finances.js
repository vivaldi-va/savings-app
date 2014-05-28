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
	description: String,
	disabled: Boolean,
	disabled_date: Date
});

mongoose.model('Finance', FinanceSchema);