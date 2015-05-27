
/**
 * Created by vivaldi on 07/03/2015.
 */


var _						= require('underscore');
var moment				= require('moment');
var AppDispatcher			= require('../dispatcher/AppDispatcher');
var EventEmitter			= require('events').EventEmitter;
var FinanceActionTypes	= require('../constants/FinanceActionTypes');
var FinanceAPI				= require('../utils/FinanceAPI');

// Define initial data points
var _finances = {
	income: [],
	expense: []
};
var _financeModalState = null;
var _financeTotals = {
	income: 0,
	expense: 0
};



var calcFinanceTotals = function() {
	"use strict";

	var calc = function(finance) {

		var type = finance.type === 0 ? "income" : "expense";

		switch(finance.interval) {
			case 24:
				_financeTotals[type] += finance.amount * moment().daysInMonth();
				break;
			case 24*7:
				_financeTotals[type] += finance.amount * 4;
				break;
			case 24*7*2:
				_financeTotals[type] += finance.amount * 2;
				break;
			case 24*31:
				_financeTotals[type] += finance.amount;
				break;
		}
	};

	for(var i in _finances) {
		if(_finances.hasOwnProperty(i)) {
			var type = _finances[i];
			type.forEach(calc);
		}
	}
};

// Add a new finance
function addFinance(finance) {
	if(finance.type === 0) {
		_finances.income.push(finance);
	} else {
		_finances.expense.push(finance);
	}

	calcFinanceTotals();

}

// Remove item from cart
function removeFinance(id) {
	for(var i in _finances) {
		for(var f in _finances[i]) {
			if(_finances[i][f]._id === id) {
				_finances[i] = _finances[i].splice(f, 1);
				return;
			}
		}
	}
}


function updateFinance(updatedFinance) {
	"use strict";

	for(var i in _finances) {
		if(_finances.hasOwnProperty(i)) {
			_finances[i] = _finances[i].map(function(finance) {
				if(finance._id === updatedFinance._id) {
					finance.name = updatedFinance.name;
					finance.amount = updatedFinance.amount;
					finance.duedate = updatedFinance.duedate;
					finance.interval = updatedFinance.interval;
					finance.description = updatedFinance.description;
				}
				return finance;
			});
			calcFinanceTotals.call(null);
		}
	}
}

function setFinanceModalOpen(data) {
	console.log('setModalState', data);
	_financeModalState = data;
}

// Extend Cart Store with EventEmitter to add eventing capabilities
var FinancesStore = _.extend({}, EventEmitter.prototype, {


	getFinances: function() {
		return _finances;
	},

	getModalState: function() {
		"use strict";
		return _financeModalState;
	},

	getFinanceTotals: function() {
		"use strict";
		return _financeTotals;
	},

	// Emit Change event
	emitChange: function () {
		this.emit('change');
	},

	// Add change listener
	addChangeListener: function (callback) {
		this.on('change', callback);
	},

	// Remove change listener
	removeChangeListener: function (callback) {
		this.removeListener('change', callback);
	}

});

// Register callback with AppDispatcher
AppDispatcher.register(function (payload) {
	var action = payload.action;
	var text;

	switch (action.actionType) {

		case FinanceActionTypes.FINANCE_ADD:
			addFinance(action.data);
			//FinanceAPI.emit(action.actionType, action.data);
			break;


		case FinanceActionTypes.FINANCE_REMOVE:
			removeFinance(action.id);
			FinanceAPI.emit(action.actionType, {id: action.id});
			break;


		case FinanceActionTypes.FINANCE_UPDATED:
			updateFinance(action.data);
			//FinanceAPI.emit(action.actionType, {id: action.id, data: action.data});
			break;


		case FinanceActionTypes.FINANCE_MODAL_OPEN:
			console.log('finance modal toggle', action.data);
			setFinanceModalOpen(action.data);
			break;

		default:
			return true;
	}

	// If action was responded to, emit change event
	FinancesStore.emitChange();

	return true;

});

module.exports = FinancesStore;
