/**
 * Created by Zaccary on 25/05/2015.
 */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var TimelineActionTypes = require('../constants/TimelineActionTypes');


var TimelineActions = {

	initTimeline: function (data) {
		"use strict";
		AppDispatcher.handleAction({
			actionType: TimelineActionTypes.TIMELINE_INIT,
			data: data
		});
	},
	addItem: function (data) {
		"use strict";
		AppDispatcher.handleAction({
			actionType: TimelineActionTypes.TIMELINE_ITEM,
			data: data
		});
	}
};

module.exports = TimelineActions;