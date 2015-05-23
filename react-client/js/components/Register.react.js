/**
 * Created by Zaccary on 23/05/2015.
 */


var React = require('react');
var AuthUtil = require('../utils/AuthUtil');

var Register = React.createClass({
	handleSubmit: function(e) {
		"use strict";
		e.preventDefault();
		var username = this.refs.username.getDOMNode().value;
		var email = this.refs.email.getDOMNode().value;
		var password = this.refs.password.getDOMNode().value;
		AuthUtil.create(username, email, password, function(err, result) {

		});
	},
	render: function() {
		"use strict";
		return (
			<form onSubmit={this.handleSubmit}>
				<div>
					<label htmlFor="username">username</label>
					<input ref="username" id="username" type="text"/>
				</div>
				<div>
					<label htmlFor="email">email</label>
					<input ref="email" id="email" type="email"/>
				</div>
				<div>
					<label htmlFor="password">password</label>
					<input ref="password" id="password" type="password"/>
				</div>
				<div>
					<button type="submit">register</button>
				</div>
			</form>

		)
	}
});

module.exports = Register;