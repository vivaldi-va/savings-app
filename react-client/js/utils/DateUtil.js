/**
 * Created by Zaccary on 22/05/2015.
 */

var IntervalConstants = require('../constants/IntervalConstants');

module.exports = {
	formatInterval: function formatInterval(interval) {
		"use strict";
		var formatted;
		switch(Number(interval)) {
			case 24:
				formatted = IntervalConstants.INTERVAL_DAY;
				break;
			case 24 * 7:
				formatted = IntervalConstants.INTERVAL_WEEK;
				break;
			case 24 * 7 * 2:
				formatted = IntervalConstants.INTERVAL_OTHER_WEEK;
				break;
			case 24 * 31:
				formatted = IntervalConstants.INTERVAL_MONTH;
				break;
			case 24 * 31 * 6:
				formatted = IntervalConstants.INTERVAL_SIX_MONTH;
				break;
			case 24 * 31 * 12:
				formatted = IntervalConstants.INTERVAL_YEAR;
				break;
		}

		return formatted;
	}
};