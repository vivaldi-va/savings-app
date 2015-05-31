/**
 * Created by vivaldi on 07/03/2015.
 */

var React = require('react');
var TimelineSegment = require('./TimelineSegment.react');

var TimelineAPI = require('../../utils/TimelineAPI');


var Timeline = React.createClass({
	componentDidMount: function() {
		"use strict";
		TimelineAPI.initListener('TIMELINE_COMPLETE', function() {

		});
	},
	handleScrollToToday: function(today) {
		"use strict";
		console.log('handle scroll to today');
		var scroll = this.refs.scroll.getDOMNode();

		scroll.scrollTop = today.offsetTop-(window.innerHeight/2);
	},
	render: function () {
		"use strict";
		var timelineItems;

		if (!this.props.timeline) {
			timelineItems = null;
		} else {
			timelineItems = this.props.timeline.items.map(function (segment, index) {
				return (<TimelineSegment key={index} segment={segment} index={index} onToday={this.handleScrollToToday} />)
			}, this);
		}


		return (
			<div className="box timeline" ref="scroll">
				<div className="timeline__ScrollWrapper">
					{timelineItems}
				</div>
			</div>
		);
	}
});

module.exports = Timeline;