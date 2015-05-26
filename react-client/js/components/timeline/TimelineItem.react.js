/**
 * Created by vivaldi on 07/03/2015.
 */


var React = require('react');
var ClassNames = require('classnames');
var Numeral = require('numeral');
var Moment = require('moment');

var TimelineItem = React.createClass({
	render: function() {
		"use strict";
		var item = this.props.item;
		var classNames = ClassNames('timeline__Item',
			{
				'timeline__Item-income': item.type === 0,
				'timeline__Item-expense': item.type === 1
			}
		);
		var rowClassNames = ClassNames('timeline__ItemRow', {
			'timeline__ItemRow-first': this.props.index === 0
		});

		var wrapperClassNames = ClassNames('timeline__ItemWrapper', {
			'timeline__ItemWrapper-income': item.type === 0,
			'timeline__ItemWrapper-expense': item.type === 1
		})

		return (
			<div className={rowClassNames}>
				<div className={wrapperClassNames}>
					<div className={classNames}>
						<div className="timeline__ItemAmountWrapper">
							<div className="timeline__ItemAmount">{item.amount}</div>
						</div>
						<div className="timeline__ItemNameWrapper">
							<div className="timeline__ItemName">{ item.name }</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = TimelineItem;