/**
 * Created by Zaccary on 23/05/2015.
 */

var AppDispatcher			= require('../dispatcher/AppDispatcher');
var EventEmitter			= require('events').EventEmitter;
var UserActionTypes		= require('../constants/UserActionTypes');
var FinanceAPI				= require('../utils/FinanceAPI');
var _						= require('underscore');

// Define initial data points
var _user = null;


var addUserDetail = function(user) {
	"use strict";
	_user = user;
}

// Extend Cart Store with EventEmitter to add eventing capabilities
var FinancesStore = _.extend({}, EventEmitter.prototype, {

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

		case UserActionTypes.USER_UPDATE:
			break;

		default:
			return true;
	}

	// If action was responded to, emit change event
	FinancesStore.emitChange();

	return true;

});

module.exports = FinancesStore;
