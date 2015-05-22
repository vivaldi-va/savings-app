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
	render: function() {

		var finance = this.props.finance;
		var cx = ClassNames(
			"finances__Item",
			{
				"finances__Item-income": finance.type === 0,
				"finances__Item-expense": finance.type === 1
			}
		);


		return (
			<div className="finances__ItemWrapper">
				<div className={cx}>
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