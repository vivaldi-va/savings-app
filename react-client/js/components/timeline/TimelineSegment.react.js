/**
 * Created by vivaldi on 07/03/2015.
 */

/**
 * Created by vivaldi on 07/03/2015.
 */


var React = require('react');
var ClassNames = require('classnames');
var TimelineItemList = require('./TimelineItemList.react');



var TimelineSegment = React.createClass({
	propTypes: {
		onToday: React.PropTypes.func
	},
	getDefaultProps: function() {
		"use strict";
		return {
			onToday: function() {}
		};
	},
	componentWillReceiveProps: function(newProps) {
		"use strict";
		if(newProps.segment.attrs.today) {
			this.props.onToday(this.refs.segment.getDOMNode());
		}
	},
	render: function() {
		"use strict";
		var timelineSegment = this.props.segment;


		var segmentClasses = ClassNames('timeline__Segment',
			{
				'timeline__Segment-today': timelineSegment.attrs.today,
				'timeline__Segment-first': this.props.index === 0,
				'timeline__Segment-future': timelineSegment.attrs.future
			}
		)

		return (
			<div className={segmentClasses} ref="segment">

				<TimelineItemList type="income" items={timelineSegment.finances.income} date={timelineSegment.attrs.date} future={timelineSegment.attrs.future} />
				<TimelineItemList type="expenses" items={timelineSegment.finances.expenses} date={timelineSegment.attrs.date} future={timelineSegment.attrs.future} />
			</div>
		)
	}
});

module.exports = TimelineSegment;