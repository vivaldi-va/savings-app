var React = require('react');
var SavingsApp = require('./components/SavingsApp.react.js');
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


/*var addEvent = function(elem, type, eventHandle) {
	if(elem == null ||typeof(elem) == 'undefined') return;
	if(elem.addEventListener) {
		elem.addEventListener(type, eventHandle, false);
	} else if(elem.attachEvent) {
		elem.attachEvent("on" + type, eventHandle);
	} else {
		elem["on" + type] = eventHandle;
	}
};

function setWindow() {
	console.log('set window');
	var container	= document.getElementById('window');
	var header		= document.getElementById('header');
	container.style.height = window.innerHeight - header.clientHeight + 'px';

}
(function() {
	setWindow();
	addEvent(window, "resize", setWindow);
})();*/

React.render(
	<SavingsApp />,
	document.getElementById('savings-app')
);
