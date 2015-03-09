/**
 * Created by vivaldi on 07/03/2015.
 */


var React = require('react');
var FinancesStore = require('../stores/FinancesStore');
var TimelineStore = require('../stores/TimelineStore');
var FinancesColumn = require('../components/SavingsFinancesColumn.react');
//var Timeline = require('../components/Timeline.react');

// Method to retrieve state from Stores
function getFinancesState() {
	return {
		finances: FinancesStore.getFinances(),
		timelineitems: {}
	};
}

// Define main Controller View
var SavingsApp = React.createClass({

	// Get initial state from stores
	getInitialState: function () {
		return getFinancesState();
	},

	// Add change listeners to stores
	componentDidMount: function () {
		FinancesStore.addChangeListener(this._onChange);
	},

	// Remove change listers from stores
	componentWillUnmount: function () {
		FinancesStore.removeChangeListener(this._onChange);
	},

	// Render our child components, passing state via props
	render: function () {


		console.log(this.state.finances);

		return (
			<div className="savings-app">
				<FinancesColumn className="finances__Income" finances={this.state.finances.income} type="income" />
				<FinancesColumn className="finances__Expenses" finances={this.state.finances.expense} type="expense" />
			</div>
		);
	},

	// Method to setState based upon Store changes
	_onChange: function () {
		this.setState(getFinancesState());
	}

});

module.exports = SavingsApp;