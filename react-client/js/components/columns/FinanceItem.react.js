/**
 * Created by vivaldi on 07/03/2015.
 */

var React = require('react');
var ClassNames = require('classnames');
var Moment = require('moment');
var Numeral = require('numeral');

var DateUtil = require('../../utils/DateUtil');
var FinanceActions = require('../../actions/FinanceActions');


var FinanceItem = React.createClass({
	componentDidMount: function() {
		"use strict";

	},
	handleEdit: function(e) {
		"use strict";
		FinanceActions.openModal(this.props.finance.type, this.props.finance);
	},
	render: function() {
		"use strict";
		var finance = this.props.finance;
		var cx = ClassNames(
			"finances__Item",
			{
				"finances__Item-income": finance.type === 0,
				"finances__Item-expense": finance.type === 1
			},
			{
				"active": this.props.open
			}
		);


		return (
			<div className="finances__ItemWrapper">
				<div className={cx} onClick={this.handleEdit}>
					<div className="finances__ItemAmountWrapper">
						<div className="finances__ItemAmount">{Numeral(finance.amount).format('$0,0.00')}</div>
						<div className="finances__ItemInterval">
							{DateUtil.formatInterval(finance.interval)}
						</div>
					</div>
					<div className="finances__ItemName">{finance.name}</div>
				</div>
			</div>
		)
	}
});

module.exports = FinanceItem;