/**
 * Created by vivaldi on 08/03/2015.
 */

'use strict';
var AppDispatcher = require('../dispatcher/AppDispatcher');
var FinanceActionTypes = require('../constants/FinanceActionTypes');


var SavingsFinanceActions = {

	addFinance: function(data) {
		AppDispatcher.handleAction({
			actionType: FinanceActionTypes.FINANCE_ADD,
			data: data
		});
	},

	removeFinance: function(id) {
		AppDispatcher.handleAction({
			actionType: FinanceActionTypes.FINANCE_REMOVE,
			id: id
		});
	},

	updateFinance: function(id, data) {
		AppDispatcher.handleAction({
			actgionType: FinanceActionTypes.FINANCE_UPDATE,
			id: id,
			data: data
		});
	}
};

module.exports = SavingsFinanceActions;