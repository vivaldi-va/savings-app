/**
 * Created by Zaccary on 23/05/2015.
 */

var React = require('react');
var AuthUtil = require('../utils/AuthUtil');

var Login = React.createClass({
	handleSubmit: function(e) {
		"use strict";
		e.preventDefault();
		var email = this.refs.email.getDOMNode().value;
		var password = this.refs.password.getDOMNode().value;
		AuthUtil.login(email, password, function(err, result) {
			if(!!result) {

			}

		});
	},
	render: function() {
		"use strict";

		console.log('render login component');
		return (
			<form onSubmit={this.handleSubmit}>
				<div>
					<label htmlFor="email">email</label>
					<input ref="email" id="email" name="email" type="email"/>
				</div>

				<div>
					<label htmlFor="password">password</label>
					<input ref="password" type="password" id="password"/>
				</div>
				<div>
					<button type="submit">log in</button>
				</div>

			</form>
		)
	}
});

module.exports = Login;