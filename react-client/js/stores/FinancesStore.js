
/**
 * Created by vivaldi on 07/03/2015.
 */

var AppDispatcher			= require('../dispatcher/AppDispatcher');
var EventEmitter			= require('events').EventEmitter;
var FinanceActionTypes	= require('../constants/FinanceActionTypes');
var FinanceAPI				= require('../utils/FinanceAPI');
var _						= require('underscore');

// Define initial data points
var _finances = {
	income: [],
	expense: []
};
var _financeModalOpen = false;

// Add a new finance
function addFinance(finance) {
	if(finance.type === 0) {
		_finances.income.push(finance);
	} else {
		_finances.expense.push(finance);
	}

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


function updateFinance(id, data) {
	for(var i in _finances) {
		for(var f in _finances[i]) {
			if(_finances[i][f]._id === id) {
				_finances[i][f] = data;
				return;
			}
		}
	}
}

function setFinanceModalOpen(open) {
	console.log('setModalState', open);
	_financeModalOpen = open;
}

// Extend Cart Store with EventEmitter to add eventing capabilities
var FinancesStore = _.extend({}, EventEmitter.prototype, {


	getFinances: function() {
		return _finances;
	},

	getModalState: function() {
		"use strict";
		return _financeModalOpen;
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
			FinanceAPI.emit(action.actionType, action.data);
			break;


		case FinanceActionTypes.FINANCE_REMOVE:
			removeFinance(action.id);
			FinanceAPI.emit(action.actionType, {id: action.id});
			break;


		case FinanceActionTypes.FINANCE_UPDATE:
			updateFinance(action.id, action.data);
			FinanceAPI.emit(action.actionType, {id: action.id, data: action.data});
			break;


		case FinanceActionTypes.FINANCE_MODAL_OPEN:
			setFinanceModalOpen(action.open);
			break;

		default:
			return true;
	}

	// If action was responded to, emit change event
	FinancesStore.emitChange();

	return true;

});

module.exports = FinancesStore;
