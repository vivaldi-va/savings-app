/**
 * Created by vivaldi on 08/03/2015.
 */

'use strict';
var AppDispatcher = require('../dispatcher/AppDispatcher');
var FinanceActionTypes = require('../constants/FinanceActionTypes');


var FinanceActions = {

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

	updateFinance: function(data) {
		console.log('update finance', data);
		AppDispatcher.handleAction({
			actionType: FinanceActionTypes.FINANCE_UPDATED,
			data: data
		});
	},

	openModal: function(type, finance) {
		finance = finance || null;

		console.log('open modal', type);
		AppDispatcher.handleAction({
			actionType: FinanceActionTypes.FINANCE_MODAL_OPEN,
			data: {
				open: true,
				type: type,
				finance: finance
			}
		});
	},
	closeModal: function() {
		AppDispatcher.handleAction({
			actionType: FinanceActionTypes.FINANCE_MODAL_OPEN,
			data: null

		});
	}
};

module.exports = FinanceActions;