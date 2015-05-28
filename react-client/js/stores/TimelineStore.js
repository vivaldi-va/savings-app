/**
 * Created by vivaldi on 07/03/2015.
 */

var AppDispatcher			= require('../dispatcher/AppDispatcher');
var EventEmitter			= require('events').EventEmitter;
var TimelineActionTypes	= require('../constants/TimelineActionTypes');
var _						= require('underscore');
var Moment = require('moment');

// Define initial data points
var _timeline = null;

var setTimeline = function(timeline) {
	"use strict";
	console.log('set timeline', timeline);
	timeline.items.reverse();
	_timeline = timeline;
};

var addTimelineItem = function(item) {
	"use strict";

	var newItemDate = Moment(item.timeline_date);

	_timeline.items.forEach(function(segment) {
		var segmentDate = Moment(segment.attrs.date);
		//console.log('segment date', segmentDate.calendar())

		if(newItemDate.isSame(segmentDate, 'day')) {


			if(item.type === 0) {
				segment.finances.income.push(item);
			} else {
				segment.finances.expenses.push(item);
			}
		}
	});
};

var cleanUpdatedTimeline = function(financeId, type, cb) {
	"use strict";
	console.log('clean updated finance');
	type = type === 0 ? 'income' : 'expenses';
	_timeline.items.forEach(function(segment) {
		segment.finances[type].forEach(function(item, index) {
			if(item.finance_id === financeId) {
				console.log('cleaned finance');
				segment.finances[type].splice(index, 1);
			}
		});
	});

	cb();
};

// Extend Cart Store with EventEmitter to add eventing capabilities
var TimelineStore = _.extend({}, EventEmitter.prototype, {

	getTimeline: function() {
		"use strict";
		return _timeline;
	},

	cleanUpdatedTimeline: cleanUpdatedTimeline,
	// Add change listener
	addChangeListener: function (callback) {
		this.on('change', callback);
	},

	// Remove change listener
	removeChangeListener: function (callback) {
		this.removeListener('change', callback);
	},
	// Emit Change event
	emitChange: function () {
		this.emit('change');
	}

});

// Register callback with AppDispatcher
AppDispatcher.register(function (payload) {
	var action = payload.action;
	switch (action.actionType) {

		case TimelineActionTypes.TIMELINE_INIT:
			setTimeline(action.data);
			break;
		case TimelineActionTypes.TIMELINE_ITEM:
			addTimelineItem(action.data);
			break;

		default:
			return true;
	}

	// If action was responded to, emit change event
	TimelineStore.emitChange();

	return true;
});

module.exports = TimelineStore;