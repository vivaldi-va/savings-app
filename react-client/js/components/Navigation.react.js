/**
 * Created by Zaccary on 21/05/2015.
 */

var React = require('react');
var Router = require('react-router');
var Link = Router.Link;

var Navigation = React.createClass({
	render: function () {
		"use strict";
		return (
			<div className="navigation">
				<a href="#" className="navigation__Item">Timeline</a>
			</div>
		)
	}
});

module.exports = Navigation;