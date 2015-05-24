/**
 * Created by vivaldi on 07/03/2015.
 */


var React = require('react');
var FinancesStore = require('../stores/FinancesStore');
var TimelineStore = require('../stores/TimelineStore');
var FinanceAPI = require('../utils/FinanceAPI');

var FinanceActions = require('../actions/FinanceActions');

var Header = require('./Header.react');
var Navigation = require('./Navigation.react');
var FinancesColumn = require('./columns/FinancesColumn.react.js');
var Timeline = require('./timeline/Timeline.react');

var FinanceModal = require('./FinanceModal.react');

// Method to retrieve state from Stores
function getFinancesState() {
	return {
		finances: FinancesStore.getFinances(),
		financeTotals: FinancesStore.getFinanceTotals(),
		timelineItems: {},
		modal: FinancesStore.getModalState()
	};
}

var SavingsApp = React.createClass({
	getInitialState: function() {
		return getFinancesState();
	},
	componentDidMount: function () {
		"use strict";
		FinanceAPI.emit('FINANCE_LOAD');
		FinanceAPI.initListener('FINANCE_GET', function(financeData) {
			console.log('got finance', financeData);
			FinanceActions.addFinance(financeData);

		});
		FinancesStore.addChangeListener(this._onChange);
	},
	componentWillUnmount: function () {
		"use strict";
		FinancesStore.removeChangeListener(this._onChange);
	},
	_onChange: function () {
		this.setState(getFinancesState());
	},
	render: function () {
		console.log(this.state.finances);

		var modal;
		var openFinance = null;

		if(this.state.modal) {
			modal = (<FinanceModal modal={this.state.modal} />);
			openFinance = this.state.modal.finance;
		}

		return (
			<div className="window">
				<Header />
				<Navigation />
				<div className="container savings-app">
					<Timeline className="timeline" timelineItems={this.state.timelineItems} />
					<FinancesColumn finances={this.state.finances.income} type={0} total={this.state.financeTotals.income} openFinance={openFinance} />
					<FinancesColumn finances={this.state.finances.expense} type={1} total={this.state.financeTotals.expense} openFinance={openFinance} />
				</div>
				{modal}
			</div>
		);
	}
});

module.exports = SavingsApp;