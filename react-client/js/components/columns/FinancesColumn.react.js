/**
 * Created by vivaldi on 07/03/2015.
 */

var React = require('react');
var SavingsFinanceActions = require('../../actions/SavingsFinanceActions');
var SavingsFinanceItem = require('./FinanceItem.react.js');


var SavingsFinanceColumn = React.createClass({
	openFinance: function(finance) {

	},

	newFinance: function(type) {

	},

	render: function() {

		console.log(this.props);

		return (
			<div className={"box finances__Column finances__Column-" + this.props.type}>
				<div className="financeColumn__Header">
					<span>{this.props.type}</span>
				</div>

				<div className="financeColumn__ItemWrapper">
				{this.props.finances.map(function(finance) {
					return (
						<SavingsFinanceItem finance={finance} />
					)
				})}
				</div>
			</div>
		);
	}
});

module.exports = SavingsFinanceColumn;