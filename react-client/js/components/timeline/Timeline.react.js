/**
 * Created by vivaldi on 07/03/2015.
 */

var React = require('react');
var TimelineSegment = require('./TimelineSegment.react');

var Timeline = React.createClass({
	render: function () {
		"use strict";
		var timelineItems;

		if (!this.props.timeline) {
			timelineItems = null;
		} else {
			timelineItems = this.props.timeline.items.map(function (segment, index) {
				return (<TimelineSegment segment={segment} index={index} />)
			}, this);
		}


		return (
			<div className="box timeline">
				<div className="timeline__ScrollWrapper">
					{timelineItems}
				</div>
			</div>
		);
	}
});

module.exports = Timeline;