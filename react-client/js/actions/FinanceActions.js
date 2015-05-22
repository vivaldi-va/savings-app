/**
 * Created by vivaldi on 08/03/2015.
 */

'use strict';
var AppDispatcher = require('../dispatcher/AppDispatcher');
var SavingsAppConstants = require('../constants/SavingsAppConstants');


var SavingsFinanceActions = {

	addFinance: function(data) {
		AppDispatcher.handleAction({
			actionType: SavingsAppConstants.FINANCE_ADD,
			data: data
		});
	},

	removeFinance: function(id) {
		AppDispatcher.handleAction({
			actionType: SavingsAppConstants.FINANCE_REMOVE,
			id: id
		});
	},

	updateFinance: function(id, data) {
		AppDispatcher.handleAction({
			actgionType: SavingsAppConstants.FINANCE_UPDATE,
			id: id,
			data: data
		});
	}
};

module.exports = SavingsFinanceActions;