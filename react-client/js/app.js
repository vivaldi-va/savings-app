var React = require('react');
require('./router');
var AuthUtil = require('./utils/AuthUtil');

var SavingsApp = require('./components/SavingsApp.react.js');
var FinanceActions = require('./actions/FinanceActions');
var uuid = require('node-uuid');



/*for(var i = 0; i < 10; i++) {
	FinanceActions.addFinance({
		__v: 0,
		_id: uuid.v4(),
		amount: Math.random() * 1000,
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
}*/



/*AuthUtil.checkSession(function(err, result) {
	"use strict";
	if(err) {
		console.error(err);
		return;
	}

	console.log('logged in');

	console.log(document.getElementById('savings-app'));

	React.render(
		<SavingsApp />,
		document.getElementById('savings-app')
	);

})*/


