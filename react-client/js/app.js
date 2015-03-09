var React = require('react');
var SavingsApp = require('./components/SavingsApp.react');
var SavingsFinanceActions = require('./actions/SavingsFinanceActions');
var uuid = require('node-uuid');



for(var i = 0; i < 10; i++) {
	SavingsFinanceActions.addFinance({
		__v: 0,
		_id: uuid.v4(),
		amount: 1,
		description: "",
		disabled: false,
		disabled_date: null,
		duedate: "2014-12-08T13:41:50.858Z",
		interval: 168,
		meta: {
			created: "2015-03-03T13:41:59.599Z",
			modifications: []
		},
		name: "fds",
		time_until_next: "Today",
		type: i % 2,
		user_id: "540f56f90c468e7e6ebeaafc"
	});
}


// Render FluxCartApp Controller View
React.render(
	<SavingsApp />,
	document.getElementById('savings-app')
);
