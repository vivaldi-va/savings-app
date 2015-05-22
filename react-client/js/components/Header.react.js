/**
 * Created by Zaccary on 21/05/2015.
 */


var React = require('react');

var Header = React.createClass({
	render: function () {
		"use strict";
		return (
			<div className="header">
				<div className="header__Logo"></div>
				<div className="header__UserInteraction"></div>
			</div>
		)
	}
});

module.exports = Header;