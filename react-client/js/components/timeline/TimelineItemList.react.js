/**
 * Created by Zaccary on 25/05/2015.
 */


var React = require('react');
var ClassNames = require('classnames');
var Moment = require('moment');

var TimelineItem = require('./TimelineItem.react');

var TimelineItemList = React.createClass({
	render: function() {
		"use strict";

		if(!this.props.items.length) {
			return null;
		}

		var containerClasses = ClassNames('timeline__ItemContainer',
			{
				'timeline__ItemContainer-income': this.props.type === 'income',
				'timeline__ItemContainer-expenses': this.props.type === 'expenses'
			}
		);

		var items = this.props.items || [];

		return (
			<div className={containerClasses}>
				<div className="timeline__SegmentMeta">
					{function() {
						switch(this.props.type) {
							case 'income':
								if(this.props.future) {
									return 'expected';
								} else {
									return 'received';
								}
								break;
							case 'expenses':
								if(this.props.future) {
									return 'due';
								} else {
									return 'paid';
								}
								break;
						}
					}.call(this)} {Moment(this.props.date).format('DD/MM/YYYY')}
				</div>

				{items.map(function(item, index) {
					return (
						<TimelineItem item={item} key={index} index={index} future={this.props.future} />
					);
				}, this)}
			</div>
		)
	}
});

module.exports = TimelineItemList;