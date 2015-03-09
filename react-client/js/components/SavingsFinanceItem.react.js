/**
 * Created by vivaldi on 07/03/2015.
 */

var React = require('react');
var SavingsFinanceActions = require('../actions/SavingsFinanceActions');


var SavingsFinanceColumn = React.createClass({
	render: function() {

		var finance = this.props.finance;

		return (
			<div>
				{finance._id}
			</div>
		)
	}
});

module.exports = SavingsFinanceColumn;